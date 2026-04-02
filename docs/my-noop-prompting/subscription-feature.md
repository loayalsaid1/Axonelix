# Subscription.. 
## Overview
### Usual Initial Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.

### Known points
- Hierarchy of materials: Modules > Subjects (theoritical/practical) > Chapters > Lessons
- flashcards, questions are linked to lessons
- you can generate quizzes based on any level or mix of levels of the hierarchy.. in other words questions of all lessons and chapters of the chosen hierarchy level ..etc
- subscription is on module level (access to all content of the module)

### Intended overall system behvaiour
- acccess based on modules user have access to.. in eveything..
- user purchase a module.. now he can interact and view it's content 



### Implementation details overview  Draft.... .. (yes, details & overview.. I like it this way!)
After a ton of pondering.. and searching.. and given the context and complixity of the system.. I choosed initally the following.. and waiting for further confirmation..
- all tables now have a .. let's say.. boundry or tanent key.. which is `module_id`
- I check access based on that
- I attatch user accessable moduleIds to the user object in the request...


## Backend Implementation
### Backend data model plan

#### New tables
1. `user_module_access`
- id (pk)
- user_id (fk users.id)
- module_id (fk modules.id)
- source (default `manual_payment`)
- granted_by (admin user id, nullable)
- granted_at (default now)
<!-- - expires_at (nullable) -->
- revoked_at (nullable)
- unique active index on (user_id, module_id) where revoked_at is null
- index on (module_id, user_id)

2. `module_payment_requests`
- id (pk)
- user_id, module_id
- status enum: pending, approved, rejected, canceled
- proof_image_id (fk images.id nullable)
- submit_note
- review_note
- reviewed_by, reviewed_at
- created_at, updated_at (on update now!)
- partial unique index to block multiple pending requests per same user+module

3. `module_payment_request_events` (audit log)
- id (pk)
- payment_request_id
- from_status, to_status
- actor_user_id
- note
- created_at

#### Enum updates
- Extend image entity type with `payment_proof`.
- Add `payment_request_status` enum.

#### Denormalization (recommended)
Add `module_id` to:
- chapters
- lessons
- questions

Then:
- backfill existing rows
- set not null
- add indexes
- add sync triggers to prevent drift

Reason:
- this makes access filters very cheap and avoids deep repeated joins in high-read endpoints.

---
### Structure
```text
src/modules/subscriptions/
  subscriptions.module.ts
  subscriptions.service.ts
  subscriptions.controller.ts                # student endpoints
  admin-subscriptions.controller.ts          # admin moderation endpoints
  dto/
    create-payment-request.dto.ts
    review-payment-request.dto.ts
    list-payment-requests.dto.ts
    grant-user-module-access.dto.ts
  utils/
    access-condition.ts                      # shared SQL condition helpers
```

### 4. API Contract

#### Student Endpoints:
1. `GET /api/materials/modules` (Modified) - Returns modules with ownership status for current user (`access.status`)
2. `POST /api/subscriptions/payment-requests` - Body: `moduleId`, `proofImageId`, `submitNote`. Creates pending request.
3. `GET /api/subscriptions/payment-requests/me` - List my requests
4. `GET /api/subscriptions/my-modules` - List granted module ids/details

#### Admin Endpoints (Role.Admin):
1. `GET /api/admin/subscriptions/payment-requests` - Filter by status, moduleId, userId, date range.
2. `GET /api/admin/subscriptions/payment-requests/:id` - Includes proof image and event history.
3. `PATCH /api/admin/subscriptions/payment-requests/:id/review` - Body: action (approve/reject), reviewNote. Approves and creates/upserts `user_module_access` in same transaction. Writes audit event.
4. `POST /api/admin/subscriptions/user-access/grant` - Manual admin grant fallback.
5. `DELETE /api/admin/subscriptions/user-access/:userId/:moduleId` - Soft revoke (set revokedAt).


### 5. Authorization Enforcement
**Core rule:** Authenticated student can read or generate content only if `user_module_access` exists for the target `moduleId`.

