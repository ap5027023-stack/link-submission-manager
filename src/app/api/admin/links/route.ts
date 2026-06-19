import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllLinks } from "@/lib/sheets";
import { verifyToken } from "@/lib/auth";

async function getAdminUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const links = await getAllLinks();
    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
