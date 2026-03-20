import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clarus - Public",
  description: "Instantly credible",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
