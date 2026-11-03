"use client";

import Link from "next/link";
import { Headset, MessageCircle } from "lucide-react";

export function ContactSupportButton() {
  return (
    <aside className="contact-support-float" aria-label="Contact support">
      <div className="contact-support-card">
        <div className="contact-support-heading">
          <span className="contact-support-icon" aria-hidden="true"><Headset size={20} /></span>
          <div>
            <p className="contact-support-title">Online Quran College</p>
            <p className="contact-support-subtitle">We&apos;re here to help</p>
          </div>
        </div>
        <Link href="/contact" className="contact-support-cta">
          <MessageCircle size={17} aria-hidden="true" />
          <span>Contact Support</span>
        </Link>
      </div>
    </aside>
  );
}
