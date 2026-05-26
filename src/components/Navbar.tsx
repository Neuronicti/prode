'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUIStore } from '@/store/ui'

function Avatar({ name, photoURL }: { name: string; photoURL: string }) {
  if (photoURL) {
    return <img src={photoURL} alt={name} className="w-8 h-8 rounded-full object-cover" />
  }
  const initials = name.slice(0, 2).toUpperCase()
  const colors = ['bg-[#0C53A1]', 'bg-[#2970CA]', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white`}>
      {initials}
    </div>
  )
}

const NAV_LINKS = [
  { href: '/picks', label: 'Picks' },
  { href: '/ranking', label: 'Ranking' },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, logout } = useUIStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo_simple.png" alt="Neuronic" className="h-10 w-auto" />
          <span className="font-black text-xl tracking-tight text-white">Pro<span className="text-[#2970CA]">de</span></span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150
                  ${active
                    ? 'bg-[#0C53A1]/20 text-[#2970CA]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar name={currentUser.displayName} photoURL={currentUser.photoURL} />
              <span className="text-sm text-zinc-400 hidden sm:block">{currentUser.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
