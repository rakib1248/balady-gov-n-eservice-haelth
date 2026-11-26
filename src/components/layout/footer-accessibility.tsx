"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Mic, Palette, Settings } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

interface Recognition {
  lang: string;
  start(): void;
  abort(): void;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export default function FooterAccessibility({ contrast, dark, onContrast, onDark }: {
  contrast: boolean; dark: boolean; onContrast: () => void; onDark: () => void;
}) {
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => locale === "ar" ? ar : en;
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const speech = useRef<Recognition | null>(null);
  const controls = useRef<HTMLDivElement>(null);
  const settings = useRef<HTMLDetailsElement>(null);

  useEffect(() => () => {
    if (speech.current) {
      speech.current.onend = speech.current.onerror = speech.current.onresult = null;
      speech.current.abort();
    }
  }, []);

  function listen() {
    if (listening) { speech.current?.abort(); return; }
    const browser = window as Window & {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Engine = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Engine) {
      setMessage(txt("هذا المتصفح لا يدعم الأوامر الصوتية.", "Voice commands are unavailable in this browser."));
      return;
    }
    const recognition = new Engine();
    speech.current = recognition;
    recognition.lang = locale === "ar" ? "ar-SA" : "en-US";
    recognition.onresult = ({ results }) => {
      const query = results[0][0].transcript.trim().toLocaleLowerCase().replace(/[.!؟。]+$/, "");
      const links = controls.current?.closest("footer")?.querySelectorAll<HTMLAnchorElement>("nav a") ?? [];
      const match = Array.from(links).find(a => a.textContent?.trim().toLocaleLowerCase() === query);
      if (match) {
        match.focus();
        setMessage(txt("تم تحديد الرابط. اضغط لفتحه.", "Link selected. Activate it to open."));
      } else setMessage(txt("لم يتم العثور على الرابط.", "No matching footer link found."));
    };
    recognition.onerror = () => setMessage(txt("تعذر استخدام الميكروفون.", "Microphone unavailable."));
    recognition.onend = () => { speech.current = null; setListening(false); };
    try {
      recognition.start();
      setListening(true);
      setMessage(txt("انطق اسم رابط من التذييل.", "Say the name of a footer link."));
    } catch {
      recognition.onerror();
      recognition.onend();
    }
  }

  return <div ref={controls}>
    <div className="balady-footer-buttons">
      <button type="button" title={txt("تباين الألوان", "Color contrast")} aria-pressed={contrast} onClick={onContrast}><Eye /></button>
      <button type="button" title={txt("الوضع الداكن", "Dark mode")} aria-pressed={dark} onClick={onDark}><Palette /></button>
      <button type="button" title={txt("الأوامر الصوتية", "Voice commands")} aria-pressed={listening} onClick={listen}><Mic /></button>
      <details ref={settings} className="balady-footer-settings"
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}
        onKeyDown={event => {
          if (event.key === "Escape" && settings.current) {
            settings.current.open = false;
            settings.current.querySelector("summary")?.focus();
          }
        }}>
        <summary aria-label={txt("الإعدادات", "Settings")}><Settings /></summary>
        <div>
          <button onClick={() => window.print()}>{txt("طباعة", "Print")}</button>
          <button onClick={() => {
            if (settings.current) settings.current.open = false;
            setMessage(txt("لحفظ الصفحة، اختر إضافة إشارة مرجعية من قائمة المتصفح.", "To save this page, choose Add bookmark in your browser menu."));
          }}>{txt("حفظ الصفحة", "Save page")}</button>
        </div>
      </details>
    </div>
    <p role="status" className="balady-footer-status">{message}</p>
  </div>;
}
