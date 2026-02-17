# Materials Hierarchy

Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarcy of the app, I want to to implement the feature with as per the following Backend (NestJS) and Frontend (NextJS) guidelines, While I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similer from google stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features
- As per the UI, I'm relying mainly on shadcn and and for styles, I want to mainly focus now on positioning and will leave shads and cologin g and so on for later using a design system in my globals.css for my components
- for the backend, i'm currently delaying the user and auth features and implementation in my codebase.
- No need to say, all code need to be planed ahead, clean code, and modularized well, like with reusable components and hooks and clasees and functions for front-end


## Backend
### structure
I want to to structure similer to the following  from my backend structure plan and I'm currently leaving 
```
│   ├── materials/              # Parent module for all learning materials
│   │   ├── materials.module.ts
│   │   │
│   │   ├── modules/            # Academic modules (not NestJS modules)
│   │   │   ├── modules.controller.ts
│   │   │   ├── modules.service.ts
│   │   │   └── dto/
│   │   │       ├── create-module.dto.ts
│   │   │       ├── update-module.dto.ts
│   │   │       └── module-response.dto.ts
│   │   │
│   │   ├── subjects/
│   │   │   ├── subjects.controller.ts
│   │   │   ├── subjects.service.ts
│   │   │   └── dto/
│   │   │       ├── create-subject.dto.ts
│   │   │       ├── update-subject.dto.ts
│   │   │       └── subject-response.dto.ts
│   │   │
│   │   ├── chapters/
│   │   │   ├── chapters.controller.ts
│   │   │   ├── chapters.service.ts
│   │   │   └── dto/
│   │   │       ├── create-chapter.dto.ts
│   │   │       ├── update-chapter.dto.ts
│   │   │       └── chapter-response.dto.ts
│   │   │
│   │   ├── lessons/
│   │   │   ├── lessons.controller.ts
│   │   │   ├── lessons.service.ts
│   │   │   └── dto/
│   │   │       ├── create-lesson.dto.ts
│   │   │       ├── update-lesson.dto.ts
│   │   │       ├── lesson-response.dto.ts
│   │   │       └── lesson-with-hierarchy.dto.ts
│   │   │
│   │   └── dto/                # Shared DTOs for materials
│   │       └── hierarchy-response.dto.ts
```
### API
with this list of API routes and more if needed as makes sense

```
GET    /api/materials/modules
POST   /api/materials/modules
GET    /api/materials/modules/:id
PUT    /api/materials/modules/:id
DELETE /api/materials/modules/:id
GET    /api/materials/modules/:id/hierarchy  // Get full tree

GET    /api/materials/subjects
POST   /api/materials/subjects
GET    /api/materials/subjects/:id
PUT    /api/materials/subjects/:id
DELETE /api/materials/subjects/:id
GET    /api/materials/subjects/:id/chapters  // Get all chapters

GET    /api/materials/chapters
POST   /api/materials/chapters
GET    /api/materials/chapters/:id
PUT    /api/materials/chapters/:id
DELETE /api/materials/chapters/:id
GET    /api/materials/chapters/:id/lessons  // Get all lessons

GET    /api/materials/lessons
POST   /api/materials/lessons
GET    /api/materials/lessons/:id
PUT    /api/materials/lessons/:id
DELETE /api/materials/lessons/:id
GET    /api/materials/lessons/:id/questions  // Get questions for lesson
```
