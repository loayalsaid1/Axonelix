# Questions Feature
Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarcy of the app, I want to to implement the feature with as per the following Backend (NestJS) and Frontend (NextJS) guidelines, While I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similer from google stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features
- As per the UI, I'm relying mainly on shadcn and and for styles, I want to mainly focus now on positioning and will leave shads and cologin g and so on for later using a design system in my globals.css for my components
- for the backend, i'm currently delaying the user and auth features and implementation in my codebase.
- No need to say, all code need to be planed ahead, clean code, and modularized well, like with reusable components and hooks and clasees and functions for front-end

Note, I want the questions functioanlity now, however, I'll implement teh quizz related logic later

Let's start by questions tap in lessons page ***(done)***


## Backend
- the lessons controller have a questions handler, we can use it and add pagination to it

## Front-end
Implement the questions tap in the lessons page
- a sticky bar at the bottom with teh pagination component and a dropdown menu showing how many questions per page 
- showing cards of the question statement optoin to show answers and another to show explanation when showing answer and selecting a rigth or wrong answer
- can be similer to the cards and bar from references/UI/Stitch reference 2/lesson_questions_tab_with_pagination/code.html without the mark botton and the filters stuff 


## Backend initial
I need to as per the app summary create the questions hierarchy and backed as follows, 

### Structure 
```
│   ├── questions/              # Questions and related entities
│   │   ├── questions.module.ts
│   │   │
│   │   ├── questions/          # Main questions logic
│   │   │   ├── questions.controller.ts
│   │   │   ├── questions.service.ts
│   │   │   └── dto/
│   │   │       ├── create-question.dto.ts
│   │   │       ├── update-question.dto.ts
│   │   │       ├── question-response.dto.ts
│   │   │       ├── question-filter.dto.ts
│   │   │       └── create-mcq-question.dto.ts
│   │   │
│   │   ├── question-options/   # MCQ options
│   │   │   ├── question-options.service.ts
│   │   │   └── dto/
│   │   │       └── question-option.dto.ts
│   │   │
│   │   ├── old-exams/          # Old exam classification
│   │   │   ├── old-exams.controller.ts
│   │   │   ├── old-exams.service.ts
│   │   │   └── dto/
│   │   │       ├── create-old-exam.dto.ts
│   │   │       └── old-exam-response.dto.ts
│   │   │
│   │   ├── universities/
│   │   │   ├── universities.controller.ts
│   │   │   ├── universities.service.ts
│   │   │   └── dto/
│   │   │       ├── create-university.dto.ts
│   │   │       └── university-response.dto.ts
```
Notes:
  - For DTOs, we better use the infered database types similer to the /materails/lessons/DTOs
  - Exam types are merely used in old exams when I pick modules, then exam type (i.e, subjects are practical or theoritical) then I chose from available universites and years, so need need to make them a serparete module or controller or stuff, they are final, flipped, mid-term and tpl as per the app Revised App Summary document


### Initial API routes
From the Project_sturucture.md document
```
GET    /api/questions
POST   /api/questions
GET    /api/questions/:id
PUT    /api/questions/:id
DELETE /api/questions/:id

Query params for filtering:
?lessonId=xxx
?chapterId=xxx
?isMisc=true // fetch only misc questions for chapters
?questionType=mcq
?oldExamId=xxx

GET    /api/questions/old-exams
POST   /api/questions/old-exams
GET    /api/questions/old-exams/:id
PUT    /api/questions/old-exams/:id
DELETE /api/questions/old-exams/:id

Query params:
?moduleId=xxx
?universityId=xxx
?year=2024
?examType=final
?moduleType=theoretical

GET    /api/questions/universities
POST   /api/questions/universities
GET    /api/questions/universities/:id
```
 
#### My data access model for questions (execluding loged in specific behaviour like thier old questiosn history for examle now)
##### user side
- fetch lessons questions
- provide moduleId, type (theoritical/practical), and exam tye (final, midterm, tpl, or flipped) and show available old exams per university and year
  (then then fetch questions for that old exam, either alone or internally, after generating a quizz from that old exam questions)
- later when generating a quizz, filter variants according to materials hierarchy described in the Revised App Summary md document
  - one or more module, subject types(theo, prac), subject,  chapter, lesson, only misc questions (ones attached just to the chapter, not that all questions from lessons under that chapter)
  - typically this will be from a seprate function to only return questionIds, and used when generating a queizz

##### Admin side,
  - filter the actual questions similer to previous manner but fetching actuall questions this time
  - fetching avaialble universities in the system as well, and available old exams and filtering them 


#### Notes
- You can use a POST /filter endpoint for this complex filtering
- use 2 functions one for getting the questions and one for just ids
- make a private method for building conditions of the query from the filters given, by using the query builder pattern
- ***[havn't decided this yet]***, some how if we are keeping the normal /questions with query parameters, for simple uses?! may be .. we return certain http error to redirect to the /filter endpoint or something?! if we are keeping this endpoint
- pagination all the way!

- Another note, I initally put it so that we can filter by all types of variats of hierarchy, like one or more modules, subjet types, subjects etc.. but I think it may be unnccessary most, i guess , I don'tk now.. wemay keep it with scopped to chapters, and lessons?!


## Front-end Initial
Currently we have questions backend
what we need is to
- get old exams
- fetch the actual questions of the exam and take the quizz
  - either save teh data or just show the quesiont and show the results later or whatever.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
