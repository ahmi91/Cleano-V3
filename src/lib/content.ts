import productsData from '@/data/products.json'
import branchesData from '@/data/branches.json'
import categoriesData from '@/data/categories.json'
import en from '@/i18n/en.json'
import am from '@/i18n/am.json'
import type {
  Branch,
  Category,
  Language,
  MediaAsset,
  Product,
  Translations,
  WebsiteSettings,
} from '@/lib/types'

export const CONTENT_KEYS = {
  products: 'cleano-admin-products',
  categories: 'cleano-admin-categories',
  stores: 'cleano-admin-stores',
  media: 'cleano-admin-media',
  settings: 'cleano-admin-settings',
  translations: 'cleano-admin-translations',
  auditLogs: 'cleano-admin-audit-logs',
  session: 'cleano-admin-session',
} as const

export const defaultProducts = (productsData as Product[]).map((product) => ({
  status: 'active' as const,
  sizes: ['3L', '5L'],
  images: [product.image],
  sku: product.id.toUpperCase().replaceAll('-', '_'),
  ...product,
}))

export const defaultCategories = categoriesData as Category[]

export const defaultStores = (branchesData as Branch[]).map((branch) => ({
  status: 'active' as const,
  availableProducts: defaultProducts.map((product) => product.id),
  contactInfo: branch.phone,
  ...branch,
}))

export const defaultMedia: MediaAsset[] = defaultProducts.map((product) => ({
  id: `media-${product.id}`,
  url: product.image,
  alt: product.name,
  type: 'image',
  usedFor: ['product'],
  createdAt: '2026-06-05T00:00:00.000Z',
}))

export const defaultWebsiteSettings: WebsiteSettings = {
  heroBadge: {
    en: '#1 Cleaning Brand in Ethiopia',
    am: 'በኢትዮጵያ #1 የጽዳት ብራንድ',
  },
  heroCustomerText: {
    en: '50K+ happy customers',
    am: '50K+ ደስተኛ ደንበኞች',
  },
  footerDescription: {
    en: "Ethiopia's most trusted cleaning brand, delivering premium quality detergents to homes and businesses across Addis Ababa.",
    am: 'በአዲስ አበባ ለቤቶች እና ለንግዶች ፕሪሚየም የጽዳት ምርቶችን የሚያቀርብ የኢትዮጵያ ታማኝ ብራንድ።',
  },
  footerTagline: {
    en: 'Made with care for Ethiopian homes',
    am: 'ለኢትዮጵያ ቤቶች በጥንቃቄ የተሰራ',
  },
  contactAddress: {
    en: 'Mafi Mall, Bole Road, Addis Ababa, Ethiopia',
    am: 'ማፊ ሞል፣ ቦሌ መንገድ፣ አዲስ አበባ፣ ኢትዮጵያ',
  },
  contactPhone: '+251 91 788 8888',
  contactEmail: 'hello@cleanoet.com',
  banners: [],
  testimonials: [],
}

export const defaultTranslations: Record<Language, Translations> = { en, am }

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStored<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getAdminTranslations(): Record<Language, Translations> {
  return readStored(CONTENT_KEYS.translations, defaultTranslations)
}

export function getTranslations(language: Language): Translations {
  return getAdminTranslations()[language]
}

export function flattenTranslations(
  source: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  return Object.entries(source).reduce<Record<string, string>>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      acc[nextKey] = value
    } else if (value && typeof value === 'object') {
      Object.assign(acc, flattenTranslations(value as Record<string, unknown>, nextKey))
    }
    return acc
  }, {})
}

export function unflattenTranslations(values: Record<string, string>): Translations {
  const result: Record<string, unknown> = {}

  Object.entries(values).forEach(([path, value]) => {
    const parts = path.split('.')
    let cursor = result
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = value
      } else {
        cursor[part] = cursor[part] ?? {}
        cursor = cursor[part] as Record<string, unknown>
      }
    })
  })

  return result as unknown as Translations
}

export function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}`
}
