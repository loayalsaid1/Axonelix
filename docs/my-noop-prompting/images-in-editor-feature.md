# Images in the tiptap editor
Allow uploading images in the lessons and questions and questions explanations editor

## Core
- make an imagekitio auth endpoint in the backend
- Modify the upload function in the editor utils to use the imagekitio auth endpoint and upload images to imagekitio
- thus.. the images will be saved in the editor with the src being the imagekitio url of the uploaded image
- further more.. create a table to save image metadata.. like Id, and url.. and make the upload function save the image metadata in the database as well

## Problems and gotchas
### images optimizations in various devices
IN retrieval.. mobile should't just get 1000px wide images.. and overall quality may need to be reduced abit..
- I shouldn't use the image exntetion sololy but rather extend it .. something like this: 
```js
renderHTML({ HTMLAttributes }) {

  const src = HTMLAttributes.src

  return [
    'img',
    {
      ...HTMLAttributes,
      src: `${src}?tr=w-900,q-75,f-auto`,
      srcset: `
        ${src}?tr=w-400,q-75,f-auto 400w,
        ${src}?tr=w-800,q-75,f-auto 800w,
        ${src}?tr=w-1200,q-75,f-auto 1200w
      `,
      sizes: "(max-width: 768px) 100vw, 900px"
    }
  ]
}
```
### Elephant in the room: orphaned images
- once a user clicks upload an image.. it's already uploaded before saving the lesson, and like any other node. (i.e, text and headers..etc) it can be deleted.. and we are left with an image in the system taking space and never being used..


### organization ... lesssons Ids created after the image is uploaded to imagekitIO...
if we wanted to organize the images based on parent.. and we are uploading images on the client.. while creating the source.. don't have the lesson id yet.. so we can't organize the images in folders based on lesson ids..

so we will just upload all the images to the same folder in imagekitIO and save the image metadata in our database with a reference to the lesson id.. so we can easily retrieve all the images of a lesson when needed

### Brain dump of edge cases + extra problem:
#### Extra problem:
- we don't have a folder for the lesson at upload time ,because we don't have an Id for the lesson yet before creation
	- have a type of temp place.. make the creation service aware of this.. and .. upon creation.. update the images with the correct lesson
#### on creation:
- upload an image.. then deletes it..before save 

#### on update:
	- deletes an image existing.. then saves
		- detect the difference on save.. and delete it
	- addes a new image and keep it. which is fine ✅
	- adds a new image and then deletes it before saving 
  	- fetch existing images => detect existing images from the JSON => delete the onces not there

#### on delete:
- deletes a lesson that has images => we have orphaned images in the system
  - we delete all images for that lesson in the folder


### Database schema:
```sql
images (
  id          UUID PK,
  url         TEXT NOT NULL,
  imagekit_file_id TEXT NOT NULL,  -- critical: needed to delete from ImageKit
  entity_type TEXT,                -- 'lesson', 'question', 'explanation'
  entity_id   UUID,                -- nullable until committed
  status      TEXT DEFAULT 'pending', -- 'pending' | 'committed' | 'deleted' ENUM
  created_at  TIMESTAMPTZ DEFAULT now()
  upadted_at  TIMESTAMPTZ DEFAULT now() onUpdate now()
  deleted_at: TIMESTAMPTZ nullable
)
```

**Store `imagekit_file_id`** — not just the URL. You cannot delete a file from ImageKit without its file ID, and reconstructing it from a URL is fragile.

---

### The Four Casesssssss, Resolved

**On Create — user uploads then deletes before saving**
the image sits in the DB as `PENDING` forever. A **background cleanup job** runs periodically and deletes all `PENDING` images older than X hours (say.. 24h) from both ImageKit and DB.

**On Create — user uploads and saves**
On save, extract all `src` URLs from the Tiptap JSON, find the matching DB records, and flip their `status` to `committed` and set `entity_id = lesson.id`. 

**On Update — user deletes an existing image then saves**
On save: compute `existing_committed_urls - urls_in_new_json` = images to delete. Then delete them from ImageKit (using `imagekit_file_id`) and from the DB.

**On Update — user adds a new image then deletes it before saving**
These are still `PENDING` in your DB. The background cleanup job handles them. You don't need special logic here.

