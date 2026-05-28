'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// ============ TYPES ============
interface Comment {
  id: string
  taskId: string
  agentName: string
  text: string
  isSystem: boolean
  createdAt: string
}

interface Task {
  id: string
  title: string
  desc: string
  health: string
  due: string
  risk: string
  revenue: string
  column: string
  assignee: string | null
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

interface Phase {
  name: string
  start: string
  end: string
  color: string
  desc: string
}

interface Project {
  id: string
  name: string
  desc: string
  stage: string
  timeline: boolean
  phases: string | null
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

// ============ CONSTANTS ============
const COLUMNS = ['Backlog', 'Todo', 'Doing', 'Review', 'Done']
const COL_COLORS: Record<string, string> = { Backlog: '#6b7280', Todo: '#3b82f6', Doing: '#f59e0b', Review: '#a855f7', Done: '#22c55e' }
const AGENTS = ['Amun', 'Thoth', 'Ptah', 'Shisat', 'Aset']
const AGENT_COLORS: Record<string, string> = { Amun: '#a855f7', Thoth: '#00f0ff', Ptah: '#f59e0b', Shisat: '#22c55e', Aset: '#ec4899' }
const PASSWORD = 'kanban2026'

// ============ HELPERS ============
function healthColor(h: string) { return h === 'Green' ? '#22c55e' : h === 'Yellow' ? '#eab308' : '#ef4444' }
function daysUntil(due: string) { return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000) }
function parsePhases(phasesStr: string | null): Phase[] | undefined {
  if (!phasesStr) return undefined
  try { return JSON.parse(phasesStr) } catch { return undefined }
}
function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ============ PASSWORD GATE ============
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem('kanban-auth', 'true')
      onAuth()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 via-transparent to-[#a855f7]/5" />
      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center font-bold text-3xl text-[#0a0a0f] mx-auto mb-6 shadow-[0_0_40px_rgba(0,240,255,0.3)]">K</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#a855f7] bg-clip-text text-transparent mb-2">Kanban Command</h1>
          <p className="text-gray-500 text-sm">Enter password to access the dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border ${error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 focus:border-[#00f0ff]/50'} text-white text-center text-lg tracking-widest focus:outline-none transition-all placeholder:text-gray-600`}
          />
          {error && <p className="text-red-400 text-sm text-center animate-pulse">Incorrect password</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-[#0a0a0f] font-bold text-sm hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

// ============ ASSIGNEE BADGE ============
function AssigneeBadge({ name, small }: { name: string; small?: boolean }) {
  const color = AGENT_COLORS[name] || '#6b7280'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-medium ${small ? 'text-[9px] px-1 py-0' : 'text-[10px] px-1.5 py-0.5'}`}
      style={{ background: `${color}15`, color, borderColor: `${color}40` }}
    >
      <span className={`${small ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full flex-shrink-0`} style={{ background: color }} />
      {name}
    </span>
  )
}

// ============ MAIN COMPONENT ============
export default function KanbanDashboard() {
  const [authed, setAuthed] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [view, setView] = useState<'kanban' | 'gantt' | 'heatmap'>('kanban')
  const [sidePanelTask, setSidePanelTask] = useState<{ taskId: string; projectId: string } | null>(null)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [addTaskColumn, setAddTaskColumn] = useState('Backlog')
  const [dragInfo, setDragInfo] = useState<{ taskId: string; projectId: string; fromColumn: string } | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [newProjName, setNewProjName] = useState('')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newProjStage, setNewProjStage] = useState('Backlog')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskHealth, setNewTaskHealth] = useState('Green')
  const [newTaskDue, setNewTaskDue] = useState('2026-06-15')
  const [newTaskRisk, setNewTaskRisk] = useState('Low')
  const [newTaskRevenue, setNewTaskRevenue] = useState('$0')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentAgent, setCommentAgent] = useState('Amun')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [sideAssignee, setSideAssignee] = useState<string>('')
  const fetchCountRef = useRef(0)

  // Auth check
  useEffect(() => {
    const isAuth = sessionStorage.getItem('kanban-auth') === 'true'
    if (isAuth) setAuthed(true)
  }, [])

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        fetchCountRef.current++
        // Set current project on first load
        if (fetchCountRef.current === 1 && data.length > 0) {
          setCurrentProjectId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchProjects()
  }, [authed, fetchProjects])

  // Fetch comments for side panel
  useEffect(() => {
    if (sidePanelTask) {
      setCommentsLoading(true)
      fetch(`/api/comments?task_id=${sidePanelTask.taskId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => { setComments(data); setCommentsLoading(false) })
        .catch(() => { setComments([]); setCommentsLoading(false) })

      // Set current assignee
      const proj = projects.find(p => p.id === sidePanelTask.projectId)
      const task = proj?.tasks.find(t => t.id === sidePanelTask.taskId)
      if (task) setSideAssignee(task.assignee || '')
    }
  }, [sidePanelTask, projects])

  const currentProject = projects.find(p => p.id === currentProjectId)
  const allTasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name, projectId: p.id })))

  // Summary
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => t.column === 'Done').length
  const completionPct = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0
  const blockedItems = allTasks.filter(t => t.health === 'Red').length
  const upcomingDeadlines = allTasks.filter(t => {
    const d = new Date(t.due); const now = new Date(); const week = new Date(now.getTime() + 7 * 86400000)
    return d >= now && d <= week && t.column !== 'Done'
  }).length

