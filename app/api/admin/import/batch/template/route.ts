import { NextResponse } from 'next/server'
import { generateCsvTemplate } from '@/lib/ingestion/csv'

// GET /api/admin/import/batch/template — download CSV template
export async function GET() {
  const csv = generateCsvTemplate()
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="zanigo-template.csv"',
    },
  })
}
