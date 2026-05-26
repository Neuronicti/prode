import { Router, Request, Response } from 'express'
import { query } from '../db.js'

const router = Router()

// GET /matches - List all matches
router.get('/', async (req: Request, res: Response) => {
  try {
    const stage = req.query.stage as string | undefined
    const group = req.query.group as string | undefined

    let sql = 'SELECT * FROM matches WHERE 1=1'
    const params: any[] = []

    if (stage) {
      sql += ' AND stage = $' + (params.length + 1)
      params.push(stage)
    }

    if (group) {
      sql += ' AND "group" = $' + (params.length + 1)
      params.push(group)
    }

    sql += ' ORDER BY kickoff ASC'

    const result = await query(sql, params)
    res.json(result.rows)
  } catch (err) {
    console.error('Matches error:', err)
    res.status(500).json({ error: 'Failed to fetch matches' })
  }
})

// GET /matches/:id - Get single match
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM matches WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Match error:', err)
    res.status(500).json({ error: 'Failed to fetch match' })
  }
})

export default router
