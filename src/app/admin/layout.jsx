export const metadata = {
  title: { default: "Admin panel", template: "%s · Admin · Online Quran College" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return children;
}
