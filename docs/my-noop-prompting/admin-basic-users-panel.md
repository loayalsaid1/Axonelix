# Admin Basic Users Panel

**Usual Initial Context:**
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.

## Overview
We need to create a basic users panel for admins, where they can see the list of users, their roles, and basic info like name, email, last activity (last log in for now), signup data or creation date. This will be the first step towards building a more comprehensive admin dashboard in the future.

### Note:
obviously, revising the entities/users file and the authGuard and the users service, we save id, clerkId, email and role in the database
and all auth happen in clerk

## Backend 
Base, already implemented, ***reference the AdminUsersController and AdminUsersService in the users module for the implementation of the API endpoint to get all users with their basic info.***

- Create an endpoint to delete a user, and you can delete it from clerk as well
- Paginate the list of users

## Front-end
- Use the previous endpoint to fetch the list of users
- and display their information in a table 
- It can has actions like delete a user, 
- Allow builk edits, like selecting multiple users and deleting them at once
- Of course, delete has to be confirmed with a pop-up dialog to avoid accidental deletions
- pagenate the table
