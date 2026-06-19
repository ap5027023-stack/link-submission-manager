import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserById,
  updateUser,
  deleteUser,
  deleteLinksByUser,
  getUserByEmail,
} from "@/lib/sheets";
import { verifyToken, hashPassword } from "@/lib/auth";

async function getAdminUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const user = await getUserById(params.id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // If email is changing, check it's not taken
    if (body.email && body.email !== user.email) {
      const existing = await getUserByEmail(body.email);
      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const updates: Partial<typeof user> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.submissionLimit !== undefined)
      updates.submissionLimit = parseInt(body.submissionLimit);
    if (body.status !== undefined) updates.status = body.status;
    if (body.password) {
      updates.passwordHash = await hashPassword(body.password);
    }

    await updateUser(params.id, updates);
    return NextResponse.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getUserById(params.id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Delete user's links first, then delete user
    await deleteLinksByUser(params.id);
    await deleteUser(params.id);

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
