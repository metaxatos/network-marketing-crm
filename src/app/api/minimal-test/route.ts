import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      received: body,
      timestamp: new Date().toISOString()
    }, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, {
      status: 500
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'GET method works - POST should also work'
  })
}
