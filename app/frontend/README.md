<div align="center">

![Gamema](../../docs/assets/gamema-banner.png)

# 🖥️ Gamema Frontend

**React · TypeScript · Vite · shadcn/ui** 로 만든 게임 멘토링 SPA

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

![스택 아이콘](https://skillicons.dev/icons?i=react,vite,ts,tailwind&perline=4)

[← 루트 README](../../README.md) · [백엔드 README](../backend/README.md)

</div>

---

## 📖 개요

Gamema 프론트엔드는 **Vite + React 18 + TypeScript** 기반 SPA입니다.

| 역할 | 설명 |
|------|------|
| **일반 사용자** | 반별 선생님 탐색, 수강 신청, 마이페이지, 졸업면담 |
| **관리자** | 대시보드, 선생님/신청/졸업면담 관리 (`/admin`) |
| **데이터 연동** | `@metagptx/web-sdk` → FastAPI 백엔드 (`/api` 프록시) |

개발 서버: **http://localhost:3000** · API 프록시: **→ localhost:8000**

---

## 🧰 Tech Stack

| 분류 | 패키지 | 버전 | 용도 |
|------|--------|------|------|
| UI | **React** | ^18.3 | 컴포넌트 SPA |
| 언어 | **TypeScript** | ^5.5 | 타입 안전성 |
| 빌드 | **Vite** | ^5.4 | dev HMR, production build |
| 라우팅 | react-router-dom | ^6.30 | 페이지 라우팅 |
| 스타일 | Tailwind CSS | ^3.4 | 유틸리티 CSS |
| UI 키트 | shadcn/ui + Radix UI | — | Dialog, Sheet, Select, Toast … |
| 아이콘 | lucide-react | ^0.462 | 아이콘 |
| 차트 | recharts | ^2.12 | 관리자 대시보드 |
| 폼 | react-hook-form + zod | — | 폼 검증 |
| 서버 상태 | @tanstack/react-query | ^5.56 | (선택) 캐싱 |
| 백엔드 SDK | @metagptx/web-sdk | latest | Auth, Entity CRUD |
| HTTP | axios | 1.6 | REST 호출 |
| 알림 | sonner, @radix-ui/react-toast | — | 토스트 UI |
| 린트 | ESLint 9 + typescript-eslint | — | 코드 품질 |
| E2E | Playwright | ^1.55 | (선택) 브라우저 테스트 |

---

## 🚀 실행 방법

### 루트에서 (권장)

```bash
# 프로젝트 루트 (gamema/)
npm run dev:all      # 프론트 + 백엔드 동시
npm run dev          # 프론트만
```

### 이 디렉터리에서 직접

```bash
cd app/frontend
npm install
npm run dev          # http://localhost:3000
npm run build        # dist/ 생성
npm run lint         # ESLint
npm run preview      # 빌드 미리보기
```

> ⚠️ 백엔드(`localhost:8000`)가 꺼져 있으면 API 호출·저장이 실패합니다.

---

## 🗺️ 라우트 맵

`src/App.tsx` 기준:

### 공개 페이지 (`Layout` + 우주 테마 헤더)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `pages/home/Index` | 메인 · 반별 카드 |
| `/class/:classId` | `pages/class/ClassPage` | 반별 선생님 목록 |
| `/teacher/:teacherId` | `pages/teacher/TeacherDetail` | 선생님 상세 |
| `/apply/:teacherId` | `pages/application/ApplicationForm` | 수강 신청 |
| `/apply-complete` | `pages/application/ApplicationComplete` | 신청 완료 |
| `/mypage` | `pages/member/MyPage` | 마이페이지 |
| `/graduation-interview` | `pages/interview/GraduationInterview` | 졸업면담 |
| `/interview-complete` | `pages/interview/InterviewComplete` | 면담 완료 |
| `/login` | `pages/auth/Login` | 로그인 |
| `/signup` | `pages/auth/Signup` | 회원가입 |
| `/signup-complete` | `pages/auth/SignupComplete` | 가입 완료 |
| `/auth/callback` | `pages/auth/AuthCallback` | OIDC 콜백 |

### 관리자 (`AdminLayout` + 사이드바)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/admin` | `pages/admin/Dashboard` | 통계 · 차트 |
| `/admin/applications` | `pages/admin/AdminApplications` | 신청 관리 |
| `/admin/teachers` | `pages/admin/AdminTeachers` | 선생님 관리 |
| `/admin/interviews` | `pages/admin/AdminInterviews` | 졸업면담 관리 |

> 관리자 비밀번호 게이트: `game1234` (`AdminPasswordGate`)

### 반(classId) 매핑

| classId | 반 | 게임 |
|---------|-----|------|
| `overwatch` | 🦦 수달반 | Overwatch |
| `pubg` | 🦁 사자반 | PUBG |
| `valorant` | 🦊 여우반 | Valorant |

---

## 📁 디렉터리 구조

```
app/frontend/
├── index.html              # ⚠️ 수정 금지 (배포 시 env 치환)
├── vite.config.ts          # Vite · 프록시 · prerender
├── tailwind.config.ts
├── components.json         # shadcn 설정
├── package.json
├── public/                 # favicon, robots.txt
└── src/
    ├── main.tsx            # 엔트리 (styles/index.css import)
    ├── App.tsx             # 라우터
    ├── components/
    │   ├── ui/             # shadcn/ui (자동 생성, 40+ 컴포넌트)
    │   ├── layout/         # Layout, SiteHeader, SpaceBackground
    │   ├── common/         # PageHeader, LoadingSpinner
    │   ├── admin/          # AdminLayout, Sidebar, FormModal …
    │   └── blog/           # 블로그 Markdown 렌더
    ├── pages/
    │   ├── home/           # Index
    │   ├── class/          # ClassPage
    │   ├── teacher/        # TeacherDetail
    │   ├── application/    # ApplicationForm, Complete
    │   ├── interview/      # GraduationInterview, Complete
    │   ├── member/         # MyPage
    │   ├── auth/           # Login, Signup, Callback …
    │   ├── admin/          # Dashboard, Teachers, Applications …
    │   └── blog/           # BlogIndex, BlogPost
    ├── lib/
    │   ├── api/            # teachers-admin, applications-admin …
    │   ├── config/         # API_BASE_URL 등
    │   ├── blog/           # 블로그 유틸
    │   ├── client.ts       # web-sdk client
    │   └── utils.ts        # cn() re-export
    ├── hooks/
    │   ├── ui/             # use-toast, use-mobile (실구현)
    │   └── use-toast.ts    # shadcn 호환 re-export
    ├── constants/          # game-classes, teacher-form, admin-nav …
    ├── utils/              # teacher-form, dashboard-stats …
    ├── types/                # teacher 등
    ├── styles/             # CSS 모듈 분리
    │   ├── animations/       # space-stars, nebula, laser-border …
    │   ├── theme/            # variables, base-layer
    │   └── utilities/        # responsive, gradients
    └── contexts/           # AuthContext
```

---

## 🎨 스타일 · UI 규칙

### CSS 구조

- **진입점:** `src/styles/index.css` (구 `index.css` 대체)
- **애니메이션:** `styles/animations/` — 우주 배경, 레이저 보더
- **반응형:** `styles/utilities/responsive.css` — `.page-container`, `.card-pad`

### shadcn/ui

- 모든 UI 프리미티브: `@/components/ui/*`
- import 예: `import { Button } from '@/components/ui/button'`
- **추가 설치 불필요** — 이미 프로젝트에 포함됨

### 경로 별칭

```typescript
import PageHeader from '@/components/common/PageHeader';
import { createTeacher } from '@/lib/api/teachers-admin';
```

`@/` → `src/`

### re-export (shadcn 호환)

| import 경로 | 실제 위치 |
|-------------|-----------|
| `@/lib/utils` | `utils/classnames/cn.ts` |
| `@/hooks/use-toast` | `hooks/ui/use-toast.ts` |

---

## 🔌 API · 데이터 연동

### Vite 프록시

```typescript
// vite.config.ts
proxy: { '/api': { target: 'http://localhost:8000' } }
```

브라우저 → `/api/v1/...` → 백엔드 FastAPI

### web-sdk Client

```typescript
import client from '@/lib/client';

// 조회 (본인 데이터)
await client.entities.teachers.query({ query: {}, limit: 20 });

// 관리자 전체 조회
await client.entities.applications.queryAll({ query: {}, limit: 2000 });

// 생성 / 수정 / 삭제
await client.entities.teachers.create({ data: payload });
await client.entities.teachers.update({ id: '1', data: payload });
await client.entities.teachers.delete({ id: '1' });

// 인증
await client.auth.me();
```

### 관리자 전용 API 레이어 (`lib/api/`)

| 파일 | 역할 |
|------|------|
| `teachers-admin.ts` | 선생님 CRUD + admin_logs |
| `applications-admin.ts` | 신청 queryAll, 수정, 삭제 |
| `admin-entities.ts` | 졸업면담 admin delete/update (fetch) |
| `auth.ts` | 인증 헬퍼 |
| `settings.ts` | env 설정 API |

---

## 🧩 주요 컴포넌트

### Layout

| 컴포넌트 | 설명 |
|----------|------|
| `Layout` | 공개 페이지 래퍼 + SiteHeader |
| `SiteHeader` | 데스크톱 nav + **모바일 Sheet** 메뉴 |
| `SpaceBackground` | 우주 배경 애니메이션 |
| `PageHeader` | 제목 · 부제 · 뒤로가기 · action 슬롯 |

### Admin

| 컴포넌트 | 설명 |
|----------|------|
| `AdminLayout` | 사이드바 + **모바일 토글** |
| `AdminSidebar` | nav + 「메인으로 돌아가기」 |
| `AdminPasswordGate` | 관리자 비밀번호 (`game1234`) |
| `TeacherFormModal` | 선생님 등록/수정 → 즉시 DB 저장 |
| `ApplicationFormModal` | 신청 수정 모달 |
| `EditableStatCard` | 대시보드 수치 편집 (localStorage) |

---

## 📱 반응형

- `page-container` — 좌우 패딩 · max-width
- `card-pad` — 카드 내부 패딩 (모바일 축소)
- Admin / AdminTeachers / AdminApplications — `flex-col md:flex-row`, `text-xs sm:text-sm`
- SiteHeader — `md:` breakpoint에서 Sheet 메뉴

---

## 🏗️ 빌드

```bash
npm run build
```

- 출력: `dist/`
- prerender: `/`, `/blog/` (vite-prerender-plugin)
- manualChunks: react, router, ui vendor 분리

환경 변수 (`index.html` 플레이스홀더):

| 변수 | 용도 |
|------|------|
| `VITE_APP_TITLE` | 페이지 타이틀 |
| `VITE_APP_DESCRIPTION` | meta description |
| `VITE_APP_LOGO_URL` | favicon URL |
| `VITE_API_BASE_URL` | API base (런타임 config 실패 시) |
| `VITE_PORT` | dev 서버 포트 (기본 3000) |

> `index.html`은 **직접 수정하지 마세요.** 배포 시 env로 치환됩니다.

---

## ✅ 개발 체크리스트

- [ ] `npm run dev:all` 또는 백엔드 + 프론트 각각 실행
- [ ] `/` 메인 · `/class/overwatch` 등 반별 페이지 확인
- [ ] `/admin` 관리자 (비밀번호 `game1234`)
- [ ] 선생님 등록 → 새로고침 후 데이터 유지
- [ ] `npm run lint` 통과
- [ ] `npm run build` 성공

---

## 🩹 트러블슈팅

| 증상 | 해결 |
|------|------|
| API `ECONNREFUSED` | 루트에서 `npm run dev:backend` |
| `@/` import 오류 | `vite.config.ts` alias 확인 |
| shadcn toast 안 뜸 | `App` 또는 layout에 `<Toaster />` 포함 확인 |
| HMR 느림 (Docker/WSL) | `vite.config` `watch.usePolling: true` (이미 설정됨) |

---

## 📚 더 보기

- [루트 README — 전체 가이드](../../README.md)
- [백엔드 README — API · DB](../backend/README.md)
- [web-sdk 가이드](../backend/skills_docs/web_sdk.md)

<div align="center">

🦦 수달반 · 🦁 사자반 · 🦊 여우반

</div>
