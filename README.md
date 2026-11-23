# Axonelix

Axonelix is a medical learning platform for students. It combines a structured study library, a question bank with past exams, generated quizzes, flashcards, a study planner and performance tracking, plus an admin dashboard for managing content, users and subscriptions.

## Features

**For students**

- **Library** – browse material as Modules → Subjects (theoretical / practical) → Chapters → Lessons, with rich-text lesson content.
- **QBank** – practice lesson-linked questions, take old exams (by university, year, exam type and subject), generate custom tests, and review past test sessions.
- **Flashcards** – decks and cards for active recall.
- **Planner** – personal study tasks.
- **Dashboard & performance** – stats, streaks and progress.
- **Subscriptions** – request module access and pay via InstaPay.
- **Themes** – light/dark mode and several color themes.

**For admins**

- CRUD for the materials hierarchy and lessons (Tiptap rich-text editor with images).
- Question and old-exam management, including bulk upload via CSV.
- Flashcards, users, module access and subscription management.
- Analytics.

## Tech stack

| Part | Stack |
|------|-------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Tiptap, React Hook Form + Zod |
| Backend | NestJS 11, TypeScript, Drizzle ORM, PostgreSQL |
| Auth | Clerk (frontend sessions, backend JWT verification, webhooks via Svix) |
| Media | ImageKit |
| Tooling | pnpm, ESLint, Prettier, Jest, Docker |

## Repository structure

```
.
├── Back-End/          NestJS API (served under /api)
│   ├── src/
│   │   ├── common/    guards, decorators, filters, interceptors
│   │   ├── database/  Drizzle schema, entities and relations
│   │   └── modules/   auth, materials, questions, quizzes, flashcards,
│   │                  planner, stats, streaks, subscriptions, users, images
│   ├── drizzle/       SQL migrations
│   └── docs/          API docs (materials, questions, flashcards)
├── Frontend/          Next.js app
│   ├── app/(app)/     student pages (dashboard, library, qbank, flashcards, …)
│   ├── app/admin/     admin dashboard
│   ├── app/api/       Next.js route handlers used by the admin dashboard
│   ├── components/    UI and feature components
│   ├── hooks/         React hooks
│   └── lib/           API clients, services, types and utilities
└── docs/              product and feature design notes
```

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 9 (`corepack enable`)
- A PostgreSQL database
- A [Clerk](https://clerk.com) application
- An [ImageKit](https://imagekit.io) account

### 1. Backend

```bash
cd Back-End
pnpm install
cp .env.example .env   # then fill in the values below
pnpm db:migrate        # apply Drizzle migrations
pnpm start:dev         # http://localhost:4000/api when PORT=4000
```

`Back-End/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port. Use something other than `3000` locally, since the frontend runs on `3000` (e.g. `4000`). |
| `DATABASE_URL` | PostgreSQL connection string. |
| `FRONTEND_URL` | Allowed CORS origin (default `http://localhost:3000`). |
| `CLERK_SECRET_KEY` | Clerk secret key. |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Signing secret of the Clerk webhook endpoint. |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key. |
| `INSTAPAY_HANDLE` | InstaPay handle shown on the payment page. |
| `INSTAPAY_QR_IMAGE_URL` | URL of the InstaPay QR code image. |

Point a Clerk webhook at `<API_URL>/api/auth/clerk/webhook` so users are synced to the database.

### 2. Frontend

```bash
cd Frontend
pnpm install
# create .env.local with the values below
pnpm dev               # http://localhost:3000
```

`Frontend/.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL, e.g. `http://localhost:4000/api`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key. |
| `CLERK_SECRET_KEY` | Clerk secret key. |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit public key. |
| `NEXT_PUBLIC_IMAGEKIT_UPLOAD_FOLDER` | ImageKit folder for uploads. |
| `POSTGRES_URL` | PostgreSQL connection string used by the remaining admin route handlers (`@vercel/postgres`). |

## Scripts

**Back-End**

| Command | Description |
|---------|-------------|
| `pnpm start:dev` | Start in watch mode |
| `pnpm build` / `pnpm start:prod` | Build and run the compiled app |
| `pnpm lint` / `pnpm format` | Lint / format |
| `pnpm test` / `pnpm test:e2e` | Unit / e2e tests |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push the schema directly (dev only) |

**Frontend**

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Build and run in production mode |
| `pnpm lint` | Lint |

## API

The backend exposes a REST API under `/api`, protected by Clerk auth and role guards. Main route groups:

`auth`, `users`, `admin/users`, `materials/{modules,subjects,chapters,lessons}`, `questions`, `questions/old-exams`, `questions/universities`, `quizzes`, `quiz-sessions`, `flashcards`, `planner/tasks`, `streaks`, `users/me/stats`, `subscriptions`, `admin/subscriptions`, `images`.

Detailed docs:

- [Materials API](Back-End/docs/MATERIALS_API.md)
- [Questions API](Back-End/docs/QUESTIONS_API.md)
- [Flashcards API](Back-End/docs/FLASHCARDS_API.md)

## Deployment

- **Backend** – a multi-stage `Dockerfile` builds the app and runs migrations on start. `docker-compose.yml` (production) and `docker-compose.preview.yml` (preview) run it behind an `nginx-proxy` network with Let's Encrypt (`VIRTUAL_HOST`, `LETSENCRYPT_HOST`, `LETSENCRYPT_EMAIL`). A `Procfile` is included for Heroku.
- **Frontend** – a standard Next.js app; deploy to Vercel or any Node host and set the environment variables above.

## Docs

- [App design blueprint](docs/Revised%20App%20Summary.md)
- Feature specs: [`docs/my-noop-prompting`](docs/my-noop-prompting)