**On Delete (lesson/question deleted)**
Query all `committed` images where `entity_id = lesson.id`, call them `deleted`. 

---

#### The Unified Strategy
```
Upload → always save to DB as PENDING with uploaded_by
                        ↓
Save/Create entity → extract URLs from JSON
                   → mark matching records as COMMITTED + set entity_id
                   → delete COMMITTED records no longer in JSON from ImageKit + DB
                        ↓
Delete entity → delete all COMMITTED images for entity from ImageKit + DB
                        ↓
Background job (daily) → delete PENDING images older than 24h from ImageKit + DB


status: 'pending' | 'committed' | 'deleted'
deleted_at: TIMESTAMPTZ nullable
```

On save/update — you just mark unreferenced images as `deleted`. That's it. The cleanup job handles the actual ImageKit API call and DB removal. This means:
- If the cleanup job fails, you just retry it — no data inconsistency
- You get an audit trail for free (`deleted_at` timestamp)
- You can even add a grace period — e.g., only actually delete files marked `deleted` for more than 1 hour, giving you a short recovery window if someone accidentally saves


## Note... 
-  sequence must be noted.. our server is more vaulndrable than imagekit.. so .. on updating or even the uploading if the DP query fail.. we just delete the image from the uplaod function.. 
- the folder of images will be in /images folder and can be overwritten by an env var..


## For Organization.. :
Good structure overall. Here's how I'd organize it.

---

### The Core Decision

Image management is kinda **cross-cutting** — it's not owned by lessons, questions, or any single module. It serves all of them. So it lives in its own module, similar to how `auth` or `users` is a standalone module.

```
modules/
  images/
    images.module.ts
    images.controller.ts      ← ImageKit auth endpoint lives here
    images.service.ts         ← status updates, querying, deletion logic
    images.cron.service.ts    ← cleanup job
    dto/
      create-image.dto.ts
    types/
      image-entity.types.ts   ← EntityType enum: 'lesson' | 'question' | 'explanation'
```
and we have in the shared folder: 
```
    utils/
      tiptap.utils.ts         ← extract image URLs from Tiptap JSON
```

And in `database/entities/` you add `images.ts` alongside your other entities.

---

### Responsibility Breakdown

**`images.controller.ts`** — one endpoint:
```
POST /images/imagekit_auth   ← generates ImageKit auth signature for client upload
POST /images        ← saves image metadata to DB as PENDING after client upload
```

**`images.service.ts`** — all image business logic:
```ts
commitImages(entityType, entityId, urls: string[])  
// marks images as COMMITTED, sets entity_id

markDeletedByDiff(entityId, newUrls: string[])       
// compares new content URLs vs committed URLs → marks removed ones as DELETED

deleteAllForEntity(entityType, entityId)             
// called by lessons.service / questions.service on entity delete
```

**`images.cron.service.ts`** — scheduled cleanup:
```ts
// runs nightly
// deletes DELETED status records from ImageKit + DB
// deletes PENDING records older than 24h from ImageKit + DB
```

**`tiptap.utils.ts`** — pure utility function, no DI, no side effects:
```ts
export function extractImageUrls(tiptapJson: object): string[]
```
This is the key decision — keep it as a plain utility, not a service. It has no dependencies, it's easily testable, and it gets imported wherever needed.

---

### How Lessons and Questions Use This

`lessons.service.ts` and `questions.service.ts` inject `ImagesService` and call it at the right lifecycle points:

```ts
// lessons.service.ts
async create(dto: CreateLessonDto) {
  const lesson = await this.db.insert(lessons).values(...).returning()
  
  const urls = extractImageUrls(dto.content)
  await this.imagesService.commitImages('lesson', lesson.id, urls)
  
  return lesson
}

async update(id, dto: UpdateLessonDto) {
  await this.db.update(lessons)...
  
  const urls = extractImageUrls(dto.content)
  await this.imagesService.markDeletedByDiff(id, urls)
  await this.imagesService.commitImages('lesson', id, urls)
}

async delete(id) {
  await this.imagesService.deleteAllForEntity('lesson', id)
  await this.db.delete(lessons).where(eq(lessons.id, id))
}
```

---
