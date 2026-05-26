import { pool } from './db.js'
import { generateMatches } from './seed-data.js'

async function seed() {
  const client = await pool.connect()
  try {
    const matches = generateMatches()

    console.log(`Seeding ${matches.length} matches...`)

    for (const match of matches) {
      await client.query(
        `INSERT INTO matches (id, home_team, away_team, kickoff, lock_at, stage, "group", status, score, result)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          match.id,
          JSON.stringify(match.homeTeam),
          JSON.stringify(match.awayTeam),
          match.kickoff,
          match.lockAt,
          match.stage,
          match.group || null,
          match.status || 'SCHEDULED',
          match.score ? JSON.stringify(match.score) : null,
          match.result || null,
        ]
      )
    }

    console.log('Database seeded successfully')
  } catch (err) {
    console.error('Seed error:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})
