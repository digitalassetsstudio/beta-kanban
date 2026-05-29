// ============ SOVEREIGNTY-FIRST CORS ============
// Replaces the wildcard (*) CORS policy with Tailscale-aware same-origin.
// Only allows requests from:
// 1. Same origin (browser on the same host)
// 2. Tailscale IPs (100.64.0.0/10 range)
// 3. Configured ALLOWED_ORIGINS env var

import { NextRequest } from 'next/server'

// Tailscale CGNAT range: 100.64.0.0/10
const TAILSCALE_PREFIXES = ['100.64.', '100.65.', '100.66.', '100.67.', '100.68.', '100.69.', '100.70.', '100.71.', '100.72.', '100.73.', '100.74.', '100.75.', '100.76.', '100.77.', '100.78.', '100.79.', '100.80.', '100.81.', '100.82.', '100.83.', '100.84.', '100.85.', '100.86.', '100.87.', '100.88.', '100.89.', '100.90.', '100.91.', '100.92.', '100.93.', '100.94.', '100.95.', '100.96.', '100.97.', '100.98.', '100.99.', '100.100.', '100.101.', '100.102.', '100.103.', '100.104.', '100.105.', '100.106.', '100.107.', '100.108.', '100.109.', '100.110.', '100.111.', '100.112.', '100.113.', '100.114.', '100.115.', '100.116.', '100.117.', '100.118.', '100.119.', '100.120.', '100.121.', '100.122.', '100.123.', '100.124.', '100.125.', '100.126.', '100.127.']

function isTailscaleIP(ip: string): boolean {
  return TAILSCALE_PREFIXES.some(prefix => ip.startsWith(prefix))
}

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS || ''
  return envOrigins.split(',').map(o => o.trim()).filter(Boolean)
}

/**
 * Build CORS headers based on the request origin.
 * Returns headers that restrict access to same-origin + Tailscale + configured origins.
 */
export function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowedOrigins = getAllowedOrigins()
  const requestHost = req.headers.get('host') || ''

  // Determine if this origin should be allowed
  let allowedOrigin = ''

  // Same-origin requests (no origin header, or origin matches host)
  if (!origin || origin.includes(requestHost)) {
    allowedOrigin = origin || '*'
  }

  // Tailscale IP in origin
  const originHost = origin.replace(/^https?:\/\//, '').split(':')[0]
  if (isTailscaleIP(originHost)) {
    allowedOrigin = origin
  }

  // Configured allowed origins
  if (allowedOrigins.includes(origin)) {
    allowedOrigin = origin
  }

  // For VPS deployment: also allow localhost for health checks
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    allowedOrigin = origin
  }

  // If no specific origin matched, allow same-origin only (empty string = browser blocks cross-origin)
  if (!allowedOrigin) {
    // Deny cross-origin - return minimal headers
    return {
      'Access-Control-Allow-Origin': '',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  }
}

/**
 * Create CORS preflight response
 */
export function corsOptionsResponse(req: NextRequest) {
  const headers = getCorsHeaders(req)
  return new Response(null, { status: 204, headers })
}
