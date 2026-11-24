import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Issue Health Certificate",
  robots: { index: false, follow: false, noarchive: true },
};

export default function VerificationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
