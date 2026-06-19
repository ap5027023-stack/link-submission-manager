import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/admin/login");
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") redirect("/admin/login");

  return (
    <DashboardShell
      role="admin"
      name={payload.name}
      email={payload.email}
      title="User Management"
      subtitle="Create, edit, and manage user accounts"
    >
      <UsersClient />
    </DashboardShell>
  );
}
