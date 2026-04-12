import { redirect } from 'next/navigation'

// /contribuer redirige vers /ajouter-lieu (ancien lien)
export default function ContribuerRedirect() {
  redirect('/ajouter-lieu')
}
