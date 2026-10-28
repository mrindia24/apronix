/** Minimal shell for administrator sign-in — no marketing header or footer. */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-ink">{children}</div>;
}
