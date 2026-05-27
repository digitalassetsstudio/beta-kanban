const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  LevelFormat,
} = require("docx");
const fs = require("fs");

// Palette — DM-1 Deep Cyan (AI/Tech)
const P = {
  primary: "162235",
  body: "000000",
  secondary: "5A6080",
  accent: "1B6B7A",
  surface: "EDF3F5",
  coverBg: "162235",
  coverTitle: "FFFFFF",
  coverSub: "B0B8C0",
  coverMeta: "90989F",
  coverAccent: "37DCF2",
};
const c = (hex) => hex.replace("#", "");

// Borders
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const tableBorderAccent = {
  top: { style: BorderStyle.SINGLE, size: 2, color: P.accent },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: P.accent },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
  insideVertical: { style: BorderStyle.NONE },
};

// Helper: heading
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

// Helper: body paragraph
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 22, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, ...opts })],
  });
}

// Helper: bullet item
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [new TextRun({ text, size: 22, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

// Helper: code-style paragraph
function code(text) {
  return new Paragraph({
    spacing: { line: 280, after: 20 },
    indent: { left: 360 },
    children: [new TextRun({ text, size: 19, color: "37474F", font: { ascii: "Consolas", eastAsia: "Consolas" } })],
  });
}

// Helper: accent highlight paragraph
function accentBody(text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    indent: { left: 360, right: 360 },
    shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
    children: [new TextRun({ text, size: 22, color: "1B5E20", font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, italics: true })],
  });
}

// Helper: simple table
function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorderAccent,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map(h =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: "FFFFFF", font: { ascii: "Calibri", eastAsia: "SimHei" } })] })],
            shading: { type: ShadingType.CLEAR, fill: P.accent },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
          })
        ),
      }),
      ...rows.map((row, idx) =>
        new TableRow({
          cantSplit: true,
          children: row.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
              shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? "FFFFFF" : P.surface },
              margins: { top: 50, bottom: 50, left: 120, right: 120 },
            })
          ),
        })
      ),
    ],
  });
}

