'use client'

import Link from 'next/link'
import { UtensilsCrossed, BedDouble, TreePine, Stethoscope, BadgeCheck, type LucideIcon } from 'lucide-react'

interface Category {
  href: string
  label: string
  desc: string
  Icon: LucideIcon
  color: string
  bg: string
}

const CATEGORIES: Category[] = [
  { href: '/restaurants',  label: 'Restaurants & bars',  desc: 'Terrasses et cafés ouverts aux animaux',        Icon: UtensilsCrossed, color: '#FF6B57', bg: '#FFF3F1' },
  { href: '/hebergements', label: 'Hébergements',         desc: 'Hôtels, gîtes, campings, locations',            Icon: BedDouble,       color: '#2A74E6', bg: '#EEF4FF' },
  { href: '/balades',      label: 'Balades & spots',      desc: 'Sentiers, plages, parcs, nature',               Icon: TreePine,        color: '#1FA97E', bg: '#EDFBF5' },
  { href: '/services',     label: 'Services',             desc: 'Vétérinaires, toiletteurs, pensions',           Icon: Stethoscope,     color: '#8B5CF6', bg: '#F3EEFF' },
  { href: '/pro',          label: 'Espace pro',           desc: 'Établissements engagés & partenariats',         Icon: BadgeCheck,      color: '#37C8C0', bg: '#EDFBFA' },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CATEGORIES.map(({ href, label, desc, Icon, color, bg }) => (
        <Link
          key={href}
          href={href}
          className="group relative overflow-hidden rounded-2xl flex flex-col justify-between"
          style={{
            minHeight: 140,
            background: bg,
            border: `1.5px solid ${color}22`,
            transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = `${color}55`
            el.style.boxShadow = `0 4px 20px ${color}18`
            el.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = `${color}22`
            el.style.boxShadow = 'none'
            el.style.transform = 'translateY(0)'
          }}
        >
          <div className="flex items-center justify-center pt-5 pb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${color}18` }}
            >
              <Icon size={24} strokeWidth={1.5} style={{ color }} />
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              {label}
            </p>
            <p className="text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>{desc}</p>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}60, ${color}20)` }}
          />
        </Link>
      ))}
    </div>
  )
}
