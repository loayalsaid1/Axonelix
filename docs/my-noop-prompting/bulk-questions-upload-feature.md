# Bulk Questions Upload via CSV

Usual Initial Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.


## Frontend
### Flow & UI Guidelines
1. **Entry Point (Split Button):** Update the current "Create Question" button in the admin question lists/pages. Change it into a "Split Button" or a button group:
   - Primary action: Opens the standard `CreateQuestionDialog`.
   - Secondary action (dropdown or secondary button): "Bulk Upload questions" -> This will navigate the user to a dedicated bulk upload page (e.g., `/admin/questions/upload`) rather than cluttering the UI with another modal.
2. **The 3-Step Wizard Page:** Build a dedicated page acting as a wizard for the upload process.
   - **Step 1: Upload File:** Provide a clear "Drag & Drop" zone for the CSV file. Use `react-papaparse` to parse the CSV on the client side. Include a UI note or link showing the expected CSV layout.
   - **Step 2: Preview & Validation:** Show the parsed data in a scrollable Data Table. 
     - The parser hook must validate every row. If a row is missing the question text or a correct answer, highlight it in red. Show a validation summary (e.g., "Found 45 questions, 42 valid, 3 errors").
     - The UI should disable the "Next" step until all rows are either valid or the user chooses to "Dismiss Invalid Rows".
   - **Step 3: Context Assignment (Metadata Mapping):** After previewing, display our components for context, similer to what we do in the createQUestionDialog. The user must assign a target (e.g., Chapter, Subject, or Old Exam) for this *entire batch* of imported questions. This is crucial for our app's organization and later retrieval of questions. 
		 - The UI should clearly indicate that the assigned context will apply to all questions in the batch.
		 - Provide a summary of the batch (e.g., "You're about to upload 42 questions to <attatched context>").

### CSV Structure & Data Mapping
- The standard CSV header will look like this: `"question_text","option_1","option_2","option_3","option_4","correct_answer"`
- **Dynamic Options Handling:** 
  - Some rows might only have options 1, 2, and 3 (with column 4 empty). Our parser must exclude empty options.
  - Some rows might have 5 or 6 options (columns `option_5`, `option_6`, etc.). Our code should be flexible enough to aggregate all columns starting with `option_` into a single options array.
- **Correct Answer Mapping:** The `correct_answer` column will contain letters (e.g., `A`, `B`, `C`, `D`). 
  - Write a clear utility function to map these letters to their corresponding option text and mark `isCorrect: true` on that option (e.g., `A` = `option_1`, `B` = `option_2`).

## Backend
### API & Database (NestJS & Drizzle)
- **New Endpoint:** Create a `POST /questions/bulk` endpoint strictly for bulk generation. 
- **Bulk Payload:** The frontend should send a JSON payload Similer to what we do in create-question-dialog, but with an array of validated questions instead of one
- **Transactions (Critical):** Do NOT loop and do `apiFetch` 50 times from the frontend, and do NOT loop individual `insert` queries on the backend without safety. The backend service method must use a Drizzle database transaction (`db.transaction(async (tx) => { ... })`).
- It also should insert all questions using `.insert(...).values(questionsArray)` in batch, and follow up by mapping the resulting `question_id`s to bulk inserts in the `options` table. This ensures the upload is atomic (either perfectly succeeds or perfectly fails without leaving orphan data) and highly performant of course, not 50 round trips to the database over the netwoorrrrkkk!.
