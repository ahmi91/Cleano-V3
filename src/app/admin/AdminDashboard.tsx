'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Database,
  FileText,
  FolderTree,
  ImageIcon,
  Languages,
  ListChecks,
  Lock,
  MapPinned,
  Package,
  Plus,
  Save,
  Shield,
  Store,
  Trash2,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'
import {
  CONTENT_KEYS,
  createId,
  flattenTranslations,
  unflattenTranslations,
} from '@/lib/content'
import type {
  Branch,
  Category,
  ContentStatus,
  MediaAsset,
  Product,
  ProductCategory,
  Translations,
  WebsiteSettings,
} from '@/lib/types'

type AdminTab =
  | 'products'
  | 'categories'
  | 'stores'
  | 'content'
  | 'translations'
  | 'media'
  | 'audit'
  | 'locatorAudit'

type AdminRole = 'admin' | 'editor' | 'viewer'

const roles: AdminRole[] = ['admin', 'editor', 'viewer']
const statuses: ContentStatus[] = ['draft', 'active', 'archived']
const productCategories: ProductCategory[] = ['laundry', 'multipurpose', 'floor', 'dishes', 'baby']
const sizes = ['500ml', '1L', '3L', '5L'] as const

const fallbackPassword = 'admin'

export function AdminDashboard() {
  const { t, language } = useStore()
  const hydrate = useContentStore((state) => state.hydrate)
  const products = useContentStore((state) => state.products)
  const categories = useContentStore((state) => state.categories)
  const stores = useContentStore((state) => state.stores)
  const media = useContentStore((state) => state.media)
  const settings = useContentStore((state) => state.settings)
  const translations = useContentStore((state) => state.translations)
  const auditLogs = useContentStore((state) => state.auditLogs)
  const saveProduct = useContentStore((state) => state.saveProduct)
  const deleteProduct = useContentStore((state) => state.deleteProduct)
  const saveCategory = useContentStore((state) => state.saveCategory)
  const deleteCategory = useContentStore((state) => state.deleteCategory)
  const saveStore = useContentStore((state) => state.saveStore)
  const deleteStore = useContentStore((state) => state.deleteStore)
  const saveMedia = useContentStore((state) => state.saveMedia)
  const deleteMedia = useContentStore((state) => state.deleteMedia)
  const saveSettings = useContentStore((state) => state.saveSettings)
  const saveTranslations = useContentStore((state) => state.saveTranslations)

  const [session, setSession] = useState<{ role: AdminRole } | null>(null)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AdminRole>('admin')
  const [tab, setTab] = useState<AdminTab>('products')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedStore, setSelectedStore] = useState<Branch | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null)
  const [settingsDraft, setSettingsDraft] = useState<WebsiteSettings>(settings)
  const [translationDraft, setTranslationDraft] = useState<Record<string, { en: string; am: string }>>({})

  const canEdit = session?.role === 'admin' || session?.role === 'editor'
  const canDelete = session?.role === 'admin'

  useEffect(() => {
    hydrate()
    const raw = window.localStorage.getItem(CONTENT_KEYS.session)
    if (raw) setSession(JSON.parse(raw))
  }, [hydrate])

  useEffect(() => {
    setSettingsDraft(settings)
  }, [settings])

  useEffect(() => {
    const enFlat = flattenTranslations(translations.en as unknown as Record<string, unknown>)
    const amFlat = flattenTranslations(translations.am as unknown as Record<string, unknown>)
    const keys = Array.from(new Set([...Object.keys(enFlat), ...Object.keys(amFlat)])).sort()
    setTranslationDraft(
      keys.reduce<Record<string, { en: string; am: string }>>((acc, key) => {
        acc[key] = { en: enFlat[key] ?? '', am: amFlat[key] ?? '' }
        return acc
      }, {})
    )
  }, [translations])

  const tabs = useMemo(
    () => [
      { key: 'products' as const, label: t.admin.products, icon: Package },
      { key: 'categories' as const, label: t.admin.categories, icon: FolderTree },
      { key: 'stores' as const, label: t.admin.stores, icon: Store },
      { key: 'content' as const, label: t.admin.content, icon: FileText },
      { key: 'translations' as const, label: t.admin.translations, icon: Languages },
      { key: 'media' as const, label: t.admin.media, icon: ImageIcon },
      { key: 'audit' as const, label: t.admin.audit, icon: ListChecks },
      { key: 'locatorAudit' as const, label: t.admin.locatorAudit, icon: MapPinned },
    ],
    [t]
  )

  const signIn = () => {
    const expected = process.env.NEXT_PUBLIC_CLEANO_ADMIN_PASSWORD ?? fallbackPassword
    if (password !== expected) return

    const nextSession = { role }
    window.localStorage.setItem(CONTENT_KEYS.session, JSON.stringify(nextSession))
    setSession(nextSession)
    setPassword('')
  }

  const signOut = () => {
    window.localStorage.removeItem(CONTENT_KEYS.session)
    setSession(null)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 px-4 page-enter">
        <div className="max-w-md mx-auto card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cleano-blue text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl text-gray-900 dark:text-white">
                {t.admin.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.admin.subtitle}</p>
            </div>
          </div>

          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t.admin.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-field mt-2 mb-4"
          />

          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t.admin.role}
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className="input-field mt-2 mb-5"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button onClick={signIn} className="btn-primary w-full">
            <Shield className="w-4 h-4" />
            {t.admin.signIn}
          </button>
          <p className="text-xs text-gray-400 mt-4">{t.admin.localOnlyNotice}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 page-enter">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
              {t.admin.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.admin.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge bg-cleano-light text-cleano-blue">{session.role}</span>
            <button onClick={signOut} className="btn-secondary py-2">
              {t.admin.signOut}
            </button>
          </div>
        </div>

        <p className="card p-3 text-sm text-gray-500 dark:text-gray-400 mb-5">
          {t.admin.localOnlyNotice}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          <aside className="card p-2 h-fit">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === key
                    ? 'bg-cleano-blue text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-cleano-light dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </aside>

          <section>
            {tab === 'products' && (
              <RecordEditor
                title={t.admin.products}
                items={products}
                selected={selectedProduct}
                onSelect={setSelectedProduct}
                onNew={() =>
                  setSelectedProduct({
                    id: createId('product'),
                    name: { en: 'New product', am: 'አዲስ ምርት' },
                    description: { en: '', am: '' },
                    image: '',
                    images: [],
                    category: 'laundry',
                    prices: { '3L': 0, '5L': 0 },
                    sizes: ['3L', '5L'],
                    sku: '',
                    status: 'draft',
                    badge: null,
                    rating: 5,
                    reviews: 0,
                    tiktokVideos: [],
                    featured: false,
                  })
                }
                onSave={(item) => saveProduct(item)}
                onDelete={deleteProduct}
                canEdit={canEdit}
                canDelete={canDelete}
                renderSummary={(item) => item.name[language]}
                renderFields={(draft, update) => (
                  <ProductFields draft={draft} update={update} categories={categories} />
                )}
              />
            )}

            {tab === 'categories' && (
              <RecordEditor
                title={t.admin.categories}
                items={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                onNew={() =>
                  setSelectedCategory({
                    id: 'laundry',
                    name: { en: 'New category', am: 'አዲስ ምድብ' },
                    sortOrder: categories.length + 1,
                    status: 'draft',
                  })
                }
                onSave={saveCategory}
                onDelete={deleteCategory}
                canEdit={canEdit}
                canDelete={canDelete}
                renderSummary={(item) => item.name[language]}
                renderFields={(draft, update) => <CategoryFields draft={draft} update={update} />}
              />
            )}

            {tab === 'stores' && (
              <RecordEditor
                title={t.admin.stores}
                items={stores}
                selected={selectedStore}
                onSelect={setSelectedStore}
                onNew={() =>
                  setSelectedStore({
                    id: createId('store'),
                    name: { en: 'New store', am: 'አዲስ መደብር' },
                    address: { en: '', am: '' },
                    phone: '',
                    hours: '',
                    lat: 9.02,
                    lng: 38.75,
                    contactInfo: '',
                    availableProducts: [],
                    status: 'draft',
                    tiktokVideos: [],
                    isMain: false,
                  })
                }
                onSave={saveStore}
                onDelete={deleteStore}
                canEdit={canEdit}
                canDelete={canDelete}
                renderSummary={(item) => item.name[language]}
                renderFields={(draft, update) => (
                  <StoreFields draft={draft} update={update} products={products} />
                )}
              />
            )}

            {tab === 'content' && (
              <ContentEditor
                value={settingsDraft}
                onChange={setSettingsDraft}
                onSave={() => saveSettings(settingsDraft)}
                canEdit={canEdit}
              />
            )}

            {tab === 'translations' && (
              <TranslationEditor
                rows={translationDraft}
                setRows={setTranslationDraft}
                onSave={() => {
                  const enValues = Object.fromEntries(
                    Object.entries(translationDraft).map(([key, value]) => [key, value.en])
                  )
                  const amValues = Object.fromEntries(
                    Object.entries(translationDraft).map(([key, value]) => [key, value.am])
                  )
                  saveTranslations({
                    en: unflattenTranslations(enValues),
                    am: unflattenTranslations(amValues),
                  } as Record<'en' | 'am', Translations>)
                }}
                canEdit={canEdit}
              />
            )}

            {tab === 'media' && (
              <RecordEditor
                title={t.admin.media}
                items={media}
                selected={selectedMedia}
                onSelect={setSelectedMedia}
                onNew={() =>
                  setSelectedMedia({
                    id: createId('media'),
                    url: '',
                    alt: { en: '', am: '' },
                    type: 'image',
                    usedFor: ['product'],
                    createdAt: new Date().toISOString(),
                  })
                }
                onSave={saveMedia}
                onDelete={deleteMedia}
                canEdit={canEdit}
                canDelete={canDelete}
                renderSummary={(item) => item.alt[language] || item.url}
                renderFields={(draft, update) => <MediaFields draft={draft} update={update} />}
              />
            )}

            {tab === 'audit' && (
              <Panel title={t.admin.audit}>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.targetId} · {new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  {!auditLogs.length && <p className="text-sm text-gray-500">No audit events yet.</p>}
                </div>
              </Panel>
            )}

            {tab === 'locatorAudit' && (
              <LocatorAuditReport stores={stores} products={products} />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="input-field" />
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="input-field min-h-24" />
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="input-field" />
}

function RecordEditor<T extends { id: string }>({
  title,
  items,
  selected,
  onSelect,
  onNew,
  onSave,
  onDelete,
  canEdit,
  canDelete,
  renderSummary,
  renderFields,
}: {
  title: string
  items: T[]
  selected: T | null
  onSelect: (item: T | null) => void
  onNew: () => void
  onSave: (item: T) => void
  onDelete: (id: string) => void
  canEdit: boolean
  canDelete: boolean
  renderSummary: (item: T) => string
  renderFields: (draft: T, update: (next: T) => void) => React.ReactNode
}) {
  const { t } = useStore()
  const [draft, setDraft] = useState<T | null>(selected)
  const [json, setJson] = useState('')

  useEffect(() => {
    setDraft(selected)
    setJson(selected ? JSON.stringify(selected, null, 2) : '')
  }, [selected])

  const applyJson = () => {
    if (!json.trim()) return
    setDraft(JSON.parse(json) as T)
  }

  return (
    <Panel title={title}>
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
        <div>
          <button onClick={onNew} disabled={!canEdit} className="btn-primary w-full mb-3 disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {t.admin.new}
          </button>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                  selected?.id === item.id
                    ? 'border-cleano-blue bg-cleano-light text-cleano-blue'
                    : 'border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="font-semibold line-clamp-1">{renderSummary(item)}</span>
                <span className="block text-xs text-gray-400">{item.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          {draft ? (
            <div className="space-y-4">
              {renderFields(draft, (next) => {
                setDraft(next)
                setJson(JSON.stringify(next, null, 2))
              })}
              <Field label="Advanced JSON">
                <TextArea value={json} onChange={(event) => setJson(event.target.value)} onBlur={applyJson} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    applyJson()
                    if (draft) onSave(draft)
                  }}
                  disabled={!canEdit}
                  className="btn-primary disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t.admin.save}
                </button>
                <button
                  onClick={() => {
                    onDelete(draft.id)
                    onSelect(null)
                  }}
                  disabled={!canDelete}
                  className="btn-secondary disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.admin.delete}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a record or create a new one.</p>
          )}
        </div>
      </div>
    </Panel>
  )
}

function ProductFields({
  draft,
  update,
  categories,
}: {
  draft: Product
  update: (next: Product) => void
  categories: Category[]
}) {
  const { t } = useStore()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label={`${t.admin.name} EN`}>
        <TextInput value={draft.name.en} onChange={(e) => update({ ...draft, name: { ...draft.name, en: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.name} AM`}>
        <TextInput value={draft.name.am} onChange={(e) => update({ ...draft, name: { ...draft.name, am: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.description} EN`}>
        <TextArea value={draft.description.en} onChange={(e) => update({ ...draft, description: { ...draft.description, en: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.description} AM`}>
        <TextArea value={draft.description.am} onChange={(e) => update({ ...draft, description: { ...draft.description, am: e.target.value } })} />
      </Field>
      <Field label={t.admin.category}>
        <SelectInput value={draft.category} onChange={(e) => update({ ...draft, category: e.target.value as ProductCategory })}>
          {(categories.length ? categories.map((c) => c.id) : productCategories).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label={t.admin.status}>
        <SelectInput value={draft.status ?? 'active'} onChange={(e) => update({ ...draft, status: e.target.value as ContentStatus })}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </SelectInput>
      </Field>
      <Field label={t.admin.image}>
        <TextInput value={draft.image} onChange={(e) => update({ ...draft, image: e.target.value, images: [e.target.value, ...(draft.images ?? []).slice(1)] })} />
      </Field>
      <Field label={t.admin.sku}>
        <TextInput value={draft.sku ?? ''} onChange={(e) => update({ ...draft, sku: e.target.value })} />
      </Field>
      {sizes.map((size) => (
        <Field key={size} label={`${t.admin.pricing} ${size}`}>
          <TextInput
            type="number"
            value={draft.prices[size] ?? ''}
            onChange={(e) => update({ ...draft, prices: { ...draft.prices, [size]: Number(e.target.value) } })}
          />
        </Field>
      ))}
    </div>
  )
}

function CategoryFields({ draft, update }: { draft: Category; update: (next: Category) => void }) {
  const { t } = useStore()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="ID">
        <SelectInput value={draft.id} onChange={(e) => update({ ...draft, id: e.target.value as ProductCategory })}>
          {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
        </SelectInput>
      </Field>
      <Field label={t.admin.status}>
        <SelectInput value={draft.status} onChange={(e) => update({ ...draft, status: e.target.value as ContentStatus })}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </SelectInput>
      </Field>
      <Field label={`${t.admin.name} EN`}>
        <TextInput value={draft.name.en} onChange={(e) => update({ ...draft, name: { ...draft.name, en: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.name} AM`}>
        <TextInput value={draft.name.am} onChange={(e) => update({ ...draft, name: { ...draft.name, am: e.target.value } })} />
      </Field>
      <Field label={t.admin.sortOrder}>
        <TextInput type="number" value={draft.sortOrder} onChange={(e) => update({ ...draft, sortOrder: Number(e.target.value) })} />
      </Field>
      <Field label={t.admin.image}>
        <TextInput value={draft.image ?? ''} onChange={(e) => update({ ...draft, image: e.target.value })} />
      </Field>
    </div>
  )
}

function StoreFields({
  draft,
  update,
  products,
}: {
  draft: Branch
  update: (next: Branch) => void
  products: Product[]
}) {
  const { t } = useStore()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label={`${t.admin.name} EN`}>
        <TextInput value={draft.name.en} onChange={(e) => update({ ...draft, name: { ...draft.name, en: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.name} AM`}>
        <TextInput value={draft.name.am} onChange={(e) => update({ ...draft, name: { ...draft.name, am: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.location} EN`}>
        <TextArea value={draft.address.en} onChange={(e) => update({ ...draft, address: { ...draft.address, en: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.location} AM`}>
        <TextArea value={draft.address.am} onChange={(e) => update({ ...draft, address: { ...draft.address, am: e.target.value } })} />
      </Field>
      <Field label="Latitude">
        <TextInput type="number" value={draft.lat} onChange={(e) => update({ ...draft, lat: Number(e.target.value) })} />
      </Field>
      <Field label="Longitude">
        <TextInput type="number" value={draft.lng} onChange={(e) => update({ ...draft, lng: Number(e.target.value) })} />
      </Field>
      <Field label={t.admin.contactInfo}>
        <TextInput value={draft.contactInfo ?? draft.phone} onChange={(e) => update({ ...draft, contactInfo: e.target.value, phone: e.target.value })} />
      </Field>
      <Field label={t.admin.status}>
        <SelectInput value={draft.status ?? 'active'} onChange={(e) => update({ ...draft, status: e.target.value as ContentStatus })}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </SelectInput>
      </Field>
      <Field label={t.admin.availableProducts}>
        <TextArea
          value={(draft.availableProducts ?? []).join(', ')}
          onChange={(e) => update({ ...draft, availableProducts: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
          placeholder={products.map((product) => product.id).join(', ')}
        />
      </Field>
      <Field label="Hours">
        <TextInput value={draft.hours} onChange={(e) => update({ ...draft, hours: e.target.value })} />
      </Field>
    </div>
  )
}

function ContentEditor({
  value,
  onChange,
  onSave,
  canEdit,
}: {
  value: WebsiteSettings
  onChange: (next: WebsiteSettings) => void
  onSave: () => void
  canEdit: boolean
}) {
  const { t } = useStore()
  return (
    <Panel title={t.admin.content}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={`${t.admin.heroText} EN`}>
          <TextInput value={value.heroBadge.en} onChange={(e) => onChange({ ...value, heroBadge: { ...value.heroBadge, en: e.target.value } })} />
        </Field>
        <Field label={`${t.admin.heroText} AM`}>
          <TextInput value={value.heroBadge.am} onChange={(e) => onChange({ ...value, heroBadge: { ...value.heroBadge, am: e.target.value } })} />
        </Field>
        <Field label={`${t.admin.footerContent} EN`}>
          <TextArea value={value.footerDescription.en} onChange={(e) => onChange({ ...value, footerDescription: { ...value.footerDescription, en: e.target.value } })} />
        </Field>
        <Field label={`${t.admin.footerContent} AM`}>
          <TextArea value={value.footerDescription.am} onChange={(e) => onChange({ ...value, footerDescription: { ...value.footerDescription, am: e.target.value } })} />
        </Field>
        <Field label="Phone">
          <TextInput value={value.contactPhone} onChange={(e) => onChange({ ...value, contactPhone: e.target.value })} />
        </Field>
        <Field label="Email">
          <TextInput value={value.contactEmail} onChange={(e) => onChange({ ...value, contactEmail: e.target.value })} />
        </Field>
        <Field label={t.admin.banners}>
          <TextArea value={JSON.stringify(value.banners, null, 2)} onChange={(e) => onChange({ ...value, banners: JSON.parse(e.target.value) })} />
        </Field>
        <Field label={t.admin.testimonials}>
          <TextArea value={JSON.stringify(value.testimonials, null, 2)} onChange={(e) => onChange({ ...value, testimonials: JSON.parse(e.target.value) })} />
        </Field>
      </div>
      <button onClick={onSave} disabled={!canEdit} className="btn-primary mt-4 disabled:opacity-50">
        <Save className="w-4 h-4" />
        {t.admin.save}
      </button>
    </Panel>
  )
}

function TranslationEditor({
  rows,
  setRows,
  onSave,
  canEdit,
}: {
  rows: Record<string, { en: string; am: string }>
  setRows: (next: Record<string, { en: string; am: string }>) => void
  onSave: () => void
  canEdit: boolean
}) {
  const { t } = useStore()
  return (
    <Panel title={t.admin.translations}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2">{t.admin.translationKey}</th>
              <th className="p-2">{t.admin.english}</th>
              <th className="p-2">{t.admin.amharic}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rows).map(([key, value]) => (
              <tr key={key} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-2 align-top font-mono text-xs text-gray-500">{key}</td>
                <td className="p-2">
                  <TextArea value={value.en} onChange={(e) => setRows({ ...rows, [key]: { ...value, en: e.target.value } })} />
                </td>
                <td className="p-2">
                  <TextArea value={value.am} onChange={(e) => setRows({ ...rows, [key]: { ...value, am: e.target.value } })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={onSave} disabled={!canEdit} className="btn-primary mt-4 disabled:opacity-50">
        <Save className="w-4 h-4" />
        {t.admin.save}
      </button>
    </Panel>
  )
}

function MediaFields({ draft, update }: { draft: MediaAsset; update: (next: MediaAsset) => void }) {
  const { t } = useStore()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label={t.admin.url}>
        <TextInput value={draft.url} onChange={(e) => update({ ...draft, url: e.target.value })} />
      </Field>
      <Field label={`${t.admin.altText} EN`}>
        <TextInput value={draft.alt.en} onChange={(e) => update({ ...draft, alt: { ...draft.alt, en: e.target.value } })} />
      </Field>
      <Field label={`${t.admin.altText} AM`}>
        <TextInput value={draft.alt.am} onChange={(e) => update({ ...draft, alt: { ...draft.alt, am: e.target.value } })} />
      </Field>
      <Field label={t.admin.usedFor}>
        <TextInput value={draft.usedFor.join(', ')} onChange={(e) => update({ ...draft, usedFor: e.target.value.split(',').map((item) => item.trim()) as MediaAsset['usedFor'] })} />
      </Field>
    </div>
  )
}

function LocatorAuditReport({ stores, products }: { stores: Branch[]; products: Product[] }) {
  const { t } = useStore()
  const storesMissingProducts = stores.filter((store) => !(store.availableProducts?.length))
  const invalidCoordinates = stores.filter(
    (store) => Number.isNaN(store.lat) || Number.isNaN(store.lng) || !store.lat || !store.lng
  )
  const knownProductIds = new Set(products.map((product) => product.id))
  const unavailableRefs = stores.flatMap((store) =>
    (store.availableProducts ?? [])
      .filter((productId) => !knownProductIds.has(productId))
      .map((productId) => `${store.id}: ${productId}`)
  )

  return (
    <Panel title={t.admin.locatorAudit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <Metric icon={Store} label="Stores" value={stores.length} />
        <Metric icon={MapPinned} label="Missing coordinates" value={invalidCoordinates.length} />
        <Metric icon={Database} label="Product reference issues" value={unavailableRefs.length} />
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
        <h3>Data structure quality</h3>
        <p>Branches use localized names and addresses, phone, hours, coordinates, TikTok links, and main-branch flags. Admin extensions add status, contact info, and available product IDs.</p>
        <h3>Map performance</h3>
        <p>The locator dynamically imports Leaflet with SSR disabled, which protects the main app bundle. Current marker count is small, so clustering is not needed yet.</p>
        <h3>Search/filter logic</h3>
        <p>The current public locator has nearest-branch geolocation and branch selection, but no text search or product availability filters. Those can now be added against admin-managed fields.</p>
        <h3>UX issues</h3>
        <p>Location permission errors are plain English strings, and popup copy contains a hardcoded directions label. These should be translated in a future locator polish pass.</p>
        <h3>Optional enhancements</h3>
        <p>Add branch search, product availability filter, map marker refresh when nearest branch changes, and marker clustering if the store list grows beyond roughly 50 locations.</p>
        <h3>Current warnings</h3>
        <p>{storesMissingProducts.length} stores have no available product list. {invalidCoordinates.length} stores have invalid coordinates. {unavailableRefs.length} product references do not match known products.</p>
      </div>
    </Panel>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <Icon className="w-5 h-5 text-cleano-blue mb-2" />
      <p className="font-display font-black text-2xl text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
