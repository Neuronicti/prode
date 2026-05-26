'use client'

import { useProdeStore } from '@/store/prode'
import { Match, Prediction } from '@/lib/types'
import { Flag } from '@/components/Flag'

function PickLabel({ pick, match }: { pick: string; match: Match }) {
  if (pick === 'H') return <div className="flex items-center gap-2"><Flag code={match.homeTeam.flag} size="sm" /> {match.homeTeam.name}</div>
  if (pick === 'A') return <div className="flex items-center gap-2"><Flag code={match.awayTeam.flag} size="sm" /> {match.awayTeam.name}</div>
  return <>Empate</>
}

function PickStatusBadge({ match, prediction }: { match: Match; prediction: Prediction }) {
  if (match.status === 'FINISHED') {
    if (prediction.pick === match.result) {
      return (
        <span className="flex items-center gap-1 text-[#2970CA]$ font-bold text-sm">
          <span>✓</span>
          <span>+3 pts</span>
        </span>
      )
    }
    return <span className="text-red-400 font-bold text-sm">✗ 0 pts</span>
  }
  if (match.status === 'LIVE') {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 font-bold">EN VIVO</span>
  }
  return <span className="text-xs text-zinc-500 font-medium">Pendiente</span>
}

export default function MisPicksPage() {
  const { matches, predictions } = useProdeStore()

  // Only matches where user has a prediction
  const pickedMatches = matches
    .filter((m) => predictions[m.id])
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())

  const totalPicks = pickedMatches.length
  const correctPicks = pickedMatches.filter(
    (m) => m.status === 'FINISHED' && predictions[m.id]?.pick === m.result
  ).length
  const totalPoints = correctPicks * 3

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Mis Picks</h1>
        <p className="text-sm text-zinc-500">Tus predicciones para todos los partidos</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111] rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-3xl font-black text-white">{totalPicks}</div>
          <div className="text-xs text-zinc-500 mt-1">Picks totales</div>
        </div>
        <div className="bg-[#111] rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-3xl font-black text-[#2970CA]$">{correctPicks}</div>
          <div className="text-xs text-zinc-500 mt-1">Aciertos</div>
        </div>
        <div className="bg-[#111] rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-3xl font-black text-white">{totalPoints}</div>
          <div className="text-xs text-zinc-500 mt-1">Puntos</div>
        </div>
      </div>

      {/* Picks list */}
      {pickedMatches.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <div className="text-4xl mb-3">⚽</div>
          <div className="font-medium">Todavía no hiciste ningún pick</div>
          <div className="text-sm mt-1">Andá al Fixture para predecir los partidos</div>
        </div>
      ) : (
        <div className="space-y-2">
          {pickedMatches.map((match) => {
            const prediction = predictions[match.id]!
            const kickoffDate = new Date(match.kickoff).toLocaleDateString('es-AR', {
              weekday: 'short', day: 'numeric', month: 'short'
            })
            const kickoffTime = new Date(match.kickoff).toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit'
            })

            return (
              <div
                key={match.id}
                className="bg-[#111] rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between gap-4"
              >
                {/* Teams */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Flag code={match.homeTeam.flag} size="sm" /> {match.homeTeam.name} <span className="text-zinc-600">vs</span> <Flag code={match.awayTeam.flag} size="sm" /> {match.awayTeam.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {kickoffDate} · {kickoffTime}hs
                    {match.status === 'FINISHED' && match.score && (
                      <span className="ml-2 font-medium text-zinc-400">
                        ({match.score.home}-{match.score.away})
                      </span>
                    )}
                  </div>
                </div>

                {/* Pick */}
                <div className="text-sm text-zinc-400 shrink-0 text-right">
                  <div className="font-medium text-white">
                    <PickLabel pick={prediction.pick} match={match} />
                  </div>
                  <div className="mt-0.5">
                    <PickStatusBadge match={match} prediction={prediction} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
