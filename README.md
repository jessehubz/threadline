# Threadline

A production-ready, collaborative task management SaaS where the core organizing structure is a **visual dependency graph** instead of a flat to-do list.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Prisma 7, Clerk, React Flow, Pusher, Vercel Blob, Resend, and Recharts.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![React](https://img.shields.io/badge/React-19-61DAFB) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [License](#license)

---

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

### Task Comments & Media

- **Threaded comments** — Comment on any task node directly in the detail panel
- **Media attachments** — Attach images, PDFs, and documents to individual comments
- **Privacy toggle** — Mark comments as private (visible only to the author and project owner)
- **Real-time updates** — Comments load dynamically and support inline file previews
- **Moderation** — Comment authors can delete their own comments; project owners can delete any

### Messaging

- **Project channels** — Group chat per project for team-wide discussions
- **Direct messages** — 1-on-1 private conversations with any team member
- **Tabbed interface** — Switch between Channels and Direct Messages seamlessly
- **Conversation list** — Sidebar showing all DM conversations with last message preview
- **New conversation flow** — Start a DM with any teammate from a simple picker
- **Real-time delivery** — All messages pushed instantly via Pusher channels

### Profile & Account

- **Profile picture upload** — Upload an avatar via Vercel Blob with instant preview
- **Initials fallback** — Displays initials when no profile picture is set
- **Editable profile** — Update display name and bio
- **Notification preferences** — Toggle email notifications per category in settings
- **Theme selection** — System, light, or dark mode

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
- **Toast notifications** — Success/error feedback on every action (via Sonner)
- **Responsive design** — Mobile sidebar, stacked layouts on small screens
- **Error boundaries** — Friendly error pages with retry options
- **Rate limiting** — Upstash Redis (production) or in-memory fallback (development)
- **Input sanitization** — Defense-in-depth XSS prevention on all user input

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Server Actions) | 16.2 |
| Language | TypeScript | 5 |
| UI Library | React | 19 |
| Styling | Tailwind CSS | 4 |
| Database | PostgreSQL via Prisma (Neon serverless adapter) | Prisma 7.8 |
| Auth | Clerk | 7.5 |
| Graph Canvas | React Flow (@xyflow/react) | 12 |
| Real-time | Pusher Channels + pusher-js | 5.3 / 8.5 |
| File Storage | Vercel Blob | 2.5 |
| Email | Resend + React Email | 6.17 |
| Charts | Recharts | 3.9 |
| Validation | Zod | 4 |
| Rate Limiting | Upstash Redis + Ratelimit | 2.0 |
| Icons | Lucide React | 1.23 |
| Date Utilities | date-fns | 4.4 |
| Deployment | Vercel | — |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (React 19)                 │
│  React Flow Canvas │ Task Panels │ Messaging UI     │
└──────────────┬──────────────────────┬───────────────┘
               │ Server Actions       │ REST API
               ▼                      ▼
┌─────────────────────────────────────────────────────┐
│              Next.js 16 App Router                   │
│  Server Components │ Route Handlers │ Middleware     │
└──────────┬──────────────┬───────────────┬───────────┘
           │              │               │
     ┌─────▼─────┐  ┌────▼────┐   ┌──────▼──────┐
     │  Prisma 7  │  │ Pusher  │   │ Vercel Blob │
     │  (Neon PG) │  │ Server  │   │  (Storage)  │
     └────────────┘  └─────────┘   └─────────────┘
           │
     ┌─────▼──────────────────┐
     │  Clerk (Auth/Webhooks) │
     └────────────────────────┘
