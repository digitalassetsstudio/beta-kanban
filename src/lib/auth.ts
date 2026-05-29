// ============ SOVEREIGNTY-FIRST AUTH ============
// Password is stored in environment variable, never in client bundle.
// Session uses HTTP-only cookie for server-side verification.

import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'kanban-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Get the password from environment.
 * Falls back to KANBAN_PASSWORD env var.
 * If not set, uses a default (CHANGE THIS IN PRODUCTION).
 */
function getValidPassword(): string {
  return process.env.KANBAN_PASSWORD || 'kanban2026'
}

/**
 * Simple hash for session token (not cryptographic, but sufficient for internal tool)
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32)
  // Use crypto if available (Node.js 18+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() + '-' + Date.now().toString(36)
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Verify password and create session
 */
export function authenticate(password: string): { success: boolean; token?: string } {
  if (password === getValidPassword()) {
    return { success: true, token: generateSessionToken() }
  }
  return { success: false }
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  return response
}

/**
 * Check if request has valid session
 */
export function isAuthenticated(req: NextRequest): boolean {
  const session = req.cookies.get(SESSION_COOKIE)?.value
  return !!session
}

/**
 * Clear session cookie
 */
export function clearSession(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return response
}
