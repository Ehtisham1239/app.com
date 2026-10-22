import Link from "next/link";
import { KeyRound } from "lucide-react";

export const metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="adm-card w-full max-w-md p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
          <KeyRound className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-sans text-xl font-bold text-mushaf-900">Forgot your password?</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          For security, admin passwords are reset by a Super Admin. Ask them to open <strong>Admin users</strong>, choose your name and click <strong>Reset password</strong>. You will get a temporary password and choose a new one when you sign in.
        </p>
        <Link href="/admin/login" className="btn btn-primary mt-7">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
