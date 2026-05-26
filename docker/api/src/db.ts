import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function initDb() {
  try {
    const res = await pool.query('SELECT NOW()')
    console.log('Database connected:', res.rows[0])
  } catch (err) {
    console.error('Database connection failed:', err)
    throw err
  }
}

export function query(text: string, params?: any[]) {
  return pool.query(text, params)
}

export async function getClient() {
  return pool.connect()
}

export { pool }
