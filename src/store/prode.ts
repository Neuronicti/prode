'use client'

import { create } from 'zustand'
import { Match, Prediction, Standing, Pick } from '@/lib/types'
import { api } from '@/lib/api'

interface ProdeState {
  matches: Match[]
  predictions: Record<string, Prediction>
  standings: Standing[]
  isLoading: boolean
  error: string | null

  setPick: (matchId: string, pick: Pick) => Promise<void>
  loadMatches: () => Promise<void>
  loadPredictions: (userId: string) => Promise<void>
  loadStandings: () => Promise<void>
  loadAllData: (userId: string) => Promise<void>
}

export const useProdeStore = create<ProdeState>()((set, get) => ({
  matches: [],
  predictions: {},
  standings: [],
  isLoading: false,
  error: null,

  loadMatches: async () => {
    console.log('[Store] loadMatches called')
    set({ isLoading: true, error: null })
    try {
      console.log('[Store] Calling api.getMatches()')
      const matches = await api.getMatches()
      console.log('[Store] API returned', matches?.length, 'matches')
      // Matches from API come as plain objects, convert to proper Match format
      const formattedMatches = matches.map((m: any) => ({
        id: m.id,
        homeTeam: typeof m.home_team === 'string' ? JSON.parse(m.home_team) : m.home_team,
        awayTeam: typeof m.away_team === 'string' ? JSON.parse(m.away_team) : m.away_team,
        kickoff: m.kickoff,
        lockAt: m.lock_at,
        stage: m.stage,
        group: m.group,
        status: m.status,
        score: m.score ? (typeof m.score === 'string' ? JSON.parse(m.score) : m.score) : null,
        result: m.result,
      }))
      console.log('[Store] Setting', formattedMatches.length, 'formatted matches to state')
      set({ matches: formattedMatches, isLoading: false })
      console.log('[Store] Store state updated:', get().matches.length)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load matches'
      console.error('[Store] Error loading matches:', message)
      set({ error: message, isLoading: false })
    }
  },

  loadPredictions: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const predictions = await api.getPredictions(userId)
      const predMap: Record<string, Prediction> = {}
      predictions.forEach((p: any) => {
        predMap[p.match_id] = { matchId: p.match_id, pick: p.pick, points: p.points || 0 }
      })
      set({ predictions: predMap, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load predictions'
      set({ error: message, isLoading: false })
    }
  },

  loadStandings: async () => {
    set({ isLoading: true, error: null })
    try {
      const standings = await api.getStandings()
      const formattedStandings = standings.map((s: any) => ({
        uid: s.uid,
        displayName: s.display_name,
        photoURL: s.photo_url || '',
        totalPoints: s.total_points,
        correctPicks: s.correct_picks,
        totalPicks: s.total_picks,
      }))
      set({ standings: formattedStandings, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load standings'
      set({ error: message, isLoading: false })
    }
  },

  loadAllData: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all([
        get().loadMatches(),
        get().loadPredictions(userId),
        get().loadStandings(),
      ])
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load data'
      set({ error: message, isLoading: false })
    }
  },

  setPick: async (matchId: string, pick: Pick) => {
    try {
      await api.setPrediction(matchId, pick)
      // Update local predictions immediately for UI feedback
      set((state) => ({
        predictions: {
          ...state.predictions,
          [matchId]: { matchId, pick, points: 0 },
        },
      }))
      // Reload standings after making a pick
      await get().loadStandings()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save prediction'
      set({ error: message })
      throw error
    }
  },
}))
