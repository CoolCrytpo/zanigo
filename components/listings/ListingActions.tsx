'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Pencil, Trash2, Mail } from 'lucide-react'

interface ListingActionsProps {
  listingId: string
  listingSlug: string
}

export function ListingActions({ listingId, listingSlug }: ListingActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-6 pt-4 border-t" style={{ borderColor: '#e2e8f0' }}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Settings size={12} className="inline mr-1" /> Vous gérez ce lieu ou vous avez une remarque ?
      </button>
      {open && (
        <div className="flex flex-wrap gap-3 mt-3">
          <Link
            href={`/corriger/${listingSlug}?id=${listingId}`}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e2e8f0', color: '#374151' }}
          >
            <Pencil size={11} className="inline mr-1" /> Corriger cette fiche
          </Link>
          <Link
            href={`/retrait/${listingSlug}?id=${listingId}`}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e2e8f0', color: '#374151' }}
          >
            <Trash2 size={11} className="inline mr-1" /> Demander le retrait
          </Link>
          <a
            href="mailto:contact@zanimo-guide.re"
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e2e8f0', color: '#374151' }}
          >
            <Mail size={11} className="inline mr-1" /> Nous contacter
          </a>
        </div>
      )}
    </div>
  )
}
