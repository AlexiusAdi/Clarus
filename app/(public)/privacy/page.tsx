import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { PRIVACY_CONTENT } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Certus",
  description:
    "Bagaimana Certus mengumpulkan, menggunakan, dan melindungi data pribadi Anda sesuai UU PDP No. 27 Tahun 2022.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      source={PRIVACY_CONTENT}
      counterpart={{ href: "/terms", label: "Syarat dan Ketentuan" }}
    />
  );
}
