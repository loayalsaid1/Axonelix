🧠 Axonelix Med-Learning Platform
High-Density, Low-Cognitive Load UI/UX Architecture

We are designing for high-stress medical students, meaning:

Zero clutter.

Stable navigation.

Predictable interactions.

High information density without visual overload.

Fast access to wrong answers + weak areas.

1️⃣ GLOBAL LAYOUT STRUCTURE
🧱 App Shell Layout (Non-Collapsible Sidebar)
| Sidebar (Fixed 280px) | Main Workspace | Utility Panel (Contextual) |

Sidebar (Persistent, Non-Collapsible)

Clinical, structured, stable.

Sections:

Dashboard

Library

QBank

Old Exams

Flashcards

Performance

Profile

Design Specs:

Background: Soft neutral (#F7F9FB or light gray-blue)

Active item: Left accent bar (medical blue)

Icons: Minimal outline (Feather or Lucide)

No animation-heavy transitions

This reduces cognitive load and prevents navigation disorientation.

2️⃣ INFORMATION ARCHITECTURE (Deep Hierarchy Without Getting Lost)
A. Library (Material Explorer)
🔍 Left Sub-Sidebar (Inside Library)

Two navigation modes toggle:

Tree View

Module
   Subject (T/P)
      Chapter
         Lesson
            - Misc


Search Mode

Instant lesson search

Tag filters

Recent + Favorites pinned

📍 Breadcrumb (Top of Main Panel)

Example:

Module 3 > Internal Medicine > Cardiology > Arrhythmias > Atrial Fibrillation


Clickable at every level.

This prevents hierarchy fatigue.

📚 Lesson Dashboard (Default Library View)

Grid layout:

Continue Learning

Recent Lessons

Favorite Lessons

Weak Areas (AI-generated later)

Cards include:

Lesson title

Question count

Completion %

Incorrect count badge (red subtle dot)

📖 Lesson View (Tabbed Interface)

Tabs:

| Content | Questions | Flashcards |

Content Tab

Clean reading mode

Adjustable text size

Sticky lesson header

Highlighting + notes

Default: Preview mode (TipTap JSON rendered cleanly)

Questions Tab

Inline question preview

Filter:

Incorrect only

Unread only

Quick mini-test mode (10 questions)

Flashcards Tab

Spaced repetition system

Show/hide answers

“Mark Hard”

3️⃣ QBANK & TEST ENGINE (High Performance Mode)
🧪 Test Creation Page (Filter-Heavy but Structured)

Split layout:

Left Column (Filters)

Material hierarchy selector (multi-level dropdown)

Question type (MCQ / Written)

Incorrect only

Unread only

Randomize toggle

Question count slider

Time limit toggle

Right Column:

Live test preview stats:

Selected question count

Difficulty breakdown

Estimated time

CTA:
Primary button: Generate Test

🧠 Test Interface (Focus Mode)

Remove distractions.

Layout
| Question Card |
| Answer Options |
| Explanation (collapsed) |
| Controls Bar |

🧩 Question Card

Supports:

Tables

Images

Multi-line headers

Rich formatting (TipTap JSON)

Spacing:

Max width: 820px

Generous vertical rhythm

Image auto-scale

✅ Answer Cards Component

Reusable component:

Props:

isCorrect

isSelected

showReference

States:

State	Visual
Default	White background
Selected	Soft blue border
Correct	Green border + soft green bg
Incorrect	Red border
Strike-through	Muted opacity + line-through

Interaction:

Click to strike-through

Click circle to select

Toggle explanation

🔄 Test Controls Bar (Sticky Bottom)

Mark for Later

Suspend

End Test

Timer (top right persistent)

Progress (12/40)

📊 Post-Test Review Screen

Split view:

Left:

Question list (color-coded)
Right:

Question + explanation

Legend:

Green = Correct

Red = Incorrect

Yellow = Marked

If incorrect → added to Incorrect Records
If later answered correctly → auto-removed from Incorrect Records but preserved in history.

Clean and logical.

4️⃣ OLD EXAMS MODULE

Filter panel:

University

Year

Exam Type

Part (T/P)

Display:
Card grid with:

Exam metadata

Difficulty indicator

Average student score

Click → Launch exam simulation mode.

5️⃣ ADMIN WORKSPACE
Hierarchy Builder

Tree editor:

Drag-and-drop structure:

Add Module

Add Subject

Add Chapter

Add Lesson

Bulk import option (CSV/JSON).

Question Editor (TipTap-Based)

Split layout:

Left: Editor
Right: Live Preview (default view)

Features:

MCQ builder

Add explanation (JSON export)

Mark correct answers

Add references

Add image

Tag lesson

Preview always default.

6️⃣ VISUAL DESIGN SYSTEM
Color Palette

Primary: Medical Blue (#2B6CB0)

Success: Muted Green

Error: Clinical Red (not bright red)

Background: Soft gray-white

Avoid dark mode initially (medical students prefer clarity for long reading).

Typography

Headings: Inter SemiBold

Body: Inter Regular

Code/JSON: JetBrains Mono

Line height: 1.6 minimum

7️⃣ PERFORMANCE DASHBOARD

Stats:

Study streak

Weekly hours

Weak modules

Incorrect trend graph

Mastery heatmap (Module × Subject)

Focus:
Encourage progress, not guilt.

🎯 Why This Works for Med Students

Stable navigation (non-collapsible sidebar)

Deep hierarchy without losing context

Fast incorrect question access

Clean test focus mode

High-density but structured UI

Minimal animations

Efficient late-night usability
