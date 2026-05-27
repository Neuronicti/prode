// Use Next.js API route as proxy to Docker API
const API_URL = '/api/proxy'

async function request(endpoint: string, options: RequestInit = {}) {
  // Encode the endpoint path as a query parameter for the proxy
  const url = `${API_URL}?path=${encodeURIComponent(endpoint)}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    console.log(`[API] Requesting: ${endpoint}`)
    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`[API] Response status: ${response.status} for ${endpoint}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `API error: ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    const data = await response.json()
    console.log(`[API] Got data for ${endpoint}, length:`, Array.isArray(data) ? data.length : 'object')
    return data
  } catch (error) {
    console.error(`[API] Error for ${endpoint}:`, error)
    throw error
  }
}

export const api = {
  // Auth
  googleAuth: (token: string) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Matches
  getMatches: (stage?: string, group?: string) => {
    const params = new URLSearchParams()
    if (stage) params.append('stage', stage)
    if (group) params.append('group', group)
    return request(`/matches${params.toString() ? '?' + params : ''}`)
  },

  getMatch: (id: string) => request(`/matches/${id}`),

  // Predictions
  getPredictions: (userId: string) => request(`/predictions/${userId}`),

  setPrediction: (matchId: string, pick: string) =>
    request('/predictions', {
      method: 'POST',
      body: JSON.stringify({ matchId, pick }),
    }),

  // Standings
  getStandings: () => request('/standings'),

  // Health check
  health: () => request('/health').catch(() => ({ status: 'error' })),
}
