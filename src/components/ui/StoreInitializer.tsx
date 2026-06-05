'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'

export function StoreInitializer() {
  const { darkMode, language, refreshTranslations } = useStore()
  const hydrateContent = useContentStore((state) => state.hydrate)

  useEffect(() => {
    hydrateContent()
    refreshTranslations()

    // Sync dark mode with DOM
    document.documentElement.classList.toggle('dark', darkMode)

    // Sync language
    document.documentElement.lang = language
    if (language === 'am') {
      document.documentElement.classList.add('font-amharic')
    } else {
      document.documentElement.classList.remove('font-amharic')
    }

    const onTranslationsUpdated = () => refreshTranslations()
    window.addEventListener('cleano-translations-updated', onTranslationsUpdated)
    return () => {
      window.removeEventListener('cleano-translations-updated', onTranslationsUpdated)
    }
  }, [darkMode, hydrateContent, language, refreshTranslations])

  return null
}
