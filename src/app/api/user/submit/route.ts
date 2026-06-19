import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getUserById, getLinkCount, addLink } from "@/lib/sheets";
import { verifyToken, isValidUrl } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { link } = await request.json();

    if (!link || !link.trim()) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    if (!isValidUrl(link.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid URL (must start with http:// or https://)" },
        { status: 400 }
      );
    }

    const user = await getUserById(payload.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.status === "disabled") {
      return NextResponse.json(
        { error: "Your account has been disabled" },
        { status: 403 }
      );
    }

    const currentCount = await getLinkCount(payload.userId);
    if (currentCount >= user.submissionLimit) {
      return NextResponse.json(
        {
          error: `You have reached your submission limit of ${user.submissionLimit} links`,
          limitReached: true,
        },
        { status: 429 }
      );
    }

    const submission = {
      submissionId: uuidv4(),
      userId: payload.userId,
      userEmail: user.email,
      link: link.trim(),
      timestamp: new Date().toISOString(),
    };

    await addLink(submission);

    return NextResponse.json({
      success: true,
      message: "Link submitted successfully",
      submission,
      remaining: user.submissionLimit - currentCount - 1,
    });
  } catch (error) {
    console.error("Submit link error:", error);
    return NextResponse.json(
      { error: "Failed to submit link" },
      { status: 500 }
    );
  }
}
