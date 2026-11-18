"""End-to-end QA for BridgeFund (Playwright for Python). Start the app with `npm run build && npx next start -p 3100`, then run `python3 scripts/e2e.py`."""
import re, json, sys
from playwright.sync_api import sync_playwright, expect
import os
B = os.environ.get("BASE_URL", "http://localhost:3100")
fails, errs = [], []
def check(cond, msg):
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond: fails.append(msg)
def state(pg): return pg.evaluate("JSON.parse(localStorage.getItem('bridgefund-state'))")
def req(pg, opp): return next((r for r in state(pg)["requests"] if r["opportunityId"] == opp), None)
def settle(pg, ms=600): pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(ms)

with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(viewport={"width": 1366, "height": 900}, accept_downloads=True)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"pageerror {pg.url}: {e}"))
    pg.on("console", lambda m: errs.append(f"console {pg.url}: {m.text}") if m.type == "error" else None)

    # 1. Demo: full run + success screen
    pg.goto(B + "/demo"); settle(pg)
    texts = []
    for cta in ["Run BridgeEngine", "Send to her school", "Fund as a sponsor", "See the result"]:
        pg.get_by_role("button", name=cta).click(); pg.wait_for_timeout(1400)
        texts.append(pg.inner_text("main"))
    check("AED 150" in texts[0] and "left for sponsors" in texts[0], "demo step 2 shows AED 150 left for sponsors")
    check("Guardian consent recorded" in texts[1], "demo verification shows guardian consent")
    check("AED 850" in texts[2], "demo sponsor balance 1,000 → 850")
    check("An opportunity secured." in texts[3] and "A future unlocked." in texts[3], "demo success headline")
    check("3.00x" in texts[3] and "AED 300" in texts[3], "demo success multiplier + conserved")
    r = req(pg, "o-mariam-stem")
    check(r and r["status"] == "Completed" and r["funded"] == 150, "demo request completed with AED 150 funded")
    # replay resets
    pg.get_by_role("button", name="Replay demo").click(); settle(pg)
    check(req(pg, "o-mariam-stem") is None and "Run BridgeEngine" in pg.inner_text("main"), "replay resets the demo")
    # double-click protection
    pg.get_by_role("button", name="Run BridgeEngine").dblclick(); pg.wait_for_timeout(900)
    check(state(pg)["demo"]["stage"] == 1, "double-click advances one step only")

    # 2. Judge mode reset + navigation to every area
    pg.goto(B + "/student"); settle(pg)
    pg.get_by_role("button", name="Judge mode").click(); pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Reset demo data").click(); pg.wait_for_timeout(500)
    check(req(pg, "o-mariam-stem") is None and state(pg)["demo"]["stage"] == 0, "judge mode reset is instant")
    for title, path, role in [("BridgeEngine", "/student/engine", "student"), ("UAE opportunities", "/student/waivers", "student"), ("Sponsor contributions", "/sponsor/marketplace", "sponsor"), ("Institution management", "/institution/requests", "institution"), ("Impact analytics", "/impact", None), ("Business model", "/business", None)]:
        pg.get_by_role("button", name="Judge mode").first.click(); pg.wait_for_timeout(300)
        pg.get_by_role("button", name=re.compile("^" + title)).click(); settle(pg, 400)
        ok = path in pg.url and (role is None or state(pg)["role"] == role)
        check(ok, f"judge mode → {title}")
        if role is None: pg.goto(B + "/student"); settle(pg, 300)

    # 3. Student journey with guardian consent + persistence
    pg.goto(B + "/student/engine?opp=o-mariam-stem"); settle(pg)
    pg.get_by_role("button", name="Find solutions").click(); pg.wait_for_timeout(6000)
    check("AED 300" in pg.inner_text("main"), "engine finds AED 300 of savings")
    pg.get_by_role("button", name="Compare plans").click(); pg.wait_for_timeout(500)
    pg.get_by_role("button", name=re.compile("^Use “")).click(); pg.wait_for_timeout(500)
    submit = pg.get_by_role("button", name="Submit request")
    check(submit.is_disabled(), "submit blocked until guardian consent (minor)")
    pg.get_by_role("checkbox").check(); 
    check(submit.is_enabled(), "consent enables submit")
    submit.click(); pg.wait_for_timeout(800)
    r = req(pg, "o-mariam-stem")
    check(r and r["status"] == "Submitted" and r["guardianConsent"] == "Given", "request submitted with consent")
    pg.reload(); settle(pg)
    check(req(pg, "o-mariam-stem") is not None and "Submitted" in pg.inner_text("main"), "request persists after reload")

    # 4. Institution verification
    rid = r["id"]
    pg.goto(B + f"/institution/requests?focus={rid}"); settle(pg)
    pg.get_by_role("button", name="Approve and verify").first.click(); pg.wait_for_timeout(500)
    if pg.get_by_role("button", name="Approve anyway").count(): pg.get_by_role("button", name="Approve anyway").click(); pg.wait_for_timeout(400)
    r = req(pg, "o-mariam-stem")
    check(r["status"] == "Verified" and all(x["confirmed"] for x in r["reductions"]), "institution verification confirms savings")

    # 5. Sponsor partial then complete contribution
    pg.goto(B + f"/sponsor/marketplace/{rid}"); settle(pg)
    pg.get_by_role("button", name="Contribute").first.click(); pg.wait_for_timeout(300)
    pg.locator("#contrib").fill("50"); pg.get_by_role("button", name=re.compile(r"^Contribute AED")).click(); pg.wait_for_timeout(1500)
    r = req(pg, "o-mariam-stem")
    check(r["status"] == "Partially Funded" and r["funded"] == 50, "partial sponsor contribution")
    pg.goto(B + f"/sponsor/marketplace/{rid}"); settle(pg)
    pg.get_by_role("button", name="Contribute").first.click(); pg.wait_for_timeout(300)
    pg.locator("#contrib").fill("500"); pg.wait_for_timeout(200)
    btn = pg.get_by_role("button", name=re.compile(r"^Contribute"))
    if btn.last.is_disabled():
        pg.locator("#contrib").fill("100")
    btn.last.click(); pg.wait_for_timeout(1500)
    r = req(pg, "o-mariam-stem")
    sp = next(s for s in state(pg)["sponsors"] if s["id"] == "sp-ghaf")
    check(r["status"] == "Fully Funded" and r["funded"] == 150, "complete sponsor contribution caps at remaining")
    check(sp["balance"] == 850, "sponsor balance reconciles (1,000 → 850)")

    # 6. Resource reservation
    pg.goto(B + "/student/resources"); settle(pg)
    before = sum(x["available"] for x in state(pg)["resources"]); nres = len(state(pg)["reservations"])
    pg.get_by_role("button", name="Request and reserve").first.click(); pg.wait_for_timeout(300)
    pg.get_by_role("button", name="Confirm reservation").click(); pg.wait_for_timeout(500)
    after = sum(x["available"] for x in state(pg)["resources"])
    check(after == before - 1 and len(state(pg)["reservations"]) == nres + 1, "reservation reduces stock by one")
    pg.get_by_role("button", name="Cancel").first.click(); pg.wait_for_timeout(400)
    check(sum(x["available"] for x in state(pg)["resources"]) == before, "cancelling frees the item")

    # 7. Reports
    pg.goto(B + "/institution/audit"); settle(pg)
    with pg.expect_download() as d: pg.get_by_role("button", name="Export CSV").click()
    check(d.value.suggested_filename.endswith(".csv") and len(open(d.value.path(), encoding="utf-8").read()) > 200, "audit CSV export")
    pg.goto(B + "/pilot"); settle(pg)
    with pg.expect_download() as d: pg.get_by_role("button", name=re.compile("Feedback CSV")).click()
    check(open(d.value.path(), encoding="utf-8-sig").read().startswith('"Date"'), "feedback CSV export")

    # 8. Feedback widget
    pg.goto(B + "/student"); settle(pg)
    pg.get_by_role("button", name=re.compile("Feedback", re.I)).first.click(); pg.wait_for_timeout(300)
    pg.get_by_role("radio").nth(3).click() if pg.get_by_role("radio").count() else pg.get_by_role("button", name=re.compile("4 star", re.I)).first.click()
    pg.get_by_role("button", name=re.compile("^Send", re.I)).click(); pg.wait_for_timeout(400)
    check(len(state(pg)["feedback"]) == 1, "anonymous feedback saved")

    # 9. Corrupted storage recovers
    pg.evaluate("localStorage.setItem('bridgefund-state','{broken')"); pg.goto(B + "/student"); settle(pg)
    check("Dashboard" in pg.inner_text("body") or "Mariam" in pg.inner_text("body"), "corrupted storage recovers to seed")

    # 10. Arabic RTL
    pg.get_by_role("button", name="العربية").first.click(); pg.wait_for_timeout(400)
    check(pg.evaluate("document.documentElement.dir") == "rtl", "Arabic switches to RTL")
    pg.goto(B + "/demo"); settle(pg)
    check(pg.evaluate("document.documentElement.dir") == "rtl", "RTL persists across pages")
    pg.evaluate("()=>{const s=JSON.parse(localStorage.getItem('bridgefund-state'));s.display.locale='en';localStorage.setItem('bridgefund-state',JSON.stringify(s))}")

    # 11. Keyboard: skip link + judge dialog focus trap + escape
    pg.goto(B + "/student"); settle(pg)
    pg.keyboard.press("Tab")
    check(pg.evaluate("document.activeElement.textContent.trim()") == "Skip to content", "skip link is first tab stop")
    pg.get_by_role("button", name="Judge mode").click(); pg.wait_for_timeout(300)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    check(pg.get_by_role("dialog").count() == 0, "Escape closes judge mode")

    # 12. Every page renders on mobile without horizontal overflow
    m = br.new_context(viewport={"width": 375, "height": 812}).new_page()
    m.on("pageerror", lambda e: errs.append(f"mobile pageerror {m.url}: {e}"))
    pages = ["/", "/demo", "/impact", "/business", "/scale", "/pilot", "/why", "/simulator", "/present", "/signin", "/student", "/student/engine", "/student/waivers", "/student/requests", "/student/resources", "/student/calculator", "/student/tracker", "/student/scanner", "/sponsor", "/sponsor/marketplace", "/sponsor/allocate", "/sponsor/impact", "/sponsor/contributions", "/institution", "/institution/requests", "/institution/matching", "/institution/urgent", "/institution/resources", "/institution/analytics", "/institution/audit", "/settings", "/notifications", "/activity", "/does-not-exist"]
    for path in pages:
        m.goto(B + path); m.wait_for_load_state("networkidle"); m.wait_for_timeout(300)
        sw = m.evaluate("document.documentElement.scrollWidth")
        if sw > 377: check(False, f"mobile overflow {path} ({sw}px)")
    check(True, f"mobile sweep of {len(pages)} pages")
    br.close()

real = [e for e in errs if "favicon" not in e and "Download the React DevTools" not in e]
print("\nconsole/page errors:", len(real)); [print("  ", e[:220]) for e in real[:15]]
print(f"\n{len(fails)} failures"); [print("  -", f) for f in fails]
sys.exit(1 if fails or real else 0)
