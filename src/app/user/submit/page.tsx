import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import SubmitClient from "./SubmitClient";

export default async function SubmitPage() {
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
      title="Submit Link"
      subtitle="Add a new link to your submission list"
    >
      <SubmitClient />
    </DashboardShell>
  );
}
