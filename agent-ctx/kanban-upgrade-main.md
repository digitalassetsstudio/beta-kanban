# Task: Upgrade Kanban Dashboard to Full Backend-Powered Next.js 16 App

## Summary
Successfully upgraded the Kanban Command dashboard from an in-memory React app to a full backend-powered Next.js 16 application with Prisma/SQLite, API routes, password gate, comments, assignees, and auto-comments.

## Files Created/Modified

### 1. `prisma/schema.prisma` — Replaced with new schema
- 3 models: Project, Task, Comment
- Project: id, name, desc, stage, timeline, phases (JSON string), timestamps
- Task: id, title, desc, health, due, risk, revenue, column, assignee, projectId, timestamps
- Comment: id, taskId, agentName, text, isSystem, timestamps
- Uses SQLite provider with cascade deletes

### 2. `.env` — Updated DATABASE_URL
- Set to `file:/home/z/my-project/db/custom.db` (absolute path for Next.js compatibility)

### 3. `prisma/seed.ts` — New seed script
- Seeds 8 projects with 48 tasks
- Assigns agents (Amun, Thoth, Ptah, Shisat, Aset) to tasks
- Includes phases data for Ptah Evolution and Shisat Upgrade
- Run with: `npx tsx prisma/seed.ts`

### 4. `src/app/api/projects/route.ts` — Projects API
- GET: Returns all projects with tasks and comments
- POST: Creates a new project
- CORS headers and OPTIONS support

### 5. `src/app/api/tasks/route.ts` — Tasks API
- GET: Returns tasks for a project (requires ?project_id=xxx)
- POST: Creates a new task
- CORS headers and OPTIONS support

### 6. `src/app/api/tasks/[id]/route.ts` — Task update/delete API
- PATCH: Updates task with auto-comment generation for column/assignee changes
- DELETE: Deletes a task
- Auto-comments created by "System" agent with isSystem=true

### 7. `src/app/api/comments/route.ts` — Comments API
- GET: Returns comments for a task (requires ?task_id=xxx)
- POST: Creates a comment
- CORS headers and OPTIONS support

### 8. `src/app/page.tsx` — Complete rewrite (~700 lines)
- **Password Gate**: Full-screen overlay with "K" logo, hardcoded password "kanban2026", sessionStorage persistence
- **API Integration**: All data fetched from /api/projects, mutations use POST/PATCH/DELETE
- **Assignee System**: Color-coded badges (Amun=purple, Thoth=cyan, Ptah=amber, Shisat=green, Aset=pink)
- **Comment Threads**: Side panel shows comments, system comments styled dimmer/italic, post comments with agent dropdown
- **Auto-comments**: Column changes and assignee changes auto-create System comments
- **All views preserved**: Kanban, Gantt (Timeline), Heatmap
- **Drag & drop**: Still works, persists to DB on drop via PATCH
- **Dark neon theme**: Maintained bg-[#0a0a0f], neon-cyan #00f0ff, neon-purple #a855f7

### 9. `eslint.config.mjs` — Updated ignores
- Added "download/**" to ignore list

## Issues Encountered
1. **DATABASE_URL path resolution**: SQLite relative paths in Prisma are resolved relative to schema.prisma location. Had to use absolute path to ensure Next.js dev server connects to the same database as the seed script.
2. **Turbopack cache corruption**: After schema change, Turbopack's .next cache became corrupted. Required `rm -rf .next` and server restart to fix.
3. **Server stability**: The dev server process would sometimes die. The `.zscripts/dev.sh` script properly manages the server lifecycle.

## Verification
- ✅ `bun run db:push` — Schema pushed successfully
- ✅ `npx tsx prisma/seed.ts` — 8 projects, 48 tasks seeded
- ✅ `GET /api/projects` — Returns all data correctly
- ✅ `GET /` — Main page renders (22KB+ HTML)
- ✅ `bun run lint` — No errors (download/** excluded)
- ✅ Dev server running on port 3000
