import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import DashboardClient from "./DashboardClient";

export default async function UserDashboardPage() {
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
      title={`Welcome, ${payload.name.split(" ")[0]} 👋`}
      subtitle="Here's an overview of your submission activity"
    >
      <DashboardClient />
    </DashboardShell>
  );
}
