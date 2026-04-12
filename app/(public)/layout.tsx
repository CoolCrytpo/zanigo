import { TopNav } from '@/components/shell/TopNav'
import { Footer } from '@/components/shell/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
