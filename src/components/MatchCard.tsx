'use client'

import { Match, Prediction } from '@/lib/types'
import { useProdeStore } from '@/store/prode'
import { PickButtons } from './PickButtons'
import { LiveBadge } from './LiveBadge'
import { Flag } from './Flag'

interface MatchCardProps {
  match: Match
  prediction?: Prediction
}

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isLocked(lockAt: string) {
  return new Date(lockAt) <= new Date()
}

export function MatchCard({ match, prediction }: MatchCardProps) {
  const setPick = useProdeStore((s) => s.setPick)
  const locked = isLocked(match.lockAt)
  const selected = prediction?.pick ?? null

  const resultCorrect =
    match.status === 'FINISHED' && prediction && prediction.pick === match.result
  const resultWrong =
    match.status === 'FINISHED' && prediction && prediction.pick !== match.result

  return (
    <div className={`bg-[#111] rounded-2xl p-4 border transition-all duration-200
      ${match.status === 'LIVE' ? 'border-red-500/40 shadow-lg shadow-red-500/10' : 'border-white/5 hover:border-white/10'}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">
          {match.stage === 'group' ? `Grupo ${match.group}` :
           match.stage === 'r16' ? 'Octavos' :
           match.stage === 'qf' ? 'Cuartos' :
           match.stage === 'sf' ? 'Semifinal' :
           match.stage === 'third' ? '3er Puesto' : 'Final'}
        </span>
        {match.status === 'LIVE' && <LiveBadge />}
        {match.status === 'FINISHED' && (
          <span className="text-xs text-zinc-500 font-medium">FINALIZADO</span>
        )}
        {match.status === 'SCHEDULED' && (
          <span className="text-xs text-zinc-500">{formatDate(match.kickoff)}</span>
        )}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <Flag code={match.homeTeam.flag} size="lg" />
          <span className="text-sm font-semibold text-white text-center leading-tight">{match.homeTeam.name}</span>
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center min-w-[80px]">
          {match.status !== 'SCHEDULED' && match.score ? (
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black tabular-nums ${match.status === 'LIVE' ? 'text-red-400' : 'text-white'}`}>
                {match.score.home}
              </span>
              <span className="text-zinc-500 text-xl">-</span>
              <span className={`text-3xl font-black tabular-nums ${match.status === 'LIVE' ? 'text-red-400' : 'text-white'}`}>
                {match.score.away}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xl font-bold text-[#2970CA]$">{formatKickoff(match.kickoff)}</div>
              <div className="text-xs text-zinc-600">hs</div>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <Flag code={match.awayTeam.flag} size="lg" />
          <span className="text-sm font-semibold text-white text-center leading-tight">{match.awayTeam.name}</span>
        </div>
      </div>

      {/* Pick section */}
      <div className="border-t border-white/5 pt-3">
        {match.status === 'FINISHED' ? (
          <div className="flex items-center justify-center gap-3">
            {prediction ? (
              <>
                <span className="text-sm text-zinc-400">
                  Tu pick: <span className="inline-flex items-center gap-1 font-bold text-white">
                    {prediction.pick === 'H' ? <><Flag code={match.homeTeam.flag} size="sm" /> {match.homeTeam.name}</> : prediction.pick === 'A' ? <><Flag code={match.awayTeam.flag} size="sm" /> {match.awayTeam.name}</> : 'Empate'}
                  </span>
                </span>
                {resultCorrect && (
                  <span className="flex items-center gap-1 text-[#2970CA]$ font-bold text-sm">
                    <span>✓</span>
                    <span>+{prediction.points > 0 ? prediction.points : 3} pts</span>
                  </span>
                )}
                {resultWrong && (
                  <span className="text-red-400 font-bold text-sm">✗ 0 pts</span>
                )}
              </>
            ) : (
              <span className="text-xs text-zinc-600 italic">Sin predicción</span>
            )}
          </div>
        ) : match.status === 'LIVE' ? (
          <div className="flex items-center justify-center gap-3">
            {prediction ? (
              <span className="text-sm text-zinc-400">
                Tu pick: <span className="font-bold text-white">
                  {prediction.pick === 'H' ? `${match.homeTeam.flag} ${match.homeTeam.name}` : prediction.pick === 'A' ? `${match.awayTeam.flag} ${match.awayTeam.name}` : 'Empate'}
                </span>
              </span>
            ) : (
              <span className="text-xs text-zinc-600 italic">Sin predicción</span>
            )}
          </div>
        ) : locked ? (
          <div className="flex items-center justify-center gap-3">
            {prediction ? (
              <span className="text-sm text-zinc-400">
                Pick bloqueado: <span className="inline-flex items-center gap-1 font-bold text-white">
                  {prediction.pick === 'H' ? <><Flag code={match.homeTeam.flag} size="sm" /> {match.homeTeam.name}</> : prediction.pick === 'A' ? <><Flag code={match.awayTeam.flag} size="sm" /> {match.awayTeam.name}</> : 'Empate'}
                </span>
              </span>
            ) : (
              <span className="text-xs text-zinc-600 italic">Pick cerrado</span>
            )}
          </div>
        ) : (
          <div>
            <div className="text-xs text-zinc-500 text-center mb-2">¿Quién gana?</div>
            <PickButtons
              selected={selected}
              onSelect={(pick) => setPick(match.id, pick)}
            />
            <div className="flex justify-between text-xs text-zinc-600 mt-1.5 px-1">
              <span className="inline-flex items-center gap-1"><Flag code={match.homeTeam.flag} size="sm" /> {match.homeTeam.name}</span>
              <span>Empate</span>
              <span className="inline-flex items-center gap-1">{match.awayTeam.name} <Flag code={match.awayTeam.flag} size="sm" /></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