1. **Materials:** In lessons/chapters reads, filter by `moduleId` in SQL.
2. **Questions:** All operations and direct fetching is pretty much restricted to admins.. users just 
3. **Quizzes:** In `quizzes.service.ts`, enforce `moduleIds` is a subset of owned modules.
4. **Admin Bypass:** Admins skip subscription gating.
5. **Direct Resource Access:** Things like the CRUD of quizzes or quiz session or futher, the flashcards are depending on owndership anyways.. just like quiz after the generation par

#### Verdict for old exams
If we will make quesitons controller for admin.. we need (should have done from the start) created a specific oldexams/:id/questions. and let it create a old exam service method for that matter and it may delege logic to teh find all generic function in teh questions service 
and in this controller endpoint we mark it as for studnets as well.. and we check accessability based on moduleId in this case 

### 6. Payment Proof Upload Flow
Reuse existing ImageKit flow:
1. Client gets imagekit auth from `GET /api/images/imagekit_auth`.
2. Client uploads to ImageKit.
3. Client records image via `POST /api/images`.
4. On create payment request, attach the `imagekitFileId` and the backend marks the image as committed to entity type `'payment_proof'`.

### 7. Transaction Rules (Admin Approval)
Approve payment request must be atomic:
1. Lock request row for update.
2. Verify status is 'pending'.
3. Set status 'approved' + `reviewedBy`/`reviewedAt`.
4. Upsert `user_module_access`.
5. Write event log.
6. Commit.


## Front-end (Won't be implemented now): 
### Modules Hierarchy in the library sidebar and quiz generation filters
Group Top Section (My Modules): Shows everything with access.status === 'owned'.
Group Bottom Section (Available to Purchase): Shows access.status === 'locked'. Render these cards with a slightly grayed-out background or a small 🔒 icon.

**For Quiz generation filtesr **
- Disable the checkboxes for locked modules.
- Add a (Locked 🔒) badge and a tooltip: "Purchase this module to include its questions."

### Lesson page
Frontend Paywall Component: Instead of throwing a generic "404 Not Found" or empty error boundary, the Next.js frontend catches this specifically and mounts a <Paywall /> barrier:
Header: "This lesson is part of the Cardiology module."
Body: "It looks like you haven't purchased this module yet."
Button: [ Unlock Now ] (taking him to modules or billing of whatever)

---

## Principal Revision (Backend-First, Clean and SOLID)

This section supersedes the execution strategy in the draft above.

### A. What the current backend already gives us

1. Global auth and role guards are already active and reliable.
2. Material hierarchy is normalized as Modules -> Subjects -> Chapters -> Lessons.
3. Quiz filtering already has a flattened question ancestry view (`vw_question_ancestry`) with `module_id`, which is ideal for access gating.
4. Image upload lifecycle already supports pending/committed/deleted state and can be reused for payment proof with one enum extension.

### B. Architectural decisions (revised)

1. **Introduce subscriptions as a dedicated feature module** (`src/modules/subscriptions`) with student and admin controllers.
2. **Keep access policy in services, not only controllers**. Controllers should parse and delegate; services enforce business rules.
3. **Do not denormalize chapters/lessons/questions with `module_id` in phase 1**.
4. **Use existing hierarchy joins and `vw_question_ancestry` first**, then denormalize only if production telemetry proves a performance need.
5. **Represent ownership as active grants** in `user_module_access` (`revoked_at IS NULL`).
6. **Use explicit transaction boundaries** for payment review (approve/reject) and grant/revoke operations.
7. **Admin bypass remains role-based** and explicit in access helper functions.

### C. Final backend domain model

#### New enum

1. `payment_request_status`: `pending | approved | rejected | canceled`
2. Extend `image_entity_type` with: `payment_proof`

#### New tables

1. `user_module_access`
- `id` serial pk
- `user_id` int not null fk users(id)
- `module_id` int not null fk modules(id)
- `source` varchar not null default `manual_payment`
- `granted_by` int null fk users(id)
- `granted_at` timestamp not null default now
- `revoked_at` timestamp null
- partial unique index: `(user_id, module_id)` where `revoked_at is null`
- index: `(module_id, user_id)`

