// ============ AUTH API ROUTE ============
// POST /api/auth — Login: verify password, set HTTP-only session cookie
// DELETE /api/auth — Logout: clear session cookie
// GET /api/auth — Check: verify session is valid

import { NextRequest, NextResponse } from 'next/server'
import { authenticate, setSessionCookie, isAuthenticated, clearSession } from '@/lib/auth'
import { getCorsHeaders, corsOptionsResponse } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse(req)
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req)

  try {
    const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400, headers: corsHeaders })
    }

    const result = authenticate(password)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401, headers: corsHeaders })
    }

    const response = NextResponse.json({ success: true }, { headers: corsHeaders })
    return setSessionCookie(response, result.token!)
  } catch (error) {
    console.error('POST /api/auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500, headers: corsHeaders })
  }
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req)
  const authenticated = isAuthenticated(req)

  return NextResponse.json({ authenticated }, { headers: corsHeaders })
}

export async function DELETE(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req)
  const response = NextResponse.json({ success: true }, { headers: corsHeaders })
  return clearSession(response)
}
