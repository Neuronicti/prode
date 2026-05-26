export async function GET() {
  try {
    const response = await fetch('http://localhost:4000/matches')
    const data = await response.json()
    return Response.json({
      success: true,
      count: Array.isArray(data) ? data.length : 0,
      sampleLength: data ? Object.keys(data).length : 0,
      isArray: Array.isArray(data),
      firstItem: Array.isArray(data) ? data[0] : null
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
