import { useLocaleStore } from "@/store/locale"
import { getTranslations } from "@/lib/i18n"

export function useTranslations() {
  const locale = useLocaleStore((s) => s.locale)
  return getTranslations(locale)
}
