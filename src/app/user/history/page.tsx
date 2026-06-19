import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/login");
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "user") redirect("/login");

  return (
    <DashboardShell
      role="user"
      name={payload.name}
      email={payload.email}
      title="Submission History"
      subtitle="All links you've submitted"
    >
      <HistoryClient />
    </DashboardShell>
  );
}
