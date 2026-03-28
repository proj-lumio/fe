import { en } from "./en"
import { it } from "./it"

export type Locale = "en" | "it"

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string
}

export type Translations = DeepStringify<typeof en>

const translations: Record<Locale, Translations> = { en, it }

export function getTranslations(locale: Locale): Translations {
  return translations[locale]
}
