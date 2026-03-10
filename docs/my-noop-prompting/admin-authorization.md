# Auth & Role Management (For admins)

**Usual Initial Context:**
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.


## Overview
We need to authorize admins by their roles, stored in the users table as per the entties folder, redirect admins in the front-end based on that, and also gaurd the backend routes for admins only.


## Current state
Referencing ClerkAuthGaurd, user entity and table, and users.service.ts:
- requests we make a user with teh clerkId and internal id and so on
- default to "student" role, (currently string, not enum!)
- we have a getUserByClerkId function in the users service, and we have the ClerkAuthGuard that extracts the clerkId from the JWT and adds the user to the request context. `request.user = x`

---

### User Sync Flow

1. User signs up via Clerk.
2. Clerk triggers a **webhook**.
3. NestJS receives the webhook and **creates a user in the database**.

Example user record:

```
users
-----
id
clerk_id
email
role
created_at
```

Default role: `student` saved as string, not enum currently!

Admins can later promote users by updating the database role.

---

## Backend
- User Entity
  - create and enum for roles, now student and admin
  - use in the table
  - also, create an enum in the code level in teh common/enums there
- Roles reflector decorator, an array of roles, enum roles array or string[] for that  matter
- RolesGuard that uses the reflector to get the required roles and checks against the user role in the request context classes and handler
- and... `/users/me` Endpoint returning the user

---

### Frontend Role Access Pattern
Create a Roles enum in the frontend.

Create a shared helper:

```
getCurrentUser()
```

Responsibilities:

1. Get Clerk token.
2. Call `/me`.
3. Return the database user.

The function is wrapped in **React `cache()`** so multiple components reuse the same request.

Example usage:

```
const user = await getCurrentUser()
```

---

### Admin Route Protection

Protect admin pages at the layout level:
```
/admin/layout.tsx
```

Flow:

1. Call `getCurrentUser()`
2. Check role
3. Redirect if unauthorized

Example logic:

```
if (user.role !== "admin") redirect("/")
```
