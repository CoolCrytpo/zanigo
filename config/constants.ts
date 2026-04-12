export const APP_NAME = 'Zanimo Guide'
export const APP_TAGLINE = 'Le guide péi des lieux pensés pour les animaux'
export const APP_DESCRIPTION = 'Restaurants, hébergements, balades, spots et services ouverts aux animaux à La Réunion. Trouve les bonnes adresses pour sortir avec ton animal.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zanimo.guide'
export const APP_EMAIL = 'contact@zanimo-guide.re'

// Navigation principale — nouvelle structure
export const NAV_LINKS = [
  { href: '/a-la-une',       label: 'À la une',         icon: 'Sparkles' },
  { href: '/restaurants',    label: 'Restaurants & bars', icon: 'UtensilsCrossed' },
  { href: '/hebergements',   label: 'Hébergements',      icon: 'BedDouble' },
  { href: '/balades',        label: 'Balades & spots',   icon: 'MapPin' },
  { href: '/services',       label: 'Services',          icon: 'Stethoscope' },
  { href: '/partenaires',    label: 'Partenaires',       icon: 'BadgeCheck' },
] as const

// Catégories home — tiles visuelles
export const HOME_CATEGORIES = [
  {
    href: '/restaurants',
    label: 'Restaurants & bars',
    desc: 'Terrasses, cafés, restos chiens admis',
    icon: 'UtensilsCrossed',
    color: '#FF6B57',
    bg: '#FFF3F1',
  },
  {
    href: '/hebergements',
    label: 'Hébergements',
    desc: 'Hôtels, gîtes, campings, locations',
    icon: 'BedDouble',
    color: '#2A74E6',
    bg: '#EEF4FF',
  },
  {
    href: '/balades',
    label: 'Balades & spots',
    desc: 'Sentiers, plages, parcs, nature',
    icon: 'TreePine',
    color: '#1FA97E',
    bg: '#EDFBF5',
  },
  {
    href: '/services',
    label: 'Services',
    desc: 'Vétérinaires, toiletteurs, pensions',
    icon: 'Stethoscope',
    color: '#8B5CF6',
    bg: '#F3EEFF',
  },
  {
    href: '/a-la-une',
    label: 'À la une',
    desc: 'Sélections, nouveautés, coups de cœur',
    icon: 'Sparkles',
    color: '#F4B73F',
    bg: '#FFF8E6',
  },
  {
    href: '/partenaires',
    label: 'Partenaires',
    desc: 'Établissements engagés dog-friendly',
    icon: 'BadgeCheck',
    color: '#37C8C0',
    bg: '#EDFBFA',
  },
] as const

export const COMMUNE_LA_REUNION = 'la-reunion'

export const DOG_POLICY_LABELS: Record<string, string> = {
  allowed:     'Accepté',
  conditional: 'Sous conditions',
  disallowed:  'Non autorisé',
  unknown:     'À confirmer',
}

export const DOG_POLICY_COLORS: Record<string, string> = {
  allowed:     '#1FA97E',
  conditional: '#F4B73F',
  disallowed:  '#EF4444',
  unknown:     '#94A3B8',
}

export const TRUST_LEVEL_LABELS: Record<string, string> = {
  high:   'Vérifié récemment',
  medium: 'Vérification en cours',
  low:    'Infos à confirmer',
}

export const LISTING_TYPE_LABELS: Record<string, string> = {
  place:   'Lieu',
  spot:    'Spot',
  walk:    'Balade',
  service: 'Service',
}

export const LISTING_TYPE_PATHS: Record<string, string> = {
  place:   '/lieux',
  spot:    '/balades',
  walk:    '/balades',
  service: '/services',
}

export const REACTION_LABELS: Record<string, string> = {
  useful: 'Utile',
  thanks: 'Merci',
  love:   'J\'adore',
  oops:   'Oups',
}

// Reactions uses Lucide icons — no emojis
export const REACTION_ICONS: Record<string, string> = {
  useful: 'ThumbsUp',
  thanks: 'Heart',
  love:   'Star',
  oops:   'AlertCircle',
}

export const TRAIL_DIFFICULTY_LABELS: Record<string, string> = {
  easy:     'Facile',
  moderate: 'Modéré',
  hard:     'Difficile',
  expert:   'Expert',
}

export const TRAIL_DIFFICULTY_COLORS: Record<string, string> = {
  easy:     '#1FA97E',
  moderate: '#F4B73F',
  hard:     '#EF4444',
  expert:   '#8B5CF6',
}

// Legacy alias — kept for backward compat
export const REACTION_EMOJIS: Record<string, string> = {
  useful: '👍',
  thanks: '🙏',
  love:   '❤️',
  oops:   '😬',
}
