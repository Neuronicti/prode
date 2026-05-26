import { Match, Team, Pick } from './types'
import { WC_GROUPS, WC_GROUP_MATCHES } from './wc2026'

// ─── Tipos del bracket ──────────────────────────────────────────────────────

export type BracketStage = 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'

export interface BracketMatch {
  id: string
  stage: BracketStage
  homeTeam: Team | null
  awayTeam: Team | null
}

export interface GroupTableRow {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  points: number
}

// ─── Simulación de tabla de grupo ───────────────────────────────────────────

export function simulateGroupTable(
  groupId: string,
  picks: Record<string, Pick>
): GroupTableRow[] {
  const teams = WC_GROUPS[groupId]
  const matches = WC_GROUP_MATCHES.filter((m) => m.group === groupId)

  const rows: Record<string, GroupTableRow> = {}
  for (const team of teams) {
    rows[team.code] = { team, played: 0, won: 0, drawn: 0, lost: 0, points: 0 }
  }

  for (const match of matches) {
    const pick = picks[match.id]
    if (!pick) continue

    const home = rows[match.homeTeam.code]
    const away = rows[match.awayTeam.code]
    home.played++
    away.played++

    if (pick === 'H') {
      home.won++; home.points += 3
      away.lost++
    } else if (pick === 'A') {
      away.won++; away.points += 3
      home.lost++
    } else {
      home.drawn++; home.points++
      away.drawn++; away.points++
    }
  }

  return Object.values(rows).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    // tiebreaker: por código de equipo (simplificado)
    return a.team.code.localeCompare(b.team.code)
  })
}

// ─── Resultados de todos los grupos ────────────────────────────────────────

export interface GroupResult {
  groupId: string
  table: GroupTableRow[]
  first: Team
  second: Team
  third: Team
}

export function simulateAllGroups(picks: Record<string, Pick>): GroupResult[] {
  return Object.keys(WC_GROUPS).map((groupId) => {
    const table = simulateGroupTable(groupId, picks)
    return {
      groupId,
      table,
      first: table[0].team,
      second: table[1].team,
      third: table[2].team,
    }
  })
}

// ─── 8 mejores terceros (por puntos, luego código) ─────────────────────────

export function getBestThirds(groupResults: GroupResult[]): Team[] {
  const thirds = groupResults
    .map((g) => ({ team: g.third, points: g.table[2].points }))
    .sort((a, b) => b.points - a.points || a.team.code.localeCompare(b.team.code))
    .slice(0, 8)
  return thirds.map((t) => t.team)
}

// ─── Construcción del bracket R32 ──────────────────────────────────────────
// Cruces reales del R32 según fixture oficial WC 2026
// Fuente: worldcup.json partidos 73-88
export function buildR32Bracket(groupResults: GroupResult[]): BracketMatch[] {
  const g: Record<string, GroupResult> = {}
  for (const r of groupResults) g[r.groupId] = r

  const thirds = getBestThirds(groupResults) // ordenados por puntos desc

  // Los 8 mejores terceros se asignan por posición (simplificado)
  const t = (i: number) => thirds[i] ?? null

  const slot = (pos: 'first' | 'second' | 'third', groupId: string) =>
    g[groupId]?.[pos] ?? null

  // Fixture exacto: partido 73-88
  const raw: [string, Team | null, Team | null][] = [
    ['r32-73', slot('second','A'),  slot('second','B')],
    ['r32-74', slot('first','E'),   t(0)],
    ['r32-75', slot('first','F'),   slot('second','C')],
    ['r32-76', slot('first','C'),   slot('second','F')],
    ['r32-77', slot('first','I'),   t(1)],
    ['r32-78', slot('second','E'),  slot('second','I')],
    ['r32-79', slot('first','A'),   t(2)],
    ['r32-80', slot('first','L'),   t(3)],
    ['r32-81', slot('first','D'),   t(4)],
    ['r32-82', slot('first','G'),   t(5)],
    ['r32-83', slot('second','K'),  slot('second','L')],
    ['r32-84', slot('first','H'),   slot('second','J')],
    ['r32-85', slot('first','B'),   t(6)],
    ['r32-86', slot('first','J'),   slot('second','H')],
    ['r32-87', slot('first','K'),   t(7)],
    ['r32-88', slot('second','D'),  slot('second','G')],
  ]

  return raw.map(([id, homeTeam, awayTeam]) => ({ id, stage: 'r32' as const, homeTeam, awayTeam }))
}

// ─── Avance de ronda: dado picks del bracket, construye la siguiente ronda ──

export function advanceBracket(
  currentRound: BracketMatch[],
  bracketPicks: Record<string, 'H' | 'A'>,
  nextStage: BracketStage
): BracketMatch[] {
  const winners: (Team | null)[] = currentRound.map((m) => {
    const pick = bracketPicks[m.id]
    if (!pick) return null
    return pick === 'H' ? m.homeTeam : m.awayTeam
  })

  const nextMatches: BracketMatch[] = []
  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      id: `${nextStage}-${i / 2 + 1}`,
      stage: nextStage,
      homeTeam: winners[i],
      awayTeam: winners[i + 1] ?? null,
    })
  }
  return nextMatches
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function isRoundComplete(
  matches: BracketMatch[],
  bracketPicks: Record<string, 'H' | 'A'>
): boolean {
  return matches.every((m) => !!bracketPicks[m.id] && m.homeTeam && m.awayTeam)
}

export function getGroupMatchIds(groupId: string): string[] {
  return WC_GROUP_MATCHES.filter((m) => m.group === groupId).map((m) => m.id)
}

export function isGroupComplete(
  groupId: string,
  picks: Record<string, Pick>
): boolean {
  return getGroupMatchIds(groupId).every((id) => !!picks[id])
}

export function areAllGroupsComplete(picks: Record<string, Pick>): boolean {
  return Object.keys(WC_GROUPS).every((g) => isGroupComplete(g, picks))
}
