'use client'

import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'
import { cn } from '@/lib/utils'

// ─── Category Tabs ───────────────────────────────────────────────────────────

export function CategoryTabs() {
  const { t, language, activeCategory, setActiveCategory } = useStore()
  const categories = useContentStore((state) => state.categories)

  const cats: { key: string; label: string }[] = [
    { key: 'all',         label: t.products.allCategories },
    ...categories
      .filter((category) => (category.status ?? 'active') === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({
        key: category.id,
        label: category.name[language],
      })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {cats.map((cat) => {
        const active = activeCategory === cat.key
        return (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              'relative whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0',
              active
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-cleano-blue hover:bg-cleano-light dark:hover:bg-gray-800'
            )}
          >
            {active && (
              <motion.div
                layoutId="cat-pill"
                className="absolute inset-0 bg-cleano-blue rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Search Bar ──────────────────────────────────────────────────────────────

export function SearchBar() {
  const { t, searchQuery, setSearchQuery } = useStore()

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.products.searchPlaceholder}
        className="input-field pl-10 pr-10"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
