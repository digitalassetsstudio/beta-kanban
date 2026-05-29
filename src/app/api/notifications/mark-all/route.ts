import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { getCorsHeaders, corsOptionsResponse } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse(req)
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req)

  // Auth check
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  try {
    const result = await db.notification.updateMany({
      where: { read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true, updated: result.count }, { headers: corsHeaders })
  } catch (error) {
    console.error('POST /api/notifications/mark-all error:', error)
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500, headers: corsHeaders })
  }
}
