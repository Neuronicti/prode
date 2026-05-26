// Predictions are now handled directly via the backend API
// Frontend calls src/lib/api.ts which connects to the Docker API service
// This endpoint can be removed or kept as a reference/proxy if needed

import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // All prediction logic moved to Docker backend API
  // See src/lib/api.ts setPrediction() and backend/api/src/routes/predictions.ts

  return Response.json(
    { error: 'Use the backend API directly via src/lib/api.ts' },
    { status: 410 } // Gone
  )
}
