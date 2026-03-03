# My tests page & user tests history
Usual Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- Auth is already implemented in the codebase – use the existing auth guard and extract `userId` from the JWT/request context as done in other modules.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end.

---

Building the my tests page, similer to the reference from /references/UI/stitch reference 1/my_tests_history
- fetchign stats about user tests, average score, and unfinished (suspended ) tests, progres, and type whether this is for Qbank or referencing an old exam
- showing a list of test sessions entries, paginated user have taken including
  - sesisonId, quiz title, start time, status (in progres, completed, suspened, or not started), and actions (revewi , resume or delete)


## Backend
Revising the quizzes module backend, entities, and DTOs, I suggest we include 
- a user_status endpoint fetching the 3 neccesary status here
- history endpoint fetching the nccessary data here for our lovely table of sessions.

# Front-end 
Now with the user-stats endpoint added. as described ealier, use the reference from teh my_tests_history ui reference

Notes: 
- needless to say, loading should be considered.
- and to rely on shadcn compoents more
- when deleting, talk to the quiz controller now for the delete endpoint not the quiz-session
- I havn't decided on mobile how th elook will be, I may suggest if this is more approriate that we make the view or table showing items be scrollable horizontally
- an error boundry should be added 
