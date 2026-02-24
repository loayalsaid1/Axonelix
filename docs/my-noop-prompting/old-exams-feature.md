# Old exams
Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarcy of the app, I want to to implement the feature with as per the following Backend (NestJS) and Frontend (NextJS) guidelines, While I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similer from google stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features
- As per the UI, I'm relying mainly on shadcn and and for styles, I want to mainly focus now on positioning and will leave shads and cologin g and so on for later using a design system in my globals.css for my components
- for the backend, i'm currently delaying the user and auth features and implementation in my codebase.
- No need to say, all code need to be planed ahead, clean code, and modularized well, like with reusable components and hooks and clasees and functions for front-end


Following what we have done in teh "questions-feature-backend.md" document, as per the Revised app summary document, I want to create the old exams pages as described in teh flow

## Front-end 
### Flow
select modele, subejcts type and exam type (final, mid-term ...etc) then show exam items like univerisites and years available. 
we can either for that item go to the page showing exam details and list of questions as in the questions tap in lessonsTabs.tsx, pagenated 
- You can use the installed Field and Select to initiate the search
- Utilize Item component for questions. 
- We can have a button with a tooltip saying, soon that generateds a quizz from that old exam. but this feature not available now


## Backend
As we have done in the questions endpoints and old exams to get old exam data,
- we can follow up by adding an end point fetching avaialbe modules ids and names


	