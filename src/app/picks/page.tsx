'use client'

import { useRouter } from 'next/navigation'
import { useWizardStore } from '@/store/wizard'
import { useProdeStore } from '@/store/prode'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { GroupStep } from '@/components/wizard/GroupStep'
import { BracketFullView } from '@/components/wizard/BracketFullView'
import { SummaryStep } from '@/components/wizard/SummaryStep'
import { WC_GROUP_MATCHES } from '@/lib/wc2026'
import { simulateAllGroups, buildR32Bracket, advanceBracket } from '@/lib/tournament'
import { BracketStage } from '@/lib/tournament'
import { Pick } from '@/lib/types'

export default function PicksPage() {
  const router = useRouter()
  const {
    step, groupPicks, bracketPicks, bracket,
    setPick, setBracketPick, nextStep, prevStep, goToGroup, reset,
    isCurrentGroupComplete,
  } = useWizardStore()

  const setPredictionsFromWizard = useProdeStore((s) => s.setPick)

  function handleAutoFill() {
    const options: Pick[] = ['H', 'D', 'A']
    const newPicks: Record<string, Pick> = {}
    WC_GROUP_MATCHES.forEach((m) => {
      newPicks[m.id] = options[Math.floor(Math.random() * 3)]
    })
    // Set all picks at once then build bracket
    WC_GROUP_MATCHES.forEach((m) => setPick(m.id, newPicks[m.id]))
    const groupResults = simulateAllGroups(newPicks)
    const r32 = buildR32Bracket(groupResults)
    useWizardStore.setState((s: any) => ({
      bracket: { ...s.bracket, r32 },
      step: { type: 'bracket', stage: 'r32' },
    }))
  }

  function handleAutoFillBracket() {
    const stages: BracketStage[] = ['r32', 'r16', 'qf', 'sf', 'final']
    let currentBracket = { ...bracket }
    let newPicks = { ...bracketPicks }

    for (const stage of stages) {
      const matches = currentBracket[stage] ?? []
      // Pick random winner for each match in this round
      matches.forEach((m) => {
        if (m.homeTeam && m.awayTeam) {
          newPicks[m.id] = Math.random() < 0.5 ? 'H' : 'A'
        }
      })
      // Build next round
      const nextIdx = stages.indexOf(stage) + 1
      if (nextIdx < stages.length) {
        const nextStage = stages[nextIdx]
        currentBracket[nextStage] = advanceBracket(matches, newPicks, nextStage)
      }
    }

    useWizardStore.setState({ bracketPicks: newPicks, bracket: currentBracket })
  }

  function isBracketComplete() {
    const fin = bracket.final ?? []
    return fin.length > 0 && !!bracketPicks[fin[0]?.id]
  }

  function handleConfirm() {
    Object.entries(groupPicks).forEach(([matchId, pick]) => {
      setPredictionsFromWizard(matchId, pick)
    })
    router.push('/my-picks')
  }

  return (
    <div className={`mx-auto space-y-6 ${step.type === 'bracket' ? 'max-w-full px-2' : 'max-w-2xl'}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Mis Predicciones</h1>
        <p className="text-sm text-zinc-500">Mundial 2026 — completá tu pronóstico partido por partido</p>
      </div>

      {/* DEV buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={reset}
          className="text-xs text-zinc-700 border border-dashed border-white/5 px-3 py-1 rounded-lg hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          🗑 reset
        </button>
        <button
          onClick={handleAutoFill}
          className="text-xs text-zinc-600 border border-dashed border-white/10 px-3 py-1 rounded-lg hover:text-zinc-300 hover:border-white/30 transition-colors"
        >
          🎲 grupos
        </button>
        {(bracket.r32 ?? []).length > 0 && (
          <button
            onClick={handleAutoFillBracket}
            className="text-xs text-zinc-600 border border-dashed border-white/10 px-3 py-1 rounded-lg hover:text-zinc-300 hover:border-white/30 transition-colors"
          >
            🎲 playoffs
          </button>
        )}
      </div>

      {/* Progreso (oculto en welcome) */}
      {step.type !== 'welcome' && (
        <div className="bg-[#111] rounded-2xl border border-white/5 p-4">
          <WizardProgress step={step} groupPicks={groupPicks} onGoToGroup={goToGroup} />
        </div>
      )}

      {/* Welcome */}
      {step.type === 'welcome' && (
        <div className="bg-[#111] rounded-2xl border border-white/5 p-8 text-center space-y-4">
          <div className="text-5xl">⚽</div>
          <h2 className="text-xl font-black text-white">Armá tu prode del Mundial 2026</h2>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Predecí los resultados de todos los partidos de la fase de grupos y luego armá tu bracket de playoffs hasta la final.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-[#2970CA]">12</div>
              <div className="text-xs text-zinc-500 mt-0.5">Grupos</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-[#2970CA]">72</div>
              <div className="text-xs text-zinc-500 mt-0.5">Partidos</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-[#2970CA]">48</div>
              <div className="text-xs text-zinc-500 mt-0.5">Equipos</div>
            </div>
          </div>
          <button
            onClick={nextStep}
            className="w-full py-3 rounded-xl bg-[#0C53A1] text-white font-black text-sm hover:bg-[#2970CA] transition-colors"
          >
            Empezar →
          </button>
          {Object.keys(groupPicks).length > 0 && (
            <button onClick={reset} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Reiniciar predicciones
            </button>
          )}
        </div>
      )}

      {/* Grupos */}
      {step.type === 'group' && (
        <GroupStep
          groupIndex={step.groupIndex}
          picks={groupPicks}
          onPick={setPick}
          onNext={nextStep}
          onPrev={prevStep}
          isComplete={isCurrentGroupComplete()}
        />
      )}

      {/* Bracket completo */}
      {step.type === 'bracket' && (
        <BracketFullView
          bracket={bracket}
          bracketPicks={bracketPicks}
          onPick={setBracketPick}
          onNext={() => useWizardStore.setState({ step: { type: 'summary' } })}
          onPrev={() => useWizardStore.setState({ step: { type: 'group', groupIndex: 11 } })}
          isComplete={isBracketComplete()}
        />
      )}

      {/* Resumen */}
      {step.type === 'summary' && (
        <SummaryStep
          groupPicks={groupPicks}
          bracketPicks={bracketPicks}
          bracket={bracket}
          onConfirm={handleConfirm}
          onPrev={() => useWizardStore.setState({ step: { type: 'bracket', stage: 'r32' } })}
        />
      )}
    </div>
  )
}
