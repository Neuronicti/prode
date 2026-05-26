'use client'

import { useEffect, useState } from 'react'
import { useProdeStore } from '@/store/prode'
import { MatchCard } from '@/components/MatchCard'
import { Match, Stage } from '@/lib/types'
import { api } from '@/lib/api'

const STAGE_LABELS: Record<Stage, string> = {
  group: 'Fase de Grupos',
  r16: 'Octavos de Final',
  qf: 'Cuartos de Final',
  sf: 'Semifinales',
  third: 'Tercer Puesto',
  final: 'Final',
}

const STAGE_ORDER: Stage[] = ['group', 'r16', 'qf', 'sf', 'third', 'final']

function groupMatchesByStage(matches: Match[]) {
  const grouped: Record<string, Match[]> = {}

  for (const match of matches) {
    const key = match.stage === 'group' && match.group
      ? `group-${match.group}`
      : match.stage
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(match)
  }

  // Sort each group by kickoff
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
  }

  return grouped
}

function getSectionLabel(key: string, matches: Match[]) {
  if (key.startsWith('group-')) {
    const group = key.replace('group-', '')
    return `Grupo ${group}`
  }
  return STAGE_LABELS[key as Stage] ?? key
}

function getSectionOrder(key: string) {
  if (key.startsWith('group-')) {
    return STAGE_ORDER.indexOf('group') * 100 + key.charCodeAt(key.length - 1)
  }
  return STAGE_ORDER.indexOf(key as Stage) * 100
}

export default function FixturePage() {
  const { predictions } = useProdeStore()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load matches from API test endpoint (server-side fetch)
    fetch('/api/test')
      .then(r => r.json())
      .then((testResponse: any) => {
        if (testResponse.success && testResponse.count > 0) {
          // Get real matches from API
          return fetch('/api/proxy?path=%2Fmatches')
            .then(r => r.json())
            .then((data: any) => {
              if (Array.isArray(data) && data.length > 0) {
                setMatches(data)
              }
              setIsLoading(false)
            })
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load matches:', err)
        setIsLoading(false)
      })
  }, [])

  // LIVE matches first
  const liveMatches = matches.filter((m) => m.status === 'LIVE')
  const otherMatches = matches.filter((m) => m.status !== 'LIVE')

  const grouped = groupMatchesByStage(otherMatches)
  const sections = Object.keys(grouped).sort((a, b) => getSectionOrder(a) - getSectionOrder(b))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Fixture</h1>
        <p className="text-sm text-zinc-500">Hacé tus predicciones antes del inicio de cada partido</p>
      </div>

      {isLoading && (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300">Cargando partidos...</p>
        </div>
      )}

      {!isLoading && matches.length === 0 && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-300">No se pudieron cargar los partidos</p>
        </div>
      )}

      {/* LIVE section */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">En Vivo</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} prediction={predictions[match.id]} />
            ))}
          </div>
        </section>
      )}

      {/* Other sections */}
      {sections.map((key) => (
        <section key={key}>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">
            {getSectionLabel(key, grouped[key])}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {grouped[key].map((match) => (
              <MatchCard key={match.id} match={match} prediction={predictions[match.id]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
