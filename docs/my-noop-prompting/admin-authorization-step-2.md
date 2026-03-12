# Auth & Role Management (For admins) Step 2

**Usual Initial Context:**
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.


## Overview
Following the admin-authorization.md file, Now, it's about authorizing controllers fully, so basically, we have global auth gaurd, and roles gaurd for admin routes

## Steps in Backend
- Make auth guard global, so it applies to all routes
- make an isPublic decorator that set's metadata to teh handler to allow routes to be public, speaking of auth here mostly
- make it visible to teh auth gaurd
- in controllers, mostly, use roles student decorator ontop of controllers and use the roles gaurd on top of them, and then for Create, Update, and Delete on Materials and questions implement initially the roles admin decorator
