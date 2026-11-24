import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rifd Certificate Verification",
  robots: { index: false, follow: false, noarchive: true },
};

export default function VerificationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