  // Drag handlers
  const handleDragStart = useCallback((taskId: string, projectId: string, fromColumn: string) => {
    setDragInfo({ taskId, projectId, fromColumn })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, column: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(column)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (!dragInfo) return

    // Optimistic update
    setProjects(prev => prev.map(p => {
      if (p.id !== dragInfo.projectId) return p
      return { ...p, tasks: p.tasks.map(t => t.id === dragInfo.taskId ? { ...t, column: targetColumn } : t) }
    }))

    // Persist to DB
    try {
      await fetch(`/api/tasks/${dragInfo.taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: targetColumn }),
      })
    } catch (err) {
      console.error('Failed to move task:', err)
    }
    setDragInfo(null)
  }, [dragInfo])

  const handleDragEnd = useCallback(() => {
    setDragInfo(null)
    setDragOverColumn(null)
  }, [])

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    setSidePanelTask(null)
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      await fetchProjects()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }, [fetchProjects])

  // Add project
  const addProject = useCallback(async () => {
    if (!newProjName.trim()) return
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjName.trim(), desc: newProjDesc.trim() || 'New project', stage: newProjStage, timeline: false }),
      })
      if (res.ok) {
        const project = await res.json()
        setCurrentProjectId(project.id)
        setShowAddProject(false)
        setNewProjName('')
        setNewProjDesc('')
        await fetchProjects()
      }
    } catch (err) {
      console.error('Failed to add project:', err)
    }
  }, [newProjName, newProjDesc, newProjStage, fetchProjects])

  // Add task
  const addTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || 'New task',
          column: addTaskColumn,
          project_id: currentProjectId,
          health: newTaskHealth,
          due: newTaskDue,
          risk: newTaskRisk,
          revenue: newTaskRevenue,
          assignee: newTaskAssignee || null,
        }),
      })
      setShowAddTask(false)
      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskAssignee('')
      await fetchProjects()
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }, [newTaskTitle, newTaskDesc, newTaskHealth, newTaskDue, newTaskRisk, newTaskRevenue, addTaskColumn, currentProjectId, newTaskAssignee, fetchProjects])

  // Post comment
  const postComment = useCallback(async () => {
    if (!sidePanelTask || !commentText.trim()) return
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: sidePanelTask.taskId,
          agent_name: commentAgent,
          text: commentText.trim(),
          is_system: false,
        }),
      })
      setCommentText('')
      // Refetch comments
      const res = await fetch(`/api/comments?task_id=${sidePanelTask.taskId}`)
      if (res.ok) setComments(await res.json())
      await fetchProjects()
    } catch (err) {
      console.error('Failed to post comment:', err)
    }
  }, [sidePanelTask, commentText, commentAgent, fetchProjects])

  // Change assignee
  const changeAssignee = useCallback(async (taskId: string, newAssignee: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: newAssignee || null }),
      })
      await fetchProjects()
      // Refetch comments
      if (sidePanelTask) {
        const res = await fetch(`/api/comments?task_id=${sidePanelTask.taskId}`)
        if (res.ok) setComments(await res.json())
      }
    } catch (err) {
      console.error('Failed to change assignee:', err)
    }
  }, [fetchProjects, sidePanelTask])

  // Gantt helpers
  const globalStart = new Date('2026-01-01').getTime()
  const globalEnd = new Date('2027-07-01').getTime()
  const totalMs = globalEnd - globalStart
  const dateToPercent = (d: string) => Math.max(0, Math.min(100, ((new Date(d).getTime() - globalStart) / totalMs) * 100))

  // Heatmap score
  const getScore = (t: { risk: string; health: string; due: string; column: string }) => {
    let s = 0
    s += t.risk === 'High' ? 3 : t.risk === 'Med' ? 2 : 1
    s += t.health === 'Red' ? 3 : t.health === 'Yellow' ? 2 : 0
    const d = daysUntil(t.due)
    s += d < 0 ? 4 : d <= 3 ? 3 : d <= 7 ? 2 : 1
    s += t.column === 'Done' ? 0 : 1
    return s
  }

  const sideTask = sidePanelTask ? projects.find(p => p.id === sidePanelTask.projectId)?.tasks.find(t => t.id === sidePanelTask.taskId) : null
  const sideProject = sidePanelTask ? projects.find(p => p.id === sidePanelTask.projectId) : null

  // ============ AUTH GATE ============
  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />
  }

  // ============ LOADING ============
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center font-bold text-2xl text-[#0a0a0f] mx-auto mb-4 animate-pulse">K</div>
          <p className="text-gray-400 text-sm">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center font-bold text-sm text-[#0a0a0f]">K</div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#00f0ff] to-[#a855f7] bg-clip-text text-transparent hidden sm:inline">Kanban Command</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={() => setShowAddProject(true)} className="px-3 py-2 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm font-medium hover:bg-[#00f0ff]/20 transition-all flex items-center gap-1.5">
              <span className="text-base leading-none">+</span> Project
            </button>
            {(['kanban', 'gantt', 'heatmap'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${view === v ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                {v === 'kanban' ? 'Kanban' : v === 'gantt' ? 'Timeline' : 'Heatmap'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* SUMMARY */}
      <div className="pt-16 pb-2 px-4">
        <div className="max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 py-4">
          {[
            { label: 'Total Projects', value: projects.length, icon: '📊', gradient: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/20' },
            { label: 'Total Tasks', value: totalTasks, icon: '📝', gradient: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/20' },
            { label: 'Completion', value: completionPct + '%', icon: '🎯', gradient: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/20' },
            { label: 'Revenue Potential', value: '$780k+', icon: '💰', gradient: 'from-yellow-500/20 to-orange-500/10', border: 'border-yellow-500/20' },
            { label: 'Due This Week', value: upcomingDeadlines, icon: '⏰', gradient: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/20' },
            { label: 'Blocked Items', value: blockedItems, icon: '🚫', gradient: 'from-red-500/20 to-pink-500/10', border: 'border-red-500/20' }
          ].map(c => (
            <div key={c.label} className={`bg-gradient-to-br ${c.gradient} border ${c.border} rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] cursor-default`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{c.label}</span>
                <span className="text-lg">{c.icon}</span>
              </div>
              <div className="text-2xl font-bold text-white">{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROJECT TABS */}
      <div className="px-4 pb-2">
        <div className="max-w-[1800px] mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {projects.map(p => {
            const pct = p.tasks.length ? Math.round(p.tasks.filter(t => t.column === 'Done').length / p.tasks.length * 100) : 0
            const active = p.id === currentProjectId
            return (
              <button key={p.id} onClick={() => setCurrentProjectId(p.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${active ? 'bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.12)]' : 'bg-[#1a1a2e]/50 border border-white/5 text-gray-400 hover:bg-[#22223a]/50 hover:text-gray-200'}`}>
                <span className="whitespace-nowrap">{p.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${active ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'bg-white/5 text-gray-500'}`}>{pct}%</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN VIEWS */}
      <div className="px-4 pb-8">
        <div className="max-w-[1800px] mx-auto">

          {/* KANBAN VIEW */}
          {view === 'kanban' && currentProject && (
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
              {COLUMNS.map(col => {
                const tasks = currentProject.tasks.filter(t => t.column === col)
                return (
                  <div key={col} className="flex-shrink-0 w-[300px] md:w-[320px] flex flex-col"
                    onDragOver={(e) => handleDragOver(e, col)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => handleDrop(e, col)}>
                    <div className="flex items-center justify-between px-3 py-2.5 mb-2 rounded-xl bg-[#12121a]/80 border border-white/5 sticky top-0 z-10 backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COL_COLORS[col] }} />
                        <span className="font-semibold text-sm text-gray-200">{col}</span>
                        <span className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">{tasks.length}</span>
                      </div>
                      <button onClick={() => { setAddTaskColumn(col); setShowAddTask(true) }} className="w-6 h-6 rounded-md bg-white/5 hover:bg-[#00f0ff]/20 text-gray-500 hover:text-[#00f0ff] transition flex items-center justify-center text-lg leading-none">+</button>
                    </div>
                    <div className={`flex-1 space-y-2 min-h-[100px] p-1 rounded-xl transition-colors ${dragOverColumn === col ? 'bg-[#00f0ff]/5 border-2 border-dashed border-[#00f0ff]/30' : 'bg-[#0a0a0f]/30 border border-transparent'}`}>
                      {tasks.map(task => {
                        const days = daysUntil(task.due)
                        const dueColor = days < 0 ? 'text-red-400' : days <= 3 ? 'text-yellow-400' : 'text-gray-500'
                        const riskBorder = task.risk === 'High' ? 'border-l-2 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent' : task.risk === 'Med' ? 'border-l-2 border-l-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent' : 'border-l-2 border-l-green-500 bg-gradient-to-r from-green-500/5 to-transparent'
                        const isDragging = dragInfo?.taskId === task.id
                        return (
                          <div key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(task.id, currentProject.id, task.column)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSidePanelTask({ taskId: task.id, projectId: currentProject.id })}
                            className={`bg-[#1a1a2e]/60 border border-white/5 rounded-xl p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,240,255,0.15),0_8px_25px_rgba(0,0,0,0.4)] cursor-grab active:cursor-grabbing ${riskBorder} ${isDragging ? 'opacity-50 rotate-1' : ''}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-100 leading-tight flex-1 pr-2">{task.title}</h4>
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${task.health === 'Red' ? 'bg-red-500 animate-pulse' : task.health === 'Yellow' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} title={task.health} />
                            </div>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.desc}</p>
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className={`text-xs ${dueColor}`}>{days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {task.assignee && <AssigneeBadge name={task.assignee} small />}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.health === 'Green' ? 'bg-green-500/10 text-green-400 border-green-500/30' : task.health === 'Yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>{task.health}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">{task.revenue}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* GANTT VIEW */}
          {view === 'gantt' && (
            <div className="bg-[#12121a]/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#00f0ff] mb-6">Timeline View — Ptah Evolution & Shisat Upgrade</h2>
              <div className="relative">
                <div className="flex mb-4 border-b border-white/5 pb-2 overflow-x-auto">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => (
                    <div key={i} className="flex-1 min-w-[40px] text-[10px] text-gray-600 text-center">{m}</div>
                  ))}
                </div>
                {projects.filter(p => p.timeline && p.phases).map(p => {
                  const phases = parsePhases(p.phases)
                  if (!phases) return null
                  return (
                    <div key={p.id} className="mb-8">
                      <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ background: phases[0].color }} />
                        {p.name}
                      </h3>
                      <div className="space-y-2">
                        {phases.map(ph => {
                          const left = dateToPercent(ph.start)
                          const right = dateToPercent(ph.end)
                          const width = right - left
                          return (
                            <div key={ph.name} className="flex items-center gap-3">
                              <div className="w-28 text-xs text-gray-400 flex-shrink-0">{ph.name}</div>
                              <div className="flex-1 relative h-7">
                                <div className="absolute top-0 h-7 rounded-md overflow-hidden" style={{ left: `${left}%`, width: `${width}%`, background: `${ph.color}33`, border: `1px solid ${ph.color}66` }}>
                                  <div className="absolute inset-0 flex items-center px-2 text-[10px] text-white font-medium truncate">{ph.desc}</div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {/* Today marker */}
                <div className="absolute top-0 bottom-0" style={{ left: `${dateToPercent('2026-05-19')}%`, width: 2, background: '#00f0ff44', zIndex: 5 }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] text-[#00f0ff] font-bold bg-[#12121a] px-1 rounded whitespace-nowrap">TODAY</div>
                </div>
              </div>
            </div>
          )}

          {/* HEATMAP VIEW */}
          {view === 'heatmap' && (() => {
            const riskOrder: Array<'High' | 'Med' | 'Low'> = ['High', 'Med', 'Low']
            const scored = [...allTasks].sort((a, b) => getScore(b) - getScore(a))
            const top5 = scored.slice(0, 5)
            const byRisk = (r: string) => allTasks.filter(t => t.risk === r)
            const riskColors: Record<string, string> = { High: '#ef4444', Med: '#eab308', Low: '#22c55e' }
            return (
              <div className="bg-[#12121a]/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#00f0ff] mb-2">Priority Heat Map</h2>
                <p className="text-xs text-gray-500 mb-6">Tasks sorted by composite priority score (risk + health + urgency)</p>
                {/* Top 5 */}
                <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <h3 className="text-sm font-bold text-red-400 mb-3">🔥 Top 5 Critical Actions</h3>
                  <div className="space-y-2">
                    {top5.map((t, i) => (
                      <div key={t.id} className="flex items-center gap-3 bg-[#0a0a0f]/50 rounded-lg p-2.5 cursor-pointer hover:bg-[#0a0a0f]/80 transition" onClick={() => setSidePanelTask({ taskId: t.id, projectId: t.projectId })}>
                        <span className="text-xs font-bold text-red-400 w-5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-200 truncate">{t.title}</div>
                          <div className="text-[10px] text-gray-500">{t.projectName}</div>
                        </div>
                        {t.assignee && <AssigneeBadge name={t.assignee} small />}
                        <div className="w-2 h-2 rounded-full" style={{ background: healthColor(t.health) }} />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">Score: {getScore(t)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {riskOrder.map(r => (
                  <div key={r} className="mb-6">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: riskColors[r] }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: riskColors[r] }} />
                      {r} Risk ({byRisk(r).length} tasks)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {byRisk(r).map(t => (
                        <div key={t.id} className="bg-[#1a1a2e]/40 border border-white/5 rounded-lg p-3 transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setSidePanelTask({ taskId: t.id, projectId: t.projectId })}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-200 truncate flex-1 pr-2">{t.title}</span>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: healthColor(t.health) }} />
                          </div>
                          <div className="text-[10px] text-gray-500 mb-1">{t.projectName}</div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] ${t.column === 'Done' ? 'text-green-400' : 'text-gray-500'}`}>{t.column}</span>
                            {t.assignee && <AssigneeBadge name={t.assignee} small />}
                            <span className="text-[10px] text-gray-600">{t.due}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* SIDE PANEL OVERLAY */}
      {sidePanelTask && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidePanelTask(null)} />}

      {/* SIDE PANEL */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#12121a] border-l border-white/10 z-50 overflow-y-auto transition-transform duration-300 ${sidePanelTask ? 'translate-x-0' : 'translate-x-full'}`}>
        {sideTask && sideProject && (() => {
          const days = daysUntil(sideTask.due)
          const dueLabel = days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days remaining`
          return (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Task Details</h2>
                <button onClick={() => setSidePanelTask(null)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center transition text-sm">✕</button>
              </div>
              <div className="mb-4">
                <span className="text-[10px] px-2 py-1 rounded-md bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-medium">{sideProject.name}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{sideTask.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{sideTask.desc}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0a0a0f]/50 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Health</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: healthColor(sideTask.health) }} />
                    <span className="text-sm font-semibold" style={{ color: healthColor(sideTask.health) }}>{sideTask.health}</span>
                  </div>
                </div>
                <div className="bg-[#0a0a0f]/50 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risk Level</div>
                  <span className={`text-sm font-semibold ${sideTask.risk === 'High' ? 'text-red-400' : sideTask.risk === 'Med' ? 'text-yellow-400' : 'text-green-400'}`}>{sideTask.risk} Risk</span>
                </div>
                <div className="bg-[#0a0a0f]/50 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Due Date</div>
                  <div className={`text-sm font-semibold ${days < 0 ? 'text-red-400' : days <= 3 ? 'text-yellow-400' : 'text-white'}`}>{sideTask.due}</div>
                  <div className={`text-[10px] ${days < 0 ? 'text-red-400/60' : days <= 3 ? 'text-yellow-400/60' : 'text-gray-600'}`}>{dueLabel}</div>
                </div>
                <div className="bg-[#0a0a0f]/50 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Revenue Potential</div>
                  <div className="text-sm font-semibold text-white">{sideTask.revenue}</div>
                </div>
              </div>

              {/* Column Status */}
              <div className="mb-6">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Current Column</div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COL_COLORS[sideTask.column] }} />
                  <span className="text-sm font-semibold text-white">{sideTask.column}</span>
                </div>
              </div>

              {/* Assignee */}
              <div className="mb-6 bg-[#0a0a0f]/50 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Assignee</div>
                <select
                  value={sideAssignee}
                  onChange={e => {
                    setSideAssignee(e.target.value)
                    changeAssignee(sideTask.id, e.target.value)
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm"
                >
                  <option value="">Unassigned</option>
                  {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {sideTask.assignee && (
                  <div className="mt-2">
                    <AssigneeBadge name={sideTask.assignee} />
                  </div>
                )}
              </div>

              {/* Move Task Buttons */}
              <div className="mb-6">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Move to</div>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map(col => (
                    <button
                      key={col}
                      onClick={async () => {
                        if (col === sideTask.column) return
                        await fetch(`/api/tasks/${sideTask.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ column: col }),
                        })
                        await fetchProjects()
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        sideTask.column === col
                          ? 'bg-white/5 text-gray-600 border-white/5 cursor-default'
                          : 'bg-[#1a1a2e] border-white/10 text-gray-300 hover:border-[#00f0ff]/30 hover:text-[#00f0ff]'
                      }`}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: COL_COLORS[col] }} />
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-6">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Comments ({comments.length})</div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-3">
                  {commentsLoading ? (
                    <div className="text-xs text-gray-600 italic">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-xs text-gray-600 italic">No comments yet</div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className={`rounded-lg p-3 border ${c.isSystem ? 'bg-[#0a0a0f]/30 border-white/5' : 'bg-[#1a1a2e]/40 border-white/5'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {c.isSystem ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/10 font-mono">System</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{
                                background: `${AGENT_COLORS[c.agentName] || '#6b7280'}15`,
                                color: AGENT_COLORS[c.agentName] || '#6b7280',
                                borderColor: `${AGENT_COLORS[c.agentName] || '#6b7280'}40`
                              }}>{c.agentName}</span>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-600">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className={`text-xs ${c.isSystem ? 'text-gray-500 italic' : 'text-gray-300'}`}>{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={commentAgent}
                      onChange={e => setCommentAgent(e.target.value)}
                      className="px-2 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-xs"
                    >
                      {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment() } }}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-xs placeholder:text-gray-600"
                    />
                    <button
                      onClick={postComment}
                      disabled={!commentText.trim()}
                      className="px-3 py-2 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-medium hover:bg-[#00f0ff]/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => deleteTask(sideTask.id)} className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition">Delete Task</button>
            </div>
          )
        })()}
      </div>

      {/* ADD PROJECT MODAL */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowAddProject(false)}>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">New Project</h2>
            <div className="space-y-3">
              <input type="text" value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="Project name" className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm" autoFocus />
              <input type="text" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm" />
              <select value={newProjStage} onChange={e => setNewProjStage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                <option value="Backlog">Backlog</option>
                <option value="Checkpoint 1">Checkpoint 1</option>
                <option value="Alpha">Alpha</option>
                <option value="MVP">MVP</option>
                <option value="Stage 4">Stage 4</option>
                <option value="Near Launch">Near Launch</option>
                <option value="Continuous">Continuous</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddProject(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition">Cancel</button>
                <button onClick={addProject} className="flex-1 py-2.5 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-medium text-sm hover:bg-[#00f0ff]/30 transition">Create Project</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowAddTask(false)}>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">New Task — <span style={{ color: COL_COLORS[addTaskColumn] }}>{addTaskColumn}</span></h2>
            <div className="space-y-3">
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title" className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm" autoFocus />
              <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Health</label>
                  <select value={newTaskHealth} onChange={e => setNewTaskHealth(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Red">Red</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Risk</label>
                  <select value={newTaskRisk} onChange={e => setNewTaskRisk(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                    <option value="Low">Low</option>
                    <option value="Med">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Due Date</label>
                  <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Revenue</label>
                  <select value={newTaskRevenue} onChange={e => setNewTaskRevenue(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                    <option value="$0">$0</option>
                    <option value="$1k-$5k">$1k-$5k</option>
                    <option value="$5k-$20k">$5k-$20k</option>
                    <option value="$20k-$50k">$20k-$50k</option>
                    <option value="$50k-$100k">$50k-$100k</option>
                    <option value="$100k+">$100k+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Assignee</label>
                <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                  <option value="">Unassigned</option>
                  {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Column</label>
                <select value={addTaskColumn} onChange={e => setAddTaskColumn(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                  {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddTask(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition">Cancel</button>
                <button onClick={addTask} className="flex-1 py-2.5 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-medium text-sm hover:bg-[#00f0ff]/30 transition">Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
