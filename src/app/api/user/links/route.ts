import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById, getLinksByUser } from "@/lib/sheets";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getUserById(payload.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const links = await getLinksByUser(payload.userId);
    const totalSubmitted = links.length;
    const remaining = Math.max(0, user.submissionLimit - totalSubmitted);

    return NextResponse.json({
      success: true,
      stats: {
        submissionLimit: user.submissionLimit,
        totalSubmitted,
        remaining,
      },
      links: links.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    });
  } catch (error) {
    console.error("Get user links error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
