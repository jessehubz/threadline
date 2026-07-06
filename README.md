# Threadline

A production-ready, collaborative task management SaaS where the core organizing structure is a **visual dependency graph** instead of a flat to-do list.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma, Clerk, React Flow, Pusher, Vercel Blob, Resend, and Recharts.

![Threadline](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Core Graph Editor
- **Infinite canvas** — Pannable, zoomable workspace for organizing tasks visually
- **Dependency connections** — Draw directed edges between nodes to define task dependencies
- **Cycle detection** — DFS-based algorithm prevents circular dependencies in real-time
- **Custom task nodes** — Color-coded nodes showing status, assignees, due dates, and progress
- **Folder nodes** — Special nodes that contain sub-graphs for organizing large projects
- **Nested sub-graphs** — Double-click folders to enter sub-graphs with breadcrumb navigation
- **Auto-derived parent status** — Parent node status reflects sub-graph progress automatically
- **Minimal controls** — Subtle zoom/recenter controls, small dark minimap in top-right

### Color Coding
- **Status-based colors** — Automatic color coding by task status (gray/blue/red/amber/green)
- **Custom color override** — Pick a custom color for any node via preset swatches

### AI Assistant
- **Smart graph generator** — Describe your project in plain text and generate a full dependency graph
- **Pre-built templates** — Web App, Marketing Campaign, Event Planning, Product Launch, Mobile App, Research Paper, Design Project
- **Intelligent parser** — Splits descriptions into logical tasks with sensible dependencies
- **No API key needed** — Works entirely offline with template + heuristic-based generation

### Collaboration
- **Real-time sync** — Live updates via Pusher when collaborators make changes
- **Presence indicators** — See who's viewing the same graph in real-time
- **Role-based access** — Owner, Editor, and Viewer permission levels
- **Share button (Google Docs style)** — Copy view/edit links, invite by email
- **Public share links** — Anonymous viewing without sign-in, editing requires authentication
- **Team management** — Invite members by email with role assignment

### Task Management
- **Full CRUD** — Create, edit, delete nodes and connections at any time
- **Assign people** — Multi-member assignment with approver designation
- **Rich task details** — Title, description, status, due date, assignees, attachments, custom color
- **6 status types** — Not Started, In Progress, Blocked, Awaiting Approval, Rejected, Complete
- **Dependency enforcement** — Tasks can't complete until upstream dependencies are done
- **Approval workflow** — Submit for approval, reviewer can approve or reject with reason

### Deadlines
- **Global "My Tasks" page** — See all assigned tasks across projects, grouped by due date
- **In-graph deadlines panel** — Collapsible panel showing upcoming deadlines for current graph
- **Click-to-focus** — Click any deadline to select and focus that node on canvas

### File Attachments
- **Vercel Blob storage** — Upload images, PDFs, documents as proof of completion
- **Drag-and-drop** — Easy file upload in the task detail panel
- **10MB limit** — Supports images, PDFs, Word docs, and text files

### Analytics
- **Completion rate over time** — Line chart showing daily/weekly progress
- **Status breakdown** — Pie chart of current task distribution
- **Workload per person** — Bar chart showing task assignment balance
- **Overdue tracking** — List of tasks past their due date

### Notifications
- **In-app notifications** — Bell icon with unread count and dropdown
- **Email notifications** — Via Resend for assignments, approvals, rejections, due dates
- **Notification preferences** — Toggle email notifications per type in settings
- **Real-time delivery** — Pusher events update notification count without refresh

### Polish
- **Dark mode** — System, light, or dark theme preference
- **Loading skeletons** — Professional loading states on every page
- **Empty states** — Helpful CTAs when no data exists
- **Toast notifications** — Success/error feedback on every action
- **Responsive design** — Mobile sidebar, stacked layouts on small screens
- **Error boundaries** — Friendly error pages with retry options

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL via Prisma 7 |
| Auth | Clerk |
| Graph Canvas | React Flow (@xyflow/react 12) |
| Real-time | Pusher Channels |
| File Storage | Vercel Blob |
| Email | Resend |
| Charts | Recharts |
| Validation | Zod |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (Neon recommended — free tier)
- Clerk account (https://clerk.com)
- Pusher account (https://pusher.com)
- Resend account (https://resend.com)
- Vercel account (https://vercel.com) with Blob storage

### 1. Clone & Install

```bash
git clone <repository-url>
cd kiro-todo-v5
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values. See `.env.example` for all required variables.

### 3. Database Setup

```bash
npx prisma db push    # Sync schema to database
npx prisma generate   # Generate client
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Deployment on Vercel

1. Push to GitHub
2. Import at https://vercel.com/new
3. Add all env vars from `.env.example`
4. Deploy — Vercel handles the rest

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run db:push     # Push schema to DB
npm run db:studio   # Open Prisma Studio
```

## License

MIT
