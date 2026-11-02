"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/site/review-form";

export function ReviewPageForm({ config, consentText }) {
  const [open, setOpen] = useState(true);
  return open ? (
    <ReviewForm open={open} config={config} consentText={consentText} onClose={() => setOpen(false)} />
  ) : (
    <div className="py-8 text-center">
      <p className="text-sm text-ink-soft">The review form is closed.</p>
      <button type="button" className="btn btn-primary mt-4 min-h-11 justify-center" onClick={() => setOpen(true)}>
        Write a review
      </button>
    </div>
  );
}
