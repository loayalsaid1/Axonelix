# Materials Hierarchy API

This API provides endpoints for managing the learning materials hierarchy: Modules → Subjects → Chapters → Lessons.

## Base URL

All endpoints are prefixed with `/api/materials`

## Modules

Academic modules (e.g., Anatomy, Physiology)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/modules` | Create a new module |
| GET | `/modules` | Get all modules |
| GET | `/modules/:id` | Get a specific module |
| GET | `/modules/:id/hierarchy` | Get module with full hierarchy (includes subjects, chapters, lessons) |
| PATCH | `/modules/:id` | Update a module |
| DELETE | `/modules/:id` | Delete a module |

### Request/Response Examples

#### Create Module
```json
POST /api/materials/modules
{
  "name": "Anatomy",
  "description": "Human anatomy module",
  "orderIndex": 1
}
```

#### Response
```json
{
  "id": 1,
  "name": "Anatomy",
  "description": "Human anatomy module",
  "orderIndex": 1,
  "createdAt": "2026-02-17T...",
  "updatedAt": "2026-02-17T..."
}
```

---

## Subjects

Subjects within modules, categorized as theoretical or practical

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subjects` | Create a new subject |
| GET | `/subjects?moduleId={id}` | Get all subjects (optionally filtered by module) |
| GET | `/subjects/:id` | Get a specific subject |
| GET | `/subjects/:id/chapters` | Get all chapters for a subject |
| PATCH | `/subjects/:id` | Update a subject |
| DELETE | `/subjects/:id` | Delete a subject |

### Request/Response Examples

#### Create Subject
```json
POST /api/materials/subjects
{
  "moduleId": 1,
  "name": "Cardiovascular System",
  "type": "theoretical",
  "description": "Study of the heart and blood vessels",
  "orderIndex": 1
}
```

**Subject Types:** `theoretical` | `practical`

#### Response
```json
{
  "id": 1,
  "moduleId": 1,
  "name": "Cardiovascular System",
  "type": "theoretical",
  "description": "Study of the heart and blood vessels",
  "orderIndex": 1,
  "createdAt": "2026-02-17T...",
  "updatedAt": "2026-02-17T..."
}
```

---

## Chapters

Chapters within subjects

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chapters` | Create a new chapter |
| GET | `/chapters?subjectId={id}` | Get all chapters (optionally filtered by subject) |
| GET | `/chapters/:id` | Get a specific chapter |
| GET | `/chapters/:id/lessons` | Get all lessons for a chapter |
| PATCH | `/chapters/:id` | Update a chapter |
| DELETE | `/chapters/:id` | Delete a chapter |

### Request/Response Examples

#### Create Chapter
```json
POST /api/materials/chapters
{
  "subjectId": 1,
  "name": "The Heart",
  "description": "Structure and function of the heart",
  "isMiscellaneous": false,
  "orderIndex": 1
}
```

#### Response
```json
{
  "id": 1,
  "subjectId": 1,
  "name": "The Heart",
  "description": "Structure and function of the heart",
  "isMiscellaneous": false,
  "orderIndex": 1,
  "createdAt": "2026-02-17T...",
  "updatedAt": "2026-02-17T..."
}
```

---

## Lessons

Lessons within chapters, containing TipTap JSON content

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lessons` | Create a new lesson |
| GET | `/lessons?chapterId={id}` | Get all lessons (optionally filtered by chapter) |
| GET | `/lessons/:id` | Get a specific lesson with full hierarchy |
| GET | `/lessons/:id/questions` | Get all questions for a lesson |
| PATCH | `/lessons/:id` | Update a lesson |
| DELETE | `/lessons/:id` | Delete a lesson |

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Lesson title |
| `chapterId` | number | Conditional | Required when not creating a misc lesson |
| `subjectId` | number | Conditional | Required when `isMisc` is `true` |
| `isMisc` | boolean | ❌ | When `true` and no `chapterId` provided, the lesson is placed in the subject's misc chapter (created automatically if it doesn't exist) |
| `description` | string | ❌ | Short description |
| `content` | object | ❌ | TipTap JSON content |
| `orderIndex` | number | ❌ | Display order within the chapter |

### Request/Response Examples

#### Create Lesson under a specific chapter
```json
POST /api/materials/lessons
{
  "chapterId": 1,
  "name": "Cardiac Chambers",
  "description": "Atria and ventricles",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "The heart has four chambers..." }]
      }
    ]
  },
  "orderIndex": 1
}
```

#### Create a misc lesson (no chapter required)

When `isMisc` is `true` and a `subjectId` is provided without a `chapterId`, the API automatically finds or creates the subject's dedicated **Misc** chapter and attaches the lesson to it. Only one Misc chapter can exist per subject.

```json
POST /api/materials/lessons
{
  "subjectId": 1,
  "isMisc": true,
  "name": "Extra Notes",
  "description": "Miscellaneous notes for this subject",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Additional content..." }]
      }
    ]
  }
}
```

> **Validation rules:**
> - If `chapterId` is provided, `subjectId` and `isMisc` are ignored for placement.
> - If `chapterId` is omitted, both `isMisc: true` and `subjectId` must be present — otherwise a `400 Bad Request` is returned.

#### Response (GET /lessons/:id)
```json
{
  "id": 1,
  "chapterId": 1,
  "name": "Cardiac Chambers",
  "description": "Atria and ventricles",
  "content": { /* TipTap JSON */ },
  "orderIndex": 1,
  "createdAt": "2026-02-17T...",
  "updatedAt": "2026-02-17T...",
  "chapter": {
    "id": 1,
    "name": "The Heart",
    "subject": {
      "id": 1,
      "name": "Cardiovascular System",
      "type": "theoretical",
      "module": {
        "id": 1,
        "name": "Anatomy"
      }
    }
  }
}
```

---

## Hierarchy Structure

```
Module
  ├── Subject (theoretical)
  │   ├── Chapter
  │   │   ├── Lesson
  │   │   └── Lesson
  │   └── Chapter (miscellaneous)
  │       └── Lesson
  └── Subject (practical)
      └── Chapter
          └── Lesson
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `500` - Internal Server Error

## Notes

- All IDs are serial integers
- All timestamps are returned in ISO 8601 format
- `orderIndex` determines the display order (lower numbers first)
- `isMiscellaneous` chapters are for lessons that don't fit into other chapters
- Each subject has at most **one** Misc chapter (`isMiscellaneous: true`). It is created automatically on the first misc lesson creation and reused for all subsequent ones
- Misc lessons are created by sending `isMisc: true` + `subjectId` without a `chapterId` — the API resolves the chapter automatically
- Deleting a parent entity cascades to children (e.g., deleting a module deletes all its subjects)
- The `content` field in lessons stores TipTap JSON format
