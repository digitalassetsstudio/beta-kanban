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

    // Get current task to compare changes
    const currentTask = await db.task.findUnique({ where: { id } })
    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404, headers: corsHeaders })
    }

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.desc = body.description
    if (body.health !== undefined) updateData.health = body.health
    if (body.due !== undefined) updateData.due = body.due
    if (body.risk !== undefined) updateData.risk = body.risk
    if (body.revenue !== undefined) updateData.revenue = body.revenue
    if (body.column !== undefined) updateData.column = body.column
    if (body.assignee !== undefined) updateData.assignee = body.assignee || null

    const updatedTask = await db.task.update({
      where: { id },
      data: updateData,
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    })

    // Auto-comment: column change
    if (body.column !== undefined && body.column !== currentTask.column) {
      await db.comment.create({
        data: {
          taskId: id,
          agentName: 'System',
          text: `Task moved from ${currentTask.column} to ${body.column}`,
          isSystem: true,
        },
      })
    }

    // Auto-comment: assignee change
    if (body.assignee !== undefined) {
      const oldAssignee = currentTask.assignee || 'Unassigned'
      const newAssignee = body.assignee || 'Unassigned'
      if (oldAssignee !== newAssignee) {
        await db.comment.create({
          data: {
            taskId: id,
            agentName: 'System',
            text: `Assignee changed from ${oldAssignee} to ${newAssignee}`,
            isSystem: true,
          },
        })
      }
    }

    // Re-fetch with comments to include the new auto-comments
    const taskWithComments = await db.task.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    })

    return NextResponse.json(taskWithComments, { headers: corsHeaders })
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500, headers: corsHeaders })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const task = await db.task.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404, headers: corsHeaders })
    }

    await db.task.delete({ where: { id } })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500, headers: corsHeaders })
  }
}
