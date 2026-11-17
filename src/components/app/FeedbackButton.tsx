"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquarePlus, Star } from "lucide-react";
import { useStore, useT } from "@/lib/store";
import { addFeedback } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/** Lightweight, anonymous feedback: a 1–5 rating and an optional comment. No names are stored. */
export function FeedbackButton() {
  const { state, dispatch } = useStore();
  const tr = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const send = () => {
    dispatch(addFeedback({ role: state.role, rating, comment: comment.trim(), page: pathname }), { success: "Thanks — feedback saved", description: "Stored anonymously in this browser." });
    setOpen(false);
    setRating(0);
    setComment("");
  };
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={tr("Feedback")} title={tr("Feedback")}>
        <MessageSquarePlus />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How easy was this?</DialogTitle>
            <DialogDescription>Anonymous — only your role and this page are recorded.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} of 5`} onClick={() => setRating(n)} className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Star className={cn("h-7 w-7", n <= rating ? "fill-primary text-primary" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
          <Textarea aria-label="Comment" rows={3} maxLength={500} placeholder="What should we improve? (optional — please don't include names)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={send} disabled={rating === 0}>
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
