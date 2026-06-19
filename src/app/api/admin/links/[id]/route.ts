import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteLink } from "@/lib/sheets";
import { verifyToken } from "@/lib/auth";

async function getAdminUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await deleteLink(params.id);
    return NextResponse.json({ success: true, message: "Link deleted" });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