// ─── COVER ───
function buildCover() {
  const calcTitleLayout = (title, maxW, pref = 40, min = 24) => {
    const charW = pt => pt * 12;
    const cpl = pt => Math.floor(maxW / charW(pt));
    let pt = pref;
    while (pt >= min) {
      if (cpl(pt) >= title.length / 2) break;
      pt -= 2;
    }
    return { titlePt: pt, titleLines: title.length > cpl(pt) ? [title.slice(0, Math.ceil(title.length/2)), title.slice(Math.ceil(title.length/2))] : [title] };
  };
  const { titlePt, titleLines } = calcTitleLayout("Kanban Command Dashboard - Technical Specification", 14000, 36, 24);

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [new TableRow({
        height: { value: 16838, rule: "exact" },
        children: [new TableCell({
          verticalAlign: "top",
          borders: allNoBorders,
          shading: { type: ShadingType.CLEAR, fill: P.coverBg },
          children: [
            new Paragraph({ spacing: { before: 3200 }, children: [] }),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { after: 200 },
              children: [new TextRun({ text: "TECHNICAL SPECIFICATION", size: 18, color: P.coverAccent, font: { ascii: "Calibri", eastAsia: "SimHei" }, bold: true })],
            }),
            ...titleLines.map(line => new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { line: Math.ceil(titlePt * 23), lineRule: "atLeast", after: 100 },
              children: [new TextRun({ text: line, size: titlePt * 2, color: P.coverTitle, font: { ascii: "Calibri", eastAsia: "SimHei" }, bold: true })],
            })),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { before: 400, after: 100 },
              children: [new TextRun({ text: "Kanban Command Dashboard", size: 26, color: P.coverSub, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { after: 60 },
              children: [new TextRun({ text: "Full Architecture, Data Model & Backend Integration Guide", size: 22, color: P.coverSub, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { before: 600 },
              children: [new TextRun({ text: "Prepared for: Ptah (Backend Engineering)", size: 20, color: P.coverMeta, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { after: 60 },
              children: [new TextRun({ text: "Date: May 27, 2026  |  Version: 2.0", size: 20, color: P.coverMeta, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              spacing: { before: 200 },
              border: { top: { style: BorderStyle.SINGLE, size: 12, color: P.coverAccent, space: 30 } },
              children: [],
            }),
            new Paragraph({
              indent: { left: 1400, right: 1400 },
              children: [new TextRun({ text: "Digital Assets Studio  |  Confidential", size: 18, color: P.coverMeta, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
          ],
        })],
      })],
    }),
  ];
}

// ─── BODY CONTENT ───
function buildBody() {
  const children = [];

  // 1. EXECUTIVE OVERVIEW
  children.push(h1("1. Executive Overview"));
  children.push(body("The Kanban Command Dashboard is a fully self-contained, single-file HTML application that serves as a centralized project management and AI agent coordination hub for Digital Assets Studio. It tracks 8 active projects across their full lifecycle, from Backlog to Done, with drag-and-drop Kanban columns, timeline visualizations, priority heatmaps, and a three-section interactive sidebar that provides real-time project statistics, AI agent insights, and direct agent chat capabilities. The dashboard is currently deployed live at https://beta-kanban.vercel.app via GitHub-to-Vercel auto-deploy pipeline."));
  children.push(body("This document provides Ptah with the complete technical specification needed to wire up the backend. It covers every data structure, API surface, event handler, and integration point in the current frontend, along with clear recommendations for how each piece should be connected to a persistent Python backend service. The goal is to transform the current static, client-side-only prototype into a fully dynamic, multi-user, persistent application that could serve as the foundation for a custom mobile chat Python application residing on the MacBook."));
  children.push(accentBody("Key context: This dashboard is being considered as a potential component of a custom mobile chat Python application that resides on the MacBook. All backend integration points should be designed with this eventual portability in mind."));

  // 2. ARCHITECTURE OVERVIEW
  children.push(h1("2. Architecture Overview"));
  children.push(h2("2.1 Current Frontend Architecture"));
  children.push(body("The entire application lives in a single kanban-dashboard.html file (678 lines). There are no build steps, no bundler, and no external dependencies beyond the Tailwind CSS CDN. All data is hardcoded as JavaScript objects in the file itself, meaning there is no persistence layer - refreshing the page resets all state. The application uses vanilla JavaScript DOM manipulation with template literals for rendering, the HTML5 Drag and Drop API for card movement between columns, and CSS transitions for all animations and panel interactions."));
  children.push(body("The application is structured around a reactive rendering pattern: any data mutation triggers a full re-render via the renderAll() function, which cascades through renderSummary(), renderProjectTabs(), and renderKanban(). This is simple but effective for the current scale of 8 projects and ~48 tasks. For a backend-connected version, this pattern should be replaced with a more targeted update strategy that only re-renders the affected components."));

  children.push(h2("2.2 Proposed Backend Architecture"));
  children.push(body("The recommended backend stack is Python (FastAPI or Flask) with a SQLite or PostgreSQL database for persistence, WebSocket support for real-time updates, and a REST API layer that mirrors the current client-side data structures. The backend should expose endpoints for all CRUD operations on projects and tasks, a WebSocket channel for real-time agent chat and status updates, and an API for AI agent insight generation and delivery. For the MacBook-resident use case, FastAPI with Uvicorn running locally would be the ideal lightweight solution."));

  children.push(makeTable(
    ["Layer", "Current", "Proposed", "Technology"],
    [
      ["Data Storage", "Hardcoded JS objects", "Persistent database", "SQLite / PostgreSQL"],
      ["API Layer", "None (client-side only)", "REST + WebSocket API", "FastAPI / Flask"],
      ["Real-time Updates", "None (full re-render)", "WebSocket push", "Socket.IO / FastAPI WS"],
      ["Agent Chat", "Simulated responses", "LLM-backed agent", "OpenAI / Local LLM API"],
      ["Agent Insights", "Static mock data", "Dynamic AI-generated", "Agent pipeline + LLM"],
      ["Authentication", "None", "JWT / OAuth2", "Auth middleware"],
      ["Deployment", "Static HTML on Vercel", "Full-stack app", "Docker / Local service"],
    ]
  ));

  // 3. DATA MODEL
  children.push(h1("3. Complete Data Model"));
  children.push(h2("3.1 Project Schema"));
  children.push(body("Each project is represented as a JavaScript object with the following fields. This is the primary entity that groups tasks together. The backend should create a projects table with these columns, plus standard audit fields (created_at, updated_at, created_by)."));

  children.push(makeTable(
    ["Field", "Type", "Description", "Example"],
    [
      ["id", "string", "Unique identifier (p1-p8)", "p1"],
      ["name", "string", "Project display name", "LegitCheck (JIT Check)"],
      ["desc", "string", "Short description", "Near-launch PWA scam verifier..."],
      ["stage", "string enum", "Lifecycle stage", "Near Launch"],
      ["timeline", "boolean", "Has Gantt timeline phases", "true"],
      ["phases", "array", "Timeline phases (if timeline=true)", "See 3.3"],
      ["tasks", "array", "Array of task objects", "See 3.2"],
    ]
  ));

  children.push(h3("Valid Stage Values"));
  children.push(body("The stage field uses the following enum values. These represent the project lifecycle stages from initial concept through continuous evolution. The backend should enforce these as a constrained enum type in the database schema to maintain data integrity across all API consumers."));
  children.push(bullet("Backlog - Project is planned but not yet started"));
  children.push(bullet("Alpha - Early prototype / proof of concept phase"));
  children.push(bullet("MVP - Minimum viable product with core features"));
  children.push(bullet("Stage 1 through Stage 4 - Progressive development stages"));
  children.push(bullet("Near Launch - Final testing and deployment preparation"));
  children.push(bullet("Continuous - Ongoing evolution with phased roadmap"));
  children.push(bullet("Checkpoint 1 - Milestone-based delivery checkpoint"));

  children.push(h2("3.2 Task Schema"));
  children.push(body("Each task belongs to exactly one project and represents a discrete unit of work. Tasks are the cards that appear in the Kanban columns and are the primary interactive element in the sidebar. The backend tasks table should include a project_id foreign key, these columns, and standard audit fields."));

  children.push(makeTable(
    ["Field", "Type", "Description", "Example"],
    [
      ["id", "string", "Unique identifier (t1-t48)", "t1"],
      ["title", "string", "Task title (short)", "Finalize scam database schema"],
      ["desc", "string", "Detailed description", "Complete the database schema..."],
      ["health", "string enum", "Green / Yellow / Red", "Green"],
      ["due", "date string", "Due date (YYYY-MM-DD)", "2026-05-20"],
      ["risk", "string enum", "Low / Med / High", "Low"],
      ["revenue", "string enum", "Revenue potential tier", "$50k-$100k"],
      ["column", "string enum", "Kanban column position", "Doing"],
    ]
  ));

  children.push(h3("Kanban Column Values (Task Lifecycle)"));
  children.push(body("Tasks flow through five columns representing their lifecycle. The column field determines where the task card appears in the Kanban board. The backend should enforce these values as an enum and track column change timestamps for analytics (how long tasks spend in each column, average cycle time, etc.)."));
  children.push(bullet("Backlog - Identified but not yet prioritized or scheduled"));
  children.push(bullet("Todo - Prioritized and scheduled, waiting to be started"));
  children.push(bullet("Doing - Actively being worked on by a team member or agent"));
  children.push(bullet("Review - Work complete, awaiting review or QA approval"));
  children.push(bullet("Done - Approved and completed, ready for deployment"));

  children.push(h3("Health Status Values"));
  children.push(body("The health field provides a quick visual indicator of task status. Green means on track with no issues. Yellow indicates the task is at risk - there may be delays, dependencies, or uncertainty that could impact the timeline. Red means the task is blocked - there is a critical issue preventing progress that requires attention. The health indicator drives the colored dot on each card (green solid, yellow pulsing, red pulsing) and is used in the heatmap priority scoring algorithm."));

  children.push(h3("Revenue Tier Values"));
  children.push(body("Revenue tiers provide a rough estimate of the financial impact of each task. The current tiers are: $0, $1k-$5k, $5k-$20k, $20k-$50k, $50k-$100k, and $100k+. These are displayed on each card and in the sidebar statistics section. The backend could replace these with actual tracked revenue numbers once billing integration is in place."));

  children.push(h2("3.3 Timeline Phase Schema"));
  children.push(body("Projects with timeline=true have a phases array that powers the Gantt timeline view. Currently, only Ptah Evolution and Shisat Upgrade have timeline phases. Each phase has a name, start date, end date, color hex code, and short description. The backend should create a separate phases table with a project_id foreign key."));

  children.push(makeTable(
    ["Field", "Type", "Description", "Example"],
    [
      ["name", "string", "Phase name", "Foundation"],
      ["start", "date string", "Phase start date", "2026-01-01"],
      ["end", "date string", "Phase end date", "2026-03-31"],
      ["color", "hex string", "Display color for Gantt bar", "#3b82f6"],
      ["desc", "string", "Short phase description", "Core architecture & design system"],
    ]
  ));

  // 4. AGENT DATA MODEL
  children.push(h1("4. AI Agent Data Model"));
  children.push(body("One of the most critical integration points for the backend is the AI Agent system. Each project has a dedicated AI agent that provides insights and responds to chat messages. Currently, the agent data is hardcoded in the AGENT_DATA object with static insights and simulated chat responses. The backend needs to replace this with a real agent pipeline that generates insights dynamically and provides LLM-backed chat capabilities."));

  children.push(h2("4.1 Agent Schema"));
  children.push(makeTable(
    ["Field", "Type", "Description", "Example"],
    [
      ["name", "string", "Agent display name", "Legit Agent"],
      ["avatar", "emoji string", "Agent avatar emoji", "shield"],
      ["status", "string enum", "active / idle / offline", "active"],
      ["lastSeen", "string", "Human-readable time since last activity", "2 min ago"],
      ["insights", "array", "Array of insight objects (see 4.2)", "See below"],
    ]
  ));

  children.push(h2("4.2 Insight Schema"));
  children.push(body("Each insight represents a discrete piece of information from the agent. Insights are categorized by type, which determines their visual presentation (icon, color) and their semantic meaning. The insight type drives the color-coded left border and icon in the sidebar, making it easy to scan for blockers vs. working updates vs. new ideas."));

  children.push(makeTable(
    ["Field", "Type", "Description", "Example"],
    [
      ["type", "string enum", "Insight category", "working"],
      ["text", "string", "Insight content (1-2 sentences)", "Running batch verification..."],
      ["time", "string", "Human-readable time ago", "2m ago"],
    ]
  ));

  children.push(h3("Insight Type Values"));
  children.push(makeTable(
    ["Type", "Icon", "Color", "Meaning"],
    [
      ["working", "gear", "Cyan (#00f0ff)", "Agent is actively working on this task"],
      ["discovery", "bulb", "Purple (#a855f7)", "Agent found something notable during work"],
      ["idea", "sparkle", "Green (#22c55e)", "Agent has a suggestion or improvement idea"],
      ["blocker", "construction", "Red (#ef4444)", "Agent hit a problem blocking progress"],
      ["finding", "magnifier", "Yellow (#eab308)", "Agent observed a pattern or data point"],
    ]
  ));

  children.push(h2("4.3 Chat History Schema"));
  children.push(body("The chatHistories object stores per-project conversation histories. Each entry is an array of message objects with a role (user or agent) and text content. Currently, chat messages are only stored in memory and are lost on page refresh. The backend must persist chat histories in a messages table with project_id, role, content, and timestamp fields, and provide a WebSocket endpoint for real-time message delivery."));

  // 5. SIDE PANEL SPECIFICATION
  children.push(h1("5. Interactive Sidebar Specification"));
  children.push(body("The sidebar is the most complex interactive component in the dashboard. It opens when any Kanban card is clicked and slides in from the right edge of the screen. It occupies 520px on desktop or full-width on mobile, with a dark overlay behind it. The sidebar is divided into three clearly separated sections, each serving a distinct purpose. Understanding this structure is critical for the backend because each section requires different API endpoints and data flows."));

  children.push(h2("5.1 Section 1: Project Statistics"));
  children.push(body("The top section displays project-level statistics alongside the specific task details. It includes a circular SVG progress ring showing the project completion percentage, mini stat bars for completion, in-progress, in-review, and blocked counts, a row of three info cards showing risk level, revenue potential, and estimated completion date, and a column quick-move row that allows changing the task's Kanban column directly from the sidebar without dragging. The backend API should provide a project stats endpoint that returns all these computed values so the frontend does not have to calculate them client-side."));

  children.push(h3("Statistics Computed Values"));
  children.push(makeTable(
    ["Statistic", "Source", "Computation", "Display"],
    [
      ["Completion %", "Project tasks", "doneCount / totalCount * 100", "SVG progress ring + text"],
      ["Status", "Project stage", "Direct from project.stage", "Text label"],
      ["Health", "Task health", "Direct from task.health", "Color-coded text"],
      ["Days Left", "Task due date", "(dueDate - today) / 86400000", "Text with color coding"],
      ["Blocked Count", "Project tasks", "Count where health=Red", "Red stat bar"],
      ["In Progress", "Project tasks", "Count where column=Doing", "Amber stat bar"],
      ["In Review", "Project tasks", "Count where column=Review", "Purple stat bar"],
      ["Risk Level", "Task risk", "Direct from task.risk", "Color-coded card"],
      ["Revenue", "Task revenue", "Direct from task.revenue", "Cyan text card"],
      ["Est. Complete", "Task due date", "Direct from task.due", "White text card"],
    ]
  ));

  children.push(h3("Column Quick-Move"));
  children.push(body("The column quick-move buttons allow changing a task's Kanban column directly from the sidebar. When clicked, the moveTask() function updates the task's column property and re-renders the board. The currently active column is highlighted with its designated color. The backend should expose a PATCH /tasks/:id endpoint that accepts a new column value and returns the updated task. It should also emit a WebSocket event so other connected clients see the change in real-time."));

  children.push(h2("5.2 Section 2: AI Insights & Updates"));
  children.push(body("The middle section displays real-time insights from the project's dedicated AI agent. It shows the agent's name, avatar, status indicator (green dot for active, gray for idle), and last-seen timestamp at the top. Below that, it renders a scrollable list of insight cards, each with a color-coded left border, type icon, descriptive text, type badge, and timestamp. The backend agent pipeline should generate these insights dynamically based on project activity, code changes, external data sources, and user interactions. Insights should be pushed to connected clients via WebSocket as they are generated."));

  children.push(h3("Recommended Insight Generation Pipeline"));
  children.push(body("The backend agent should run on a configurable interval (default: 5 minutes) and produce insights based on the following triggers. Each trigger maps to a specific insight type and produces contextual, project-specific content rather than generic status updates."));
  children.push(bullet("Task movement events (column changes) produce 'working' insights - the agent acknowledges and contextualizes the change"));
  children.push(bullet("Health degradation (Green to Yellow/Red) triggers 'blocker' insights - the agent diagnoses the issue and suggests remediation"));
  children.push(bullet("Deadline proximity (within 3 days) triggers 'working' insights - the agent reports on progress toward the deadline"));
  children.push(bullet("Cross-project pattern detection produces 'discovery' insights - the agent identifies correlations or shared blockers"));
  children.push(bullet("Historical analysis produces 'idea' insights - the agent suggests improvements based on completed similar tasks"));

  children.push(h2("5.3 Section 3: Direct Agent Chat"));
  children.push(body("The bottom section provides a chat interface for direct communication with the project's AI agent. The chat area displays messages in a conversational format with user messages right-aligned in cyan-tinted bubbles and agent messages left-aligned in dark bubbles. When the user sends a message, the agent displays a typing indicator (three bouncing dots) for 1-2 seconds before responding with a contextual message. Currently, responses are randomly selected from a pool of five generic acknowledgments. The backend should replace this with a real LLM-backed agent that has project context, task history, and insight data available."));

  children.push(h3("Chat API Requirements"));
  children.push(makeTable(
    ["Requirement", "Specification", "Notes"],
    [
      ["Message format", "{ role: 'user'|'agent', text: string }", "Consistent with current frontend model"],
      ["Real-time delivery", "WebSocket channel per project", "Messages pushed instantly to all clients"],
      ["Typing indicator", "Backend sends 'typing' event", "Frontend shows dots for 1-2s"],
      ["Agent context", "Project + task + insights history", "LLM should have full project context"],
      ["Persistence", "All messages stored in database", "Chat history survives page refresh"],
      ["Rate limiting", "Max 1 message per 2 seconds", "Prevent spam and excessive API costs"],
    ]
  ));

  // 6. COMPLETE API SURFACE
  children.push(h1("6. Complete API Surface for Backend Integration"));
  children.push(body("This section defines every API endpoint that the backend must expose to support the full functionality of the Kanban Command Dashboard. Each endpoint is derived from a specific user interaction or data need in the current frontend. Endpoints are organized by resource and include the HTTP method, path, request body schema, and response schema."));

  children.push(h2("6.1 Projects API"));
  children.push(makeTable(
    ["Method", "Endpoint", "Description", "Request Body", "Response"],
    [
      ["GET", "/api/projects", "List all projects with stats", "None", "Project[] with computed stats"],
      ["GET", "/api/projects/:id", "Get single project with tasks", "None", "Project with tasks array"],
      ["POST", "/api/projects", "Create new project", "{ name, desc, stage }", "Created project object"],
      ["PATCH", "/api/projects/:id", "Update project fields", "{ name?, desc?, stage? }", "Updated project object"],
      ["DELETE", "/api/projects/:id", "Delete project and all tasks", "None", "204 No Content"],
    ]
  ));

  children.push(h2("6.2 Tasks API"));
  children.push(makeTable(
    ["Method", "Endpoint", "Description", "Request Body", "Response"],
    [
      ["GET", "/api/projects/:id/tasks", "List all tasks for project", "None", "Task[]"],
      ["POST", "/api/projects/:id/tasks", "Create new task", "{ title, desc, health, due, risk, revenue, column }", "Created task object"],
      ["PATCH", "/api/tasks/:id", "Update task (including column moves)", "{ column?, health?, title?, desc?, due?, risk?, revenue? }", "Updated task object"],
      ["DELETE", "/api/tasks/:id", "Delete task", "None", "204 No Content"],
      ["GET", "/api/tasks/upcoming", "Tasks due within 7 days", "None", "Task[] with project info"],
      ["GET", "/api/tasks/blocked", "All tasks with health=Red", "None", "Task[] with project info"],
    ]
  ));

  children.push(h2("6.3 Agent API"));
  children.push(makeTable(
    ["Method", "Endpoint", "Description", "Request Body", "Response"],
    [
      ["GET", "/api/agents/:projectId", "Get agent status and insights", "None", "Agent object with insights"],
      ["POST", "/api/agents/:projectId/insights", "Trigger insight generation", "{ type?, context? }", "Newly generated insights"],
      ["GET", "/api/agents/:projectId/chat", "Get chat history", "None", "Message[]"],
      ["POST", "/api/agents/:projectId/chat", "Send message to agent", "{ text }", "Agent response message"],
      ["WebSocket", "/ws/agents/:projectId", "Real-time agent updates", "N/A", "Stream of events"],
    ]
  ));

  children.push(h2("6.4 Dashboard Stats API"));
  children.push(makeTable(
    ["Method", "Endpoint", "Description", "Response"],
    [
      ["GET", "/api/stats/summary", "Dashboard summary stats", "{ totalProjects, totalTasks, completionPct, revenuePotential, dueThisWeek, blockedItems }"],
      ["GET", "/api/stats/heatmap", "Priority heatmap scores", "Task[] with computed priority scores"],
      ["GET", "/api/stats/timeline", "Timeline data for Gantt view", "Project[] with phases for timeline projects"],
    ]
  ));

  // 7. EVENT HANDLERS
  children.push(h1("7. Frontend Event Handlers & Integration Points"));
  children.push(body("This section maps every user interaction in the frontend to its current implementation and the corresponding backend API call that should replace it. Understanding these mappings is essential for wiring up the backend without breaking the existing UI flow."));

  children.push(h2("7.1 Drag and Drop"));
  children.push(body("The HTML5 Drag and Drop API is used for moving task cards between Kanban columns. The flow is: handleDragStart() captures the task ID, project ID, and source column; handleDragOver() highlights valid drop targets; handleDrop() updates the task's column property and triggers renderAll(). The backend should replace the direct column update with a PATCH /api/tasks/:id call, and the renderAll() should be triggered by the API response rather than the local state change. Additionally, a WebSocket event should be emitted so other connected clients see the card move in real-time."));

  children.push(h2("7.2 Sidebar Open/Close"));
  children.push(body("Clicking a card calls openSidePanel(taskId, projId), which looks up the task and project, computes all sidebar statistics, builds the three-section HTML, and applies the CSS class to slide the panel in. The overlay click handler calls closeSidePanel(). The backend should provide a GET /api/tasks/:id?include=stats endpoint that returns the task with pre-computed project statistics, eliminating the need for client-side computation. Agent insights should be fetched from GET /api/agents/:projectId and chat history from GET /api/agents/:projectId/chat."));

  children.push(h2("7.3 Chat Message Send"));
  children.push(body("The sendChat() function reads the input value, appends the user message to the chat area, clears the input, shows a typing indicator, and after a delay replaces it with a randomly selected response. The backend should replace this entire flow with: POST /api/agents/:projectId/chat with the message text, receive a streaming response via WebSocket, and render the agent's reply token by token for a more natural chat experience. The response should be generated by an LLM with full project and task context."));

  children.push(h2("7.4 Add Project / Add Task Modals"));
  children.push(body("The addProject() and addTask() functions create new objects and push them into the local arrays. The backend should replace these with POST /api/projects and POST /api/projects/:id/tasks respectively. The response should include the server-assigned ID and any server-computed fields. The frontend should update its local state from the API response rather than constructing objects client-side."));

  // 8. VISUAL DESIGN SYSTEM
  children.push(h1("8. Visual Design System"));
  children.push(h2("8.1 Color Palette"));
  children.push(body("The dashboard uses a dark neon theme with a carefully curated palette. The background is deep black (#0a0a0f), with card surfaces at slightly lighter shades (#12121a, #1a1a2e, #22223a). The primary accent is neon cyan (#00f0ff), used for active states, buttons, highlights, and the brand gradient. Secondary accents include neon purple (#a855f7) for review states and AI insights, neon green (#22c55e) for done states and positive health, amber (#eab308) for in-progress and at-risk states, and red (#ef4444) for blocked items and high-risk indicators. Text is primarily light gray (#e2e8f0) on dark backgrounds with muted gray (#6b7280, #9ca3af) for secondary text."));

  children.push(h2("8.2 Column Color System"));
  children.push(makeTable(
    ["Column", "Color", "Hex", "Icon"],
    [
      ["Backlog", "Gray", "#6b7280", "Clipboard"],
      ["Todo", "Blue", "#3b82f6", "Pin"],
      ["Doing", "Amber", "#f59e0b", "Lightning"],
      ["Review", "Purple", "#a855f7", "Magnifier"],
      ["Done", "Green", "#22c55e", "Checkmark"],
    ]
  ));

  children.push(h2("8.3 Risk Heatmap Visualization"));
  children.push(body("Task cards use a left-border gradient system to indicate risk level at a glance. Low-risk cards have a subtle green left border, medium-risk cards have an amber left border, and high-risk cards have a red left border. The heatmap view computes a composite priority score for each task based on risk level (Low=1, Med=2, High=3), health status (Red=3, Yellow=2, Green=0), days until due (overdue=4, less than 3 days=3, less than 7 days=2, otherwise=1), and whether the task is done (0 if done, 1 if not). Tasks are then sorted by this score and the top 5 are highlighted as critical attention items. The backend should provide this scoring as a computed field in the API response."));

  // 9. CURRENT PROJECTS
  children.push(h1("9. Current Project Portfolio"));
  children.push(body("The dashboard currently tracks 8 projects, each with 4-6 tasks across various lifecycle stages. Below is the complete inventory with their current status, task counts, and stage information. This data should be seeded into the backend database during initial setup."));

  children.push(makeTable(
    ["ID", "Project Name", "Stage", "Tasks", "Done", "Agent Name"],
    [
      ["p1", "LegitCheck (JIT Check)", "Near Launch", "6", "1", "Legit Agent"],
      ["p2", "AI Ally Fork", "Stage 4", "6", "1", "Ally Core"],
      ["p3", "SciTrades", "Stage 4", "6", "1", "SciBot"],
      ["p4", "My Distant Relative", "Alpha", "6", "0", "Bridge Agent"],
      ["p5", "AI Quick Wins", "Checkpoint 1", "6", "1", "QuickBot"],
      ["p6", "AI Auto SaaS", "MVP", "6", "1", "SaaS Agent"],
      ["p7", "Ptah Evolution", "Continuous", "6", "1", "Ptah Agent"],
      ["p8", "Shisat Upgrade", "Continuous", "6", "1", "Shisat Agent"],
    ]
  ));

  // 10. DEPLOYMENT
  children.push(h1("10. Deployment Pipeline"));
  children.push(h2("10.1 Current Deployment"));
  children.push(body("The dashboard is deployed as a static site via Vercel with automatic deployment triggered by pushing to the main branch of the GitHub repository at https://github.com/digitalassetsstudio/beta-kanban. The live URL is https://beta-kanban.vercel.app. The entire application is a single index.html file in the repository root. Vercel automatically detects the static HTML and serves it with global CDN distribution and automatic SSL."));

  children.push(h2("10.2 Future Full-Stack Deployment"));
  children.push(body("Once the Python backend is wired up, the deployment model will shift from static site hosting to a full-stack application. The recommended approach is to containerize the Python backend with Docker, deploy the backend as a Vercel Serverless Function or a separate cloud service (Railway, Render, or AWS Lambda), and continue serving the frontend as a static asset that communicates with the backend via the REST API and WebSocket connections. For the MacBook-resident use case, the entire stack (FastAPI backend + SQLite + static frontend) can run as a single local service on localhost."));

  children.push(h2("10.3 MacBook Local Service Architecture"));
  children.push(body("For the custom mobile chat Python application use case, the following local architecture is recommended. FastAPI with Uvicorn runs as a background service on the MacBook, serving both the static frontend files and the API endpoints from the same origin. SQLite stores all data locally with automatic backups. The LLM agent runs either locally (using Ollama or a similar tool with Mistral-7B or Llama-3) for privacy, or via API calls to OpenAI/Anthropic for higher quality responses. The chat interface connects via localhost WebSocket for zero-latency real-time communication. This architecture keeps everything self-contained on the MacBook with no external dependencies, while still supporting the full dashboard feature set."));

  // 11. SECURITY
  children.push(h1("11. Security Considerations"));
  children.push(body("Currently, all data in the dashboard is hardcoded as plain text in the HTML file. Anyone who views the page source can see everything - project details, task descriptions, revenue estimates, agent insights, and chat histories. This is acceptable for a prototype but must be addressed before production use. The backend integration should include JWT-based authentication for API access, role-based access control for sensitive operations (e.g., only project leads can move tasks to Done), encryption at rest for chat histories and insights, HTTPS-only communication with certificate pinning for the mobile client, and rate limiting on all API endpoints to prevent abuse. For the MacBook-resident use case, local authentication can be simplified to a single-user model with Keychain integration on macOS."));

  // 12. ACTION ITEMS
  children.push(h1("12. Priority Action Items for Ptah"));
  children.push(body("Based on the specification above, the following action items are prioritized in order of dependency and impact. Each item includes the specific API endpoints and data structures involved, making it straightforward to implement incrementally."));

  children.push(makeTable(
    ["Priority", "Action", "API Endpoints", "Depends On"],
    [
      ["P0", "Set up FastAPI project + SQLite schema", "Core infrastructure", "None"],
      ["P0", "Implement Projects CRUD API", "GET/POST/PATCH/DELETE /api/projects", "P0 schema"],
      ["P0", "Implement Tasks CRUD API", "GET/POST/PATCH/DELETE /api/tasks", "P0 schema"],
      ["P1", "Replace hardcoded data with API fetch", "All GET endpoints", "P0 APIs"],
      ["P1", "Implement WebSocket for real-time updates", "WS /ws/projects/:id", "P0 APIs"],
      ["P1", "Implement Agent Chat API with LLM", "POST /api/agents/:id/chat", "P0 schema"],
      ["P2", "Implement dynamic insight generation", "POST /api/agents/:id/insights", "P1 chat"],
      ["P2", "Add JWT authentication", "All endpoints + /api/auth", "P0 schema"],
      ["P2", "Build macOS local service wrapper", "Full stack packaging", "P1 all"],
      ["P3", "Add analytics and reporting endpoints", "GET /api/stats/*", "P1 APIs"],
      ["P3", "Implement multi-user support", "All endpoints + user schema", "P2 auth"],
    ]
  ));

  return children;
}

// ─── ASSEMBLE DOCUMENT ───
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 280, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: P.primary },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  sections: [
    // Cover
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCover(),
    },
    // Body
    {
      properties: {
        page: {
          margin: { top: 1417, bottom: 1417, left: 1701, right: 1417 },
          pageNumbers: { start: 1 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Kanban Command - Technical Specification", size: 16, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Digital Assets Studio  |  Confidential  |  Page ", size: 16, color: P.secondary }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: P.secondary }),
            ],
          })],
        }),
      },
      children: buildBody(),
    },
  ],
});

// ─── EXPORT ───
const OUTPUT = "/home/z/my-project/download/Kanban-Command-Technical-Specification.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUTPUT, buf);
  console.log("Document generated: " + OUTPUT);
});
