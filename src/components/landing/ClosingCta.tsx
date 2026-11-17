import Link from "next/link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { PixelSprite } from "@/components/pixel/PixelSprite";

export function ClosingCta() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="panel flex flex-col items-center gap-6 bg-forest p-8 text-center text-onforest md:flex-row md:text-left">
          <div className="flex shrink-0 gap-2">
            <PixelSprite name="student" scale={5} />
            <PixelSprite name="key" scale={6} />
          </div>
          <div className="flex-1">
            <h2 className="font-pixel text-3xl">Every gap closed is a door opened.</h2>
            <p className="mt-2 opacity-90">Walk through a full student journey — scan, reduce, verify, fund, unlock — in about two minutes.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/demo" className="btn-gold px-5 py-3">
              <Gamepad2 size={18} /> Start judge demo
            </Link>
            <Link href="/student" className="btn-ghost px-5 py-3">
              Explore as a student <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
