import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { getCorsHeaders, corsOptionsResponse } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse(req)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(req)

  // Auth check
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.notification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404, headers: corsHeaders })
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: body.read ?? true },
    })

    return NextResponse.json(updated, { headers: corsHeaders })
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500, headers: corsHeaders })
  }
}
