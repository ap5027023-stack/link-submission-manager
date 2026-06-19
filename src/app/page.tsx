import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      if (payload.role === "admin") {
        redirect("/admin/users");
      } else {
        redirect("/user/dashboard");
      }
    }
  }

  redirect("/login");
}
