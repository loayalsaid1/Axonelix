<!-- Great brief 👌 — you’ve already outlined an excellent conceptual model. I’ll reshape it into a **clear, implementation-ready UI/UX master plan** that a product team (design + frontend + backend) could directly build from.

Below is a structured response that turns your description into:

• Product requirements
• Screen architecture
• Interaction flows
• Component system
• UX logic rules
• Design language -->

---

# 🧠 Axonelix – UI/UX Master Design Blueprint

**Medical Learning Platform Prototype**

---

## 1. Product Philosophy

### Core Principles

The entire system should be built around these UX pillars:

* **Density Without Chaos**
  Medical content is inherently complex – the UI must remain stable and predictable.

* **Context Preservation**
  Deep navigation must never make the user feel “lost.”

* **Speed Over Beauty**
  Functionality > decoration. Clinical, utilitarian aesthetic.

* **Active Recall First**
  Everything should push students toward retrieval practice.

* **Late-Night Usability**
  Designed for exhausted students: high contrast, minimal friction.

---

# 2. Information Architecture (IA)

This is the structural backbone of the platform.

## A. Material Hierarchy Model

```
Modules  
  → (Theoritcal Or Practical) Subjects  
      → Chapters  
          → Lessons  
              → Content  
              → Related Questions  
              → Flashcards  
```

### Special Rules

* Module's Subjects Are devided be:

  * Theoretical
  * Practical

* Subject's chapters may include:
  * Normal chapters
  * A “Miscellaneous” Chapter for lessons of teh subejct that are not connected

* Every lesson is a first-class entity with:
  * Rich text content
  * Attached questions
  * Attached flashcards

---

## B. Question Domain Model

### Question Types

1. **QBank Questions**

   * Bound to specific lessons/chapters
   * Used for custom tests

2. **Old Exam Questions**

   * Historical real-world exams
   * Treated as immutable exam sets

### Old Exam Metadata

Each Old Exam is for:

* University
* Year
* With Exam Type
  * Final
  * Midterm
  * TPL
  * Flipped
* Subject in the module 
  * Theoretical
  * Practical

---

# 3. Application Structure

## Global Layout Skeleton

```
---------------------------------------------------
| Sidebar | Top Bar                              |
|         |--------------------------------------|
|         | Main Content Area                    |
|         |                                      |
---------------------------------------------------
```
<!-- 
### Sidebar (Always Visible)

Non-collapsible for stability. -->

**Primary Navigation:**

* Dashboard
* Library
* QBank
  * Old Exams
  * My tests
  * Generate Tests
* Flashcards
* Performance
* Profile

---

# 4. Major UX Modules

---

## A. The Library – Material Explorer

### Purpose

Central hub for browsing learning material.

---

### Screen Components

#### 1. Left Panel – Navigation

* Search bar
* Tree view hierarchy
* Expandable:

```
Module  
 └ (Theoritcal Or Practical ) Subject  
    └ Chapter  
       └ Lesson  
```

---

#### 2. Top Navigation Aids

* Breadcrumbs:

```
Home > Cardiology > Arrhythmias > Atrial Fibrillation
```

* Quick actions:

  * Favorite
  * Add to study list
  * Mark as complete

---

### Lesson Dashboard

When user clicks a chapter:

Show:

* Recent Lessons
* Favorite Lessons
* Progress indicators
* “Continue where you left off”

---

### Lesson View (Core Screen)

#### Tabbed Interface

```
[Content]  [Questions]  [Flashcards]
```

##### Content Tab

* Render TipTap JSON
* Read-only by default (use RenderReactComponent from the JSON instead of a tiptap instance)
* Clean typography

##### Questions Tab

* List of all questions tied to lesson
* Quick practice mode (May be later)

##### Flashcards Tab

* Spaced repetition mini-engine

---

## B. QBank & Test Engine

This is the intellectual heart of the app.

---

### Test Generator Screen

A powerful filtering system:

**Filters**

* Material scope

  * Module
  * Subject
  * Chapter
  * Lesson

* Question type

  * MCQ
  * Written

* Status

  * All
  * Incorrect only
  * Unread

<!-- * Old Exam inclusion -->

* Number of questions

---

### Test Interface Design

#### Layout

```
--------------------------------------------------
| Question Progress | Timer | Controls           |
--------------------------------------------------
| Question Card                                  |
|                                               |
| A)                                           |
| B)                                           |
| C)                                           |
| D)                                           |
--------------------------------------------------
```

---

### Core Interactions

#### Answer Behavior

* Click to select
* Click on a button → strikethrough (elimination mode)

#### Actions

* Mark for later
* Skip
* Reveal explanation

#### Controls

* Suspend Test
* End Test
<!-- * Pause Timer -->

---

### Logic Rules

* If a previously incorrect question is now correct:

  * Remove from “Incorrect Records”
  * Still remain in history or the test

* All attempts are stored

* Every test generates (may be later):

  * Accuracy
  * Time spent
  * Weak topics

---

## C. Admin Workspace (Ignore temporarily)

A power-user area.

---

### Features

#### 1. Hierarchy Builder

* Drag-drop modules
* Create subjects
* Assign chapters
* Attach lessons

---

#### 2. Question Editor

* TipTap-based rich editor

* MCQ + Written support

* JSON output:

* Statement

* Options

* Correct answer

* Explanation

* References

---

# 5. Component System

---

## Reusable UI Components

### AnswerCard

Props:

```ts
interface AnswerCardProps {
  text: string
  isCorrect: boolean
  selected: boolean
  showReference: boolean
}
```

States:

* Default
* Selected
* Eliminated
* Correct
* Incorrect

---

### QuestionCard

* Supports:

  * Images
  * Tables
  * Rich text
  * Math
  * References

---

### Status Badges

* Correct
* Incorrect
* Skipped
* Marked

---

# 6. Visual Design Language

---

## Aesthetic Direction

* Clinical
* Neutral
* Efficient

### Colors

* Blues / Grays
* Success: Green
* Error: Red
* Focus: Cyan

---

### Typography

* Highly readable
* Large line height
* Clear hierarchy

---

### Accessibility

* High contrast
* Keyboard-first
* Dark mode optimized

---

# 7. Behavioral UX Rules

---

### Context Persistence

* Always show:

* Breadcrumbs

* Current module

* Return paths

---

### Cognitive Load Reduction

* No modals unless critical
* No hidden navigation
* Consistent placements

---

### Study Flow Focus

Minimize clicks to:

* Open lesson
* Start test
* Review mistakes

---

# 8. Analytics Layer

User should see:

* Streaks
* Accuracy by subject
* Weakest chapters
* Time per topic (may be)
* Improvement trends (may be or like week performance of correct and wronge)

---

# 9. Tech Alignment

### Data Format

* TipTap JSON as universal content layer

### Frontend Needs

* State management for:

* Test sessions

* Question history

* Favorites

* Progress

---

# Final Summary

### The Axonelix UX Promise

A platform that feels like:

> “A medical library fused with a personal exam simulator”

Where:

* Navigation is surgical
* Testing is intelligent
* Learning is measurable
* Complexity is organized
