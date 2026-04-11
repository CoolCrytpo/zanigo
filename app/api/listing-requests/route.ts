import { NextRequest, NextResponse } from 'next/server'
import { createListingRequest } from '@/lib/ingestion/queries'

// POST /api/listing-requests — public submission
export async function POST(req: NextRequest) {
  const data = await req.json()

  const { request_type, requester_name, requester_email, request_message } = data

  if (!request_type || !requester_name || !requester_email || !request_message) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  if (!['correction', 'removal', 'objection', 'other'].includes(request_type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requester_email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const id = await createListingRequest({
    listing_id: data.listing_id,
    listing_slug: data.listing_slug,
    request_type,
    requester_name: requester_name.slice(0, 100),
    requester_email: requester_email.toLowerCase().slice(0, 200),
    requester_role: data.requester_role,
    request_reason: data.request_reason,
    request_message: request_message.slice(0, 2000),
    proof_url: data.proof_url,
  })

  return NextResponse.json({ ok: true, id })
}
