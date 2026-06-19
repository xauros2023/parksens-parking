import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/requireAdmin";
import AdminNav from "@/components/AdminNav";

export const metadata = {
  title: "Administration — ParkSens",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }) {
  if (!(await isAdminRequest())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-sidebar__brand">
          ParkSens
          <span>Administration</span>
        </a>
        <AdminNav />
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
