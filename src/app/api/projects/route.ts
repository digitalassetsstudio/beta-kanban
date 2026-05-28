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

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: { tasks: { include: { comments: { orderBy: { createdAt: 'asc' } } } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(projects, { headers: corsHeaders })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, desc, stage, timeline, phases } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400, headers: corsHeaders })
    }

    const project = await db.project.create({
      data: {
        name: name.trim(),
        desc: desc?.trim() || '',
        stage: stage || 'Backlog',
        timeline: timeline || false,
        phases: phases ? JSON.stringify(phases) : null,
      },
      include: { tasks: true },
    })

    return NextResponse.json(project, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500, headers: corsHeaders })
  }
}
