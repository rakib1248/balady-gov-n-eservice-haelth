"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";

const fields = [
  { key: "municipality", label: "الأمانة", required: true }, { key: "city", label: "البلدية", required: true },
  { key: "fullName", label: "الاسم", required: true, ltr: true }, { key: "identityNumber", label: "رقم الهوية / الإقامة", required: true, ltr: true },
  { key: "gender", label: "الجنس", type: "select", required: true }, { key: "nationalityAr", label: "الجنسية", required: true },
  { key: "certificateNumber", label: "رقم الشهادة الصحية", required: true, ltr: true }, { key: "professionAr", label: "المهنة", required: true },
  { key: "hijriIssueDate", label: "تاريخ إصدار الشهادة الصحية هجري" }, { key: "issueDate", label: "تاريخ إصدار الشهادة الصحية ميلادي", type: "date", required: true },
  { key: "hijriExpiryDate", label: "تاريخ نهاية الشهادة الصحية هجري" }, { key: "expiryDate", label: "تاريخ نهاية الشهادة الصحية ميلادي", type: "date", required: true },
  { key: "programType", label: "نوع البرنامج التثقيفي", required: true }, { key: "programExpiryDate", label: "تاريخ انتهاء البرنامج التثقيفي", type: "date", required: true },
  { key: "organizationNumber", label: "رقم المنشأة", required: true, ltr: true }, { key: "licenseNumber", label: "رقم الرخصة", required: true, ltr: true },
  { key: "fullNameAr", label: "الاسم الكامل بالعربية", required: true }, { key: "nationality", label: "الجنسية بالإنجليزية", required: true, ltr: true },
  { key: "profession", label: "المهنة بالإنجليزية", required: true, ltr: true }, { key: "organizationNameAr", label: "اسم المنشأة بالعربية", required: true },
  { key: "organizationName", label: "اسم المنشأة بالإنجليزية", required: true, ltr: true },
] as const;
const labelsEn: Record<string, string> = {
  fullNameAr: "Full name (Arabic)", fullName: "Full name", identityNumber: "Identity / residency number", gender: "Gender",
  nationalityAr: "Nationality (Arabic)", nationality: "Nationality (English)", professionAr: "Profession (Arabic)", profession: "Profession (English)",
  certificateNumber: "Certificate number", issueDate: "Issue date", expiryDate: "Expiry date", programExpiryDate: "Training program expiry",
  hijriIssueDate: "Issue date (Hijri)", hijriExpiryDate: "Expiry date (Hijri)", organizationNameAr: "Organization name (Arabic)", organizationName: "Organization name (English)",
  organizationNumber: "Organization number", licenseNumber: "License number", municipality: "Municipality", city: "Municipality branch / city", programType: "Education program type",
};

