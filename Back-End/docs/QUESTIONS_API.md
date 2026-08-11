# Questions API

Covers questions, old exams, and universities.  
All endpoints are prefixed with `/api`.

---

## Questions

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/questions` | Create a question (with MCQ options in one request) |
| `GET` | `/questions` | List questions with simple query-param filters |
| `GET` | `/questions/:id` | Get a single question with its options |
| `PATCH` | `/questions/:id` | Update a question (and optionally replace its options) |
| `DELETE` | `/questions/:id` | Delete a question |
| `POST` | `/questions/filter` | Advanced hierarchy-scoped filter with pagination |
| `POST` | `/questions/filter/ids` | Same filter but returns only IDs — for quiz generation |

---

### Create Question

```json
POST /api/questions
{
  "questionType": "mcq",
  "statement": "What is the primary pacemaker of the heart?",
  "statementFormat": "text",
  "lessonId": 12,
  "isMisc": false,
  "options": [
    { "optionText": "SA node",  "isCorrect": true  },
    { "optionText": "AV node",  "isCorrect": false },
    { "optionText": "Bundle of His", "isCorrect": false },
    { "optionText": "Purkinje fibers", "isCorrect": false }
  ]
}
```

For a written question (no options needed):
```json
{
  "questionType": "written",
  "statement": "Describe the Frank-Starling mechanism.",
  "statementFormat": "text",
  "lessonId": 12
}
```

For a **misc** question attached directly to a chapter (not a lesson):
```json
{
  "questionType": "mcq",
  "statement": "...",
  "chapterId": 5,
  "isMisc": true,
  "options": [...]
}
```

**Field reference:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `questionType` | `"mcq"` \| `"written"` | ✅ | |
| `statement` | `string` | ✅ | |
| `statementFormat` | `"text"` \| `"tiptap_json"` | — | defaults to `"text"` |
| `explanation` | `object` \| `string` | — | TipTap JSON by default, or raw HTML when `explanationIsLegacyFormat` is `true` |
| `explanationIsLegacyFormat` | `boolean` | — | Marks the explanation as legacy HTML content |
| `lessonId` | `number` | — | Required if not misc / not old exam |
| `chapterId` | `number` | — | Required for misc questions |
| `isMisc` | `boolean` | — | defaults to `false` |
| `oldExamId` | `number` | — | Links question to an old exam |
| `options` | `QuestionOptionInput[]` | — | Required when `questionType = "mcq"` |

> **DB constraint:** At least one of `lessonId`, `chapterId`, or `oldExamId` must be set.

---

### Response shape

`GET /api/questions/:id` and all create/update responses return:

```json
{
  "id": 1,
  "questionType": "mcq",
  "statement": "What is the primary pacemaker of the heart?",
  "statementFormat": "text",
  "explanation": null,
  "lessonId": 12,
  "chapterId": null,
  "isMisc": false,
  "oldExamId": null,
  "createdAt": "2026-02-23T...",
  "updatedAt": "2026-02-23T...",
  "questionOptions": [
    { "id": 1, "optionText": "SA node",  "isCorrect": true  },
    { "id": 2, "optionText": "AV node",  "isCorrect": false },
    { "id": 3, "optionText": "Bundle of His", "isCorrect": false },
    { "id": 4, "optionText": "Purkinje fibers", "isCorrect": false }
  ]
}
```

---

### Simple List — `GET /api/questions`

Query params (all optional):

| Param | Type | Description |
|-------|------|-------------|
| `lessonId` | `number` | Questions for a specific lesson |
| `chapterId` | `number` | Questions for a specific chapter |
| `oldExamId` | `number` | Questions belonging to a specific old exam |
| `questionType` | `"mcq"` \| `"written"` | Filter by type |
| `isMisc` | `"true"` \| `"false"` | Filter misc questions |
| `page` | `number` | defaults to `1` |
| `limit` | `number` | defaults to `40` |

**Example:**
```
GET /api/questions?lessonId=12&questionType=mcq&page=1&limit=40
```

**Paginated response shape:**
```json
{
  "data": [...],
  "total": 84,
  "page": 1,
  "limit": 40,
  "totalPages": 3
}
```

---

### Update Question — `PATCH /api/questions/:id`

All fields are optional. Omitting `options` leaves existing options untouched.  
Passing `options: []` deletes all options. Passing a new array replaces the full set.

```json
PATCH /api/questions/1
{
  "statement": "Updated statement text",
  "options": [
    { "optionText": "SA node",  "isCorrect": true  },
    { "optionText": "AV node",  "isCorrect": false }
  ]
}
```

---

### Advanced Filter — `POST /api/questions/filter`

Supports hierarchy-scoped filtering and pagination. Only the joins required by the active filters are executed.

**Query params:** `page` (default `1`), `limit` (default `40`)

**Body — `QuestionFilterDto`:**

| Field | Type | Description |
|-------|------|-------------|
| `moduleIds` | `number[]` | Scope to all questions reachable within these modules |
| `moduleType` | `"theoretical"` \| `"practical"` | Further narrows subjects when used with `moduleIds` |
| `subjectIds` | `number[]` | Scope to all questions reachable within these subjects |
| `chapterIds` | `number[]` | All misc + lesson questions within these chapters |
| `lessonIds` | `number[]` | Direct lesson match — no joins needed |
| `questionType` | `"mcq"` \| `"written"` | |
| `isMisc` | `boolean` | |
| `oldExamId` | `number` | |

#### Filter examples

**All questions in a module:**
```json
{ "moduleIds": [3] }
```

**Theoretical subjects of a module only:**
```json
{ "moduleIds": [3], "moduleType": "theoretical" }
```

**Specific subjects (skip module join entirely):**
```json
{ "subjectIds": [10, 11, 14] }
```

**Specific chapters (only lessons join added):**
```json
{ "chapterIds": [20, 21] }
```
> Returns both misc questions pinned to the chapter and questions inside any of its lessons.

**Specific lessons (zero joins — fastest):**
```json
{ "lessonIds": [100, 101, 105] }
```

**Combined — MCQ only from a subject:**
```json
{ "subjectIds": [10], "questionType": "mcq", "isMisc": false }
```

**Response shape:** same paginated envelope as the simple list.

---

### Filter IDs — `POST /api/questions/filter/ids`

Same body as `/filter`. Returns only IDs — no pagination, intended for quiz generation.

```json
POST /api/questions/filter/ids
{ "moduleIds": [3], "moduleType": "theoretical", "questionType": "mcq" }
```

Response:
```json
{
  "ids": [1, 4, 7, 12, 99],
  "total": 5
}
```

---

## Old Exams

Old exams are immutable exam sets identified by: `module + moduleType + university + year + examType`.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/questions/old-exams` | Create an old exam record |
| `GET` | `/questions/old-exams` | List old exams with optional filters |
| `GET` | `/questions/old-exams/:id` | Get a single old exam (includes module & university) |
| `PATCH` | `/questions/old-exams/:id` | Update an old exam record |
| `DELETE` | `/questions/old-exams/:id` | Delete an old exam record |

