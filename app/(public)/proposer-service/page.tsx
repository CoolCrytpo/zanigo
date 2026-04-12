import type { Metadata } from 'next'
import { ContributionForm } from '@/components/listings/ContributionForm'

export const metadata: Metadata = {
  title: 'Proposer un service — Zanimo Guide',
  description: 'Propose un vétérinaire, toiletteur, pension ou service pour animaux à La Réunion.',
}

export default function ProposerServicePage() {
  return <ContributionForm mode="service" />
}
