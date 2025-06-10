import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    path: '/api/test'
  })
}

export async function POST() {
  return NextResponse.json({
    message: 'POST method works',
    timestamp: new Date().toISOString()
  })
} 