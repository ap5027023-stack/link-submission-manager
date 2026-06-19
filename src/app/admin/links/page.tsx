import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import LinksClient from "./LinksClient";

export default async function AdminLinksPage() {
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
      title="Link Management"
      subtitle="View, search, and manage all submitted links"
    >
      <LinksClient />
    </DashboardShell>
  );
}
