export type Locale = "ar" | "en";

export function t(locale: Locale, arabic: string, english: string) {
  return locale === "ar" ? arabic : english;
}
