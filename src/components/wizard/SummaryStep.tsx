'use client'

import { Pick } from '@/lib/types'
import { BracketMatch, BracketStage, simulateAllGroups } from '@/lib/tournament'
import { WC_GROUP_MATCHES, GROUP_KEYS, WC_GROUPS } from '@/lib/wc2026'
import { Flag } from '@/components/Flag'

interface Props {
  groupPicks: Record<string, Pick>
  bracketPicks: Record<string, 'H' | 'A'>
  bracket: Record<BracketStage, BracketMatch[]>
  onConfirm: () => void
  onPrev: () => void
}

const STAGE_LABELS: Record<BracketStage, string> = {
  r32: 'Round of 32', r16: 'Octavos', qf: 'Cuartos', sf: 'Semifinales',
  third: '3er Puesto', final: 'Final',
}

const PICK_LABEL: Record<Pick, string> = { H: 'Local', D: 'Empate', A: 'Visitante' }

export function SummaryStep({ groupPicks, bracketPicks, bracket, onConfirm, onPrev }: Props) {
  const groupResults = simulateAllGroups(groupPicks)

  // Campeón simulado
  const finalMatch = bracket.final[0]
  const champion = finalMatch
    ? bracketPicks[finalMatch.id] === 'H' ? finalMatch.homeTeam : finalMatch.awayTeam
    : null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Resumen de tus picks</h2>
        <p className="text-sm text-zinc-500 mt-1">Revisá todo antes de confirmar</p>
      </div>

      {/* Campeón */}
      {champion && (
        <div className="bg-[#0C53A1]/10$ border border-[#0C53A1]/30$ rounded-2xl p-6 text-center">
          <div className="mb-2"><Flag code={champion.flag} size="lg" /></div>
          <div className="text-lg font-black text-[#2970CA]$">{champion.name}</div>
          <div className="text-xs text-zinc-500 mt-1">Tu campeón del mundo</div>
        </div>
      )}

      {/* Grupos */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Fase de Grupos</h3>
        {GROUP_KEYS.map((groupId) => {
          const matches = WC_GROUP_MATCHES.filter((m) => m.group === groupId)
          const result = groupResults.find((g) => g.groupId === groupId)

          return (
            <div key={groupId} className="bg-[#111] rounded-xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">Grupo {groupId}</span>
                {result && (
                  <span className="text-xs text-zinc-500">
                    Clasifican: <span className="inline-flex items-center gap-1 text-[#2970CA]$"><Flag code={result.first.flag} size="sm" /> {result.first.name}</span>
                    {' · '}
                    <span className="inline-flex items-center gap-1 text-[#2970CA]$"><Flag code={result.second.flag} size="sm" /> {result.second.name}</span>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {matches.map((m) => {
                  const pick = groupPicks[m.id]
                  return (
                    <div key={m.id} className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1"><Flag code={m.homeTeam.flag} size="sm" /> {m.homeTeam.name} vs {m.awayTeam.name} <Flag code={m.awayTeam.flag} size="sm" /></span>
                      {pick ? (
                        <span className={`inline-flex items-center gap-1 font-semibold ${pick === 'D' ? 'text-zinc-400' : 'text-[#2970CA]$'}`}>
                          {pick === 'H' ? <><Flag code={m.homeTeam.flag} size="sm" /> {m.homeTeam.name}</> : pick === 'A' ? <><Flag code={m.awayTeam.flag} size="sm" /> {m.awayTeam.name}</> : 'Empate'}
                        </span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Playoffs */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Playoffs</h3>
        {(['r32', 'r16', 'qf', 'sf', 'final'] as BracketStage[]).map((stage) => {
          const matches = bracket[stage]
          if (!matches?.length) return null
          return (
            <div key={stage} className="bg-[#111] rounded-xl border border-white/5 p-4">
              <div className="text-sm font-bold text-white mb-3">{STAGE_LABELS[stage]}</div>
              <div className="space-y-1">
                {matches.map((m) => {
                  if (!m.homeTeam || !m.awayTeam) return null
                  const pick = bracketPicks[m.id]
                  const winner = pick === 'H' ? m.homeTeam : pick === 'A' ? m.awayTeam : null
                  return (
                    <div key={m.id} className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1"><Flag code={m.homeTeam.flag} size="sm" /> {m.homeTeam.name} vs {m.awayTeam.name} <Flag code={m.awayTeam.flag} size="sm" /></span>
                      {winner ? (
                        <span className="inline-flex items-center gap-1 text-[#2970CA]$ font-semibold"><Flag code={winner.flag} size="sm" /> {winner.name}</span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-white/10 hover:border-[#2970CA]/60 hover:bg-[#0C53A1]/20 hover:text-white transition-all duration-150 cursor-pointer"
        >
          ← Editar
        </button>
        <button
          onClick={onConfirm}
          className="px-8 py-3 rounded-xl text-sm font-black bg-[#0C53A1] text-white hover:bg-[#2970CA] transition-colors"
        >
          Confirmar predicciones ✓
        </button>
      </div>
    </div>
  )
}
