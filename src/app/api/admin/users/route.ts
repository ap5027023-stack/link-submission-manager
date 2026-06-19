import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getAllUsers, createUser, getUserByEmail } from "@/lib/sheets";
import { verifyToken, hashPassword } from "@/lib/auth";

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
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await getAllUsers();
    const publicUsers = users
      .filter((u) => u.role !== "admin")
      .map(({ passwordHash: _, ...u }) => u);
    return NextResponse.json({ success: true, users: publicUsers });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password, submissionLimit } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      submissionLimit: parseInt(submissionLimit) || 50,
      status: "active" as const,
      createdDate: new Date().toISOString(),
      role: "user" as const,
    };

    await createUser(newUser);

    const { passwordHash: _, ...publicUser } = newUser;
    return NextResponse.json({ success: true, user: publicUser }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
