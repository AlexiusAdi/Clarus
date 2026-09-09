import Anthropic from "@anthropic-ai/sdk";
import { GoalDTO } from "@/lib/data/goals";
import { formatCurrency } from "@/lib/helper/formatCurrency";

/**
 * Writes the goals summary shown on /goals.
 *
 * One request, one response — this is summarisation, not an agent, so there is
 * no tool loop and nothing to orchestrate.
 */

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic();
  }
  return client;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * No cache_control here on purpose: this system prompt is a few hundred tokens,
 * well under the minimum cacheable prefix, so a breakpoint would do nothing but
 * suggest a saving that is not happening.
 */
const SYSTEM = `You write a short progress note about one person's savings goals inside Certus, an Indonesian personal finance app.

Rules you must follow:
- Write 2 to 4 sentences of plain text. No markdown, no HTML, no bullet points, no headings.
- Write plain, concrete English. Short words. No idioms and no phrasal verbs — many readers are not native English speakers.
- Talk only about the goals you are given. Never invent a goal, an amount, or a date.
- Say which goal is furthest behind and one specific thing the person could do about it.
- Amounts are Indonesian Rupiah, already formatted. Copy them exactly as written.
- You are not a licensed financial adviser. Do not recommend investments, products, or anything beyond how much to set aside and when.
- If the goals are all on track, say so plainly instead of inventing a problem.`;

function describeGoals(goals: GoalDTO[], today: Date): string {
  const lines = goals.map((goal) => {
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
    const percent =
      goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0;

    const parts = [
      `Goal: ${goal.name}`,
      `saved ${formatCurrency(goal.currentAmount)} of ${formatCurrency(goal.targetAmount)} (${percent}%)`,
      `still needs ${formatCurrency(remaining)}`,
    ];

    if (goal.deadline) {
      const days = Math.ceil(
        (goal.deadline.getTime() - today.getTime()) / 86_400_000,
      );
      parts.push(
        days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`,
      );
    } else {
      parts.push("no deadline");
    }

    if (goal.isCompleted) parts.push("already complete");

    return `- ${parts.join(", ")}`;
  });

  return lines.join("\n");
}

export class NoGoalsError extends Error {}

/**
 * @throws NoGoalsError when there is nothing to write about, so the caller can
 *         answer with an empty state rather than paying for a request.
 */
export async function generateGoalsInsight(
  goals: GoalDTO[],
  today: Date = new Date(),
): Promise<string> {
  const active = goals.filter((goal) => !goal.isCompleted);
  if (active.length === 0) throw new NoGoalsError();

  const response = await anthropic().messages.create({
    // Sonnet rather than Opus: this turns five numbers into three sentences
    // under tight constraints, which is not where a frontier model earns its
    // price. Roughly Rp 80 a generation against a Rp 99.000 subscription.
    model: "claude-sonnet-5",
    max_tokens: 4096,
    // Effort is low deliberately: higher effort would spend thinking tokens on
    // a task that does not reward them.
    output_config: { effort: "low" },
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Today is ${today.toISOString().slice(0, 10)}.\n\n${describeGoals(active, today)}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(
      `Claude declined the request: ${response.stop_details?.category ?? "unknown"}`,
    );
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) throw new Error("Claude returned no text");

  return text;
}
