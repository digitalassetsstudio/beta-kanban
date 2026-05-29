# Task: Zone-Based Notification System for Kanban Command Dashboard

## Task ID: notification-system-001

## Summary
Built a complete zone-based notification system for the existing Kanban Command dashboard. The system signals which work mode to enter (research, marketing, sales, ops) based on project context and task changes.

## Files Created
1. `src/app/api/notifications/route.ts` - GET (list notifications, optional unread filter) + POST (create notification)
2. `src/app/api/notifications/[id]/route.ts` - PATCH (mark as read)
3. `src/app/api/notifications/mark-all/route.ts` - POST (mark all as read)
4. `prisma/seed.ts` - Demo notification seeding script

## Files Modified
1. `prisma/schema.prisma` - Added Notification model
2. `src/app/api/tasks/[id]/route.ts` - Added notification creation on column/assignee/health changes with zone mapping
3. `src/app/page.tsx` - Added bell icon, notification dropdown, state management, polling, fetchNotifications calls
4. `src/lib/db.ts` - Reverted to standard singleton pattern (after server restart resolved cache issue)

## Key Implementation Details
- Zone mapping based on project name: LegitCheck/SciTrades → research, AI Quick Wins/AI Auto SaaS → marketing, Ptah Evolution/Shisat Upgrade → sales, My Distant Relative → research, default → ops
- Health alerts always go to "sales" zone (revenue impact)
- Zone priority order for bell glow: sales > marketing > research > ops
- Bell icon glows with zone color when unread notifications exist
- Notifications auto-created on: column change, assignee change, health → Red
- 60-second polling for new notifications
- Click-to-navigate: marks as read, switches project, opens task panel
- Demo data seeded: 4 notifications across all 4 zones

## Issues Encountered
- HMR PrismaClient caching issue: After adding Notification model to Prisma schema, the dev server's cached PrismaClient didn't have the notification accessor. Required server restart to pick up new Prisma Client.
- Dev server stability: Server tends to crash after a few API requests in the sandbox environment, but the first request always returns correct data.

## Verification
- `bun run lint` passes with no errors
- `bun run db:push` successfully synced schema
- `GET /api/notifications` returns 4 demo notifications correctly
- `prisma/seed.ts` successfully seeded demo data
