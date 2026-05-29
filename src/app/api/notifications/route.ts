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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const notifications = await db.notification.findMany({
      where: unreadOnly ? { read: false } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notifications, { headers: corsHeaders })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { zone, title, body: notifBody, source, taskId, projectId } = body

    if (!zone || !title || !notifBody || !source) {
      return NextResponse.json({ error: 'zone, title, body, and source are required' }, { status: 400, headers: corsHeaders })
    }

    const notification = await db.notification.create({
      data: {
        zone,
        title,
        body: notifBody,
        source,
        taskId: taskId || null,
        projectId: projectId || null,
      },
    })

    return NextResponse.json(notification, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('POST /api/notifications error:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500, headers: corsHeaders })
  }
}
