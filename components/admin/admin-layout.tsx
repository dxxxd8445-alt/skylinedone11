import { AdminShell } from "./admin-shell";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, title = "Admin Panel", subtitle }: AdminLayoutProps) {
  return (
    <AdminShell title={title} subtitle={subtitle}>
      {children}
    </AdminShell>
  );
}
