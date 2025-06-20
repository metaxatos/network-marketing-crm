export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Just echo back what we received
    return Response.json({
      success: true,
      received: body,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Failed to process request'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }
}

export async function GET() {
  return Response.json({
    message: 'This endpoint only accepts POST requests'
  })
}
