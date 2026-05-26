export type Stage = 'group' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'
export type Pick = 'H' | 'D' | 'A'
export type MatchResult = Pick | null

export interface Team { name: string; code: string; flag: string }
export interface Match {
  id: string
  homeTeam: Team; awayTeam: Team
  kickoff: string // ISO
  stage: Stage; group?: string
  status: MatchStatus
  score: { home: number; away: number } | null
  result: MatchResult
  lockAt: string // ISO
}
export interface Prediction { matchId: string; pick: Pick; points: number }
export interface Standing {
  uid: string; displayName: string; photoURL: string
  totalPoints: number; correctPicks: number; totalPicks: number
}
export interface User { uid: string; displayName: string; email: string; photoURL: string }
