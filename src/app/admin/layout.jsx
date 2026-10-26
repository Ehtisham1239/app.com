import { Toaster } from "sonner";
import "./admin.css";

// CSP script nonces must be generated per request, including the login page.
export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "Admin panel", template: "%s · Admin · Online Quran College" },
  robots: { index: false, follow: false },
};

// Toasts are only used by the staff panel, so the library stays off public pages.
export default function AdminRootLayout({ children }) {
  return <>{children}<Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} /></>;
}
