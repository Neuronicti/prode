'use client'

import { Standing } from '@/lib/types'
import { useUIStore } from '@/store/ui'

interface StandingsTableProps {
  standings: Standing[]
}

function Avatar({ name, photoURL }: { name: string; photoURL: string }) {
  if (photoURL) {
    return <img src={photoURL} alt={name} className="w-8 h-8 rounded-full object-cover" />
  }
  const initials = name.slice(0, 2).toUpperCase()
  const colors = ['bg-[#093d78]', 'bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white`}>
      {initials}
    </div>
  )
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const currentUser = useUIStore((s) => s.currentUser)
  const sorted = [...standings].sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5">
      <table className="w-full">
        <thead>
          <tr className="bg-[#1a1a1a] text-xs text-zinc-500 uppercase tracking-wide">
            <th className="text-left px-4 py-3 w-8">#</th>
            <th className="text-left px-4 py-3">Jugador</th>
            <th className="text-center px-4 py-3">Picks</th>
            <th className="text-center px-4 py-3">
              <span className="hidden sm:inline">Aciertos</span>
              <span className="sm:hidden">✓</span>
            </th>
            <th className="text-right px-4 py-3 text-[#2970CA]$">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((standing, index) => {
            const isCurrentUser = standing.uid === currentUser?.uid
            return (
              <tr
                key={standing.uid}
                className={`border-t border-white/5 transition-colors
                  ${isCurrentUser ? 'bg-[#0C53A1]/10$' : 'hover:bg-white/3'}`}
              >
                <td className="px-4 py-3 text-sm">
                  {index === 0 ? (
                    <span className="text-yellow-400 font-bold">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-zinc-300 font-bold">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-orange-400 font-bold">🥉</span>
                  ) : (
                    <span className="text-zinc-500 font-medium">{index + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={standing.displayName} photoURL={standing.photoURL} />
                    <div>
                      <div className={`text-sm font-semibold ${isCurrentUser ? 'text-[#2970CA]$' : 'text-white'}`}>
                        {standing.displayName}
                        {isCurrentUser && <span className="ml-1.5 text-xs text-[#2970CA]/70$">(vos)</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-zinc-400">
                  {standing.totalPicks}
                </td>
                <td className="px-4 py-3 text-center text-sm text-zinc-400">
                  {standing.correctPicks}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-lg font-black ${isCurrentUser ? 'text-[#2970CA]$' : 'text-white'}`}>
                    {standing.totalPoints}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
