import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

// Standard API response helper
export function apiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      success: status >= 200 && status < 300,
      message,
    },
    { status }
  )
}

// Error response helper
export function apiError(
  message: string,
  status: number = 400
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      data: null,
      success: false,
      message,
    },
    { status }
  )
}

// Authentication middleware
export function withAuth<T = any>(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<null>> | NextResponse<ApiResponse<T>>> => {
    const supabase = await createClient()
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return apiError('Unauthorized', 401)
    }

    return handler(req, user.id)
  }
}

// Get current member details
export async function getCurrentMember(userId: string) {
  const supabase = await createClient()
  
  const { data: member, error } = await supabase
    .from('members')
    .select(`
      *,
      member_profiles!member_id (*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error('Failed to get member details')
  }

  return member
}

// Validate request body
export async function validateBody<T>(
  req: NextRequest,
  validator: (body: any) => T
): Promise<T> {
  try {
    const body = await req.json()
    return validator(body)
  } catch (error) {
    throw new Error('Invalid request body')
  }
}

// Pagination helper
export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    cursor: searchParams.get('cursor') || undefined,
  }
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): Promise<boolean> {
  const now = Date.now()
  const userLimit = rateLimitStore.get(identifier)

  if (!userLimit || userLimit.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
} 