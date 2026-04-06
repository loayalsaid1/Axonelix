# Flashcards

**Usual Inital Context**: 
- As per the "docs/Revised app summary.md" file, and the materials hierarchy of the app, I want to implement the feature as per the following Backend (NestJS) and Frontend (NextJS) guidelines, while I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similar from Google Stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features.
- As per the UI, I'm relying mainly on shadcn and for styles, I want to mainly focus now on positioning and will leave shading and coloring and so on for later using a design system in my globals.css for my components.
- No need to say, all code needs to be planned ahead, clean code, and modularized well, like with reusable components and hooks and classes and functions for front-end. Clean Code = Non-Negotiable.


**Overview**: As per the materials Hierarchy, I need to to enable flashcards for lessons.. Each lesson can have flashcards decks attatched to it. For now, either admin cards or the user created cards.

---

## Backend:
### General architecture
Create and edit flashcards, organizing them into a personal and an admin deck linked to a lesson. 
We will optimize the backend to be future-ready for multiple decks and maybe different types as well.. .(e.g. `COMMUNITY`, `SHARED`), but currently, the application's logic will enforce one `ADMIN` and one `PERSONAL` deck per lesson per user.

We will use an explicit creation pattern for personal decks. The frontend handles the empty state logic by explicitly calling to create a deck the first time a user wants to create a personal flashcard on a lesson.

*Note: Spaced Repetition (SRS) tracking will be postponed for now.*

### Database Schema:
```
  deck_type_enum: 'ADMIN' | 'PERSONAL'

  flashcard_decks:
  - id
  - lesson_id
  - user_id (nullable, required for PERSONAL)
  - deck_type (enum: 'ADMIN' | 'PERSONAL')
  - name
  - description
  - card_count (cached)
  - UNIQUE(lesson_id) WHERE deck_type = 'ADMIN'
  - UNIQUE(lesson_id, user_id) WHERE deck_type = 'PERSONAL'

  flashcards:
  - id
  - deck_id
  - front
  - back
```
With a trigger to update the card_count in flashcard_decks whenever a flashcard is added or removed. "Make drizzle generate a custom migration file for that

### API Endpoints:


```
// Decks
GET    /api/flashcards/decks?lessonId=123&type=admin
GET    /api/flashcards/decks/:id
POST   /api/flashcards/decks
PATCH  /api/flashcards/decks/:id
DELETE /api/flashcards/decks/:id

// Cards
GET    /api/flashcards/decks/:id/cards
GET    /api/flashcards/cards/:id
POST   /api/flashcards/decks/:id/cards
PATCH  /api/flashcards/cards/:id
DELETE /api/flashcards/cards/:id
PUT    /api/flashcards/decks/:id/cards/order
```


### Notes:
- We can mke 2 controllers each having the prefix of flashcards only so that cards controller can have decks at the start .. 
- DTOs better take from the table.insertType and SelectTYpe in teh schema for the DTO properties
- For the cards endpoint of the deck..it's etter to include a field of the deck itself, and a filed with array of cards.. for better managements
- Return types must not be forgotten of controllers and services must not be forgotten.. 
- the create cards per deck takes an array by default
---

## Front-end: 
We have 3 main parts:
The flashcards tap in the lessons page, the flashcards page in the user app, and the flashcards management in the admin dashboard.

### The flashcards tab
You have a tabs on to choose between "Axonelix cards" or "My personal cards". The first one is the official deck created by admins, and the second one is the personal deck created by the user. You can also create a card in the personal deck, and it will be linked to the lesson.

**Viewing Experience (The Deck Reviewer)**:
    *   Focused **Flashcard Viewer** (using Shadcn `Card` with 3D flip animation).
    *   Controls below the card: `[ < Prev ]` `[ 12 / 45 ]` `[ Next > ]`.
on the right can be a the list of cards there or the beggening of them to jump to them directly., and it disappears and shows into a sheet on smaller screens, with a button somehere (not sure where now) to open it 

### The flashcards page in the user app
This is a global page where you can see the flashcards of the lessson 
- Like in library page were you have a finder to pick a lesson, and then the decks of that lesson shows up. and there can be a button to show teh drawer or lessons and move and so on on mobile 
- there should be a nice empty state when no lessons is selected and the drawer opens automatically on moblie to force the user to select a lesson, 
- and you select a lesson then select a deck and you jump to the flashcard viewer directly, and you can also jump to any card in the deck from a sheet that opens from the right edge of the screen on mobile or shows already on wide screens
- IN both places, lesson and flashcards page, you can create a flashcard

### The admin side
Mainly, similer to the Stitch reference 1/admin_flashcard_editor_simplified witout teh rich text editor fields
where you have teh form for front-end and back.. and you have list or recently added (saved in session) 
- ***Not sure now*** Should I have a 2 taps, one for creating cards or show existing ones and possibly sort using (shadcn sortable) and edit cards in the show existing tab
- ***Not sure now** Should I have the flashcards management in a separate page, like lessons/id/flashcards or inside the lesson editor page as a tab? as now, we have a flashcards tab in the lessons age, that has those 2 tabs, I'm not really sure
  
#### Notes:
- The lesson card, either in the materisla page or the chapter page shoing chapter lessons, we can here have a button pointing to the flashcars page of the lesson or the lesson normally with query string of tab=flashcars
- further more, if we continue with that route.. we have to edit the save button on top inthe lesson page.. and also.. make the flashcards tab disabled if the content is not saved, that's if we keep the flashcards tab in the lesson page.. not in a seprate page. 
- Given that the current implementation is just for one admin deck and one personal deck.. and that we made our api ready for more that that.. we can make the UI with a button to actually make a request to fetch the decks there with the count, and with a button to just create a new deck and get disabled when one is there to first create the deck instead of just creating cards right away and make them user and implicitly get or create the deck.. 
so, later when we want to include more that one deck.. we remove the disability of the button and remove the unique constraint of the deck.. and modify UI to not be centeralized around one deck.. **How about that?**
- Another alternative, I would prefer, for UX . instead of disabling or removing teh button.. show an like, empty card or a card saying no personal one.. so, it sends a request to create the deck.. and then open the deck page and let user create his cards after loading is done and deck created 
