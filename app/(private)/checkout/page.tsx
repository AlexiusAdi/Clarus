import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { auth } from "@/auth";
import { getCheckoutSummary } from "@/lib/data/getCheckoutSummary";
import { PRO_FEATURES } from "@/constants/plans";
import { PAYMENT_METHODS } from "@/constants/payment";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import CheckoutPayButton from "@/components/CheckoutPayButton";

/**
 * The step between the upgrade page and Midtrans.
 *
 * Certus is a ledger, so its checkout is built as one: a ruled money column,
 * tabular figures, and a rule drawn only where a sum actually happens. The
 * purchase is the first entry the user makes in a year of Pro, and it is set
 * the way Certus sets every other entry.
 *
 * Nothing here charges anything. The button posts to /api/upgrade, which
 * records a PENDING PaymentOrder and hands back Midtrans's hosted page; the
 * plan is only granted by the signed webhook once the money arrives.
 */
const CheckoutPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const summary = await getCheckoutSummary(session.user.id);
  if (!summary) redirect("/login");

  // Someone already paying has nothing to check out. Sending them back to the
  // upgrade page shows them what they have rather than a dead end.
  if (!summary.canCheckout) redirect("/upgrade");

  const { amount, startsOn, endsOn } = summary;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-safe mx-auto flex w-full max-w-[34rem] items-center justify-between px-5 pb-2">
        <Link
          href="/upgrade"
          className="rounded-full py-1 text-[15px] tracking-[-0.012em] text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back
        </Link>
        <span className="headline text-sm">Certus</span>
      </header>

      <main className="mx-auto w-full max-w-[34rem] px-5 pb-16">
        <h1 className="headline mt-6 text-[clamp(1.75rem,5.5vw,2.25rem)] leading-[1.1] tracking-[-0.024em]">
          Review your order
        </h1>
        <p className="mt-3 max-w-[38ch] text-[15px] leading-[1.5] tracking-[-0.01em] text-muted-foreground">
          You pay on Midtrans&rsquo;s secure page. Your Pro year starts the
          moment the payment clears.
        </p>

        {/* The receipt. */}
        <section
          aria-label="Order summary"
          className="mt-7 rounded-[24px] border border-border bg-card px-6 py-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[17px] font-medium tracking-[-0.012em] text-foreground">
                Certus Pro
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                One year, billed once
              </p>
            </div>
            <span className="rounded-full border border-[var(--sage)]/30 bg-[var(--sage-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--sage)]">
              Yearly
            </span>
          </div>

          <dl className="mt-6 flex flex-col gap-3 text-[15px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Starts</dt>
              <dd className="tabular text-foreground">
                {formatDate(startsOn)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Ends</dt>
              <dd className="tabular text-foreground">{formatDate(endsOn)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Pro, 1 year</dt>
              <dd className="tabular text-foreground">
                {formatCurrency(amount)}
              </dd>
            </div>
          </dl>

          {/* The one rule on the page, because this is where the sum happens. */}
          <div className="mt-5 h-px bg-border" />

          <div className="mt-5 flex items-baseline justify-between gap-4">
            <span className="text-[15px] text-muted-foreground">Total</span>
            <span className="tabular font-[family-name:var(--font-instrument-serif)] text-[2.5rem] leading-none tracking-[-0.02em] text-foreground">
              {formatCurrency(amount)}
            </span>
          </div>
          <p className="mt-2 text-right text-[13px] text-muted-foreground">
            VAT included &middot; No automatic renewal
          </p>
        </section>

        {/* What the money buys. */}
        <section className="mt-9">
          <h2 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Included in Pro
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-center gap-2.5">
                <Check
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[var(--sage)]"
                />
                <span className="text-[15px] text-foreground">
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Named before the handoff, so the redirect is not a surprise. */}
        <section className="mt-9">
          <h2 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Pay with
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <li
                key={method.name}
                className="flex items-baseline justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className="text-[15px] font-medium text-foreground">
                  {method.name}
                </span>
                <span className="text-right text-[13px] text-muted-foreground">
                  {method.detail}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-muted-foreground">
            You choose one on the next screen.
          </p>
        </section>

        <div className="mt-9">
          <CheckoutPayButton amountLabel={formatCurrency(amount)} />
          <p className="mt-4 text-center text-[13px] leading-[1.5] text-muted-foreground">
            By paying you agree to the{" "}
            <Link
              href="/terms"
              className="text-[var(--amber)] underline-offset-2 hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[var(--amber)] underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-2 text-center font-mono text-[11px] tracking-[0.04em] text-muted-foreground uppercase">
            Payments processed by Midtrans
          </p>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
