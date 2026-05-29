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
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({ error: 'project_id query parameter is required' }, { status: 400, headers: corsHeaders })
    }

    const tasks = await db.task.findMany({
      where: { projectId },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(tasks, { headers: corsHeaders })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500, headers: corsHeaders })
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
    const { title, description, column, project_id, health, due, risk, revenue, assignee } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400, headers: corsHeaders })
    }

    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400, headers: corsHeaders })
    }

    const task = await db.task.create({
      data: {
        title: title.trim(),
        desc: description?.trim() || '',
        column: column || 'Backlog',
        projectId: project_id,
        health: health || 'Green',
        due: due || '',
        risk: risk || 'Low',
        revenue: revenue || '$0',
        assignee: assignee || null,
      },
      include: { comments: true },
    })

    return NextResponse.json(task, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500, headers: corsHeaders })
  }
}
