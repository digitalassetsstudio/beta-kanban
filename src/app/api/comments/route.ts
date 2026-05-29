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
    const taskId = searchParams.get('task_id')

    if (!taskId) {
      return NextResponse.json({ error: 'task_id query parameter is required' }, { status: 400, headers: corsHeaders })
    }

    const comments = await db.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(comments, { headers: corsHeaders })
  } catch (error) {
    console.error('GET /api/comments error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req)

  // Auth check
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { task_id, agent_name, text, is_system } = body

    if (!task_id) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400, headers: corsHeaders })
    }

    if (!agent_name || !agent_name.trim()) {
      return NextResponse.json({ error: 'agent_name is required' }, { status: 400, headers: corsHeaders })
    }

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400, headers: corsHeaders })
    }

    const comment = await db.comment.create({
      data: {
        taskId: task_id,
        agentName: agent_name.trim(),
        text: text.trim(),
        isSystem: is_system || false,
      },
    })

    return NextResponse.json(comment, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('POST /api/comments error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500, headers: corsHeaders })
  }
}
