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

## Front-end
using shadcn components. building pages as per the lessons and materials hierarchy as mentioned in the app summary file
### Materials part general look and layout and hierarchy selection (execluding lesson page or view)
- A sidebar mainly for navigation to navigate hierarchy or materials, with teh following
	- a place to search for lessons (may be via Command component) (currently disabled or does nothing nwo)
	- a place for recent lessons, (currently just let it use a sertice class that talks to local storage for the logic) 
	- a navigation hierarchy 
		- I need to show the heirarchy while be able to toggle or unfold a level, say module, (theoritcal or practical) or subject or chapter without activating the link that takes  me the page representing that hierarchy level element
		- it probably need to be in the layout so that it does'nt rerender on each link change, and it need to auto detect path in a smart and clean manner and code 
- a page with content
	- mainly with a breadcrump for navigation ontop 
	- name and description of teh hierarchy 
	- may be action buttons that may be for generating a question for that level of hierarchy or something that take you to the generate test page with heirarchy name and id in query paramters (empty link for now). and other actions and also may be a progress element for completed correct questions for that hierarchy level of the user (also mocked for now)
	- content of the hierarchy level.
		- I like as per the references/UI/Stitch reference 1/material_library_explorer/code.html where you show cards for each element (lesson in this case, but can be subjects, etc) but without the icon and badge ontop, so name, description, progres, available questions (mocked for now as well, like other stats), and lessons or chapters (like the one level deeper in the hierarchy name)
		- also, in the references/UI/Stitch reference 2/library_material_explorer_1/code.html, I like that in the for subjects, you showed list of chapters, under each with a line seprator it showed the list of lessons as cards down

Final note, Backend may adapt of being added to for the specifics of this as needed in a smart way + you can scan the names of the shadcn components in the ui folder and you can run commands to install more as needed from shadcn, instead of creating replacements yourself

Another Note, Code must abide by the proper profissional conventions of NextJS and statigeically create the componnets to utelize the SSR capabilites and the Suspense streaming and loading and error handling among other things 
