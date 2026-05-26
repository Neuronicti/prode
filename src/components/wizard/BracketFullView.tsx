'use client'

import { useState } from 'react'
import { BracketMatch, BracketStage } from '@/lib/tournament'

interface Props {
  bracket: Record<BracketStage, BracketMatch[]>
  bracketPicks: Record<string, 'H' | 'A'>
  onPick: (matchId: string, winner: 'H' | 'A') => void
  onNext: () => void
  onPrev: () => void
  isComplete: boolean
}

const SLOT_H = 64 // px per R32 slot

function MatchCard({
  match, pick, onPick, compact,
}: {
  match: BracketMatch
  pick?: 'H' | 'A'
  onPick: (w: 'H' | 'A') => void
  compact?: boolean
}) {
  if (!match.homeTeam || !match.awayTeam) {
    return (
      <div className={`${compact ? 'w-28' : 'w-32'} bg-[#0d0d0d] rounded-lg border border-white/5 overflow-hidden`}>
        <div className="py-1.5 px-2 flex items-center gap-1.5 opacity-30">
          <span className="text-zinc-700 text-[10px]">—</span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="py-1.5 px-2 flex items-center gap-1.5 opacity-30">
          <span className="text-zinc-700 text-[10px]">—</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'w-28' : 'w-32'} bg-[#111] rounded-lg border border-white/5 overflow-hidden`}>
      {(['H', 'A'] as const).map((side, si) => {
        const team = side === 'H' ? match.homeTeam! : match.awayTeam!
        const selected = pick === side
        const lost = !!pick && pick !== side
        return (
          <div key={side}>
            {si === 1 && <div className="h-px bg-white/5" />}
            <button
              onClick={() => onPick(side)}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-all duration-100 cursor-pointer
                ${selected
                  ? 'bg-[#0C53A1]/40 border-l-2 border-[#2970CA]'
                  : lost
                  ? 'opacity-25'
                  : 'hover:bg-white/5'}`}
            >
              <span className={`fi fi-${team.flag} shrink-0`} style={{ fontSize: 12 }} />
              <span className={`text-[10px] font-semibold truncate leading-none ${selected ? 'text-[#2970CA]' : 'text-zinc-300'}`}>
                {team.name}
              </span>
              {selected && <span className="ml-auto text-[#2970CA] text-[9px] shrink-0">✓</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function BracketCol({
  matches, picks, onPick, slotH, compact,
}: {
  matches: BracketMatch[]
  picks: Record<string, 'H' | 'A'>
  onPick: (id: string, w: 'H' | 'A') => void
  slotH: number
  compact?: boolean
}) {
  return (
    <div className="flex flex-col shrink-0">
      {matches.map((m) => (
        <div key={m.id} style={{ height: slotH }} className="flex items-center justify-center">
          <MatchCard match={m} pick={picks[m.id]} onPick={(w) => onPick(m.id, w)} compact={compact} />
        </div>
      ))}
    </div>
  )
}

// Connector lines between columns
function Connectors({ count, slotH, side }: { count: number; slotH: number; side: 'left' | 'right' }) {
  return (
    <div className="flex flex-col shrink-0 w-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: slotH * 2 }} className="relative">
          {side === 'left' ? (
            <>
              <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-white/10" />
              <div className="absolute right-0 top-1/4 w-3 h-px bg-white/10" style={{ top: '25%' }} />
              <div className="absolute right-0 bottom-1/4 w-3 h-px bg-white/10" style={{ bottom: '25%' }} />
            </>
          ) : (
            <>
              <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-white/10" />
              <div className="absolute left-0 top-1/4 w-3 h-px bg-white/10" style={{ top: '25%' }} />
              <div className="absolute left-0 bottom-1/4 w-3 h-px bg-white/10" style={{ bottom: '25%' }} />
            </>
          )}
        </div>
      ))}
    </div>
  )
}

const STAGE_LABELS: Record<string, string> = {
  r32: 'R32', r16: 'R16', qf: 'Cuartos', sf: 'Semis', final: 'Final', third: '3er Puesto',
}

function ColLabel({ label }: { label: string }) {
  return (
    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider text-center mb-2 shrink-0">
      {label}
    </div>
  )
}

export function BracketFullView({ bracket, bracketPicks, onPick, onNext, onPrev, isComplete }: Props) {
  const [fullscreen, setFullscreen] = useState(false)
  const r32 = bracket.r32 ?? []
  const r16 = bracket.r16 ?? []
  const qf  = bracket.qf  ?? []
  const sf  = bracket.sf  ?? []
  const fin = bracket.final ?? []
  const third = bracket.third ?? []

  const totalH = 16 * SLOT_H

  const bracketBoard = (
    <div className="overflow-auto flex-1">
      <div className="p-4 min-w-max">
        {/* Column headers */}
        <div className="flex items-end mb-1 gap-0">
          <div style={{ width: 128 }}><ColLabel label="R32" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 128 }}><ColLabel label="R16" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 112 }}><ColLabel label="Cuartos" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 112 }}><ColLabel label="Semis" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 128 }}><ColLabel label="Final" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 112 }}><ColLabel label="Semis" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 112 }}><ColLabel label="Cuartos" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 128 }}><ColLabel label="R16" /></div>
          <div style={{ width: 12 }} />
          <div style={{ width: 128 }}><ColLabel label="R32" /></div>
        </div>

        <div className="flex" style={{ height: totalH }}>
          {/* LEFT: R32[0-7] */}
          <BracketCol matches={r32.slice(0, 8)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H} />
          <Connectors count={4} slotH={SLOT_H} side="left" />

          {/* LEFT: R16[0-3] */}
          <BracketCol matches={r16.slice(0, 4)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H * 2} compact />
          <Connectors count={2} slotH={SLOT_H * 2} side="left" />

          {/* LEFT: QF[0-1] */}
          <BracketCol matches={qf.slice(0, 2)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H * 4} compact />
          <Connectors count={1} slotH={SLOT_H * 4} side="left" />

          {/* LEFT: SF[0] */}
          <BracketCol matches={sf.slice(0, 1)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H * 8} compact />
          <Connectors count={1} slotH={SLOT_H * 4} side="left" />

          {/* CENTER: Final + 3rd */}
          <div style={{ height: totalH, width: 128 }} className="flex flex-col items-center justify-center gap-4 shrink-0">
            {fin[0] && (
              <div className="text-center">
                <div className="text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider mb-1">🏆 Final</div>
                <MatchCard match={fin[0]} pick={bracketPicks[fin[0].id]} onPick={(w) => onPick(fin[0].id, w)} />
              </div>
            )}
            {third[0] && third[0].homeTeam && third[0].awayTeam && (
              <div className="text-center">
                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-1">3er Puesto</div>
                <MatchCard match={third[0]} pick={bracketPicks[third[0].id]} onPick={(w) => onPick(third[0].id, w)} />
              </div>
            )}
          </div>

          {/* RIGHT: SF[1] */}
          <Connectors count={1} slotH={SLOT_H * 4} side="right" />
          <BracketCol matches={sf.slice(1, 2)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H * 8} compact />

          {/* RIGHT: QF[2-3] */}
          <Connectors count={2} slotH={SLOT_H * 2} side="right" />
          <BracketCol matches={qf.slice(2, 4)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H * 4} compact />

          {/* RIGHT: R16[4-7] */}
          <Connectors count={4} slotH={SLOT_H} side="right" />
          <BracketCol matches={r16.slice(4, 8)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H * 2} compact />

          {/* RIGHT: R32[8-15] */}
          <Connectors count={4} slotH={SLOT_H} side="right" />
          <BracketCol matches={r32.slice(8, 16)} picks={bracketPicks} onPick={onPick} slotH={SLOT_H} />
        </div>
      </div>
    </div>
  )

  const actions = (
    <div className="flex items-center justify-between p-4 border-t border-white/5 shrink-0">
      <button
        onClick={onPrev}
        className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-white/10 hover:border-[#2970CA]/60 hover:bg-[#0C53A1]/20 hover:text-white transition-all duration-150 cursor-pointer"
      >
        ← Grupos
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
        Ver resumen →
      </button>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
        {/* Fullscreen header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
          <h2 className="text-sm font-black text-white">Bracket de Playoffs</h2>
          <button
            onClick={() => setFullscreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/10 hover:border-white/30 hover:text-white transition-all cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
            Salir
          </button>
        </div>
        {bracketBoard}
        {actions}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Bracket de Playoffs</h2>
          <p className="text-xs text-zinc-500 mt-1">Hacé click en cada equipo para elegir el ganador</p>
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-zinc-400 border border-white/10 hover:border-[#2970CA]/60 hover:bg-[#0C53A1]/20 hover:text-white transition-all cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          Pantalla completa
        </button>
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 flex flex-col">
        {bracketBoard}
        {actions}
      </div>
    </div>
  )
}
