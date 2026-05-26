import { Router, Response } from 'express'
import { query } from '../db.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /predictions/:userId - Get user predictions
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const result = await query(
      'SELECT id, match_id, pick, points FROM predictions WHERE user_id = $1',
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Predictions error:', err)
    res.status(500).json({ error: 'Failed to fetch predictions' })
  }
})

// POST /predictions - Save a prediction
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId, pick } = req.body
    const userId = req.userId

    if (!matchId || !pick) {
      return res.status(400).json({ error: 'Missing matchId or pick' })
    }

    // Check if match exists and hasn't locked
    const matchResult = await query('SELECT lock_at FROM matches WHERE id = $1', [matchId])
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' })
    }

    const lockAt = new Date(matchResult.rows[0].lock_at)
    if (new Date() > lockAt) {
      return res.status(400).json({ error: 'Match has locked' })
    }

    // Upsert prediction
    const result = await query(
      `INSERT INTO predictions (user_id, match_id, pick)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, match_id) DO UPDATE
       SET pick = $3, updated_at = now()
       RETURNING id, match_id, pick`,
      [userId, matchId, pick]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Prediction error:', err)
    res.status(500).json({ error: 'Failed to save prediction' })
  }
})

export default router