export default function CertificateForm({ initial, certificateId }: { initial?: Record<string, string>; certificateId?: string }) {
  const router = useRouter();
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState("");
  const [photoPreviewFailed, setPhotoPreviewFailed] = useState(false);
  const photoObjectUrl = useRef<string | null>(null);
  const [created, setCreated] = useState<{ id: string; number: string; token: string } | null>(null);
  useEffect(() => () => { if (photoObjectUrl.current) URL.revokeObjectURL(photoObjectUrl.current); }, []);
  function selectPhoto(file?: File) {
    if (photoObjectUrl.current) URL.revokeObjectURL(photoObjectUrl.current);
    photoObjectUrl.current = file ? URL.createObjectURL(file) : null;
    setSelectedPhotoPreview(photoObjectUrl.current ?? "");
    setPhotoPreviewFailed(false);
    setPhotoName(file?.name ?? "");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      const payload = Object.fromEntries(fields.map(({ key }) => [key, String(form.get(key) ?? "").trim()]));
      const photo = form.get("profilePhoto");
      if (photo instanceof File && photo.size) {
        const upload = new FormData(); upload.set("file", photo);
        const uploaded = await fetch("/api/files/profile-photo", { method: "POST", body: upload });
        const result = await uploaded.json().catch(() => ({}));
        if (!uploaded.ok) { setError(result.error === "FILE_STORAGE_NOT_CONFIGURED" ? txt("تخزين الصور غير مهيأ بعد. أكمل إعداد R2 ثم أعد المحاولة.", "Photo storage is not configured. Set up R2 and try again.") : txt("تعذر رفع الصورة. اختر صورة JPG أو PNG حتى 3 ميغابايت.", "Photo upload failed. Choose a JPG or PNG up to 3 MB.")); return; }
        Object.assign(payload, { photoKey: result.photoKey });
      } else if (initial?.photoKey) Object.assign(payload, { photoKey: initial.photoKey });
      const response = await fetch(certificateId ? `/api/certificates/${certificateId}` : "/api/certificates", { method: certificateId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error === "CERTIFICATE_NUMBER_EXISTS" ? txt("رقم الشهادة مستخدم بالفعل.", "This certificate number is already in use.") : txt("تعذر حفظ الشهادة. راجع الحقول وحاول مرة أخرى.", "Could not save the certificate. Check the fields and try again.")); return; }
      if (certificateId) router.push("/certificates");
      else setCreated({ id: result.id, number: result.certificateNumber, token: result.verificationToken });
    } catch { setError(txt("تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.", "Could not reach the server. Check your connection and try again.")); }
    finally { setSaving(false); }
  }
  if (created) return <section className="created-card"><CheckCircle2 size={38}/><h2>{txt("تم إصدار الشهادة", "Certificate issued")}</h2><p>{txt("رقم الشهادة:", "Certificate number:")} <b dir="ltr">{created.number}</b></p><p>{txt("رابط التحقق الفريد. يظهر رمز QR عند معاينة ملف PDF.", "The unique verification link. Its QR code appears in the PDF preview.")}</p><code dir="ltr">{`${window.location.origin}/verify/${created.token}`}</code><div><Link href="/certificates">{txt("قائمة الشهادات", "Certificate list")}</Link><Link href={`/certificates/${created.id}/pdf`}>{txt("معاينة وتنزيل PDF", "Preview and download PDF")}</Link><button onClick={()=>router.push(`/certificates/${created.id}/edit`)}>{txt("تعديل البيانات", "Edit details")}</button></div></section>;
  return <form className="certificate-form" onSubmit={submit}>
    <section className="certificate-form-fields" aria-label={txt("بيانات الشهادة الصحية", "Health certificate details")}>
      <div className="certificate-photo-block">
        <div className="photo-preview-frame">
          {!photoPreviewFailed&&(selectedPhotoPreview||(certificateId&&initial?.photoKey))?<Image src={selectedPhotoPreview||`/api/certificates/${encodeURIComponent(certificateId!)}/photo`} alt={txt("معاينة الصورة كاملة", "Full image preview")} width={180} height={165} unoptimized onError={()=>setPhotoPreviewFailed(true)}/>:<UserRound size={48} aria-hidden="true"/>}
        </div>
        <label className="photo-upload"><span>{txt("الصورة الشخصية", "Profile photo")} <small>JPG أو PNG · {txt("بحد أقصى ٣ ميغابايت", "up to 3 MB")}</small></span><input name="profilePhoto" type="file" accept="image/jpeg,image/png" onChange={(e)=>selectPhoto(e.target.files?.[0])}/>{photoName&&<small>{photoName}</small>}</label>
      </div>
      <div className="fields-grid certificate-fields-grid">{fields.map((field)=><Field key={field.key} field={field} value={initial?.[field.key]}/>)}</div>
    </section>
    {error&&<p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Link href="/certificates">{txt("إلغاء", "Cancel")}</Link><Button disabled={saving} className="primary-button">{saving&&<LoaderCircle size={16} className="spin"/>}{certificateId?txt("حفظ التعديلات", "Save changes"):txt("إصدار الشهادة", "Issue certificate")}</Button></div>
  </form>;
}

function Field({ field, value }: { field: (typeof fields)[number]; value?: string }) {
  const { locale } = useLocale();
  const ltr = "ltr" in field && field.ltr;
  return <label className="form-field"><span>{locale==="ar"?field.label:labelsEn[field.key]}{"required" in field && field.required&&<i> *</i>}</span>{"type" in field&&field.type==="select"?<select name={field.key} required defaultValue={value??""}><option value="" disabled>{t(locale,"اختر الجنس","Select gender")}</option><option value="FEMALE">{t(locale,"أنثى","Female")}</option><option value="MALE">{t(locale,"ذكر","Male")}</option><option value="OTHER">{t(locale,"أخرى","Other")}</option></select>:<Input name={field.key} type={"type" in field&&field.type==="date"?"date":"text"} required={"required" in field&&field.required} defaultValue={value} dir={ltr?"ltr":"auto"} placeholder={field.key==="certificateNumber"?"HC-2026-00001":undefined}/>}</label>;
}
