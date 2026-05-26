'use client'

import { useProdeStore } from '@/store/prode'
import { StandingsTable } from '@/components/StandingsTable'

export default function RankingPage() {
  const standings = useProdeStore((s) => s.standings)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Ranking en vivo</h1>
        <p className="text-sm text-zinc-500">Se actualiza automáticamente cuando terminan los partidos.</p>
      </div>

      <StandingsTable standings={standings} />
    </div>
  )
}