```

- **Server Actions** handle mutations with Zod validation, sanitization, and rate limiting
- **Route Handlers** (`/api/*`) serve data fetching for client components
- **Pusher** provides real-time WebSocket delivery for messages, DMs, and collaboration events
- **Prisma** connects to Neon PostgreSQL via the serverless adapter for edge compatibility

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database ([Neon](https://neon.tech) recommended — free tier available)
- [Clerk](https://clerk.com) account (authentication)
- [Pusher](https://pusher.com) account (real-time channels)
- [Resend](https://resend.com) account (transactional email)
- [Vercel](https://vercel.com) account with Blob storage enabled

### 1. Clone & Install

```bash
git clone <repository-url>
cd kiro-todo-v5
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all values — see [Environment Variables](#environment-variables) below.

### 3. Set Up Database

```bash
npx prisma db push    # Sync schema to database
npx prisma generate   # Generate Prisma Client
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create a `.env.local` file with the following:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled, with `pgbouncer=true`) |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection (for migrations) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route (default: `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route (default: `/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Post-login redirect (default: `/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Post-signup redirect (default: `/dashboard`) |
| `PUSHER_APP_ID` | Pusher application ID |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher public key |
| `PUSHER_SECRET` | Pusher secret key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region (e.g., `us2`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g., `http://localhost:3000`) |
| `UPSTASH_REDIS_REST_URL` | *(Optional)* Upstash Redis URL for production rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | *(Optional)* Upstash Redis token |

---

## Database Setup

Threadline uses **Prisma 7** with the **Neon serverless adapter** for PostgreSQL.

```bash
# Push schema to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio

# Seed database (if seed script exists)
npm run db:seed
```

### Data Models

| Model | Purpose |
|-------|---------|
| `User` | Authenticated users with profile and preferences |
| `Project` | Top-level workspace containing graphs and members |
| `ProjectMember` | User–project association with role (Owner/Editor/Viewer) |
| `Graph` | A canvas containing nodes and edges |
| `TaskNode` | Individual task or folder node on a graph |
| `Edge` | Directed dependency between two nodes |
| `TaskAssignment` | User assigned to a task (optionally as approver) |
| `Attachment` | File uploaded to a task node |
| `Comment` | Comment on a task node (supports private visibility) |
| `CommentAttachment` | File attached to a specific comment |
| `CompletionRequest` | Approval workflow request |
| `Conversation` | DM conversation container |
| `ConversationParticipant` | User membership in a conversation |
| `DirectMessage` | Individual message in a DM conversation |
| `Message` | Project channel message |
| `Notification` | In-app notification |
| `Invite` | Pending project invitation |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build with TypeScript checking |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Enable Vercel Blob storage in project settings
5. Deploy — Vercel handles builds, edge functions, and CDN automatically

### Clerk Webhook

Set up a Clerk webhook pointing to `https://your-domain.com/api/webhooks/clerk` to sync user data on sign-up and profile updates.

### Pusher Configuration

Ensure your Pusher app has **client events** disabled and **authorized connections** enabled for the `private-*` channel prefix.

---

## Project Structure

```
kiro-todo-v5/
├── prisma/
│   └── schema.prisma          # Database schema (17 models)
├── src/
│   ├── actions/               # Server Actions (mutations)
│   │   ├── approval-actions.ts
│   │   ├── assignment-actions.ts
│   │   ├── comment-actions.ts
│   │   ├── dm-actions.ts
│   │   ├── graph-actions.ts
│   │   ├── message-actions.ts
│   │   ├── profile-actions.ts
│   │   ├── project-actions.ts
│   │   ├── team-actions.ts
│   │   └── user-actions.ts
│   ├── app/
│   │   ├── (dashboard)/       # Authenticated pages
│   │   │   ├── analytics/
│   │   │   ├── calendar/
│   │   │   ├── dashboard/
│   │   │   ├── graph/[projectId]/
│   │   │   ├── messages/
│   │   │   ├── my-tasks/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── team/
│   │   ├── api/               # Route Handlers
│   │   │   ├── attachments/
│   │   │   ├── comments/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── pusher/
│   │   │   ├── upload/
│   │   │   └── webhooks/
│   │   ├── invite/[token]/
│   │   ├── share/[projectId]/[token]/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── components/
│   │   ├── graph/             # Graph editor components
│   │   │   ├── graph-editor.tsx
│   │   │   ├── task-detail-panel.tsx
│   │   │   ├── task-comments.tsx
│   │   │   ├── ai-assistant-panel.tsx
│   │   │   ├── deadlines-panel.tsx
│   │   │   └── ...
│   │   ├── ui/                # Reusable UI primitives
│   │   ├── file-upload.tsx
│   │   └── profile-form.tsx
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities & configuration
│       ├── auth.ts            # requireUser(), getCurrentUser()
│       ├── prisma.ts          # Prisma client (Neon adapter)
│       ├── pusher.ts          # Pusher server instance
│       ├── pusher-client.ts   # Pusher client (lazy-loaded)
│       ├── rate-limit.ts      # Rate limiters (Redis/memory)
│       ├── sanitize.ts        # Input sanitization
│       ├── graph-utils.ts     # Cycle detection, graph algorithms
│       └── utils.ts           # cn(), status helpers
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Security

- **Authentication** — All routes protected via Clerk middleware; server actions use `requireUser()`
- **Authorization** — Role-based access (Owner/Editor/Viewer) checked on every mutation
- **Input sanitization** — All user-generated content stripped of HTML, script injections, and event handlers before database storage
- **Rate limiting** — Per-user sliding window limits on messages, uploads, and API calls (Upstash Redis in production, in-memory fallback in development)
- **File validation** — Upload size (10MB max) and content-type whitelist enforced server-side
- **Private comments** — Visibility restricted to comment author and project owner only
- **CSRF protection** — Server Actions are inherently CSRF-safe in Next.js App Router

---

## License

MIT
