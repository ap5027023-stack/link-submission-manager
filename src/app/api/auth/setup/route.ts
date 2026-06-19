import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getUserByEmail, createUser, initializeSheets } from "@/lib/sheets";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment" },
        { status: 400 }
      );
    }

    // Initialize sheets with headers
    await initializeSheets();

    // Check if admin already exists
    const existingAdmin = await getUserByEmail(adminEmail);
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin account already exists", alreadySetup: true },
        { status: 200 }
      );
    }

    // Create admin user
    const passwordHash = await hashPassword(adminPassword);
    await createUser({
      id: uuidv4(),
      name: "Administrator",
      email: adminEmail,
      passwordHash,
      submissionLimit: 0,
      status: "active",
      createdDate: new Date().toISOString(),
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed. Check server logs." },
      { status: 500 }
    );
  }
}
