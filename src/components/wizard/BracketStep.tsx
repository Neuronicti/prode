'use client'

import { BracketMatch, BracketStage } from '@/lib/tournament'
import { Flag } from '@/components/Flag'

interface Props {
  stage: BracketStage
  matches: BracketMatch[]
  bracketPicks: Record<string, 'H' | 'A'>
  onPick: (matchId: string, winner: 'H' | 'A') => void
  onNext: () => void
  onPrev: () => void
  isComplete: boolean
}

const STAGE_LABELS: Record<BracketStage, string> = {
  r32: 'Round of 32',
  r16: 'Octavos de Final',
  qf: 'Cuartos de Final',
  sf: 'Semifinales',
  third: 'Tercer Puesto',
  final: 'Final',
}

export function BracketStep({ stage, matches, bracketPicks, onPick, onNext, onPrev, isComplete }: Props) {
  const pickedCount = matches.filter((m) => !!bracketPicks[m.id]).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">
          <span className="text-[#2970CA]$">{STAGE_LABELS[stage]}</span>
        </h2>
        <p className="text-xs text-zinc-600 mt-1">{pickedCount}/{matches.length} partidos predichos · Elegí el ganador de cada cruce</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((match) => {
          const pick = bracketPicks[match.id] ?? null
          const home = match.homeTeam
          const away = match.awayTeam

          if (!home || !away) {
            return (
              <div key={match.id} className="bg-[#111] rounded-xl border border-white/5 p-4 opacity-40">
                <div className="text-xs text-zinc-600 text-center">Equipos por definir</div>
              </div>
            )
          }

          return (
            <div key={match.id} className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
              {/* Equipo local */}
              <button
                onClick={() => onPick(match.id, 'H')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 ${
                  pick === 'H'
                    ? 'bg-[#0C53A1]/20$ border-l-2 border-[#0C53A1]$'
                    : pick === 'A'
                    ? 'opacity-40 hover:opacity-60'
                    : 'hover:bg-white/5'
                }`}
              >
                <Flag code={home.flag} size="md" />
                <span className={`font-semibold text-sm flex-1 text-left ${pick === 'H' ? 'text-[#2970CA]$' : 'text-white'}`}>
                  {home.name}
                </span>
                {pick === 'H' && <span className="text-[#2970CA]$ text-xs font-bold">✓ AVANZA</span>}
              </button>

              <div className="flex items-center gap-2 px-4 py-1 border-y border-white/5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-zinc-600 font-medium">vs</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Equipo visitante */}
              <button
                onClick={() => onPick(match.id, 'A')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 ${
                  pick === 'A'
                    ? 'bg-[#0C53A1]/20$ border-l-2 border-[#0C53A1]$'
                    : pick === 'H'
                    ? 'opacity-40 hover:opacity-60'
                    : 'hover:bg-white/5'
                }`}
              >
                <Flag code={away.flag} size="md" />
                <span className={`font-semibold text-sm flex-1 text-left ${pick === 'A' ? 'text-[#2970CA]$' : 'text-white'}`}>
                  {away.name}
                </span>
                {pick === 'A' && <span className="text-[#2970CA]$ text-xs font-bold">✓ AVANZA</span>}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-white/10 hover:border-[#2970CA]/60 hover:bg-[#0C53A1]/20 hover:text-white transition-all duration-150 cursor-pointer"
        >
          ← Atrás
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
          {stage === 'final' ? 'Ver resumen →' : 'Siguiente ronda →'}
        </button>
      </div>
    </div>
  )
}
