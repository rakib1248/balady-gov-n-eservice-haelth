import type { Metadata } from "next";

export const metadata: Metadata = { title: "Issue Health Certificate" };

export default async function PublicCertificatePrint({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pdfUrl = `/api/verify/${encodeURIComponent(token)}/pdf`;

  return (
    <main style={{ width: "100%", height: "100dvh", margin: 0, background: "#e9eeeb" }}>
      <iframe
        title="Issue Health Certificate"
        src={pdfUrl}
        style={{ display: "block", width: "100%", height: "100%", border: 0 }}
      />
    </main>
  );
}
