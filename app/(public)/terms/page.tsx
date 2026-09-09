import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { TNC_CONTENT } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan — Certus",
  description:
    "Syarat dan ketentuan penggunaan Certus, aplikasi pencatatan keuangan pribadi dari PT Anrico Integrasi Teknologi.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      source={TNC_CONTENT}
      counterpart={{ href: "/privacy", label: "Kebijakan Privasi" }}
    />
  );
}
