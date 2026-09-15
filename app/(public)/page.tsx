import Image from "next/image";
import Link from "next/link";
import PublicFooter from "@/components/PublicFooter";
import TransitionEffect from "@/components/TransitionEffect";
import { FREE_FEATURES, PLAN_PRICES, PRO_FEATURES } from "@/constants/plans";
import { formatCurrency } from "@/lib/helper/formatCurrency";
import { Check } from "lucide-react";

/**
 * The only page a stranger reads before deciding whether to sign up, and the
 * page Midtrans reviews to see what is being sold and for how much.
 *
 * A server component on purpose. Every control is a link, so there is no
 * client JavaScript on the critical path and the copy is in the HTML the
 * crawler and the payment reviewer receive.
 *
 * Structure is Apple's: full-bleed colour fields instead of ruled sections,
 * one idea per screen, and a large centred figure carrying each claim. Colour
 * stays Certus's own warm palette rather than Apple's neutral grey, so the
 * product someone signs into looks like the page that sold it.
 *
 * Motion is scroll-driven CSS (see the landing block in globals.css) and never
 * gates visibility. The original note here still holds and now covers more
 * than gsap: an entrance animation that starts at opacity 0 leaves the page
 * blank whenever the thing meant to reveal it does not run — a throttled tab,
 * a JS failure, an embedded viewer whose outer container does the scrolling.
 * Unacceptable for a page whose whole job is to be read on first paint.
 *
 * The hero leads with the reset day rather than a generic tracking promise: it
 * is the one thing Certus does that competing apps do not, and it is a claim a
 * picture can prove. The price comes from PLAN_PRICES so the page cannot
 * advertise a figure the server would not charge.
 */

const TRACKS = [
  {
    title: "Income and spending",
    accent: "var(--sage)",
    wide: true,
    body: "Record what comes in and what goes out, sorted into categories you control. Set up a repeating entry once and Certus adds it for you on the day it is due.",
  },
  {
    title: "Assets",
    accent: "var(--clay)",
    wide: false,
    body: "A house, a car, anything you own that holds value. You set the number and change it when the value changes.",
  },
  {
    title: "Investments",
    accent: "var(--amber)",
    wide: false,
    body: "Stocks, crypto and gold refresh their own prices every day, converted to rupiah. Everything else holds the value you enter. Prices are indicative.",
  },
  {
    title: "Savings goals",
    accent: "var(--sand)",
    wide: true,
    body: "Put money aside for something specific and see how close you are. Certus can write you a short summary of how each goal is tracking.",
  },
];

const REASONS = [
  {
    title: "It starts from what you already have",
    body: "Most apps count up from zero on the day you install them, so the total never agrees with your bank. Certus asks what you hold on day one and counts from there.",
  },
  {
    title: "Nothing renews automatically",
    body: "Pro lasts one year from the day you pay. There is no automatic renewal and no card kept on file. When the year ends you decide whether to pay again.",
  },
];

const NAV = [
  { href: "#tracks", label: "What it tracks" },
  { href: "#pricing", label: "Pricing" },
];

