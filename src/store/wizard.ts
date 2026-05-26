'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Pick } from '@/lib/types'
import { BracketMatch, BracketStage, buildR32Bracket, advanceBracket, simulateAllGroups, isGroupComplete, areAllGroupsComplete } from '@/lib/tournament'
import { GROUP_KEYS } from '@/lib/wc2026'

// step 0 = bienvenida
// steps 1-12 = grupos A-L
// step 13 = R32
// step 14 = R16
// step 15 = QF
// step 16 = SF + 3er puesto
// step 17 = Final
// step 18 = resumen

export type WizardStep =
  | { type: 'welcome' }
  | { type: 'group'; groupIndex: number }   // groupIndex 0-11 → grupos A-L
  | { type: 'bracket'; stage: BracketStage }
  | { type: 'summary' }

const BRACKET_STAGES: BracketStage[] = ['r32', 'r16', 'qf', 'sf', 'final']

interface WizardState {
  step: WizardStep
  groupPicks: Record<string, Pick>         // matchId → H/D/A
  bracketPicks: Record<string, 'H' | 'A'> // matchId → H/A
  bracket: Record<BracketStage, BracketMatch[]>

  // acciones
  setPick: (matchId: string, pick: Pick) => void
  setBracketPick: (matchId: string, winner: 'H' | 'A') => void
  nextStep: () => void
  prevStep: () => void
  goToGroup: (groupIndex: number) => void
  reset: () => void

  // computed
  isCurrentGroupComplete: () => boolean
  isCurrentBracketRoundComplete: () => boolean
}

const emptyBracket: Record<BracketStage, BracketMatch[]> = {
  r32: [], r16: [], qf: [], sf: [], third: [], final: [],
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      step: { type: 'welcome' },
      groupPicks: {},
      bracketPicks: {},
      bracket: emptyBracket,

      setPick: (matchId, pick) =>
        set((s) => ({ groupPicks: { ...s.groupPicks, [matchId]: pick } })),

      setBracketPick: (matchId, winner) =>
        set((s) => {
          const newPicks = { ...s.bracketPicks, [matchId]: winner }
          // Find which stage this match belongs to
          const stageIdx = BRACKET_STAGES.findIndex((st) =>
            s.bracket[st]?.some((m) => m.id === matchId)
          )
          if (stageIdx === -1) return { bracketPicks: newPicks }
          // Rebuild all downstream rounds
          let newBracket = { ...s.bracket }
          for (let i = stageIdx; i < BRACKET_STAGES.length - 1; i++) {
            const curr = BRACKET_STAGES[i]
            const next = BRACKET_STAGES[i + 1]
            newBracket = { ...newBracket, [next]: advanceBracket(newBracket[curr], newPicks, next) }
          }
          return { bracketPicks: newPicks, bracket: newBracket }
        }),

      nextStep: () => {
        const { step, groupPicks, bracketPicks, bracket } = get()

        if (step.type === 'welcome') {
          set({ step: { type: 'group', groupIndex: 0 } })
          return
        }

        if (step.type === 'group') {
          const next = step.groupIndex + 1
          if (next < GROUP_KEYS.length) {
            set({ step: { type: 'group', groupIndex: next } })
          } else {
            // Reconstruir R32 con picks actualizados, preservar rondas siguientes si ya existen
            const groupResults = simulateAllGroups(groupPicks)
            const r32 = buildR32Bracket(groupResults)
            set((s) => ({
              bracket: { ...s.bracket, r32 },
              step: { type: 'bracket', stage: 'r32' },
            }))
          }
          return
        }

        if (step.type === 'bracket') {
          const stageIdx = BRACKET_STAGES.indexOf(step.stage)
          const nextStage = BRACKET_STAGES[stageIdx + 1]

          if (!nextStage) {
            set({ step: { type: 'summary' } })
            return
          }

          // Construir siguiente ronda a partir de picks actuales
          const currentRound = bracket[step.stage]
          const nextRound = advanceBracket(currentRound, bracketPicks, nextStage)
          set({
            bracket: { ...bracket, [nextStage]: nextRound },
            step: { type: 'bracket', stage: nextStage },
          })
          return
        }
      },

      prevStep: () => {
        const { step } = get()

        if (step.type === 'group') {
          if (step.groupIndex === 0) {
            set({ step: { type: 'welcome' } })
          } else {
            set({ step: { type: 'group', groupIndex: step.groupIndex - 1 } })
          }
          return
        }

        if (step.type === 'bracket') {
          const stageIdx = BRACKET_STAGES.indexOf(step.stage)
          if (stageIdx === 0) {
            set({ step: { type: 'group', groupIndex: GROUP_KEYS.length - 1 } })
          } else {
            set({ step: { type: 'bracket', stage: BRACKET_STAGES[stageIdx - 1] } })
          }
          return
        }

        if (step.type === 'summary') {
          set({ step: { type: 'bracket', stage: 'final' } })
          return
        }
      },

      goToGroup: (groupIndex) =>
        set({ step: { type: 'group', groupIndex } }),

      reset: () =>
        set({
          step: { type: 'welcome' },
          groupPicks: {},
          bracketPicks: {},
          bracket: emptyBracket,
        }),

      isCurrentGroupComplete: () => {
        const { step, groupPicks } = get()
        if (step.type !== 'group') return false
        return isGroupComplete(GROUP_KEYS[step.groupIndex], groupPicks)
      },

      isCurrentBracketRoundComplete: () => {
        const { step, bracketPicks, bracket } = get()
        if (step.type !== 'bracket') return false
        const matches = bracket[step.stage]
        return matches.length > 0 && matches.every(
          (m) => !!bracketPicks[m.id] && m.homeTeam && m.awayTeam
        )
      },
    }),
    { name: 'prode-wizard' }
  )
)
