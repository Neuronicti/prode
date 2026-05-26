import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || ''
  const apiUrl = `http://localhost:4000${path}`

  console.log('[Proxy] GET request to:', apiUrl)

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    })

    console.log('[Proxy] Response status:', response.status)

    if (!response.ok) {
      return NextResponse.json({ error: response.statusText }, { status: response.status })
    }

    const data = await response.json()
    console.log('[Proxy] Returning data, length:', Array.isArray(data) ? data.length : 'object')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json({ error: 'API unavailable' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || ''
  const apiUrl = `http://localhost:4000${path}`
  const body = await request.json()

  console.log('[Proxy] POST request to:', apiUrl)

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Proxy] Response status:', response.status)

    if (!response.ok) {
      return NextResponse.json({ error: response.statusText }, { status: response.status })
    }

    const data = await response.json()
    console.log('[Proxy] Returning data')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json({ error: 'API unavailable' }, { status: 503 })
  }
}
