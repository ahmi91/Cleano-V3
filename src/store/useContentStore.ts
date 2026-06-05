'use client'

import { create } from 'zustand'
import {
  CONTENT_KEYS,
  createId,
  defaultCategories,
  defaultMedia,
  defaultProducts,
  defaultStores,
  defaultTranslations,
  defaultWebsiteSettings,
  readStored,
  writeStored,
} from '@/lib/content'
import type {
  Branch,
  Category,
  Language,
  MediaAsset,
  Product,
  Translations,
  WebsiteSettings,
} from '@/lib/types'

type AuditAction =
  | 'product.saved'
  | 'product.deleted'
  | 'category.saved'
  | 'category.deleted'
  | 'store.saved'
  | 'store.deleted'
  | 'media.saved'
  | 'media.deleted'
  | 'settings.saved'
  | 'translations.saved'

export interface AuditLog {
  id: string
  action: AuditAction
  targetId: string
  createdAt: string
}

interface ContentState {
  hydrated: boolean
  products: Product[]
  categories: Category[]
  stores: Branch[]
  media: MediaAsset[]
  settings: WebsiteSettings
  translations: Record<Language, Translations>
  auditLogs: AuditLog[]
  hydrate: () => void
  saveProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  saveCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  saveStore: (store: Branch) => void
  deleteStore: (id: string) => void
  saveMedia: (asset: MediaAsset) => void
  deleteMedia: (id: string) => void
  saveSettings: (settings: WebsiteSettings) => void
  saveTranslations: (translations: Record<Language, Translations>) => void
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  const exists = items.some((current) => current.id === item.id)
  return exists
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items]
}

function addAudit(logs: AuditLog[], action: AuditAction, targetId: string) {
  return [
    {
      id: createId('audit'),
      action,
      targetId,
      createdAt: new Date().toISOString(),
    },
    ...logs,
  ].slice(0, 100)
}

export const useContentStore = create<ContentState>((set, get) => ({
  hydrated: false,
  products: defaultProducts,
  categories: defaultCategories,
  stores: defaultStores,
  media: defaultMedia,
  settings: defaultWebsiteSettings,
  translations: defaultTranslations,
  auditLogs: [],

  hydrate: () => {
    if (get().hydrated) return

    set({
      hydrated: true,
      products: readStored(CONTENT_KEYS.products, defaultProducts),
      categories: readStored(CONTENT_KEYS.categories, defaultCategories),
      stores: readStored(CONTENT_KEYS.stores, defaultStores),
      media: readStored(CONTENT_KEYS.media, defaultMedia),
      settings: readStored(CONTENT_KEYS.settings, defaultWebsiteSettings),
      translations: readStored(CONTENT_KEYS.translations, defaultTranslations),
      auditLogs: readStored(CONTENT_KEYS.auditLogs, []),
    })
  },

  saveProduct: (product) => {
    const products = upsertById(get().products, product)
    const auditLogs = addAudit(get().auditLogs, 'product.saved', product.id)
    writeStored(CONTENT_KEYS.products, products)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ products, auditLogs })
  },

  deleteProduct: (id) => {
    const products = get().products.filter((product) => product.id !== id)
    const auditLogs = addAudit(get().auditLogs, 'product.deleted', id)
    writeStored(CONTENT_KEYS.products, products)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ products, auditLogs })
  },

  saveCategory: (category) => {
    const categories = upsertById(get().categories, category).sort(
      (a, b) => a.sortOrder - b.sortOrder
    )
    const auditLogs = addAudit(get().auditLogs, 'category.saved', category.id)
    writeStored(CONTENT_KEYS.categories, categories)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ categories, auditLogs })
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter((category) => category.id !== id)
    const auditLogs = addAudit(get().auditLogs, 'category.deleted', id)
    writeStored(CONTENT_KEYS.categories, categories)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ categories, auditLogs })
  },

  saveStore: (store) => {
    const stores = upsertById(get().stores, store)
    const auditLogs = addAudit(get().auditLogs, 'store.saved', store.id)
    writeStored(CONTENT_KEYS.stores, stores)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ stores, auditLogs })
  },

  deleteStore: (id) => {
    const stores = get().stores.filter((store) => store.id !== id)
    const auditLogs = addAudit(get().auditLogs, 'store.deleted', id)
    writeStored(CONTENT_KEYS.stores, stores)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ stores, auditLogs })
  },

  saveMedia: (asset) => {
    const media = upsertById(get().media, asset)
    const auditLogs = addAudit(get().auditLogs, 'media.saved', asset.id)
    writeStored(CONTENT_KEYS.media, media)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ media, auditLogs })
  },

  deleteMedia: (id) => {
    const media = get().media.filter((asset) => asset.id !== id)
    const auditLogs = addAudit(get().auditLogs, 'media.deleted', id)
    writeStored(CONTENT_KEYS.media, media)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ media, auditLogs })
  },

  saveSettings: (settings) => {
    const auditLogs = addAudit(get().auditLogs, 'settings.saved', 'website_settings')
    writeStored(CONTENT_KEYS.settings, settings)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    set({ settings, auditLogs })
  },

  saveTranslations: (translations) => {
    const auditLogs = addAudit(get().auditLogs, 'translations.saved', 'translations')
    writeStored(CONTENT_KEYS.translations, translations)
    writeStored(CONTENT_KEYS.auditLogs, auditLogs)
    window.dispatchEvent(new CustomEvent('cleano-translations-updated'))
    set({ translations, auditLogs })
  },
}))
