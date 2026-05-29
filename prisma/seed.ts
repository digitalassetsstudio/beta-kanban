import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const projects = await db.project.findMany({ include: { tasks: true } })

  if (projects.length === 0) {
    console.log('No projects found. Skipping notification seeding.')
    return
  }

  const project1 = projects.find(p => p.name.includes('LegitCheck')) || projects[0]
  const project5 = projects.find(p => p.name.includes('AI Quick Wins')) || projects[4]
  const project7 = projects.find(p => p.name.includes('Ptah Evolution')) || projects[6]
  const task5 = project1.tasks[4] || project1.tasks[0]

  // Check if notifications already exist
  const existing = await db.notification.count()
  if (existing > 0) {
    console.log(`Notifications already exist (${existing} found). Skipping seed.`)
    return
  }

  await db.notification.createMany({
    data: [
      { zone: 'research', title: 'Aset Scan Complete', body: '3 new scam patterns detected in Southeast Asian markets', source: 'Aset', projectId: project1.id },
      { zone: 'marketing', title: 'AI Opportunity Found', body: 'New micro-SaaS niche: AI-powered document pre-check for visa applications', source: 'Shisat', projectId: project5.id },
      { zone: 'sales', title: 'Health Alert: Load Testing', body: 'Task health changed to Red — 10k concurrent test blocked', source: 'System', taskId: task5.id, projectId: project1.id },
      { zone: 'ops', title: 'Daily Backup Complete', body: 'Backup completed successfully. 2.4GB compressed. Duration: 3m 22s', source: 'Ptah' },
    ]
  })

  console.log('Demo notifications seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
