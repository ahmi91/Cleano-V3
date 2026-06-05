'use client'

import { useStore } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'
import { BranchCard } from '@/components/map/BranchCard'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import branchesData from '@/data/branches.json'
import type { Branch } from '@/lib/types'

const defaultBranches = branchesData as Branch[]

export default function LocationsPage() {
  const { t } = useStore()
  const managedStores = useContentStore((state) => state.stores)
  const branches = (managedStores.length ? managedStores : defaultBranches).filter(
    (store) => (store.status ?? 'active') === 'active'
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 page-enter">
      {/* Header */}
      <div className="bg-cleano-navy pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl md:text-4xl text-white mb-2"
          >
            {t.locations.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-200 text-sm"
          >
            {t.locations.subtitle}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cleano-blue" />
          {t.locations.allBranches}
        </h2>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch, i) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <BranchCard
                branch={branch}
                index={i}
                isSelected={false}
                isNearest={false}
              />
            </motion.div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No branches available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