export default function Home() {
  const price = formatCurrency(PLAN_PRICES.PRO);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TransitionEffect />

      {/* Translucent bar over whichever field is behind it. The first two
          links drop on phones: Pricing and Sign in are the two that lead
          somewhere a visitor actually wants to go. */}
      <header className="fixed inset-x-0 top-0 z-50 h-12 border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between gap-6 px-[22px]">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt=""
              width={19}
              height={19}
              className="rounded-[5px]"
              priority
            />
            <span className="headline text-sm">Certus</span>
          </Link>
          <nav className="flex items-center gap-[18px] sm:gap-6">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs text-foreground/85 hover:text-foreground ${
                  i < 2 ? "hidden sm:inline" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-xs text-foreground/85 hover:text-foreground"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-[22px] pt-[150px] pb-[70px] text-center">
          <div className="mx-auto max-w-[980px]">
            <h1 className="landing-reveal headline text-[clamp(2.5rem,7.4vw,5rem)] leading-[1.05] tracking-[-0.028em]">
              Your month starts
              <br />
              on payday, not the 1st.
            </h1>
            <p className="landing-reveal mx-auto mt-[18px] max-w-[34ch] text-[clamp(1.1875rem,2.1vw,1.3125rem)] leading-[1.42] tracking-[-0.014em] text-muted-foreground">
              Certus tracks what you earn, spend, own and invest — measured from
              your salary date, so the number you see is the money you actually
              have left.
            </p>
            <div className="landing-reveal mt-[26px] flex flex-wrap items-center justify-center gap-x-[30px] gap-y-3.5">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-[23px] text-[17px] tracking-[-0.012em] text-background transition-opacity hover:opacity-85"
              >
                Get started
              </Link>
              <Link
                href="#pricing"
                className="text-[17px] tracking-[-0.012em] text-[var(--amber)] hover:underline"
              >
                See what Pro includes ›
              </Link>
            </div>
            <p className="landing-reveal mt-[22px] text-xs text-muted-foreground">
              Free to use. {price} a year for everything.
            </p>
          </div>
        </section>

        {/* The payday cycle — the claim in the headline, drawn.

            The panel stays pinned while the bar fills, so the reader watches a
            spending month run from one payday straight through the 1st to the
            next. The bar carries a sensible static fill and the count a static
            number, which is what shows if scroll timelines are unavailable. */}
        <div className="payday-section relative h-[230vh] bg-surface-2">
          <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-10 px-[22px]">
            <p className="headline text-[clamp(1.875rem,4.4vw,2.75rem)] tracking-[-0.024em]">
              Payday to payday.
            </p>

            <div className="relative h-[74px] w-full max-w-[760px]">
              <div className="absolute inset-x-0 top-[26px] h-2.5 rounded-full bg-foreground/10" />
              <div className="payday-fill absolute inset-x-0 top-[26px] h-2.5 rounded-full bg-[var(--amber)]" />

              {/* Rides the leading edge of the fill, so where you are in the
                  month reads at a glance without a number to keep in sync. */}
              <span
                aria-hidden
                className="payday-today absolute top-[23px] size-4 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
              />

              {/* The 1st sits partway along on purpose: the bar running past it
                  is the whole argument. */}
              <div className="absolute top-1.5 left-[34%] h-12 border-l border-dashed border-muted-foreground/55 sm:left-[38%]">
                <span className="absolute -top-1 left-2 whitespace-nowrap text-[11px] text-muted-foreground sm:text-xs">
                  the 1st — where every other app restarts
                </span>
              </div>

              <span className="absolute top-4 left-0 h-[30px] w-1.5 rounded-full bg-foreground" />
              <span className="absolute top-4 right-0 h-[30px] w-1.5 rounded-full bg-foreground" />
              <span className="absolute top-[58px] left-0 text-[13px] font-semibold">
                payday
              </span>
              <span className="absolute top-[58px] right-0 text-[13px] font-semibold">
                next payday
              </span>
            </div>

            <p className="max-w-[38ch] text-center text-sm text-muted-foreground">
              Set the day you get paid. Certus measures every month from there,
              straight through the 1st.
            </p>
          </div>
        </div>

        {/* What it tracks */}
        <section
          id="tracks"
          className="scroll-mt-12 bg-surface-2 px-[22px] py-[110px]"
        >
          <div className="mx-auto max-w-[980px]">
            <h2 className="landing-reveal headline text-center text-[clamp(2rem,4.6vw,3rem)] leading-[1.08] tracking-[-0.024em]">
              Four things, one total.
            </h2>
            <div className="mt-[52px] grid gap-3.5 sm:grid-cols-2">
              {TRACKS.map((item) => (
                <div
                  key={item.title}
                  className={`landing-reveal flex min-h-[230px] flex-col justify-end gap-2.5 rounded-[28px] border border-border bg-background px-[30px] py-[34px] ${
                    item.wide ? "sm:col-span-2" : ""
                  }`}
                >
                  {/* The same four colours the app charts money with, so the
                      page and the product read as one thing. */}
                  <span
                    aria-hidden
                    className="mb-3 block h-[5px] w-[34px] rounded-full"
                    style={{ background: item.accent }}
                  />
                  <h3 className="headline max-w-[16ch] text-[clamp(1.375rem,2.5vw,1.75rem)] leading-tight tracking-[-0.019em]">
                    {item.title}
                  </h3>
                  <p className="max-w-[38ch] text-sm leading-snug text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why the total is honest */}
        <section className="bg-foreground px-[22px] py-[110px] text-background">
          <div className="mx-auto max-w-[980px] text-center">
            <h2 className="landing-reveal headline text-[clamp(2rem,4.6vw,3rem)] leading-[1.08] tracking-[-0.024em]">
              The total matches your bank.
            </h2>
            <p className="landing-reveal mx-auto mt-[18px] max-w-[34ch] text-[clamp(1.1875rem,2.1vw,1.3125rem)] leading-[1.42] tracking-[-0.014em] text-background/65">
              Two decisions make that true.
            </p>
            <div className="mt-14 grid gap-3.5 text-left sm:grid-cols-2">
              {REASONS.map((reason) => (
                <div
                  key={reason.title}
                  className="landing-reveal flex min-h-[230px] flex-col justify-end gap-2.5 rounded-[28px] border border-background/12 bg-background/6 px-[30px] py-[34px]"
                >
                  <h3 className="headline text-[clamp(1.375rem,2.5vw,1.75rem)] leading-tight tracking-[-0.019em]">
                    {reason.title}
                  </h3>
                  <p className="max-w-[38ch] text-sm leading-snug text-background/65">
                    {reason.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="scroll-mt-12 bg-surface-2 px-[22px] py-[110px]"
        >
          <div className="mx-auto max-w-[980px] text-center">
            <h2 className="landing-reveal headline text-[clamp(2rem,4.6vw,3rem)] leading-[1.08] tracking-[-0.024em]">
              One paid plan. Everything in it.
            </h2>
            <p className="landing-reveal mx-auto mt-[18px] max-w-[34ch] text-[clamp(1.1875rem,2.1vw,1.3125rem)] leading-[1.42] tracking-[-0.014em] text-muted-foreground">
              No tiers to compare, no feature you have to go looking for.
            </p>

            <div className="mt-12 grid gap-3.5 text-left sm:grid-cols-2">
              {/* Both cards carry a list and a button so neither is left as an
                  empty block when the grid stretches them to equal height. */}
              <div className="landing-reveal flex flex-col rounded-[28px] border border-border bg-background px-[30px] py-[34px]">
                <p className="text-sm">Free</p>
                <p className="headline mt-1.5 text-[2.5rem] tracking-[-0.026em]">
                  {formatCurrency(0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">forever</p>
                <ul className="mt-6 flex flex-1 flex-col gap-[11px]">
                  {FREE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="text-[15px]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="mt-[26px] inline-flex h-11 w-full items-center justify-center rounded-full border border-border text-[17px] tracking-[-0.012em] transition-opacity hover:opacity-85"
                >
                  Start free
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  No card needed. Upgrade whenever you want.
                </p>
              </div>

              <div className="landing-reveal flex flex-col rounded-[28px] border border-foreground bg-foreground px-[30px] py-[34px] text-background">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">Pro</p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: "var(--amber)", color: "var(--ink)" }}
                  >
                    Everything included
                  </span>
                </div>
                <p className="headline mt-1.5 text-[2.5rem] tracking-[-0.026em]">
                  {price}
                </p>
                <p className="mt-1 text-xs text-background/65">a year</p>
                <ul className="mt-6 flex flex-1 flex-col gap-[11px]">
                  {PRO_FEATURES.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0"
                        style={{ color: "var(--sand)" }}
                      />
                      <span className="text-[15px]">{feature.label}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="mt-[26px] inline-flex h-11 w-full items-center justify-center rounded-full bg-background text-[17px] tracking-[-0.012em] text-foreground transition-opacity hover:opacity-85"
                >
                  Get started
                </Link>
                <p className="mt-3 text-xs text-background/65">
                  Paid through Midtrans. Billed once, in rupiah.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter floating={false} />
    </div>
  );
}
