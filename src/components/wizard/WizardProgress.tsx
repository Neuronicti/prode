'use client'

import { WizardStep } from '@/store/wizard'
import { GROUP_KEYS } from '@/lib/wc2026'
import { isGroupComplete } from '@/lib/tournament'
import { Pick } from '@/lib/types'

interface Props {
  step: WizardStep
  groupPicks: Record<string, Pick>
  onGoToGroup?: (groupIndex: number) => void
}

const KNOCKOUT_LABELS: Record<string, string> = {
  r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF', final: 'Final',
}

export function WizardProgress({ step, groupPicks, onGoToGroup }: Props) {
  const totalGroupSteps = GROUP_KEYS.length
  const knockoutStages = ['r32', 'r16', 'qf', 'sf', 'final']

  const completedGroups = GROUP_KEYS.map((g) => isGroupComplete(g, groupPicks))
  const groupProgress = completedGroups.filter(Boolean).length

  return (
    <div className="w-full space-y-3">
      {/* Grupos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Fase de Grupos</span>
          <span className="text-xs text-zinc-400 font-semibold">{groupProgress}/{totalGroupSteps}</span>
        </div>
        <div className="flex gap-1">
          {GROUP_KEYS.map((g, i) => {
            const done = completedGroups[i]
            const current = step.type === 'group' && i === step.groupIndex
            const clickable = done && onGoToGroup
            return (
              <div
                key={g}
                className={`flex-1 flex flex-col items-center gap-1 ${clickable ? 'cursor-pointer group' : ''}`}
                onClick={() => clickable && onGoToGroup(i)}
                title={clickable ? `Ir al Grupo ${g}` : undefined}
              >
                <div
                  className={`w-full h-2 rounded-full transition-all duration-300 ${
                    done
                      ? 'bg-[#2970CA] shadow-[0_0_6px_#2970CA88] group-hover:bg-[#0C53A1]'
                      : current
                      ? 'bg-[#2970CA]/50'
                      : 'bg-white/10'
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  done ? 'text-[#2970CA] group-hover:text-white' : current ? 'text-white' : 'text-zinc-600'
                }`}>{g}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Playoffs — barra simple, un solo bloque */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Playoffs</span>
        </div>
        <div
          className={`w-full h-2 rounded-full transition-all duration-300 ${
            step.type === 'summary'
              ? 'bg-[#2970CA] shadow-[0_0_6px_#2970CA88]'
              : step.type === 'bracket'
              ? 'bg-[#2970CA]/50'
              : 'bg-white/10'
          }`}
        />
      </div>
    </div>
  )
}
