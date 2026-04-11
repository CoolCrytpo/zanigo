import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import { APP_NAME } from '@/config/constants'

const ADMIN_NAV = [
  { href: '/admin',              label: '📊 Dashboard' },
  { href: '/admin/listings',     label: '📋 Fiches' },
  { href: '/admin/moderation',   label: '✋ Modération' },
  { href: '/admin/sponsors',     label: '📣 Sponsors' },
  { href: '/admin/settings',     label: '⚙️ Paramètres' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()

  // Not logged in — render children only (login page handles its own layout)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-dvh" style={{ background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 border-r"
        style={{ borderColor: '#e2e8f0', background: '#fff' }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: '#e2e8f0' }}>
          <Link href="/" className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-black"
              style={{ background: 'var(--color-vert)' }}
            >
              Z
            </span>
            <span className="font-bold text-sm" style={{ color: 'var(--color-basalte)' }}>
              {APP_NAME} Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50"
              style={{ color: '#374151' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 border-t text-xs" style={{ borderColor: '#e2e8f0', color: '#9ca3af' }}>
          <p className="font-medium" style={{ color: '#374151' }}>{user.name ?? user.email}</p>
          <p>{user.role}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
