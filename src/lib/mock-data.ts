import { Match, Standing, User, Prediction } from './types'

export const TEAMS = {
  ARG: { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  BRA: { name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
  FRA: { name: 'Francia', code: 'FRA', flag: '🇫🇷' },
  GER: { name: 'Alemania', code: 'GER', flag: '🇩🇪' },
  ESP: { name: 'España', code: 'ESP', flag: '🇪🇸' },
  ENG: { name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  POR: { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
  MAR: { name: 'Marruecos', code: 'MAR', flag: '🇲🇦' },
}

// Use dates relative to "now" so matches feel current
const now = new Date()
const pastDate = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString()
const futureDate = (hoursFromNow: number) => new Date(now.getTime() + hoursFromNow * 3600000).toISOString()

export const MOCK_MATCHES: Match[] = [
  // LIVE match
  {
    id: 'm-live',
    homeTeam: TEAMS.ARG,
    awayTeam: TEAMS.FRA,
    kickoff: pastDate(1),
    stage: 'group',
    group: 'A',
    status: 'LIVE',
    score: { home: 1, away: 1 },
    result: null,
    lockAt: pastDate(1),
  },
  // FINISHED matches (group stage)
  {
    id: 'm1',
    homeTeam: TEAMS.BRA,
    awayTeam: TEAMS.GER,
    kickoff: pastDate(48),
    stage: 'group',
    group: 'B',
    status: 'FINISHED',
    score: { home: 2, away: 1 },
    result: 'H',
    lockAt: pastDate(48),
  },
  {
    id: 'm2',
    homeTeam: TEAMS.ESP,
    awayTeam: TEAMS.ENG,
    kickoff: pastDate(24),
    stage: 'group',
    group: 'C',
    status: 'FINISHED',
    score: { home: 0, away: 0 },
    result: 'D',
    lockAt: pastDate(24),
  },
  {
    id: 'm3',
    homeTeam: TEAMS.POR,
    awayTeam: TEAMS.MAR,
    kickoff: pastDate(72),
    stage: 'group',
    group: 'D',
    status: 'FINISHED',
    score: { home: 3, away: 1 },
    result: 'H',
    lockAt: pastDate(72),
  },
  {
    id: 'm4',
    homeTeam: TEAMS.GER,
    awayTeam: TEAMS.ARG,
    kickoff: pastDate(96),
    stage: 'group',
    group: 'A',
    status: 'FINISHED',
    score: { home: 1, away: 2 },
    result: 'A',
    lockAt: pastDate(96),
  },
  {
    id: 'm5',
    homeTeam: TEAMS.FRA,
    awayTeam: TEAMS.ESP,
    kickoff: pastDate(120),
    stage: 'group',
    group: 'C',
    status: 'FINISHED',
    score: { home: 2, away: 0 },
    result: 'H',
    lockAt: pastDate(120),
  },
  // SCHEDULED matches (group stage)
  {
    id: 'm6',
    homeTeam: TEAMS.ENG,
    awayTeam: TEAMS.BRA,
    kickoff: futureDate(6),
    stage: 'group',
    group: 'B',
    status: 'SCHEDULED',
    score: null,
    result: null,
    lockAt: futureDate(6),
  },
  {
    id: 'm7',
    homeTeam: TEAMS.MAR,
    awayTeam: TEAMS.GER,
    kickoff: futureDate(10),
    stage: 'group',
    group: 'D',
    status: 'SCHEDULED',
    score: null,
    result: null,
    lockAt: futureDate(10),
  },
  // Knockout stage - SCHEDULED
  {
    id: 'm-r16-1',
    homeTeam: TEAMS.ARG,
    awayTeam: TEAMS.ESP,
    kickoff: futureDate(48),
    stage: 'r16',
    status: 'SCHEDULED',
    score: null,
    result: null,
    lockAt: futureDate(48),
  },
  {
    id: 'm-r16-2',
    homeTeam: TEAMS.FRA,
    awayTeam: TEAMS.BRA,
    kickoff: futureDate(72),
    stage: 'r16',
    status: 'SCHEDULED',
    score: null,
    result: null,
    lockAt: futureDate(72),
  },
  {
    id: 'm-qf-1',
    homeTeam: TEAMS.POR,
    awayTeam: TEAMS.ENG,
    kickoff: futureDate(120),
    stage: 'qf',
    status: 'SCHEDULED',
    score: null,
    result: null,
    lockAt: futureDate(120),
  },
  {
    id: 'm-sf-1',
    homeTeam: TEAMS.GER,
    awayTeam: TEAMS.MAR,
    kickoff: futureDate(168),
    stage: 'sf',
    status: 'SCHEDULED',
    score: null,
    result: null,
    lockAt: futureDate(168),
  },
]

export const MOCK_STANDINGS: Standing[] = [
  { uid: 'user-1', displayName: 'Leandro', photoURL: '', totalPoints: 15, correctPicks: 5, totalPicks: 7 },
  { uid: 'user-2', displayName: 'Martina', photoURL: '', totalPoints: 18, correctPicks: 6, totalPicks: 7 },
  { uid: 'user-3', displayName: 'Santiago', photoURL: '', totalPoints: 12, correctPicks: 4, totalPicks: 7 },
  { uid: 'user-4', displayName: 'Valentina', photoURL: '', totalPoints: 21, correctPicks: 7, totalPicks: 7 },
  { uid: 'user-5', displayName: 'Nicolás', photoURL: '', totalPoints: 9, correctPicks: 3, totalPicks: 7 },
]

export const MOCK_USER: User = {
  uid: 'user-1',
  displayName: 'Leandro',
  email: 'leandrobernardi@neuronic.com.ar',
  photoURL: '',
}

// Initial predictions for user-1
export const MOCK_PREDICTIONS: Record<string, Prediction> = {
  'm1': { matchId: 'm1', pick: 'H', points: 3 },    // correct: BRA won
  'm2': { matchId: 'm2', pick: 'H', points: 0 },    // wrong: was D
  'm3': { matchId: 'm3', pick: 'H', points: 3 },    // correct: POR won
  'm4': { matchId: 'm4', pick: 'A', points: 3 },    // correct: ARG won
  'm5': { matchId: 'm5', pick: 'D', points: 0 },    // wrong: FRA won
  'm-live': { matchId: 'm-live', pick: 'H', points: 0 }, // still live
  'm6': { matchId: 'm6', pick: 'A', points: 0 },    // scheduled, picked
}
