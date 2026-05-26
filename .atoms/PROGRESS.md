# Requirements & Progress

## Requirements Overview
평화로운게임마을 신입 담당선생님 배정 시스템 - 게임 커뮤니티 전용 웹사이트

## User Stories
- 신입 유저가 가입 후 원하는 담당 선생님을 직접 선택
- 관리자는 각 반별 신입 현황과 담당 배정을 쉽게 관리

## Task Breakdown
- [x] Database tables created (teachers, applications)
- [x] Mock data inserted for teachers
- [x] Images generated (mascots + logo)
- [x] Frontend: Main page with 3 class cards
- [x] Frontend: Class detail page with teacher list
- [x] Frontend: Teacher detail page
- [x] Frontend: Application form and completion page
- [x] Frontend: Admin dashboard, application management, teacher management
- [x] Install dependencies and lint/build check
- [x] Frontend: MyPage - application status tracking for logged-in users

## Progress Log
- 2026-05-25: Database tables created (teachers, applications)
- 2026-05-25: Mock data inserted (9 teachers)
- 2026-05-25: Images generated (4 images)
- 2026-05-25: Added urgency UI - blinking 마감임박 badge, progress bars, pulse animations
- 2026-05-26: Deleted old PUBG teachers (달안 dup, 비니코코 dup, 쿠잉, 뚜비, 쫑이) and inserted 7 new PUBG teachers
- 2026-05-26: Updated ClassPage and TeacherDetail to show 성별/출생년도/MBTI/게임유형/소개/인원현황 format
- 2026-05-26: Backend logic added - application creation now increments teacher's current_students and auto-closes when full
- 2026-05-26: Added admin activity logging - admin_logs table + logging on teacher CRUD + dashboard activity feed