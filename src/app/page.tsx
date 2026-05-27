'use client'

import React, { useState, useCallback, useRef } from 'react'

// ============ TYPES ============
interface Task {
  id: string
  title: string
  desc: string
  health: 'Green' | 'Yellow' | 'Red'
  due: string
  risk: 'Low' | 'Med' | 'High'
  revenue: string
  column: string
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
  phases?: Phase[]
  tasks: Task[]
}

// ============ DATA ============
const COLUMNS = ['Backlog', 'Todo', 'Doing', 'Review', 'Done']
const COL_COLORS: Record<string, string> = { Backlog: '#6b7280', Todo: '#3b82f6', Doing: '#f59e0b', Review: '#a855f7', Done: '#22c55e' }

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'LegitCheck (JIT Check)', desc: 'Near-launch PWA scam verifier for real-time product authentication', stage: 'Near Launch', timeline: false,
    tasks: [
      { id: 't1', title: 'Finalize scam database schema', desc: 'Complete the database schema for storing verified scam patterns and legitimate product signatures', health: 'Green', due: '2026-05-20', risk: 'Low', revenue: '$50k-$100k', column: 'Doing' },
      { id: 't2', title: 'PWA offline sync engine', desc: 'Build the offline-first sync engine with conflict resolution for field agents without connectivity', health: 'Yellow', due: '2026-05-25', risk: 'Med', revenue: '$50k-$100k', column: 'Doing' },
      { id: 't3', title: 'Barcode/QR scanning module', desc: 'Implement real-time barcode and QR code scanning with result caching and batch processing', health: 'Green', due: '2026-05-18', risk: 'Low', revenue: '$20k-$50k', column: 'Review' },
      { id: 't4', title: 'App Store submission prep', desc: 'Prepare all metadata, screenshots, privacy policy, and compliance docs for store submission', health: 'Green', due: '2026-06-01', risk: 'Low', revenue: '$0', column: 'Todo' },
      { id: 't5', title: 'Load testing for 10k concurrent', desc: 'Stress test the verification API to handle 10,000 concurrent scan requests with <200ms response', health: 'Red', due: '2026-05-22', risk: 'High', revenue: '$20k-$50k', column: 'Backlog' },
      { id: 't6', title: 'Partner onboarding flow', desc: 'Design and build the self-service partner onboarding with API key generation and webhook setup', health: 'Green', due: '2026-05-28', risk: 'Low', revenue: '$100k+', column: 'Done' }
    ]
  },
  {
    id: 'p2', name: 'AI Ally Fork', desc: 'Stage 4 sovereign AI platform with local inference and privacy-first architecture', stage: 'Stage 4', timeline: false,
    tasks: [
      { id: 't7', title: 'Local LLM inference pipeline', desc: 'Build the ONNX-optimized local inference pipeline supporting Llama, Mistral, and custom fine-tuned models', health: 'Green', due: '2026-05-30', risk: 'Med', revenue: '$100k+', column: 'Doing' },
      { id: 't8', title: 'Sovereign key management', desc: 'Implement zero-knowledge key management system where user keys never leave the device', health: 'Yellow', due: '2026-06-05', risk: 'High', revenue: '$50k-$100k', column: 'Doing' },
      { id: 't9', title: 'Plugin marketplace API', desc: 'Design the plugin marketplace API with sandboxed execution environment and resource limits', health: 'Green', due: '2026-06-10', risk: 'Low', revenue: '$100k+', column: 'Todo' },
      { id: 't10', title: 'Memory & context engine v2', desc: 'Rebuild the long-term memory engine with hierarchical context windows and importance scoring', health: 'Yellow', due: '2026-05-28', risk: 'Med', revenue: '$50k-$100k', column: 'Review' },
      { id: 't11', title: 'Federated learning module', desc: 'Create federated learning module that trains across user devices without sharing raw data', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$100k+', column: 'Backlog' },
      { id: 't12', title: 'End-to-end encryption layer', desc: 'Implement E2EE for all AI conversations with forward secrecy and key rotation', health: 'Green', due: '2026-05-15', risk: 'Low', revenue: '$20k-$50k', column: 'Done' }
    ]
  },
  {
    id: 'p3', name: 'SciTrades', desc: 'Stage 4 agentic trading system with autonomous strategy execution', stage: 'Stage 4', timeline: false,
    tasks: [
      { id: 't13', title: 'Multi-exchange arbitrage agent', desc: 'Build the cross-exchange arbitrage bot with sub-second execution and gas optimization', health: 'Yellow', due: '2026-05-22', risk: 'High', revenue: '$100k+', column: 'Doing' },
      { id: 't14', title: 'Risk management guardrails', desc: 'Implement position sizing, drawdown limits, and circuit breakers for autonomous trading', health: 'Green', due: '2026-05-25', risk: 'Med', revenue: '$50k-$100k', column: 'Review' },
      { id: 't15', title: 'Backtesting engine v3', desc: 'Rebuild backtesting with tick-level data, slippage modeling, and realistic fee estimation', health: 'Green', due: '2026-06-01', risk: 'Low', revenue: '$20k-$50k', column: 'Doing' },
      { id: 't16', title: 'Strategy marketplace', desc: 'Create the strategy marketplace where traders can publish and monetize their algorithms', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$100k+', column: 'Todo' },
      { id: 't17', title: 'Regulatory compliance module', desc: 'Build KYC/AML compliance layer with jurisdiction-aware trading restrictions', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$20k-$50k', column: 'Backlog' },
      { id: 't18', title: 'Real-time PnL dashboard', desc: 'Ship the live PnL tracker with unrealized gains, fee accounting, and tax lot management', health: 'Green', due: '2026-05-12', risk: 'Low', revenue: '$5k-$20k', column: 'Done' }
    ]
  },
  {
    id: 'p4', name: 'My Distant Relative', desc: 'Alpha-stage Viet-to-Japan relocation and integration program platform', stage: 'Alpha', timeline: false,
    tasks: [
      { id: 't19', title: 'Visa document wizard', desc: 'Build step-by-step visa application wizard with document checklists specific to Vietnam-to-Japan pathways', health: 'Yellow', due: '2026-06-10', risk: 'Med', revenue: '$5k-$20k', column: 'Doing' },
      { id: 't20', title: 'Language learning module', desc: 'Integrate spaced-repetition Japanese language courses tailored for Vietnamese speakers', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$1k-$5k', column: 'Todo' },
      { id: 't21', title: 'Housing matching engine', desc: 'Create housing recommendation system based on budget, commute, and lifestyle preferences', health: 'Green', due: '2026-06-20', risk: 'Low', revenue: '$5k-$20k', column: 'Todo' },
      { id: 't22', title: 'Community forum MVP', desc: 'Build the community forum for Vietnamese expats in Japan with mentorship matching', health: 'Red', due: '2026-06-25', risk: 'High', revenue: '$1k-$5k', column: 'Backlog' },
      { id: 't23', title: 'Cultural integration toolkit', desc: 'Design interactive cultural training modules covering work etiquette, social norms, and daily life', health: 'Green', due: '2026-05-30', risk: 'Low', revenue: '$1k-$5k', column: 'Review' },
      { id: 't24', title: 'Partner agency API', desc: 'Build API integrations with relocation agencies, language schools, and housing platforms', health: 'Yellow', due: '2026-07-01', risk: 'Med', revenue: '$20k-$50k', column: 'Backlog' }
    ]
  },
  {
    id: 'p5', name: 'AI Quick Wins', desc: 'Checkpoint 1 rapid tool factory for fast-to-market AI micro-products', stage: 'Checkpoint 1', timeline: false,
    tasks: [
      { id: 't25', title: 'Template scaffolding CLI', desc: 'Build the CLI tool that generates new AI micro-product projects from battle-tested templates', health: 'Green', due: '2026-05-18', risk: 'Low', revenue: '$5k-$20k', column: 'Doing' },
      { id: 't26', title: 'One-click deployment pipeline', desc: 'Create the zero-config deployment pipeline supporting Vercel, Railway, and custom VPS targets', health: 'Green', due: '2026-05-20', risk: 'Low', revenue: '$20k-$50k', column: 'Review' },
      { id: 't27', title: 'Usage analytics dashboard', desc: 'Ship the analytics dashboard tracking MAU, conversion, and revenue per micro-product', health: 'Yellow', due: '2026-05-28', risk: 'Med', revenue: '$5k-$20k', column: 'Todo' },
      { id: 't28', title: 'A/B testing framework', desc: 'Build lightweight A/B testing framework with statistical significance detection and auto-rollback', health: 'Green', due: '2026-06-01', risk: 'Low', revenue: '$20k-$50k', column: 'Todo' },
      { id: 't29', title: 'Payment integration kit', desc: 'Package Stripe and LemonSqueezy integration with usage-based billing models', health: 'Green', due: '2026-05-15', risk: 'Low', revenue: '$50k-$100k', column: 'Done' },
      { id: 't30', title: 'Auto-generated landing pages', desc: 'Build AI-powered landing page generator from product metadata and target audience description', health: 'Red', due: '2026-06-10', risk: 'High', revenue: '$20k-$50k', column: 'Backlog' }
    ]
  },
  {
    id: 'p6', name: 'AI Auto SaaS', desc: 'MVP-phase autonomous AI workers platform for business process automation', stage: 'MVP', timeline: false,
    tasks: [
      { id: 't31', title: 'Worker orchestration engine', desc: 'Build the multi-agent orchestration engine with task queuing, dependency resolution, and parallel execution', health: 'Yellow', due: '2026-05-25', risk: 'High', revenue: '$100k+', column: 'Doing' },
      { id: 't32', title: 'Natural language task definition', desc: 'Enable users to define complex workflows using natural language with AI-powered task decomposition', health: 'Green', due: '2026-06-01', risk: 'Med', revenue: '$100k+', column: 'Doing' },
      { id: 't33', title: 'Worker marketplace', desc: 'Create the marketplace for pre-built AI workers with reviews, usage stats, and customization options', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$100k+', column: 'Todo' },
      { id: 't34', title: 'Billing & metering system', desc: 'Implement usage-based billing with granular metering per AI action, token, and compute minute', health: 'Yellow', due: '2026-06-05', risk: 'Med', revenue: '$50k-$100k', column: 'Review' },
      { id: 't35', title: 'Enterprise SSO integration', desc: 'Add SAML/OIDC SSO support for enterprise customers with role-based access control', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$50k-$100k', column: 'Backlog' },
      { id: 't36', title: 'Worker monitoring dashboard', desc: 'Ship real-time monitoring with execution logs, performance metrics, and anomaly alerts', health: 'Green', due: '2026-05-10', risk: 'Low', revenue: '$20k-$50k', column: 'Done' }
    ]
  },
  {
    id: 'p7', name: 'Ptah Evolution', desc: 'Continuous evolution of the Ptah development framework across 5 strategic phases', stage: 'Continuous', timeline: true,
    phases: [
      { name: 'Foundation', start: '2026-01-01', end: '2026-03-31', color: '#3b82f6', desc: 'Core architecture & design system' },
      { name: 'Expansion', start: '2026-04-01', end: '2026-06-30', color: '#8b5cf6', desc: 'Plugin ecosystem & integrations' },
      { name: 'Intelligence', start: '2026-07-01', end: '2026-09-30', color: '#f59e0b', desc: 'AI-assisted development features' },
      { name: 'Ecosystem', start: '2026-10-01', end: '2026-12-31', color: '#22c55e', desc: 'Community & marketplace' },
      { name: 'Singularity', start: '2027-01-01', end: '2027-06-30', color: '#ef4444', desc: 'Self-evolving framework' }
    ],
    tasks: [
      { id: 't37', title: 'Core rendering engine rewrite', desc: 'Rewrite the rendering engine with WebGPU support and progressive enhancement fallbacks', health: 'Green', due: '2026-05-20', risk: 'Med', revenue: '$50k-$100k', column: 'Doing' },
      { id: 't38', title: 'Design token system v2', desc: 'Rebuild the design token system with semantic aliases, theme inheritance, and runtime switching', health: 'Green', due: '2026-05-25', risk: 'Low', revenue: '$20k-$50k', column: 'Doing' },
      { id: 't39', title: 'Plugin API public release', desc: 'Finalize and document the public plugin API with sandboxed execution and versioning', health: 'Yellow', due: '2026-06-01', risk: 'Med', revenue: '$100k+', column: 'Review' },
      { id: 't40', title: 'AI code completion integration', desc: 'Integrate context-aware AI code completion trained on Ptah-specific patterns and best practices', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$50k-$100k', column: 'Todo' },
      { id: 't41', title: 'Migration tooling from v1', desc: 'Build automated migration tool with codemods for upgrading Ptah v1 projects to v2', health: 'Red', due: '2026-06-10', risk: 'High', revenue: '$5k-$20k', column: 'Backlog' },
      { id: 't42', title: 'Documentation site redesign', desc: 'Redesign docs with interactive examples, search, and AI-powered answer engine', health: 'Green', due: '2026-05-08', risk: 'Low', revenue: '$5k-$20k', column: 'Done' }
    ]
  },
  {
    id: 'p8', name: 'Shisat Upgrade', desc: 'Continuous upgrade of the Shisat analytics platform across 5 strategic phases', stage: 'Continuous', timeline: true,
    phases: [
      { name: 'Stabilize', start: '2026-01-01', end: '2026-03-15', color: '#22c55e', desc: 'Bug fixes & performance' },
      { name: 'Modernize', start: '2026-03-16', end: '2026-06-15', color: '#3b82f6', desc: 'Tech stack modernization' },
      { name: 'Integrate', start: '2026-06-16', end: '2026-08-31', color: '#8b5cf6', desc: 'Third-party integrations' },
      { name: 'Automate', start: '2026-09-01', end: '2026-11-30', color: '#f59e0b', desc: 'AI-powered automation' },
      { name: 'Dominate', start: '2026-12-01', end: '2027-05-31', color: '#ef4444', desc: 'Market leadership push' }
    ],
    tasks: [
      { id: 't43', title: 'Real-time data pipeline', desc: 'Replace batch processing with streaming data pipeline using Apache Kafka and Flink', health: 'Yellow', due: '2026-05-22', risk: 'High', revenue: '$50k-$100k', column: 'Doing' },
      { id: 't44', title: 'Dashboard engine rewrite', desc: 'Rebuild the dashboard rendering engine with WebSocket updates and virtual scrolling', health: 'Green', due: '2026-05-28', risk: 'Med', revenue: '$20k-$50k', column: 'Doing' },
      { id: 't45', title: 'Custom report builder', desc: 'Build drag-and-drop report builder with calculated fields, filters, and scheduled delivery', health: 'Green', due: '2026-06-05', risk: 'Low', revenue: '$50k-$100k', column: 'Review' },
      { id: 't46', title: 'Data connector SDK', desc: 'Create the SDK for building custom data connectors with OAuth, rate limiting, and retry logic', health: 'Yellow', due: '2026-06-15', risk: 'Med', revenue: '$100k+', column: 'Todo' },
      { id: 't47', title: 'Anomaly detection AI', desc: 'Train and deploy ML models for automatic anomaly detection with configurable alerting thresholds', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$100k+', column: 'Backlog' },
      { id: 't48', title: 'Performance audit & fixes', desc: 'Complete comprehensive performance audit reducing p99 query latency by 60%', health: 'Green', due: '2026-05-05', risk: 'Low', revenue: '$5k-$20k', column: 'Done' }
    ]
  }
]

// ============ HELPERS ============
function healthColor(h: string) { return h === 'Green' ? '#22c55e' : h === 'Yellow' ? '#eab308' : '#ef4444' }
function daysUntil(due: string) { return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000) }

// ============ MAIN COMPONENT ============
export default function KanbanDashboard() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [currentProjectId, setCurrentProjectId] = useState('p1')
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
  const [newTaskHealth, setNewTaskHealth] = useState<'Green' | 'Yellow' | 'Red'>('Green')
  const [newTaskDue, setNewTaskDue] = useState('2026-06-15')
  const [newTaskRisk, setNewTaskRisk] = useState<'Low' | 'Med' | 'High'>('Low')
  const [newTaskRevenue, setNewTaskRevenue] = useState('$0')
  const nextIdRef = useRef(100)

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

  const handleDrop = useCallback((e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (!dragInfo) return
    setProjects(prev => prev.map(p => {
      if (p.id !== dragInfo.projectId) return p
      return { ...p, tasks: p.tasks.map(t => t.id === dragInfo.taskId ? { ...t, column: targetColumn } : t) }
    }))
    setDragInfo(null)
  }, [dragInfo])

  const handleDragEnd = useCallback(() => {
    setDragInfo(null)
    setDragOverColumn(null)
  }, [])

  // Move task
  const moveTask = useCallback((taskId: string, projectId: string, newColumn: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, column: newColumn } : t) }
    }))
  }, [])

  // Delete task
  const deleteTask = useCallback((taskId: string, projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
    }))
    setSidePanelTask(null)
  }, [])

  // Add project
  const addProject = useCallback(() => {
    if (!newProjName.trim()) return
    const id = 'p' + (++nextIdRef.current)
    setProjects(prev => [...prev, { id, name: newProjName.trim(), desc: newProjDesc.trim() || 'New project', stage: newProjStage, timeline: false, tasks: [] }])
    setCurrentProjectId(id)
    setShowAddProject(false)
    setNewProjName('')
    setNewProjDesc('')
  }, [newProjName, newProjDesc, newProjStage])

  // Add task
  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return
    const id = 't' + (++nextIdRef.current)
    setProjects(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p
      return { ...p, tasks: [...p.tasks, { id, title: newTaskTitle.trim(), desc: newTaskDesc.trim() || 'New task', health: newTaskHealth, due: newTaskDue, risk: newTaskRisk, revenue: newTaskRevenue, column: addTaskColumn }] }
    }))
    setShowAddTask(false)
    setNewTaskTitle('')
    setNewTaskDesc('')
  }, [newTaskTitle, newTaskDesc, newTaskHealth, newTaskDue, newTaskRisk, newTaskRevenue, addTaskColumn, currentProjectId])

  // Gantt helpers
  const globalStart = new Date('2026-01-01').getTime()
  const globalEnd = new Date('2027-07-01').getTime()
  const totalMs = globalEnd - globalStart
  const dateToPercent = (d: string) => Math.max(0, Math.min(100, ((new Date(d).getTime() - globalStart) / totalMs) * 100))

  // Heatmap score
  const getScore = (t: Task & { column: string }) => {
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
            <button onClick={() => { setShowAddProject(true) }} className="px-3 py-2 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm font-medium hover:bg-[#00f0ff]/20 transition-all flex items-center gap-1.5">
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
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${dueColor}`}>{days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}</span>
                              <div className="flex items-center gap-1.5">
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
                {projects.filter(p => p.timeline && p.phases).map(p => (
                  <div key={p.id} className="mb-8">
                    <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ background: p.phases![0].color }} />
                      {p.name}
                    </h3>
                    <div className="space-y-2">
                      {p.phases!.map(ph => {
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
                ))}
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
                  <span className="text-sm font-semibold text-[#00f0ff]">{sideTask.revenue}</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Status</div>
                <div className="flex gap-1">
                  {COLUMNS.map(col => (
                    <button key={col} onClick={() => moveTask(sideTask.id, sideProject.id, col)} className={`flex-1 py-2 text-[10px] font-medium rounded-lg transition ${sideTask.column === col ? 'font-bold' : 'bg-[#0a0a0f]/50 text-gray-500 hover:bg-[#0a0a0f]/80 hover:text-gray-300'}`} style={sideTask.column === col ? { background: `${COL_COLORS[col]}33`, border: `1px solid ${COL_COLORS[col]}66`, color: COL_COLORS[col] } : {}}>
                      {col}
                    </button>
                  ))}
                </div>
              </div>
              {sideTask.risk === 'High' && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
                  <div className="text-xs font-bold text-red-400 mb-1">⚠ High Risk Alert</div>
                  <div className="text-[11px] text-red-300/60">This task has significant risk. Consider breaking it down or assigning additional resources.</div>
                </div>
              )}
              {sideTask.health === 'Red' && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
                  <div className="text-xs font-bold text-red-400 mb-1">🚫 Blocked</div>
                  <div className="text-[11px] text-red-300/60">This task is currently blocked. Resolve blockers before proceeding.</div>
                </div>
              )}
              <div className="pt-4 border-t border-white/5">
                <button onClick={() => deleteTask(sideTask.id, sideProject.id)} className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition">Delete Task</button>
              </div>
            </div>
          )
        })()}
      </div>

      {/* ADD PROJECT MODAL */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddProject(false)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#00f0ff] mb-4">Add New Project</h3>
            <div className="space-y-3">
              <input value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="Project Name" className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 focus:border-[#00f0ff]/50 focus:outline-none text-sm" />
              <input value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} placeholder="Short Description" className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 focus:border-[#00f0ff]/50 focus:outline-none text-sm" />
              <select value={newProjStage} onChange={e => setNewProjStage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                {['Backlog', 'Alpha', 'MVP', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Near Launch', 'Continuous'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={addProject} className="flex-1 py-2.5 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-medium text-sm hover:bg-[#00f0ff]/30 transition">Create Project</button>
                <button onClick={() => setShowAddProject(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddTask(false)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#00f0ff] mb-4">Add New Task</h3>
            <div className="space-y-3">
              <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task Title" className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 focus:border-[#00f0ff]/50 focus:outline-none text-sm" />
              <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Description" rows={2} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 focus:border-[#00f0ff]/50 focus:outline-none text-sm resize-none" />
              <select value={newTaskHealth} onChange={e => setNewTaskHealth(e.target.value as 'Green' | 'Yellow' | 'Red')} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                <option value="Green">Green - On Track</option><option value="Yellow">Yellow - At Risk</option><option value="Red">Red - Blocked</option>
              </select>
              <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm" />
              <select value={newTaskRisk} onChange={e => setNewTaskRisk(e.target.value as 'Low' | 'Med' | 'High')} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                <option value="Low">Low Risk</option><option value="Med">Medium Risk</option><option value="High">High Risk</option>
              </select>
              <select value={newTaskRevenue} onChange={e => setNewTaskRevenue(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                {['$0', '$1k-$5k', '$5k-$20k', '$20k-$50k', '$50k-$100k', '$100k+'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={addTaskColumn} onChange={e => setAddTaskColumn(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-white focus:border-[#00f0ff]/50 focus:outline-none text-sm">
                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={addTask} className="flex-1 py-2.5 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-medium text-sm hover:bg-[#00f0ff]/30 transition">Add Task</button>
                <button onClick={() => setShowAddTask(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shimmer keyframe via style tag */}
      <style jsx global>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #12121a; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #00f0ff33; border-radius: 3px; }
      `}</style>
    </div>
  )
}
