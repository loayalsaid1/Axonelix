# Quizzes Feature

Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- Auth is already implemented in the codebase – use the existing auth guard and extract `userId` from the JWT/request context as done in other modules.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end.

## Flow

The full quiz lifecycle is:

1. **Generate Quiz** – user picks filters (material scope, question type, question status, count) → `POST /api/quizzes` → backend resolves matching question IDs, creates a `quizzes` row, and auto-creates a `quiz_sessions` row with `status: not_started` → returns `{ quiz, session }` → frontend redirects to `/qbank/session/[session.id]`.
2. **Start Session** – on the session page, user sees an overview and clicks Start → `PATCH /api/quiz-sessions/:sessionId/status` `{ status: 'in_progress' }` → session moves to `in_progress`.
3. **Answer Questions** – all answer selections tracked **locally in the frontend** (`useTestSession` state). Nothing is sent to the server per-question.
4. **Suspend / End Test** – on suspend or end, the frontend batches the full local answer map + metadata and sends it in one request. Backend persists all answers, computes correctness, and (on end) finalises session stats + `score_pct`.

I want to build **first the backend** end-to-end (generate → session → answer → end), then Later after we finish front-end ... the **frontend** generate-test form and the test-taking interface.

---

## Backend

### Module Structure

```
src/modules/
├── quizzes/
│   ├── quizzes.module.ts
│   ├── quizzes.controller.ts        # Generate + quiz lookup
│   ├── quiz-sessions.controller.ts  # Session lifecycle
│   ├── quizzes.service.ts           # Quiz generation logic
│   ├── quiz-sessions.service.ts     # Session + answer logic
│   └── dto/
│       ├── generate-quiz.dto.ts     # Filters + question count
│       ├── quiz-response.dto.ts
│       ├── start-session.dto.ts
│       ├── submit-answer.dto.ts
│       ├── session-response.dto.ts
│       └── end-session-response.dto.ts
```

### Notes on Structure
- DTOs should use **inferred Drizzle types** (same pattern as materials/questions modules) rather than manually duplicating column types.

### API Routes

```
# Quizzes (the template/config)
POST   /api/quizzes          → generate quiz + auto-create a not_started session → returns { quiz, session }
GET    /api/quizzes          → list current user's quizzes (paginated)
GET    /api/quizzes/:id      → get quiz details (with populated questions)
DELETE /api/quizzes/:id      → delete a quiz

GET    /api/quiz-sessions                  → list current user's sessions (paginated, with quiz info)
GET    /api/quiz-sessions/:sessionId       → get session + full answers + populated questions (for resume hydration)
PATCH  /api/quiz-sessions/:sessionId/status  → update session status; body drives behaviour by target status:
                                             { status: 'in_progress' }                         → start/resume; sets startedAt
                                             { status: 'suspended',  answers[], metadata }      → saves answers + metadata
                                             { status: 'completed',  answers[], metadata }      → saves answers, computes stats, sets endedAt
```

Valid status transitions enforced by the backend:
```
not_started → in_progress
suspended   → in_progress   (resume)
in_progress → suspended
in_progress → completed
```

### Frontend Generate → Session Flow

1. User submits the generate form.
2. `POST /api/quizzes` → backend creates the quiz + auto-creates a `quiz_sessions` row (`status: not_started`), returns `{ quiz, session }`.
3. Frontend redirects to `/qbank/session/[sessionId]`.
4. Session page calls `GET /api/quiz-sessions/:sessionId` which returns `{ session, quiz: { ...quiz, questions: [{ ...question, options: [] }] } }` — questions are populated here so no second round-trip is needed.
5. Page renders based on `session.status`:
   - `not_started` → overview (title, question count, scope) + **Start** button.
   - `suspended`   → overview + progress summary from `session.metadata` + **Resume** button.
   - `in_progress` → test interface; if arriving here on a page reload, hydrate `useTestSession` from the answers returned by step 4.
   - `completed`   → results view (read-only).
6. Clicking **Start** / **Resume** calls `PATCH /api/quiz-sessions/:sessionId/status` with `{ status: 'in_progress' }`.



### Design Notes
- **`scope_filter` column** in `quizzes` is a JSONB snapshot of the filters used at generation time – store the raw DTO there for auditability.
- **`question_ids` array** is managed by the DB trigger (`trg_sync_quiz_question_ids`) – never write it directly from app code; insert into `quiz_questions` junction table instead.
- **`questionStatus` filter** (`incorrect_only` / `unread`) requires joining against `v_latest_user_question_status` view – thread the `userId` from the authenticated request context (use the existing `@CurrentUser()` decorator).
- **Session status transitions** are handled by a single `PATCH /api/quiz-sessions/:sessionId/status`. The backend reads `dto.status` to determine the transition and validates it against allowed paths. Side effects are derived from the transition: `in_progress` sets `startedAt`; `suspended`/`completed` upserts answers and metadata; `completed` additionally runs `buildSessionStats()`.
- **`GET /api/quiz-sessions/:sessionId`** must return the session, its answers, and the quiz's full questions (with options) in one response — the session page depends on this single call both for initial load and for hydrating resume state.
- `submit-answer.dto.ts` becomes a single-item shape reused inside the batch array; the PATCH body is `{ status, answers?: AnswerDto[], metadata?: SessionMetadata }`.
- Pagination on list endpoints.

---
