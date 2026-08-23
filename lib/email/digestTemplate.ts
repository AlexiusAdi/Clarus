import { DigestData } from "@/lib/data/getDigestData";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { formatFinancialPeriod } from "@/lib/helper/financialPeriod";

/**
 * Palette and type are the app's own tokens, converted from the OKLCH values in
 * app/globals.css — email clients don't support oklch(), and the digest should
 * not look like a different product than the app it came from.
 */
const C = {
  paper: "#F9F7F1",
  card: "#FDFCF9",
  ink: "#21201D",
  quiet: "#85837B",
  rule: "#E4E0D3",
  alarm: "#A04838",
  alarmBg: "#FDECE8",
  gain: "#3A7649",
} as const;

// Instrument Serif is the app's display face. Clients that have it use it;
// everywhere else Georgia carries the same warm, high-contrast character.
const DISPLAY = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO =
  "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const signed = (n: number) =>
  `${n >= 0 ? "+" : "−"}${formatCurrency(Math.abs(n))}`;

const pct = (n: number) =>
  `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;

/** One ledger line: label left, figure right, note underneath. */
function row(label: string, figure: string, note: string, figureColor: string = C.ink) {
  return `
  <tr>
    <td style="padding:18px 32px;border-top:1px solid ${C.rule};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:${BODY};font-size:14px;color:${C.ink};font-weight:600;">${label}</td>
          <td align="right" style="font-family:${MONO};font-size:15px;color:${figureColor};white-space:nowrap;padding-left:12px;">${figure}</td>
        </tr>
      </table>
      <div style="font-family:${BODY};font-size:13px;line-height:1.5;color:${C.quiet};padding-top:5px;">${note}</div>
    </td>
  </tr>`;
}

export function digestSubject(data: DigestData): string {
  if (data.cash.shortfall) {
    return "Recurring charges are about to exceed your cash";
  }
  return data.daysUntilClose === 1
    ? "Your cycle closes tomorrow"
    : `Your cycle closes in ${data.daysUntilClose} days`;
}

/** Plain-text alternative. Sending HTML alone is a deliverability penalty. */
export function digestText(
  data: DigestData,
  firstName: string,
  unsubscribeLink: string,
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const plural = data.daysUntilClose === 1 ? "" : "s";

  const lines = [
    `Hi ${firstName},`,
    "",
    `Your spending cycle closes in ${data.daysUntilClose} day${plural} (${formatFinancialPeriod(data.period)}).`,
    "",
    `Spending: ${formatCurrency(data.spend.total)}` +
      (data.spend.baseline !== null
        ? ` (usually ${formatCurrency(data.spend.baseline)} by this point)`
        : ""),
  ];

  if (data.cash.shortfall) {
    lines.push(
      `Heads up: ${formatCurrency(data.cash.upcomingTotal)} of recurring charges land in the next 7 days, but your cash balance is ${formatCurrency(data.cash.balance)}.`,
    );
  }

  if (data.portfolio) {
    lines.push(
      `Portfolio: ${signed(data.portfolio.pnlAbs)}` +
        (data.portfolio.pnlPct !== null
          ? ` (${pct(data.portfolio.pnlPct)})`
          : ""),
    );
  }

  for (const goal of data.goals.slice(0, 2)) {
    lines.push(
      `${goal.name} is tracking ${goal.monthsLate} month(s) behind your deadline.`,
    );
  }

  lines.push("", `Open Clarus: ${appUrl}/home`, `Unsubscribe: ${unsubscribeLink}`);

  return lines.join("\n");
}

export function digestHtml(
  data: DigestData,
  firstName: string,
  unsubscribeLink: string,
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const days = data.daysUntilClose;

  // Ordered by what the reader can still act on, not by category.
  const rows: string[] = [];

  if (data.cash.shortfall) {
    const charges = `${data.cash.upcomingCount} recurring charge${
      data.cash.upcomingCount === 1 ? "" : "s"
    }`;
    rows.push(`
  <tr>
    <td style="padding:16px 32px;border-top:1px solid ${C.rule};background:${C.alarmBg};">
      <div style="font-family:${BODY};font-size:14px;font-weight:600;color:${C.alarm};">
        ${formatCurrency(data.cash.upcomingTotal)} due before then
      </div>
      <div style="font-family:${BODY};font-size:13px;line-height:1.5;color:${C.alarm};padding-top:4px;">
        ${charges} land in the next 7 days. Your cash balance is ${formatCurrency(data.cash.balance)}.
      </div>
    </td>
  </tr>`);
  }

  const largest = data.spend.topCategory
    ? `${data.spend.topCategory.name} is your largest at ${formatCurrency(data.spend.topCategory.amount)}`
    : null;

  rows.push(
    row(
      "Spending",
      formatCurrency(data.spend.total),
      data.spend.baseline !== null
        ? `Usually ${formatCurrency(data.spend.baseline)} by this point` +
            (largest ? ` · ${largest}` : "")
        : (largest ?? "No expenses recorded this cycle yet"),
    ),
  );

  if (data.portfolio) {
    const best = data.portfolio.best
      ? ` · ${data.portfolio.best.name} leads at ${pct(data.portfolio.best.pnlPct)}`
      : "";
    const percent =
      data.portfolio.pnlPct !== null
        ? ` · ${pct(data.portfolio.pnlPct)}`
        : "";

    rows.push(
      row(
        "Portfolio",
        signed(data.portfolio.pnlAbs),
        `Now worth ${formatCurrency(data.portfolio.totalValue)}${percent}${best}`,
        data.portfolio.pnlAbs >= 0 ? C.gain : C.alarm,
      ),
    );
  }

  for (const goal of data.goals.slice(0, 2)) {
    rows.push(
      row(
        goal.name,
        `${goal.monthsLate} mo behind`,
        `${formatCurrency(goal.remaining)} still to save to hit your deadline`,
        C.alarm,
      ),
    );
  }

  const headline =
    days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;

  const preheader = data.cash.shortfall
    ? `${formatCurrency(data.cash.upcomingTotal)} of recurring charges land before your cycle closes.`
    : `You have spent ${formatCurrency(data.spend.total)} this cycle.`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${digestSubject(data)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.rule};border-radius:14px;">

  <tr>
    <td style="padding:26px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:${BODY};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.ink};">Clarus</td>
          <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:0.04em;color:${C.quiet};">${formatFinancialPeriod(data.period)}</td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:22px 32px 26px;">
      <div style="font-family:${DISPLAY};font-size:40px;line-height:1.08;color:${C.ink};mso-line-height-rule:exactly;">
        Your cycle closes<br>${headline}
      </div>
      <div style="font-family:${BODY};font-size:14px;line-height:1.55;color:${C.quiet};padding-top:10px;">
        Hi ${firstName} — here is where you stand while there is still time to change it.
      </div>
    </td>
  </tr>
${rows.join("")}
  <tr>
    <td style="padding:26px 32px 30px;border-top:1px solid ${C.rule};">
      <a href="${appUrl}/home" style="display:inline-block;font-family:${BODY};font-size:14px;font-weight:600;color:${C.card};background:${C.ink};text-decoration:none;padding:12px 22px;border-radius:9px;">Open Clarus</a>
    </td>
  </tr>
</table>

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
  <tr>
    <td align="center" style="padding:18px 32px 0;font-family:${BODY};font-size:12px;line-height:1.6;color:${C.quiet};">
      Sent because email summaries are on for your account.<br>
      <a href="${unsubscribeLink}" style="color:${C.quiet};text-decoration:underline;">Unsubscribe</a>
    </td>
  </tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}
