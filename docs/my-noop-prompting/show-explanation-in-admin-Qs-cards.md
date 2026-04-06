# Show Explanation in Admin Qs Cards
**Usual Inital Context**: 
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.

**Problem Statement**: The admin question cars either in the questions list in the admin-question-card or in the old exam page in the exam-question-card.tsx, Either ways.. the explanation is sent via the API from the questions/filters endpoint.. the components only need to add it to it's props and render it.

## Backend:
No changes needed, the explanation field is already being sent in the API response.

## Front-end:
1. In the `AdminQuestionCard` component, add an `explanation` prop render it
2. In the `ExamQuestionCard` component, add an `explanation` prop and render it as well.

### Rendering Logic: 
IN a similer manner to the components/library/questionCard that is used in the old exam page from student side or the quesitons tab in the lessons page.. render it in a suspense with the Editor preview component, Probably, also in a dialog, the same way.
