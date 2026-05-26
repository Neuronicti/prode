import express from 'express'
import cors from 'cors'
import { initDb } from './db.js'
import authRoutes from './routes/auth.js'
import matchesRoutes from './routes/matches.js'
import predictionsRoutes from './routes/predictions.js'
import standingsRoutes from './routes/standings.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/matches', matchesRoutes)
app.use('/predictions', predictionsRoutes)
app.use('/standings', standingsRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
  })
}).catch((err) => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
