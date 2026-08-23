import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

/**
 * Opened from a mail client, so this route is deliberately unauthenticated —
 * the signed token is the credential. proxy.ts already excludes /api from its
 * matcher, so no routing change is needed.
 *
 * Responds with HTML rather than JSON because a person is looking at it.
 */
function page(title: string, body: string, status: number) {
  return new NextResponse(
    `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:32rem;margin:20vh auto;padding:0 1.5rem;text-align:center;color:#1c1917">
  <h1 style="font-size:1.25rem;margin:0 0 .5rem">${title}</h1>
  <p style="color:#78716c;line-height:1.6;margin:0">${body}</p>
</div>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return page("Invalid link", "This unsubscribe link is missing a token.", 400);
  }

  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return page(
      "Invalid link",
      "This unsubscribe link is not valid. You can turn digests off in Clarus under Settings.",
      400,
    );
  }

  try {
    await prisma.userDetail.updateMany({
      where: { userId },
      data: { emailNotification: false },
    });
  } catch (error) {
    console.error("GET /api/unsubscribe error:", error);
    return page("Something went wrong", "Please try again in a moment.", 500);
  }

  return page(
    "Unsubscribed",
    "You won't receive any more Clarus digests. You can turn them back on any time in Settings.",
  200);
}

/** Gmail and Outlook POST to List-Unsubscribe-Post rather than following the link. */
export async function POST(req: NextRequest) {
  return GET(req);
}
