import Link from "next/link";
import { COMPANY } from "@/constants/legal";

/**
 * Sits at the foot of the signed-out screens. Beyond being good manners, the
 * links are a hard requirement: Google's OAuth consent screen will not be
 * published without reachable terms and privacy URLs, and Midtrans looks for
 * both plus a named legal entity when reviewing a merchant application.
 */
export default function PublicFooter() {
  return (
    <footer className="pb-safe absolute inset-x-0 bottom-0 px-6 pt-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span>{COMPANY.name}</span>
        <Link href="/terms" className="hover:text-foreground">
          Syarat dan Ketentuan
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          Kebijakan Privasi
        </Link>
      </div>
    </footer>
  );
}
