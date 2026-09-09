import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGoals } from "@/lib/data/goals";
import { isPro } from "@/lib/helper/plan";
import {
  NoGoalsError,
  generateGoalsInsight,
  isAiConfigured,
} from "@/lib/ai/goalsInsight";

/**
 * Every generation costs real money, so regeneration is rate limited per user
 * rather than left to however often someone clicks the button. Reads are free:
 * GET returns the stored insight, which is why the page can show one without
 * calling Claude on every visit.
 *
 * A day rather than an hour: goals move slowly, so a summary rewritten more
 * often than daily says the same thing at full price, and the cap is what
 * bounds what one user can cost against a Rp 99.000 subscription.
 */
const COOLDOWN_MINUTES = 60 * 24;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const insight = await prisma.aiInsight.findUnique({
      where: { userId: session.user.id },
      select: { content: true, generatedAt: true },
    });

    return NextResponse.json({
      content: insight?.content ?? null,
      generatedAt: insight?.generatedAt ?? null,
      available: isAiConfigured(),
    });
  } catch (error) {
    console.error("GET /api/user/ai/goals error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isPro(session.user.plan)) {
      return NextResponse.json(
        { message: "AI insights are part of Certus Pro." },
        { status: 403 },
      );
    }

    if (!isAiConfigured()) {
      return NextResponse.json(
        { message: "AI insights are not available right now." },
        { status: 503 },
      );
    }

    const userId = session.user.id;

    const existing = await prisma.aiInsight.findUnique({
      where: { userId },
      select: { generatedAt: true },
    });

    if (existing) {
      const minutesSince =
        (Date.now() - existing.generatedAt.getTime()) / 60_000;
      if (minutesSince < COOLDOWN_MINUTES) {
        const minutesLeft = Math.ceil(COOLDOWN_MINUTES - minutesSince);
        const hoursLeft = Math.ceil(minutesLeft / 60);
        const wait =
          minutesLeft < 60
            ? `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`
            : `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
        return NextResponse.json(
          { message: `You can refresh this again in ${wait}.` },
          { status: 429 },
        );
      }
    }

    const goals = await getGoals(userId);

    let content: string;
    try {
      content = await generateGoalsInsight(goals);
    } catch (error) {
      if (error instanceof NoGoalsError) {
        return NextResponse.json(
          { message: "Add a goal first and we will summarise your progress." },
          { status: 400 },
        );
      }
      // Most specific first: a rate limit or an outage upstream is worth
      // telling the user apart from a bug on our side.
      if (error instanceof Anthropic.RateLimitError) {
        return NextResponse.json(
          { message: "Too many requests right now. Try again shortly." },
          { status: 429 },
        );
      }
      if (error instanceof Anthropic.APIConnectionError) {
        return NextResponse.json(
          { message: "Could not reach the AI service. Try again shortly." },
          { status: 502 },
        );
      }
      if (error instanceof Anthropic.APIError) {
        console.error("POST /api/user/ai/goals — Anthropic error:", error);
        return NextResponse.json(
          { message: "Could not write your summary. Try again shortly." },
          { status: 502 },
        );
      }
      throw error;
    }

    const saved = await prisma.aiInsight.upsert({
      where: { userId },
      create: { userId, content },
      update: { content, generatedAt: new Date() },
      select: { content: true, generatedAt: true },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("POST /api/user/ai/goals error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
