"use client";

import PublicFooter from "@/components/PublicFooter";
import TransitionEffect from "@/components/TransitionEffect";
import { Button } from "@/components/ui/button";
import { FREE_LIMITS, PLAN_PRICES, PRO_FEATURES } from "@/constants/plans";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * The only page a stranger reads before deciding whether to sign up, and the
 * page Midtrans reviews to see what is being sold and for how much.
 *
 * Deliberately no entrance animation. gsap.from() sets opacity to 0 and relies
 * on requestAnimationFrame to bring it back, so a throttled tab or a JS failure
 * leaves the headline invisible — an unacceptable trade for a page whose whole
 * job is to be read on first paint.
 *
 * The hero leads with the reset day rather than a generic tracking promise: it
 * is the one thing Certus does that competing apps do not, and it is a claim a
 * picture can prove. The price comes from PLAN_PRICES so the page cannot
 * advertise a figure the server would not charge.
 */

const TRACKS = [
  {
    title: "Income and spending",
    body: "Record what comes in and what goes out, sorted into categories you control. Set up a repeating entry once and Certus adds it for you on the day it is due.",
  },
  {
    title: "Assets",
    body: "A house, a car, anything you own that holds value. You set the number and change it when the value changes.",
  },
  {
    title: "Investments",
    body: "Stocks, crypto and gold refresh their own prices every day, converted to rupiah. Everything else holds the value you enter. Prices are indicative.",
  },
  {
    title: "Savings goals",
    body: "Put money aside for something specific and see how close you are. Certus can write you a short summary of how each goal is tracking.",
  },
];

export default function Home() {
  const router = useRouter();

  const price = formatCurrency(PLAN_PRICES.PRO);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <TransitionEffect />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="headline text-lg tracking-tight">Certus</span>
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sign in
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="border-b border-border py-16 sm:py-24">
          <p
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            Personal finance for Indonesia
          </p>
          <h1
            className="headline mt-5 max-w-[18ch] text-4xl leading-[1.1] sm:text-6xl"
          >
            Your month starts on payday, not the 1st.
          </h1>
          <p
            className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Certus tracks what you earn, spend, own and invest. It measures each
            month from your salary date, so the number you see covers the money
            you actually have left.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => router.push("/login")}
              className="h-11 rounded-[10px] bg-ink px-6 text-sm font-medium text-background hover:opacity-90"
            >
              Get started
            </Button>
            <span className="text-sm text-muted-foreground">
              Free to use. {price} a year for everything.
            </span>
          </div>

          {/*
            The diagram is the argument, not decoration: it shows the salary-date
            cycle against the calendar month that other apps measure, which is
            the difference the headline claims.
          */}
          <figure className="mt-14 max-w-lg">
            <svg viewBox="0 0 400 78" className="w-full" role="img" aria-label="A spending month running from one payday to the next, with the 1st of the month marked partway through">
              <line
                x1="92"
                y1="10"
                x2="92"
                y2="54"
                stroke="var(--border)"
                strokeWidth="1.5"
                strokeDasharray="3 4"
              />
              <text x="98" y="16" className="fill-[var(--muted-foreground)]" fontSize="9">
                the 1st — where most apps start
              </text>

              <rect x="20" y="30" width="360" height="9" rx="4.5" fill="var(--amber)" />
              <rect x="17" y="24" width="6" height="21" rx="3" fill="var(--ink)" />
              <rect x="377" y="24" width="6" height="21" rx="3" fill="var(--ink)" />

              <text x="17" y="60" className="fill-[var(--ink)]" fontSize="10" fontWeight="600">
                payday
              </text>
              <text x="383" y="60" textAnchor="end" className="fill-[var(--ink)]" fontSize="10" fontWeight="600">
                next payday
              </text>
            </svg>
            <figcaption className="mt-3 text-xs text-muted-foreground">
              Set the day you get paid. Certus measures every month from there.
            </figcaption>
          </figure>
        </section>

        {/* What it tracks */}
        <section className="border-b border-border py-16">
          <h2 className="headline text-2xl sm:text-3xl">What Certus keeps track of</h2>
          <dl className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
            {TRACKS.map((item) => (
              <div key={item.title}>
                <dt className="text-sm font-semibold">{item.title}</dt>
                <dd className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* The honest-numbers section */}
        <section className="border-b border-border py-16">
          <h2 className="headline text-2xl sm:text-3xl">
            Why the total actually matches your bank
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold">It starts from what you already have</p>
              <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
                Most apps count up from zero on the day you install them, so the
                total never agrees with your bank. Certus asks what you hold on
                day one and counts from there.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Nothing renews automatically</p>
              <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
                Pro lasts one year from the day you pay. There is no automatic
                renewal and no card kept on file. When the year ends you decide
                whether to pay again.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16">
          <h2 className="headline text-2xl sm:text-3xl">Pricing</h2>
          <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">
            One paid plan. Everything is included in it.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-6">
              <p className="text-sm font-medium">Free</p>
              <p className="headline mt-1 text-3xl">{formatCurrency(0)}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {FREE_LIMITS}
              </p>
            </div>

            <div className="rounded-2xl border border-ink bg-foreground p-6 text-background">
              <p className="text-sm font-medium">Pro</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="headline text-3xl">{price}</span>
                <span className="text-sm text-muted">a year</span>
              </div>
              <ul className="mt-5 flex flex-col gap-2.5">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-[var(--sand)]" />
                    <span className="text-sm">{feature.label}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push("/login")}
                className="mt-6 h-11 w-full rounded-[10px] bg-background text-sm font-medium text-foreground hover:opacity-90"
              >
                Get started
              </Button>
              <p className="mt-3 text-xs text-muted">
                Paid through Midtrans. Billed once, in rupiah.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter floating={false} />
    </div>
  );
}
