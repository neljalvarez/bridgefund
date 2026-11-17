"use client";

import { useState } from "react";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { useStore } from "@/lib/store";
import { setDisplay, setProfile } from "@/lib/actions";
import { CURRENCIES } from "@/lib/regions";
import { LOCALES, type Locale } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currentStudent, institutionOf } from "@/lib/selectors";
import { LEVEL_LABEL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError, PageHeader } from "@/components/shared/kit";
import { useTheme } from "@/components/app/useTheme";

export default function SettingsPage() {
  const { state, dispatch, reset } = useStore();
  const { dark, toggle } = useTheme();
  const st = currentStudent(state);
  const [name, setName] = useState(state.profile.displayName);
  const [email, setEmail] = useState(state.profile.email);
  const [confirm, setConfirm] = useState(false);
  const emailErr = /^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email address.";

  return (
    <>
      <PageHeader title="Settings" description="Profile, region and appearance." />
      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              {LEVEL_LABEL[st.level]} · {institutionOf(state, st.institutionId)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim() || emailErr) return;
                dispatch(setProfile({ displayName: name.trim(), email }), { success: "Profile saved" });
              }}
            >
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!name.trim()} />
                <FieldError>{!name.trim() ? "Name can't be empty." : null}</FieldError>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!emailErr} />
                <FieldError>{emailErr}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={!name.trim() || !!emailErr}>
                  Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["deadlineReminders", "Financial deadline reminders", "Get reminded three days before deadlines you follow."],
                ["emailUpdates", "Request status updates", "Hear when a request is verified, funded or needs information."],
              ] as const
            ).map(([k, l, d]) => (
              <label key={k} className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">{l}</span>
                  <span className="block text-sm text-muted-foreground">{d}</span>
                </span>
                <Switch checked={state.profile[k]} onCheckedChange={(v) => dispatch(setProfile({ [k]: v }), { info: `${l} ${v ? "on" : "off"}` })} />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm">{dark ? "Dark mode" : "Light mode"}</span>
            <Button variant="outline" onClick={toggle}>
              {dark ? <Sun /> : <Moon />} Switch to {dark ? "light" : "dark"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Currency and language</CardTitle>
            <CardDescription>Display preferences for global use. Everything is calculated in AED. Other currencies are for display only.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Display currency</Label>
              <Select value={state.display.currency} onValueChange={(v) => dispatch(setDisplay({ currency: v }), { info: `Showing amounts in ${v}` })}>
                <SelectTrigger aria-label="Display currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} · {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Amounts you type are always in AED.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Interface language</Label>
              <Select value={state.display.locale} onValueChange={(v) => dispatch(setDisplay({ locale: v as Locale }), { info: "Language updated" })}>
                <SelectTrigger aria-label="Interface language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LOCALES) as Locale[]).map((l) => (
                    <SelectItem key={l} value={l}>
                      {LOCALES[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Arabic switches the layout to right-to-left. Core screens are translated.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demonstration data</CardTitle>
            <CardDescription>All data is fictional and stored only in this browser&apos;s localStorage.</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <Button variant="destructive" onClick={() => setConfirm(true)}>
              <RotateCcw /> Reset demo
            </Button>
          </CardContent>
        </Card>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all demo data?</DialogTitle>
            <DialogDescription>Requests, balances, reservations and activity return to their starting state.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                reset();
                setConfirm(false);
              }}
            >
              Reset demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
