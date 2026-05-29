import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'
import { getCorsHeaders, corsOptionsResponse } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse(req)
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req)

  // Auth check
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

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
  const corsHeaders = getCorsHeaders(req)

  // Auth check — but allow internal agent posts with API key header
  const agentKey = req.headers.get('X-Agent-Key')
  const agentKeys = (process.env.AGENT_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean)

  if (!isAuthenticated(req) && !agentKeys.includes(agentKey || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { zone, title, body: notifBody, source, taskId, projectId } = body

    if (!zone || !title || !notifBody || !source) {
      return NextResponse.json({ error: 'zone, title, body, and source are required' }, { status: 400, headers: corsHeaders })
    }

    // Validate zone
    const validZones = ['research', 'marketing', 'sales', 'ops']
    if (!validZones.includes(zone)) {
      return NextResponse.json({ error: `Invalid zone. Must be one of: ${validZones.join(', ')}` }, { status: 400, headers: corsHeaders })
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
