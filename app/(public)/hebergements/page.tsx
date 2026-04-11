import { redirect } from 'next/navigation'
export default function HebergementsPage() {
  redirect('/explorer?type=place&q=hébergement')
}
