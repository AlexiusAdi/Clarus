import Link from "next/link";
import { COMPANY } from "@/constants/legal";

/**
 * Renders the plain-text legal documents in constants/legal.ts as a page.
 *
 * The source is prose, not markup, because the same strings are also shown in
 * the onboarding modal — so this parses the few structural conventions the
 * documents already follow (numbered sections, lettered subsections, dashed
 * lists) rather than asking the copy to carry HTML.
 */

type Block =
  | { kind: "section"; number: string; title: string; id: string }
  | { kind: "subsection"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

type Parsed = {
  title: string;
  updated: string | null;
  blocks: Block[];
};

const SECTION = /^(\d+)\.\s+(.+)$/;
const SUBSECTION = /^([a-z])\.\s+(.+)$/;
const UPDATED = /^Terakhir diperbarui:\s*(.+)$/;
const EMAIL = /([\w.+-]+@[\w-]+\.[\w.-]+)/g;

function parse(source: string): Parsed {
  const blocks: Block[] = [];
  let title = "";
  let updated: string | null = null;
  let list: string[] | null = null;

  const flushList = () => {
    if (list) {
      blocks.push({ kind: "list", items: list });
      list = null;
    }
  };

  for (const raw of source.trim().split("\n")) {
    const line = raw.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      (list ??= []).push(line.slice(2));
      continue;
    }

    flushList();

    if (!title) {
      title = line;
      continue;
    }

    const dated = line.match(UPDATED);
    if (dated) {
      updated = dated[1];
      continue;
    }

    const section = line.match(SECTION);
    if (section) {
      blocks.push({
        kind: "section",
        number: section[1],
        title: section[2],
        id: `bagian-${section[1]}`,
      });
      continue;
    }

    const subsection = line.match(SUBSECTION);
    if (subsection) {
      blocks.push({ kind: "subsection", text: subsection[2] });
      continue;
    }

    blocks.push({ kind: "paragraph", text: line });
  }

  flushList();
  return { title, updated, blocks };
}

/** Turns bare email addresses in the prose into working mailto links. */
function withMailtoLinks(text: string) {
  return text.split(EMAIL).map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={`mailto:${part}`}
        className="text-foreground underline decoration-[var(--amber)] decoration-2 underline-offset-4 hover:decoration-foreground"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default function LegalDocument({
  source,
  counterpart,
}: {
  source: string;
  /** The other document, linked in the header so the two read as one set. */
  counterpart: { href: string; label: string };
}) {
  const { title, updated, blocks } = parse(source);
  const sections = blocks.filter(
    (block): block is Extract<Block, { kind: "section" }> =>
      block.kind === "section",
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="headline text-lg tracking-tight hover:text-[var(--amber)]"
          >
            Certus
          </Link>
          <Link
            href={counterpart.href}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {counterpart.label}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-16">
        <div className="max-w-[62ch]">
          <h1 className="headline text-3xl leading-tight sm:text-4xl">
            {title}
          </h1>
          {updated && (
            <p className="mt-3 text-sm text-muted-foreground">
              Terakhir diperbarui {updated}
            </p>
          )}
        </div>

        <div className="mt-12 gap-16 lg:flex lg:items-start">
          {/*
            The index is the document's own numbering rather than decoration —
            clauses get referred to by number in correspondence, so being able
            to jump straight to one is the point.
          */}
          <nav
            aria-label="Daftar isi"
            className="mb-12 shrink-0 border-l border-border pl-5 lg:sticky lg:top-24 lg:order-2 lg:mb-0 lg:w-56 lg:border-none lg:pl-0"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Daftar isi
            </p>
            <ol className="mt-4 space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="tabular w-5 shrink-0 text-right text-xs leading-5 text-[var(--amber)]">
                      {section.number}
                    </span>
                    <span className="leading-5">{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0 max-w-[62ch] lg:order-1">
            {blocks.map((block, i) => {
              switch (block.kind) {
                case "section":
                  return (
                    <h2
                      key={i}
                      id={block.id}
                      className="headline mt-12 flex scroll-mt-24 gap-4 text-lg first:mt-0 sm:text-xl"
                    >
                      <span
                        aria-hidden
                        className="tabular w-8 shrink-0 text-right text-[var(--amber)]"
                      >
                        {block.number}
                      </span>
                      <span>{block.title}</span>
                    </h2>
                  );
                case "subsection":
                  return (
                    <h3
                      key={i}
                      className="mt-8 text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {block.text}
                    </h3>
                  );
                case "list":
                  return (
                    <ul key={i} className="mt-4 space-y-2">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-3 leading-relaxed">
                          <span
                            aria-hidden
                            className="mt-[0.7em] h-px w-3 shrink-0 bg-[var(--amber)]"
                          />
                          <span className="min-w-0">
                            {withMailtoLinks(item)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                default:
                  return (
                    <p key={i} className="mt-4 leading-relaxed">
                      {withMailtoLinks(block.text)}
                    </p>
                  );
              }
            })}
          </article>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">
          <p className="text-foreground">{COMPANY.name}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-foreground">
              Syarat dan Ketentuan
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Kebijakan Privasi
            </Link>
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="hover:text-foreground"
            >
              {COMPANY.supportEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
