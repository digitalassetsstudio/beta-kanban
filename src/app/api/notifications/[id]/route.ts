import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
