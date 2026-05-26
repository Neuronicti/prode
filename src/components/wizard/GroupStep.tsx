'use client'

import { Pick } from '@/lib/types'
import { WC_GROUPS, WC_GROUP_MATCHES } from '@/lib/wc2026'
import { GROUP_KEYS } from '@/lib/wc2026'
import { simulateGroupTable } from '@/lib/tournament'
import { Flag } from '@/components/Flag'

interface Props {
  groupIndex: number
  picks: Record<string, Pick>
  onPick: (matchId: string, pick: Pick) => void
  onNext: () => void
  onPrev: () => void
  isComplete: boolean
}

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function GroupStep({ groupIndex, picks, onPick, onNext, onPrev, isComplete }: Props) {
  const groupId = GROUP_KEYS[groupIndex]
  const teams = WC_GROUPS[groupId]
  const matches = WC_GROUP_MATCHES.filter((m) => m.group === groupId)
  const pickedCount = matches.filter((m) => !!picks[m.id]).length
  const table = pickedCount > 0 ? simulateGroupTable(groupId, picks) : null

  return (
    <div className="space-y-6">
      {/* Header del grupo */}
      <div>
        <h2 className="text-2xl font-black text-white">
          Grupo <span className="text-[#2970CA]">{groupId}</span>
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {teams.map((t) => (
            <span key={t.code} className="flex items-center gap-1 text-sm text-zinc-400">
              <Flag code={t.flag} size="sm" /> {t.name}
            </span>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-2">{pickedCount}/6 partidos predichos</p>
      </div>

      {/* Partidos */}
      <div className="space-y-2">
        {matches.map((match) => {
          const selected = picks[match.id] ?? null
          return (
            <div
              key={match.id}
              className="bg-[#111] rounded-xl border border-white/5 p-4"
            >
              <div className="text-xs text-zinc-600 mb-3">{formatKickoff(match.kickoff)}</div>

              {/* Equipos */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex-1 flex items-center justify-end gap-1.5">
                  <span className="text-sm font-semibold text-white">{match.homeTeam.name}</span>
                  <Flag code={match.homeTeam.flag} size="sm" />
                </div>
                <span className="text-zinc-600 text-xs font-medium">vs</span>
                <div className="flex-1 flex items-center gap-1.5">
                  <Flag code={match.awayTeam.flag} size="sm" />
                  <span className="text-sm font-semibold text-white">{match.awayTeam.name}</span>
                </div>
              </div>

              {/* Botones pick */}
              <div className="grid grid-cols-3 gap-2">
                {(['H', 'D', 'A'] as Pick[]).map((pick) => {
                  const labels: Record<Pick, string> = {
                    H: match.homeTeam.name,
                    D: 'Empate',
                    A: match.awayTeam.name,
                  }
                  const active = selected === pick
                  return (
                    <button
                      key={pick}
                      onClick={() => onPick(match.id, pick)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150 truncate cursor-pointer ${
                        active
                          ? 'bg-[#0C53A1] text-white ring-2 ring-[#2970CA]'
                          : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-[#2970CA]/60 hover:bg-[#0C53A1]/20 hover:text-white'
                      }`}
                    >
                      {labels[pick]}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview tabla */}
      {table && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Posiciones simuladas</span>
            {pickedCount < 6 && (
              <span className="text-[10px] text-zinc-600">{pickedCount}/6 picks</span>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-zinc-600 uppercase tracking-wider">
                <th className="text-left px-4 py-1.5 w-6">#</th>
                <th className="text-left px-2 py-1.5">Equipo</th>
                <th className="text-center px-2 py-1.5">PJ</th>
                <th className="text-center px-2 py-1.5">G</th>
                <th className="text-center px-2 py-1.5">E</th>
                <th className="text-center px-2 py-1.5">P</th>
                <th className="text-right px-4 py-1.5 text-[#2970CA]">Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={row.team.code} className={`border-t border-white/5 ${i < 2 ? 'bg-[#2970CA]/5' : ''}`}>
                  <td className="px-4 py-2 text-xs">
                    {i < 2
                      ? <span className="text-[#2970CA] font-bold">{i + 1}</span>
                      : <span className="text-zinc-600">{i + 1}</span>}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <Flag code={row.team.flag} size="sm" />
                      <span className={`text-xs font-semibold ${i < 2 ? 'text-white' : 'text-zinc-400'}`}>
                        {row.team.name}
                      </span>
                      {i === 1 && <span className="text-[9px] text-[#2970CA]/60 ml-1">clasifica</span>}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-xs text-zinc-500">{row.played}</td>
                  <td className="px-2 py-2 text-center text-xs text-zinc-500">{row.won}</td>
                  <td className="px-2 py-2 text-center text-xs text-zinc-500">{row.drawn}</td>
                  <td className="px-2 py-2 text-center text-xs text-zinc-500">{row.lost}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`text-sm font-black ${i < 2 ? 'text-[#2970CA]' : 'text-zinc-500'}`}>
                      {row.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-white/10 hover:border-[#2970CA]/60 hover:bg-[#0C53A1]/20 hover:text-white transition-all duration-150 cursor-pointer"
        >
          ← {groupIndex === 0 ? 'Inicio' : `Grupo ${GROUP_KEYS[groupIndex - 1]}`}
        </button>

        <button
          onClick={onNext}
          disabled={!isComplete}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
            isComplete
              ? 'bg-[#0C53A1] text-white hover:bg-[#2970CA]'
              : 'bg-white/5 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {groupIndex < GROUP_KEYS.length - 1
            ? `Grupo ${GROUP_KEYS[groupIndex + 1]} →`
            : 'Ver Bracket →'}
        </button>
      </div>
    </div>
  )
}
