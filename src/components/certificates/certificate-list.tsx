"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, FilePenLine, FileText, RotateCcw, Ban, Download, ArrowRight } from "lucide-react";
import { t, type Locale } from "@/lib/locale";

type Certificate = { id: string; certificateNumber: string; fullName: string; fullNameAr: string; profession: string; professionAr: string; organizationName: string; organizationNameAr: string; issueDate: string; expiryDate: string; status: "VALID"|"EXPIRED"|"REVOKED" };
type Result = { items: Certificate[]; page: number; pages: number; total: number };

export default function CertificateList({ locale, canEdit, canRevoke }: { locale: Locale; canEdit: boolean; canRevoke: boolean }) {
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const [result, setResult] = useState<Result>({ items: [], page: 1, pages: 0, total: 0 });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    try {
      const response = await fetch(`/api/certificates?${params}`, { cache: "no-store" });
      if (response.ok) setResult(await response.json());
      else setMessage(t(locale,"تعذر تحميل الشهادات.", "Could not load certificates."));
    } catch { setMessage(t(locale,"تعذر الاتصال بالخادم.", "Could not connect to the server.")); }
    finally { setLoading(false); }
  }, [page, query, status, locale]);
  useEffect(() => { const timer = setTimeout(()=>void load(),250); return ()=>clearTimeout(timer); }, [load]);
  async function revoke(certificate: Certificate) {
    if (!window.confirm(`${txt("إلغاء الشهادة", "Revoke certificate")} ${certificate.certificateNumber}?`)) return;
    const response = await fetch(`/api/certificates/${certificate.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Administrative revocation" }) });
    setMessage(response.ok ? txt("تم إلغاء الشهادة.", "Certificate revoked.") : txt("تعذر إلغاء الشهادة.", "Could not revoke certificate.")); void load();
  }
  async function renew(certificate: Certificate) {
    const value = window.prompt(txt("أدخل تاريخ الانتهاء الجديد (YYYY-MM-DD)", "Enter the new expiry date (YYYY-MM-DD)"));
    if (!value) return;
    const response = await fetch(`/api/certificates/${certificate.id}/renew`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expiryDate: value }) });
    setMessage(response.ok ? txt("تم تجديد الشهادة.", "Certificate renewed.") : txt("تعذر التجديد. يجب أن يكون التاريخ الجديد بعد تاريخ الانتهاء الحالي.", "Renewal failed. The new date must be after the current expiry date.")); void load();
  }
  return <section className="certificate-list-card"><div className="list-controls"><label className="search-box"><Search size={16}/><input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1)}} placeholder={txt("ابحث بالاسم أو رقم الشهادة","Search by name or certificate number")}/></label><select aria-label={txt("تصفية حسب الحالة","Filter by status")} value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1)}}><option value="">{txt("كل الحالات","All statuses")}</option><option value="VALID">{txt("سارية","Active")}</option><option value="EXPIRED">{txt("منتهية","Expired")}</option><option value="REVOKED">{txt("ملغاة","Revoked")}</option></select><span className="list-total">{result.total} {txt("شهادة","certificates")}</span></div>{message&&<div className="list-message" role="status">{message}</div>}<div className="table-scroll"><table><thead><tr><th>{txt("المستفيد","Beneficiary")}</th><th>{txt("رقم الشهادة","Certificate number")}</th><th>{txt("المنشأة","Organization")}</th><th>{txt("الإصدار","Issued")}</th><th>{txt("الانتهاء","Expires")}</th><th>{txt("الحالة","Status")}</th><th>{txt("إجراءات","Actions")}</th></tr></thead><tbody>{loading?<tr><td colSpan={7} className="empty-row">{txt("جارٍ تحميل الشهادات…","Loading certificates…")}</td></tr>:result.items.length===0?<tr><td colSpan={7} className="empty-row">{txt("لا توجد شهادات تطابق البحث.","No certificates match your search.")}</td></tr>:result.items.map((item)=><tr key={item.id}><td><b>{locale==="ar"?item.fullNameAr:item.fullName}</b><small className="secondary-name">{locale==="ar"?item.fullName:item.fullNameAr}</small></td><td dir="ltr" className="mono">{item.certificateNumber}</td><td>{locale==="ar"?item.organizationNameAr:item.organizationName}<small className="secondary-name">{locale==="ar"?item.organizationName:item.organizationNameAr}</small></td><td dir="ltr">{item.issueDate ? new Date(item.issueDate).toLocaleDateString(locale==="ar"?"ar-SA":"en-US") : "—"}</td><td dir="ltr">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString(locale==="ar"?"ar-SA":"en-US") : "—"}</td><td><span className={`status-pill ${item.status==="VALID"?"valid":item.status==="EXPIRED"?"expired":"revoked"}`}>{item.status==="VALID"?txt("سارية","Active"):item.status==="EXPIRED"?txt("منتهية","Expired"):txt("ملغاة","Revoked")}</span></td><td><div className="row-actions"><Link href={`/certificates/${item.id}`} title={txt("التفاصيل","Details")}><FileText size={15}/></Link><Link href={`/certificates/${item.id}/pdf`} title={txt("معاينة / تنزيل PDF","Preview / download PDF")}><Download size={15}/></Link>{canEdit&&<Link href={`/certificates/${item.id}/edit`} title={txt("تعديل","Edit")}><FilePenLine size={15}/></Link>}{canEdit&&item.status!=="REVOKED"&&<button title={txt("تجديد","Renew")} onClick={()=>void renew(item)}><RotateCcw size={15}/></button>}{canRevoke&&item.status!=="REVOKED"&&<button title={txt("إلغاء","Revoke")} onClick={()=>void revoke(item)}><Ban size={15}/></button>}</div></td></tr>)}</tbody></table></div><div className="list-pagination"><span>{txt("الصفحة","Page")} {result.page} {txt("من","of")} {result.pages||1}</span><div><button disabled={page<=1} onClick={()=>setPage((n)=>Math.max(1,n-1))}><ChevronRight size={15}/> {txt("السابق","Previous")}</button><button disabled={page>=result.pages} onClick={()=>setPage((n)=>n+1)}>{txt("التالي","Next")} <ChevronLeft size={15}/></button></div></div><Link className="back-link list-back" href="/"><ArrowRight size={15}/> {txt("العودة للوحة التحكم","Back to dashboard")}</Link></section>;
}
