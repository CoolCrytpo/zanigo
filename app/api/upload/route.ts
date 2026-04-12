import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'listing-images'
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Storage non configuré.' }, { status: 503 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo).' }, { status: 400 })
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await file.arrayBuffer()

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'false',
        },
        body: buffer,
      }
    )

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      console.error('Supabase upload error:', err)
      return NextResponse.json({ error: 'Erreur lors de l\'envoi du fichier.' }, { status: 500 })
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`
    return NextResponse.json({ url: publicUrl })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
