# Untangle

A production-ready, collaborative task management SaaS where the core organizing structure is a **visual dependency graph** instead of a flat to-do list.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma, Clerk, React Flow, Pusher, Vercel Blob, Resend, and Recharts.

![Untangle](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Core Graph Editor
- **Infinite canvas** — Pannable, zoomable workspace for organizing tasks visually
- **Dependency connections** — Draw directed edges between nodes to define task dependencies
- **Cycle detection** — DFS-based algorithm prevents circular dependencies in real-time
- **Custom task nodes** — Rich nodes showing status, assignees, due dates, and progress
- **Nested sub-graphs** — Any task can contain its own sub-graph with breadcrumb navigation
- **Auto-derived parent status** — Parent node status reflects sub-graph progress automatically

### Collaboration
- **Real-time sync** — Live updates via Pusher when collaborators make changes
- **Presence indicators** — See who's viewing the same graph in real-time
- **Role-based access** — Owner, Editor, and Viewer permission levels
- **Public share links** — Anonymous viewing without sign-in, editing requires authentication
- **Team management** — Invite members by email with role assignment

### Task Management
- **Full CRUD** — Create, edit, delete nodes and connections at any time
- **Rich task details** — Title, description, status, due date, assignees, attachments
- **6 status types** — Not Started, In Progress, Blocked, Awaiting Approval, Rejected, Complete
- **Dependency enforcement** — Tasks can't complete until upstream dependencies are done
- **Approval workflow** — Submit for approval, reviewer can approve or reject with reason

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
- PostgreSQL database (or Vercel Postgres / Neon)
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

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (with pgbouncer for pooling) |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection (for migrations) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `PUSHER_APP_ID` | Pusher app ID |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher public key |
| `PUSHER_SECRET` | Pusher secret key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (e.g., `us2`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., `http://localhost:3000`) |

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (requires DIRECT_DATABASE_URL)
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Clerk Setup

1. Create a Clerk application at https://dashboard.clerk.com
2. Copy the publishable and secret keys to `.env.local`
3. Set up a webhook endpoint pointing to `<your-url>/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook signing secret to `CLERK_WEBHOOK_SECRET`

### 5. Pusher Setup

1. Create a Channels app at https://dashboard.pusher.com
2. Enable client events
3. Copy the app ID, key, secret, and cluster to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Deployment on Vercel

### 1. Connect Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework preset: Next.js (auto-detected)

### 2. Add Environment Variables

Add all variables from `.env.example` in the Vercel dashboard under Settings → Environment Variables.

### 3. Database

Option A: **Vercel Postgres** (recommended)
- Add from Vercel Marketplace → Storage → Postgres
- Connection strings are auto-injected

Option B: **Neon** or any PostgreSQL provider
- Set `DATABASE_URL` and `DIRECT_DATABASE_URL` manually

### 4. Vercel Blob

- Add from Vercel Marketplace → Storage → Blob
- `BLOB_READ_WRITE_TOKEN` is auto-injected

### 5. Deploy

```bash
git push origin main
```

Vercel will automatically build and deploy. The `postinstall` script runs `prisma generate` during build.

### 6. Post-Deploy

- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Update Clerk webhook URL to your production domain
- Run migrations against production DB if needed

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Authenticated pages (with sidebar layout)
│   │   ├── analytics/      # Analytics page with charts
│   │   ├── dashboard/      # Project listing dashboard
│   │   ├── graph/[id]/     # Graph editor page
│   │   ├── profile/        # User profile
│   │   ├── settings/       # App settings
│   │   └── team/           # Team management
│   ├── api/                # API routes
│   │   ├── attachments/    # File upload/delete
│   │   ├── notifications/  # Notification fetching
│   │   ├── pusher/         # Pusher auth
│   │   ├── upload/         # Vercel Blob upload handler
│   │   └── webhooks/       # Clerk webhook
│   ├── invite/[token]/     # Invite acceptance
│   ├── share/[id]/[token]/ # Public share view
│   ├── sign-in/            # Clerk sign-in
│   └── sign-up/            # Clerk sign-up
├── actions/                # Server Actions (mutations)
│   ├── approval-actions.ts
│   ├── graph-actions.ts
│   ├── project-actions.ts
│   ├── team-actions.ts
│   └── user-actions.ts
├── components/             # React components
│   ├── graph/              # Graph editor components
│   │   ├── collaborator-presence.tsx
│   │   ├── graph-breadcrumbs.tsx
│   │   ├── graph-editor.tsx
│   │   ├── graph-toolbar.tsx
│   │   ├── task-detail-panel.tsx
│   │   └── task-node.tsx
│   ├── ui/                 # Reusable UI primitives
│   └── ...                 # Feature components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and config
│   ├── auth.ts             # Clerk auth helpers
│   ├── graph-utils.ts      # Graph algorithms (cycle detection, etc.)
│   ├── prisma.ts           # Prisma client singleton
│   ├── pusher.ts           # Server-side Pusher
│   ├── pusher-client.ts    # Client-side Pusher
│   ├── resend.ts           # Email client
│   └── utils.ts            # General utilities
└── middleware.ts           # Route protection
```

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run db:migrate  # Run Prisma migrations
npm run db:push     # Push schema to DB (no migration)
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
```

## License

MIT
