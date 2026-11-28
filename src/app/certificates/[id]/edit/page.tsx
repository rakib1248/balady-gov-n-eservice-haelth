"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CertificateForm from "@/components/certificates/certificate-form";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";
import PortalFrame from "@/components/layout/portal-frame";

export default function EditCertificatePage() {
  const { id } = useParams<{ id: string }>();
  const { locale } = useLocale();
  const txt = (ar:string,en:string)=>t(locale,ar,en);
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/certificates/${encodeURIComponent(id)}`, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error(t(locale,"تعذر العثور على الشهادة أو لا تملك صلاحية عرضها.", "Certificate not found or you do not have permission to view it."));
      const value = await response.json();
      for (const key of ["issueDate", "expiryDate", "programExpiryDate"]) value[key] = value[key] ? new Date(value[key]).toISOString().slice(0, 10) : "";
      for (const key of Object.keys(value)) value[key] ??= "";
      setData(value);
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : t(locale,"حدث خطأ.", "Something went wrong.")));
  }, [id, locale]);
  return <PortalFrame signedIn><main className="form-page certificate-page" dir={locale==="ar"?"rtl":"ltr"}><div className="form-top"><Link href="/certificates">← {txt("الشهادات","Certificates")}</Link><span>{txt("مساحة الشهادات","Certificate workspace")}</span></div><div className="form-heading"><h1>{txt("تعديل الشهادة","Edit certificate")}</h1><p>{txt("التغييرات تحفظ كسجل إصدار جديد.","Changes are saved as a new version.")}</p></div>{data?<CertificateForm initial={data} certificateId={id}/>:error?<div className="form-error" role="alert">{error}</div>:<p>{txt("جارٍ تحميل الشهادة…","Loading certificate…")}</p>}</main></PortalFrame>;
}
