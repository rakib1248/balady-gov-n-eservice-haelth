"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";
import PortalFrame from "@/components/layout/portal-frame";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false });
    setBusy(false);
    if (result?.error) setError("تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.");
    else router.push("/");
  }
  return <PortalFrame><main id="login" className="login-page" dir={locale==="ar"?"rtl":"ltr"}><div className="login-card"><div className="login-intro"><div className="eyebrow"><span/> {txt("مساحة خاصة وآمنة", "Private and secure workspace")}</div><h1>{txt("مرحباً بعودتك", "Welcome back")}</h1><p>{txt("سجّل الدخول إلى حساب شركتك لمتابعة الشهادات.", "Sign in to your company account to manage certificates.")}</p></div><form onSubmit={submit}><label>{txt("البريد الإلكتروني", "Email address")}<Input name="email" type="email" autoComplete="username" required placeholder="name@company.com" dir="ltr"/></label><label>{txt("كلمة المرور", "Password")}<Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••••••"/></label>{error&&<div className="login-error" role="alert">{txt("تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.", "Sign in failed. Check your email and password.")}</div>}<Button className="primary-button login-submit" disabled={busy}>{busy?txt("جارٍ تسجيل الدخول…", "Signing in…"):txt("تسجيل الدخول", "Sign in")}</Button></form><div className="login-disclaimer">{txt("نظام خاص لإدارة الشهادات الصحية، وليس مستنداً حكومياً.", "Private health certificate system. Not a government document.")}</div></div></main></PortalFrame>
}
