# Replace /api/admin routes in nextjs with the main nestjs backend for admin dashbaord

## Initial context:
	- As per the "docs/Revised app summary.md" file, and the materials hierarcy of the app, I want to to implement the feature with as per the following Backend (NestJS) and Frontend (NextJS) guidelines, While I'm open for revision and extra planning for that matter.
	- For front-end I'm using 2 sets of UI images very similer from google stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features
	- As per the UI, I'm relying mainly on shadcn and and for styles, I want to mainly focus now on positioning and will leave shads and cologin g and so on for later using a design system in my globals.css for my components
	- No need to say, all code need to be planed ahead, clean code, and modularized well, like with reusable components and hooks and clasees and functions for front-end

## Context:
	- The admin side of the app was initiallized earlier rapidly with AI to help inserting data by the client while the actual codepace was built seprately
	- Currently the admin code in the /app/admin pages rely on nextjs /app/api/admin routes which uses the lib/admin-services which uses `sql` from "@vercel/postgres" directly
	- All while the actuall codepases uses a proper backend using nestjs in the /Back-End folder with controllers for all materials, questions and so on.. .. You can reference that and discover the code
	- and currently, I want to replace this /app/api and directly talk to the app backend like the rest of the application



## Mainly goal: 
	- Replace the /api routes and their admin-services classes in the admin logic and the calls to /api routes with the main nestjs backend

## Notes about the code:
- Obviously, backend had entities folder, and the the differen modules with typescript DTOs and stuff for controllers and services
- for the admin side, you have it's backend being the /api routes which rely ont he lib/admin-services classes for the actualy literal queries
- the front-end either calls fetch for those /api routes int he pages or inthe components they imports, or in the hooks/admin where you have useModules, useSubjects and so on , with the types and interfaces declared there.
- and we need to replace this to call our main backend instead
- the admin front-end code and types mostly expects actual columnds in snake_case, because it fetches data via raw SQL. while the backend and the rest of app aside from this admin side already fetches data from drizzle with the js camelcase


## Command
- First, you can start by exploring the code and understanding the current logic of the admin side and how it works with the /api routes and the admin-services classes
- THen, Explore the nestjs backend and understand how the controllers and services work and how they fetch data from the database using drizzle
- Then, sinse the goal is to miror the current logic but with the nestjs backend, you can start by replacing the calls to /api routes in the admin front-end code with calls to the nestjs backend controllers.
- You have to reiterate after you finish and make sure the structure is proper and no problems introduced, and also make sure to handle any potential differences in the data structure returned by the backend and expected by the front-end, especially considering the snake_case vs camelCase issue.
- You can also consider creating some utility functions or hooks to help with the data transformation if needed, or, I believe we can simple change the types to proper camelcase and change the code to use the camelcase as well

## Notes:
- There can be a potential herdle of existing endpoints may be not returned all we expect, or so much more, fitting more the student side in specific cases which we can:
	- edit them in a sinsible way
	- or create extra endpoints to handle our needs even if we will ignore slight changes int he current endpoints for now to avoid trouble then we can fix this later after review
- of course some endpoins may not be available in the backend yet like recent lessons and flat or normalized hierarchy options used in one of the admin-services classes, which we can simple create them in the proper place
- Despite being a small change, It may seem like keeping the /api proxy in the front-end is easier and will help save some trouble and we may normalize data there and so on and just make sure we mirror exactly the admin-services and the existing returned value of the api routes, but I believe if we keep a record of what each route and service used to fetch and return, and we go step by step into refactoring, and analyzing the context of front-end code, /api routes and backend.. we can do this cleanly
	
