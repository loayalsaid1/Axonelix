# Questions Feature
Context:
- As per the "docs/Revised app summary.md" file, and the materials hierarcy of the app, I want to to implement the feature with as per the following Backend (NestJS) and Frontend (NextJS) guidelines, While I'm open for revision and extra planning for that matter.
- For front-end I'm using 2 sets of UI images very similer from google stitch for my UI looks, in the /reference folder and I'm choosing the components of each page from the 2 references I'll be referencing them on the features
- As per the UI, I'm relying mainly on shadcn and and for styles, I want to mainly focus now on positioning and will leave shads and cologin g and so on for later using a design system in my globals.css for my components
- for the backend, i'm currently delaying the user and auth features and implementation in my codebase.
- No need to say, all code need to be planed ahead, clean code, and modularized well, like with reusable components and hooks and clasees and functions for front-end

Note, I want the questions functioanlity now, however, I'll implement teh quizz related logic later

Let's start by questions tap in lessons page


## Backend
- the lessons controller have a questions handler, we can use it and add pagination to it

## Front-end
Implement the questions tap in the lessons page
- a sticky bar at the bottom with teh pagination component and a dropdown menu showing how many questions per page 
- showing cards of the question statement optoin to show answers and another to show explanation when showing answer and selecting a rigth or wrong answer
- can be similer to the cards and bar from references/UI/Stitch reference 2/lesson_questions_tab_with_pagination/code.html without the mark botton and the filters stuff 

## Backend initial
I need to as per the app summary I want to create the questions hierarchy and backed as follows, 

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
?moduleId=xxx
?subjectIds=
?lessonIds=xxx,xx,xx
?chapterIds=xxx,xx,xx
?isMisc=true // fetch only misc questions for chapters
?includeMisc // For fetching all questions for 
?questionType=mcq
?oldExamId=xxx

GET    /api/questions/old-exams
POST   /api/questions/old-exams
GET    /api/questions/old-exams/:id
PUT    /api/questions/old-exams/:id
DELETE /api/questions/old-exams/:id

Query params:
?universityId=xxx
?year=2024
?examType=final
?moduleType=theoretical

GET    /api/questions/universities
POST   /api/questions/universities
GET    /api/questions/universities/:id
```

### Notes on the way I'll be fetching via network or interacting with questions in the app 
#### In the user side
  - Fetching lesson's questions in the lesson page
  - or questions in a certiain old exam
    which as I will decide later can be not fetching, but generating a quizz based on them and dealing later with teh quizz itself
  - When dealing with quizzes
    - generate a quiz based on 
      - a lesson, an array of lessons
      - a chapter, can be just misc questions which not attatched to a specifc lesson, not that it's questions of all lesssons under the chapter
      - a module which meansn all chapter under a module or array of moduels, 
    Effectively, the different variants I can filter based on the hierarchy of my materials


  
#### In the admin side
  - getting questions based on materails hierarchy
  - yeah.. that's it


<!-- 

and note, exam types can be just an enmu in the old exams type, not a separate table, 
also,



So currently, we have questions, oldexams, no tests nothing.
so we can now, just fetch lessons's questions, and fetch lessons related to this 
fetch questions from old exams, all temporarily untell we generate tests and link to them.. 

or we can think ahead and think of a test functionality here


make a quizz, with array of questions
and metadata of the source (and userId later)
whether it's for an old exam or not


for quizzez, we can take the questionsIds, metadata (time, seen and answered and saved answered questions, last previewed question)



what I can currently do, is make the backend for questions, as usual.
then for UI, i add the paginated questions tap in lessons view + old exams view where I temporarily may be just pagenating through questions 
{may be in the questions page, i add filtering and I can pagenate through questions generally?!} -->
