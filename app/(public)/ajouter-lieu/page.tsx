import type { Metadata } from 'next'
import { ContributionForm } from '@/components/listings/ContributionForm'

export const metadata: Metadata = {
  title: 'Ajouter un lieu — Zanimo Guide',
  description: 'Ajoute un restaurant, hébergement, balade ou spot ouvert aux animaux à La Réunion.',
}

export default function AjouterLieuPage() {
  return <ContributionForm mode="lieu" />
}
