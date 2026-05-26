import { NextRequest } from 'next/server'

// Session management — JWT is stored in localStorage on client
// This endpoint is kept for compatibility but not actively used

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 })
  }

  // Token validation is done by the API backend
  // Client stores JWT in localStorage
  return Response.json({ ok: true })
}

export async function DELETE() {
  // Logout is handled client-side (clear localStorage)
  return Response.json({ ok: true })
}
