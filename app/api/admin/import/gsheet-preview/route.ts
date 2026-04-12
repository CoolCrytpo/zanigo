import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  await requireSession()
  const url = req.nextUrl.searchParams.get('url')
  const full = req.nextUrl.searchParams.get('full') === 'true'

  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ZanimoGuide/1.0' } })
    if (!res.ok) return NextResponse.json({ error: 'Impossible de charger le Google Sheet. Vérifiez qu\'il est public (partage : "Toute personne ayant le lien").' }, { status: 400 })

    const csv = await res.text()
    const lines = csv.split('\n').filter(l => l.trim())
    if (lines.length < 2) return NextResponse.json({ error: 'Google Sheet vide.' }, { status: 400 })

    const parseRow = (line: string): string[] => {
      const result: string[] = []
      let cur = '', inQ = false
      for (const c of line) {
        if (c === '"') inQ = !inQ
        else if (c === ',' && !inQ) { result.push(cur.trim()); cur = '' }
        else cur += c
      }
      result.push(cur.trim())
      return result
    }

    const headers = parseRow(lines[0])
    const preview = lines.slice(1, 6).map(l => {
      const vals = parseRow(l)
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
    })

    if (full) {
      const rows = lines.slice(1).map(l => {
        const vals = parseRow(l)
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
      })
      return NextResponse.json({ headers, preview, rows })
    }

    return NextResponse.json({ headers, preview })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur réseau ou URL invalide.' }, { status: 500 })
  }
}