2. `module_payment_requests`
- `id` serial pk
- `user_id` int not null fk users(id)
- `module_id` int not null fk modules(id)
- `status` payment_request_status not null default `pending`
- `proof_image_id` uuid null fk images(id)
- `submit_note` text null
- `review_note` text null
- `reviewed_by` int null fk users(id)
- `reviewed_at` timestamp null
- `created_at` timestamp not null default now
- `updated_at` timestamp not null default now with update trigger semantics
- partial unique index: one pending request per `(user_id, module_id)`

3. `module_payment_request_events`
- `id` serial pk
- `payment_request_id` int not null fk module_payment_requests(id)
- `from_status` payment_request_status null
- `to_status` payment_request_status not null
- `actor_user_id` int not null fk users(id)
- `note` text null
- `created_at` timestamp not null default now

### D. Module structure

```text
src/modules/subscriptions/
  subscriptions.module.ts
  subscriptions.service.ts
  subscriptions-access.service.ts
  subscriptions.controller.ts
  admin-subscriptions.controller.ts
  dto/
    create-payment-request.dto.ts
    review-payment-request.dto.ts
    list-payment-requests.dto.ts
    grant-user-module-access.dto.ts
    revoke-user-module-access.dto.ts
```

### E. API contract (backend)

#### Student

1. `GET /api/materials/modules`
- Returns list with computed ownership marker for current user:
  - `accessStatus: "owned" | "locked"`

2. `POST /api/subscriptions/payment-requests`
- Body: `moduleId`, `proofImageId?`, `submitNote?`
- Rules:
  - module must exist
  - no active ownership for same module
  - no second pending request for same module

3. `GET /api/subscriptions/payment-requests/me`
- Paginated user request history

4. `GET /api/subscriptions/my-modules`
- Owned module ids and basic module metadata

#### Admin

1. `GET /api/admin/subscriptions/payment-requests`
- Filter by status/module/user/date

2. `GET /api/admin/subscriptions/payment-requests/:id`
- Includes proof image + event timeline

3. `PATCH /api/admin/subscriptions/payment-requests/:id/review`
- Body: `action: "approve" | "reject"`, `reviewNote?`
- Atomic transactional behavior

4. `POST /api/admin/subscriptions/user-access/grant`
- Manual grant fallback

5. `DELETE /api/admin/subscriptions/user-access/:userId/:moduleId`
- Soft revoke by setting `revoked_at`

### F. Access enforcement strategy (service-level)

#### Core policy

Student can access only resources whose resolved module is in active grants.

#### Enforcement points

1. Materials services:
- modules list with ownership state
- subject/chapter/lesson reads filtered by owned modules
- direct lesson/chapter fetch validates ownership before returning payload

2. Quiz services:
- requested `moduleIds` must be subset of owned modules
- if no `moduleIds` provided, auto-scope to owned modules
- `count` endpoint uses same ownership scope rules

3. Questions and old-exams reads:
- student paths filtered to owned modules
- admin remains unrestricted

4. Direct resource access:
- any endpoint taking ids must re-resolve module ownership server-side
- never trust client-provided hierarchy ids

### G. Request user context strategy (important)

Do not mutate persisted user records with ownership fields.

Use request-level context:

1. Keep `request.user` as canonical DB user.
2. Add optional request property for computed ownership snapshot:
- `ownedModuleIds?: number[]`
3. Compute lazily in subscriptions access service and cache for request lifetime.

This avoids global auth-guard N+1 behavior while keeping controller/service code clean.

### H. Transaction design (admin review)

Approve review transaction:

1. Lock payment request row (`FOR UPDATE`).
2. Validate current status is `pending`.
3. Update request -> `approved`, `reviewed_by`, `reviewed_at`, `review_note`.
4. Upsert active grant in `user_module_access`.
5. Insert event row in `module_payment_request_events`.
6. Commit.

Reject review transaction:

