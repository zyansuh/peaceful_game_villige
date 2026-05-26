# Architecture Design

## System Overview
Full-stack web application with React frontend and Atoms Cloud backend. Features teacher listing, student application, and admin management.

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Atoms Cloud (Auth, Database, Edge Functions)
- Database: PostgreSQL via Atoms Cloud

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Main Page | Class selection cards | src/pages/Index.tsx |
| Class Page | Teacher list by class | src/pages/ClassPage.tsx |
| Teacher Detail | Full teacher profile | src/pages/TeacherDetail.tsx |
| Application | Student application form | src/pages/ApplicationForm.tsx |
| Admin | Dashboard + management | src/pages/admin/Dashboard.tsx, AdminApplications.tsx, AdminTeachers.tsx |
| Shared | Layout, navigation | src/components/Layout.tsx |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | React Router | Standard SPA routing |
| State | React hooks | Simple state needs |
| API | web-sdk client | Required by Atoms Cloud |
| Styling | Tailwind + shadcn | Pre-configured template |

## File Tree Plan
```
src/
├── App.tsx
├── pages/
│   ├── Index.tsx (main page)
│   ├── ClassPage.tsx (teacher list)
│   ├── TeacherDetail.tsx (teacher profile)
│   ├── ApplicationForm.tsx (student form)
│   ├── ApplicationComplete.tsx (success page)
│   └── admin/
│       ├── Dashboard.tsx
│       ├── AdminApplications.tsx
│       └── AdminTeachers.tsx
├── components/
│   └── Layout.tsx
└── lib/
    └── client.ts
```

## Implementation Guide
1. Set up routing in App.tsx
2. Create shared Layout component
3. Implement pages in order: Index → ClassPage → TeacherDetail → ApplicationForm → Admin
4. Use web-sdk for all API calls