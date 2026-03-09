# Admin dashboard sidebar
Simple and easy!. I want a sidebar in the admin dashboard similar to the one we have in the user dashboard
Links are, dashboard. materials, and questions. replacing the existing sidebar in the admin dashboard

## as usual, the inital context: 
Usual Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end.

## Notes
- the admin pages now are set as public in the app in the proxy.ts file, we can simple remove them and make them protected like the other pages, and thus the user stuff in the footer of teh sidebar works fine
- No need for the "upgrade to pro" and Billing options in the dropdown menu in the footer of the sidebar like in the profile
- we can have groups also in the admin sidebar, say, Main (dashboard, analytics (comming soon component)), content (materials and questions) and users and users can be a page with a coming soon component like other pages 
	- I'm not sure about my organization here, anyways, now we only have the dashboard (i,e / taking us with those 2 navigation cards) and materails and questions.. 
- ***Another uncertainty of proper choice***, currently, the /admin have a page.tsx which is the dashboard basically, should we have a /admin/dashboard route, or just /admin/ with the page.tsx in the root, or remove it into /admin/(dashboard)?
- of course the themes component should be in the sidebar as well, just like in the app sidebar!
