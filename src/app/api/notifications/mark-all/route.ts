import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST() {
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
