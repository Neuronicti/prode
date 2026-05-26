import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { query } from '../db.js'

const router = Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

interface GoogleTokenPayload {
  aud?: string
  sub?: string
  name?: string
  email?: string
  picture?: string
}

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Missing token' })
    }

    // Verify Google ID token
    let payload: GoogleTokenPayload
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload() as GoogleTokenPayload
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Google token' })
    }

    if (!payload.sub || !payload.email) {
      return res.status(400).json({ error: 'Invalid token payload' })
    }

    // Upsert user
    const result = await query(
      `INSERT INTO users (google_id, display_name, email, photo_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
       SET display_name = $2, email = $3, photo_url = $4
       RETURNING id, display_name, email, photo_url`,
      [payload.sub, payload.name || payload.email, payload.email, payload.picture || null]
    )

    const user = result.rows[0]

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        displayName: user.display_name,
        email: user.email,
        photoURL: user.photo_url,
      },
    })
  } catch (err) {
    console.error('Auth error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

export default router
