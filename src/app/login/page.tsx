"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";
import LocaleToggle from "@/components/locale-toggle";

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
  return <main className="login-page" dir={locale==="ar"?"rtl":"ltr"}><div className="login-card"><div className="login-head"><div className="login-brand"><span className="brand-mark"><ShieldCheck size={22}/></span><span><b>رِفد</b><small>{txt("نظام الشهادات الصحية", "Health certificate management")}</small></span></div><LocaleToggle/></div><div className="login-intro"><div className="eyebrow"><span/> {txt("مساحة خاصة وآمنة", "Private and secure workspace")}</div><h1>{txt("مرحباً بعودتك", "Welcome back")}</h1><p>{txt("سجّل الدخول إلى حساب شركتك لمتابعة الشهادات.", "Sign in to your company account to manage certificates.")}</p></div><form onSubmit={submit}><label>{txt("البريد الإلكتروني", "Email address")}<Input name="email" type="email" autoComplete="username" required placeholder="name@company.com" dir="ltr"/></label><label>{txt("كلمة المرور", "Password")}<Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••••••"/></label>{error&&<div className="login-error" role="alert">{txt("تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.", "Sign in failed. Check your email and password.")}</div>}<Button className="primary-button login-submit" disabled={busy}>{busy?txt("جارٍ تسجيل الدخول…", "Signing in…"):txt("تسجيل الدخول", "Sign in")}</Button></form><div className="login-disclaimer"><ShieldCheck size={15}/> {txt("نظام خاص لإدارة الشهادات الصحية، وليس مستنداً حكومياً.", "Private health certificate system. Not a government document.")}</div></div></main>
}