1. Lock request row.
2. Validate `pending`.
3. Update status -> `rejected` with reviewer fields.
4. Insert event row.
5. Commit.

### I. Execution plan with gates (step-by-step)

#### Step 1: Schema and migrations

Implement:
1. New enum and three new tables.
2. Extend `image_entity_type` with `payment_proof`.
3. Add indexes and partial unique constraints.
4. Add relations and schema exports.

Review before moving on:
1. Migration is reversible and idempotent enough for dev workflow.
2. Existing tables unaffected by default values and nullable strategy.
3. Drizzle schema compiles and app boots.

Exit criteria:
1. `pnpm run db:generate` succeeds.
2. `pnpm run db:migrate` succeeds on a clean dev database.

#### Step 2: Subscriptions module skeleton

Implement:
1. Create module, controllers, services, dto files.
2. Wire module into app module imports.
3. Add typed DTO validation and role decorators.

Review before moving on:
1. No circular dependency introduced.
2. Controllers are thin and services own business logic.
3. DTOs enforce input invariants.

Exit criteria:
1. Backend builds and routes are reachable.
2. OpenAPI/decorator metadata remains consistent.

#### Step 3: Student flows

Implement:
1. Create payment request endpoint.
2. My requests endpoint.
3. My modules endpoint.
4. Materials modules list ownership projection.

Review before moving on:
1. Duplicate pending requests prevented.
2. Already-owned module request blocked.
3. Proof image ownership and status validation enforced.

Exit criteria:
1. End-to-end manual test passes for create/list flows.
2. Correct status codes for invalid states.

#### Step 4: Admin moderation flows

Implement:
1. List and detail payment requests.
2. Review approve/reject endpoint with transaction.
3. Manual grant and revoke endpoints.
4. Event log insertion.

Review before moving on:
1. Approval is atomic.
2. Second review on non-pending request is rejected.
3. Grant upsert and revoke behavior is idempotent.

Exit criteria:
1. Transactional integrity validated with concurrent review test.
2. Event timeline always reflects transition history.

#### Step 5: Authorization enforcement rollout

Implement:
1. Access helper service (`hasModuleAccess`, `assertModuleAccess`, `ownedModuleIds`).
2. Inject into materials/quiz/questions/old-exams read paths.
3. Admin bypass path remains explicit.

Review before moving on:
1. No endpoint leaks locked content by direct id.
2. Quiz count/generate and filter endpoints share same ownership scope.
3. Error semantics are consistent (`403` vs `404`) based on policy.

Exit criteria:
1. Student cannot access locked lesson/question/old-exam paths.
2. Student can fully access owned modules.

#### Step 6: Image proof finalization

Implement:
1. Allow image commit with `payment_proof` entity type.
2. On payment request creation, attach proof image and mark committed.
3. Ensure orphan cleanup still works.

Review before moving on:
1. No regression for existing lesson/question/explanation image flows.
2. Proof images cannot be reassigned across users unexpectedly.

Exit criteria:
1. Payment proof lifecycle tested from upload to request creation.

#### Step 7: Testing and hardening

Implement:
1. Add e2e tests for critical happy and denial paths.
2. Add unit tests for access helper and review transaction logic.
3. Add API docs updates.

Review before moving on:
1. Unauthorized access scenarios are covered.
2. Concurrency edge cases are covered for admin review.

Exit criteria:
1. Build, lint, and test are green.

### J. Final review checklist (before declaring done)

1. API surface stable and REST-consistent.
2. Business invariants enforced in DB + service layer.
3. No security bypass through optional filters.
4. No circular dependencies in module graph.
5. Error responses are deterministic and documented.
6. Migration and rollback path tested on dev database.
7. Frontend can detect locked content deterministically via response shape/status.

### K. Post-release optimization decision

Only after telemetry:

1. If high read latency appears on hierarchy-gated endpoints, add controlled denormalization (`module_id` on chapters/lessons/questions) in phase 2.
2. Backfill + trigger sync + not-null hardening should be done as a separate migration series, not mixed with subscription launch.
