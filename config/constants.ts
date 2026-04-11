export const APP_NAME = 'ZaniGo'
export const APP_TAGLINE = 'Le guide péi pour bat\'karé avec son animal'
export const APP_DESCRIPTION = 'Trouve les meilleurs spots, lieux, balades et services pour sortir avec ton animal à La Réunion.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zanigo.re'

export const COMMUNE_LA_REUNION = 'la-reunion'

export const DOG_POLICY_LABELS: Record<string, string> = {
  allowed:      'Accepté',
  conditional:  'Sous conditions',
  disallowed:   'Non autorisé',
  unknown:      'À confirmer',
}

export const DOG_POLICY_COLORS: Record<string, string> = {
  allowed:      '#16a34a',
  conditional:  '#d97706',
  disallowed:   '#dc2626',
  unknown:      '#6b7280',
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
  spot:    '/spots',
  walk:    '/balades',
  service: '/services',
}

export const REACTION_LABELS: Record<string, string> = {
  useful: 'Utile',
  thanks: 'Merci',
  love:   'J\'adore',
  oops:   'Oups',
}

export const REACTION_EMOJIS: Record<string, string> = {
  useful: '👍',
  thanks: '🙏',
  love:   '❤️',
  oops:   '😬',
}

export const TRAIL_DIFFICULTY_LABELS: Record<string, string> = {
  easy:     'Facile',
  moderate: 'Modéré',
  hard:     'Difficile',
  expert:   'Expert',
}

export const TRAIL_DIFFICULTY_COLORS: Record<string, string> = {
  easy:     '#16a34a',
  moderate: '#d97706',
  hard:     '#dc2626',
  expert:   '#7c3aed',
}

export const NAV_LINKS = [
  { href: '/explorer',  label: 'Explorer' },
  { href: '/spots',     label: 'Spots' },
  { href: '/balades',   label: 'Balades' },
  { href: '/services',  label: 'Services' },
  { href: '/a-la-une',  label: 'À la une' },
  { href: '/pro',       label: 'Pros' },
  { href: '/contribuer', label: 'Contribuer' },
] as const