---

### Create Old Exam

```json
POST /api/questions/old-exams
{
  "examType": "final",
  "moduleId": 3,
  "moduleType": "theoretical",
  "universityId": 1,
  "year": 2023
}
```

**Exam types:** `final` | `midterm` | `tpl` | `flipped`  
**Module types:** `theoretical` | `practical`

---

### List Old Exams — `GET /api/questions/old-exams`

Query params (all optional):

| Param | Type | Description |
|-------|------|-------------|
| `moduleId` | `number` | |
| `universityId` | `number` | |
| `year` | `number` | |
| `examType` | `string` | `final` \| `midterm` \| `tpl` \| `flipped` |
| `moduleType` | `string` | `theoretical` \| `practical` |

**Typical user flow** — populate the QBank old-exams picker:
1. `GET /api/questions/old-exams?moduleId=3` — get all exams for the selected module
2. Narrow by `universityId` or `year` as the user makes selections
3. Fetch questions: `GET /api/questions?oldExamId=7`

**Response includes joined `module` and `university` objects:**
```json
{
  "id": 7,
  "examType": "final",
  "moduleType": "theoretical",
  "year": 2023,
  "module": { "id": 3, "name": "Cardiology" },
  "university": { "id": 1, "name": "Cairo University" },
  "createdAt": "2026-02-23T..."
}
```

---

## Universities

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/questions/universities` | Add a university |
| `GET` | `/questions/universities` | List all universities (alphabetical) |
| `GET` | `/questions/universities/:id` | Get a single university |
| `DELETE` | `/questions/universities/:id` | Delete a university |

### Create University

```json
POST /api/questions/universities
{ "name": "Cairo University" }
```

Response:
```json
{ "id": 1, "name": "Cairo University", "createdAt": "2026-02-23T..." }
```
