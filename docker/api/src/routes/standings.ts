import { Router, Request, Response } from 'express'
import { query } from '../db.js'

const router = Router()

// GET /standings - Get rankings
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM standings')
    res.json(result.rows)
  } catch (err) {
    console.error('Standings error:', err)
    res.status(500).json({ error: 'Failed to fetch standings' })
  }
})

export default router
