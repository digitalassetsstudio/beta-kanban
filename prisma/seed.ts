import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SeedPhase {
  name: string
  start: string
  end: string
  color: string
  desc: string
}

interface SeedTask {
  title: string
  desc: string
  health: string
  due: string
  risk: string
  revenue: string
  column: string
  assignee?: string
}

interface SeedProject {
  name: string
  desc: string
  stage: string
  timeline: boolean
  phases?: SeedPhase[]
  tasks: SeedTask[]
}

const PROJECTS: SeedProject[] = [
  {
    name: 'LegitCheck (JIT Check)', desc: 'Near-launch PWA scam verifier for real-time product authentication', stage: 'Near Launch', timeline: false,
    tasks: [
      { title: 'Finalize scam database schema', desc: 'Complete the database schema for storing verified scam patterns and legitimate product signatures', health: 'Green', due: '2026-05-20', risk: 'Low', revenue: '$50k-$100k', column: 'Doing', assignee: 'Amun' },
      { title: 'PWA offline sync engine', desc: 'Build the offline-first sync engine with conflict resolution for field agents without connectivity', health: 'Yellow', due: '2026-05-25', risk: 'Med', revenue: '$50k-$100k', column: 'Doing', assignee: 'Thoth' },
      { title: 'Barcode/QR scanning module', desc: 'Implement real-time barcode and QR code scanning with result caching and batch processing', health: 'Green', due: '2026-05-18', risk: 'Low', revenue: '$20k-$50k', column: 'Review', assignee: 'Ptah' },
      { title: 'App Store submission prep', desc: 'Prepare all metadata, screenshots, privacy policy, and compliance docs for store submission', health: 'Green', due: '2026-06-01', risk: 'Low', revenue: '$0', column: 'Todo' },
      { title: 'Load testing for 10k concurrent', desc: 'Stress test the verification API to handle 10,000 concurrent scan requests with <200ms response', health: 'Red', due: '2026-05-22', risk: 'High', revenue: '$20k-$50k', column: 'Backlog' },
      { title: 'Partner onboarding flow', desc: 'Design and build the self-service partner onboarding with API key generation and webhook setup', health: 'Green', due: '2026-05-28', risk: 'Low', revenue: '$100k+', column: 'Done', assignee: 'Shisat' }
    ]
  },
  {
    name: 'AI Ally Fork', desc: 'Stage 4 sovereign AI platform with local inference and privacy-first architecture', stage: 'Stage 4', timeline: false,
    tasks: [
      { title: 'Local LLM inference pipeline', desc: 'Build the ONNX-optimized local inference pipeline supporting Llama, Mistral, and custom fine-tuned models', health: 'Green', due: '2026-05-30', risk: 'Med', revenue: '$100k+', column: 'Doing', assignee: 'Amun' },
      { title: 'Sovereign key management', desc: 'Implement zero-knowledge key management system where user keys never leave the device', health: 'Yellow', due: '2026-06-05', risk: 'High', revenue: '$50k-$100k', column: 'Doing', assignee: 'Aset' },
      { title: 'Plugin marketplace API', desc: 'Design the plugin marketplace API with sandboxed execution environment and resource limits', health: 'Green', due: '2026-06-10', risk: 'Low', revenue: '$100k+', column: 'Todo', assignee: 'Thoth' },
      { title: 'Memory & context engine v2', desc: 'Rebuild the long-term memory engine with hierarchical context windows and importance scoring', health: 'Yellow', due: '2026-05-28', risk: 'Med', revenue: '$50k-$100k', column: 'Review', assignee: 'Ptah' },
      { title: 'Federated learning module', desc: 'Create federated learning module that trains across user devices without sharing raw data', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$100k+', column: 'Backlog' },
      { title: 'End-to-end encryption layer', desc: 'Implement E2EE for all AI conversations with forward secrecy and key rotation', health: 'Green', due: '2026-05-15', risk: 'Low', revenue: '$20k-$50k', column: 'Done', assignee: 'Shisat' }
    ]
  },
  {
    name: 'SciTrades', desc: 'Stage 4 agentic trading system with autonomous strategy execution', stage: 'Stage 4', timeline: false,
    tasks: [
      { title: 'Multi-exchange arbitrage agent', desc: 'Build the cross-exchange arbitrage bot with sub-second execution and gas optimization', health: 'Yellow', due: '2026-05-22', risk: 'High', revenue: '$100k+', column: 'Doing', assignee: 'Amun' },
      { title: 'Risk management guardrails', desc: 'Implement position sizing, drawdown limits, and circuit breakers for autonomous trading', health: 'Green', due: '2026-05-25', risk: 'Med', revenue: '$50k-$100k', column: 'Review', assignee: 'Thoth' },
      { title: 'Backtesting engine v3', desc: 'Rebuild backtesting with tick-level data, slippage modeling, and realistic fee estimation', health: 'Green', due: '2026-06-01', risk: 'Low', revenue: '$20k-$50k', column: 'Doing', assignee: 'Ptah' },
      { title: 'Strategy marketplace', desc: 'Create the strategy marketplace where traders can publish and monetize their algorithms', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$100k+', column: 'Todo', assignee: 'Aset' },
      { title: 'Regulatory compliance module', desc: 'Build KYC/AML compliance layer with jurisdiction-aware trading restrictions', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$20k-$50k', column: 'Backlog' },
      { title: 'Real-time PnL dashboard', desc: 'Ship the live PnL tracker with unrealized gains, fee accounting, and tax lot management', health: 'Green', due: '2026-05-12', risk: 'Low', revenue: '$5k-$20k', column: 'Done', assignee: 'Shisat' }
    ]
  },
  {
    name: 'My Distant Relative', desc: 'Alpha-stage Viet-to-Japan relocation and integration program platform', stage: 'Alpha', timeline: false,
    tasks: [
      { title: 'Visa document wizard', desc: 'Build step-by-step visa application wizard with document checklists specific to Vietnam-to-Japan pathways', health: 'Yellow', due: '2026-06-10', risk: 'Med', revenue: '$5k-$20k', column: 'Doing', assignee: 'Thoth' },
      { title: 'Language learning module', desc: 'Integrate spaced-repetition Japanese language courses tailored for Vietnamese speakers', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$1k-$5k', column: 'Todo' },
      { title: 'Housing matching engine', desc: 'Create housing recommendation system based on budget, commute, and lifestyle preferences', health: 'Green', due: '2026-06-20', risk: 'Low', revenue: '$5k-$20k', column: 'Todo', assignee: 'Ptah' },
      { title: 'Community forum MVP', desc: 'Build the community forum for Vietnamese expats in Japan with mentorship matching', health: 'Red', due: '2026-06-25', risk: 'High', revenue: '$1k-$5k', column: 'Backlog' },
      { title: 'Cultural integration toolkit', desc: 'Design interactive cultural training modules covering work etiquette, social norms, and daily life', health: 'Green', due: '2026-05-30', risk: 'Low', revenue: '$1k-$5k', column: 'Review', assignee: 'Aset' },
      { title: 'Partner agency API', desc: 'Build API integrations with relocation agencies, language schools, and housing platforms', health: 'Yellow', due: '2026-07-01', risk: 'Med', revenue: '$20k-$50k', column: 'Backlog', assignee: 'Amun' }
    ]
  },
  {
    name: 'AI Quick Wins', desc: 'Checkpoint 1 rapid tool factory for fast-to-market AI micro-products', stage: 'Checkpoint 1', timeline: false,
    tasks: [
      { title: 'Template scaffolding CLI', desc: 'Build the CLI tool that generates new AI micro-product projects from battle-tested templates', health: 'Green', due: '2026-05-18', risk: 'Low', revenue: '$5k-$20k', column: 'Doing', assignee: 'Ptah' },
      { title: 'One-click deployment pipeline', desc: 'Create the zero-config deployment pipeline supporting Vercel, Railway, and custom VPS targets', health: 'Green', due: '2026-05-20', risk: 'Low', revenue: '$20k-$50k', column: 'Review', assignee: 'Thoth' },
      { title: 'Usage analytics dashboard', desc: 'Ship the analytics dashboard tracking MAU, conversion, and revenue per micro-product', health: 'Yellow', due: '2026-05-28', risk: 'Med', revenue: '$5k-$20k', column: 'Todo', assignee: 'Shisat' },
      { title: 'A/B testing framework', desc: 'Build lightweight A/B testing framework with statistical significance detection and auto-rollback', health: 'Green', due: '2026-06-01', risk: 'Low', revenue: '$20k-$50k', column: 'Todo' },
      { title: 'Payment integration kit', desc: 'Package Stripe and LemonSqueezy integration with usage-based billing models', health: 'Green', due: '2026-05-15', risk: 'Low', revenue: '$50k-$100k', column: 'Done', assignee: 'Aset' },
      { title: 'Auto-generated landing pages', desc: 'Build AI-powered landing page generator from product metadata and target audience description', health: 'Red', due: '2026-06-10', risk: 'High', revenue: '$20k-$50k', column: 'Backlog' }
    ]
  },
  {
    name: 'AI Auto SaaS', desc: 'MVP-phase autonomous AI workers platform for business process automation', stage: 'MVP', timeline: false,
    tasks: [
      { title: 'Worker orchestration engine', desc: 'Build the multi-agent orchestration engine with task queuing, dependency resolution, and parallel execution', health: 'Yellow', due: '2026-05-25', risk: 'High', revenue: '$100k+', column: 'Doing', assignee: 'Amun' },
      { title: 'Natural language task definition', desc: 'Enable users to define complex workflows using natural language with AI-powered task decomposition', health: 'Green', due: '2026-06-01', risk: 'Med', revenue: '$100k+', column: 'Doing', assignee: 'Thoth' },
      { title: 'Worker marketplace', desc: 'Create the marketplace for pre-built AI workers with reviews, usage stats, and customization options', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$100k+', column: 'Todo', assignee: 'Ptah' },
      { title: 'Billing & metering system', desc: 'Implement usage-based billing with granular metering per AI action, token, and compute minute', health: 'Yellow', due: '2026-06-05', risk: 'Med', revenue: '$50k-$100k', column: 'Review', assignee: 'Aset' },
      { title: 'Enterprise SSO integration', desc: 'Add SAML/OIDC SSO support for enterprise customers with role-based access control', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$50k-$100k', column: 'Backlog' },
      { title: 'Worker monitoring dashboard', desc: 'Ship real-time monitoring with execution logs, performance metrics, and anomaly alerts', health: 'Green', due: '2026-05-10', risk: 'Low', revenue: '$20k-$50k', column: 'Done', assignee: 'Shisat' }
    ]
  },
  {
    name: 'Ptah Evolution', desc: 'Continuous evolution of the Ptah development framework across 5 strategic phases', stage: 'Continuous', timeline: true,
    phases: [
      { name: 'Foundation', start: '2026-01-01', end: '2026-03-31', color: '#3b82f6', desc: 'Core architecture & design system' },
      { name: 'Expansion', start: '2026-04-01', end: '2026-06-30', color: '#8b5cf6', desc: 'Plugin ecosystem & integrations' },
      { name: 'Intelligence', start: '2026-07-01', end: '2026-09-30', color: '#f59e0b', desc: 'AI-assisted development features' },
      { name: 'Ecosystem', start: '2026-10-01', end: '2026-12-31', color: '#22c55e', desc: 'Community & marketplace' },
      { name: 'Singularity', start: '2027-01-01', end: '2027-06-30', color: '#ef4444', desc: 'Self-evolving framework' }
    ],
    tasks: [
      { title: 'Core rendering engine rewrite', desc: 'Rewrite the rendering engine with WebGPU support and progressive enhancement fallbacks', health: 'Green', due: '2026-05-20', risk: 'Med', revenue: '$50k-$100k', column: 'Doing', assignee: 'Ptah' },
      { title: 'Design token system v2', desc: 'Rebuild the design token system with semantic aliases, theme inheritance, and runtime switching', health: 'Green', due: '2026-05-25', risk: 'Low', revenue: '$20k-$50k', column: 'Doing', assignee: 'Amun' },
      { title: 'Plugin API public release', desc: 'Finalize and document the public plugin API with sandboxed execution and versioning', health: 'Yellow', due: '2026-06-01', risk: 'Med', revenue: '$100k+', column: 'Review', assignee: 'Thoth' },
      { title: 'AI code completion integration', desc: 'Integrate context-aware AI code completion trained on Ptah-specific patterns and best practices', health: 'Green', due: '2026-06-15', risk: 'Low', revenue: '$50k-$100k', column: 'Todo' },
      { title: 'Migration tooling from v1', desc: 'Build automated migration tool with codemods for upgrading Ptah v1 projects to v2', health: 'Red', due: '2026-06-10', risk: 'High', revenue: '$5k-$20k', column: 'Backlog' },
      { title: 'Documentation site redesign', desc: 'Redesign docs with interactive examples, search, and AI-powered answer engine', health: 'Green', due: '2026-05-08', risk: 'Low', revenue: '$5k-$20k', column: 'Done', assignee: 'Shisat' }
    ]
  },
  {
    name: 'Shisat Upgrade', desc: 'Continuous upgrade of the Shisat analytics platform across 5 strategic phases', stage: 'Continuous', timeline: true,
    phases: [
      { name: 'Stabilize', start: '2026-01-01', end: '2026-03-15', color: '#22c55e', desc: 'Bug fixes & performance' },
      { name: 'Modernize', start: '2026-03-16', end: '2026-06-15', color: '#3b82f6', desc: 'Tech stack modernization' },
      { name: 'Integrate', start: '2026-06-16', end: '2026-08-31', color: '#8b5cf6', desc: 'Third-party integrations' },
      { name: 'Automate', start: '2026-09-01', end: '2026-11-30', color: '#f59e0b', desc: 'AI-powered automation' },
      { name: 'Dominate', start: '2026-12-01', end: '2027-05-31', color: '#ef4444', desc: 'Market leadership push' }
    ],
    tasks: [
      { title: 'Real-time data pipeline', desc: 'Replace batch processing with streaming data pipeline using Apache Kafka and Flink', health: 'Yellow', due: '2026-05-22', risk: 'High', revenue: '$50k-$100k', column: 'Doing', assignee: 'Shisat' },
      { title: 'Dashboard engine rewrite', desc: 'Rebuild the dashboard rendering engine with WebSocket updates and virtual scrolling', health: 'Green', due: '2026-05-28', risk: 'Med', revenue: '$20k-$50k', column: 'Doing', assignee: 'Thoth' },
      { title: 'Custom report builder', desc: 'Build drag-and-drop report builder with calculated fields, filters, and scheduled delivery', health: 'Green', due: '2026-06-05', risk: 'Low', revenue: '$50k-$100k', column: 'Review', assignee: 'Amun' },
      { title: 'Data connector SDK', desc: 'Create the SDK for building custom data connectors with OAuth, rate limiting, and retry logic', health: 'Yellow', due: '2026-06-15', risk: 'Med', revenue: '$100k+', column: 'Todo', assignee: 'Ptah' },
      { title: 'Anomaly detection AI', desc: 'Train and deploy ML models for automatic anomaly detection with configurable alerting thresholds', health: 'Red', due: '2026-06-20', risk: 'High', revenue: '$100k+', column: 'Backlog' },
      { title: 'Performance audit & fixes', desc: 'Complete comprehensive performance audit reducing p99 query latency by 60%', health: 'Green', due: '2026-05-05', risk: 'Low', revenue: '$5k-$20k', column: 'Done', assignee: 'Aset' }
    ]
  }
]

async function main() {
  console.log('Seeding database...')

  // Delete existing data
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  for (const proj of PROJECTS) {
    const project = await prisma.project.create({
      data: {
        name: proj.name,
        desc: proj.desc,
        stage: proj.stage,
        timeline: proj.timeline,
        phases: proj.phases ? JSON.stringify(proj.phases) : null,
        tasks: {
          create: proj.tasks.map(t => ({
            title: t.title,
            desc: t.desc,
            health: t.health,
            due: t.due,
            risk: t.risk,
            revenue: t.revenue,
            column: t.column,
            assignee: t.assignee || null,
          }))
        }
      }
    })
    console.log(`Created project: ${project.name} with ${proj.tasks.length} tasks`)
  }

  console.log('Seeding complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
