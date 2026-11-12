<div align="center">

![Gamema 배너 — 수달·사자·여우 멘토링](./docs/assets/gamema-banner.png)

# 🎮 Gamema

**게임 멘토링 클래스 · 수강 신청 · 선생님 관리 · 졸업면담**을 한곳에서!

> 수달반 🦦 · 사자반 🦁 · 여우반 🦊 — 함께 성장하는 게임 클래스

<br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

<br/>

![기술 스택 아이콘](https://skillicons.dev/icons?i=react,vite,ts,tailwind,fastapi,python,sqlite,postgres,docker,git&perline=5)

</div>

---

## 📖 이 프로젝트는?

**Gamema**는 게임 멘토링 프로그램을 위한 **풀스택 웹 애플리케이션**입니다.

| 👤 대상 | 🛠️ 할 수 있는 것 |
|--------|------------------|
| **일반 유저** | Discord 로그인 · 반별 선생님 둘러보기 · 수강 신청 · 마이페이지 · 졸업면담 작성 |
| **관리자** | 대시보드 · 회원/닉네임 관리 · 선생님 CRUD · 신청 승인/거절 · 졸업면담 관리 |

우주 테마 UI 🌌 + 모바일 반응형 📱 + Discord OAuth 🔐 + 관리자 모달 즉시 저장 💾까지 갖춘, **실제 운영을 염두에 둔** 프로젝트예요.

---

## ✨ 주요 기능

### 🌟 사용자 페이지

| 기능 | 설명 |
|------|------|
| 🏠 **메인** | 클래스 소개, 반별(수달/사자/여우) 안내 |
| 📚 **반별 페이지** | 선생님 목록 · 모집 상태 · 인원 |
| 👨‍🏫 **선생님 상세** | 프로필 · MBTI · 소개 · 신청 버튼 |
| 🔐 **Discord 로그인** | 지정 Discord 서버 멤버만 가입 · HttpOnly JWT 쿠키 |
| 🏷️ **닉네임 설정** | 최초 로그인 시 `/setup-nickname` (서버 닉 우선 프리필) |
| 📝 **수강 신청** | 경력 · 담당 선생님 선택 |
| 💬 **졸업면담** | 졸업생 인터뷰 제출 (제출 시 담당 선생님 자동 해제) |
| 👤 **마이페이지** | 프로필 닉네임 · 내 신청 · 면담 내역 |

### 🔐 관리자 페이지 (`/admin`)

> 화면 하단의 거의 안 보이는 「관리자」 링크 → 비밀번호 게이트 `game1234` (로컬 개발용)

| 메뉴 | URL | 하이라이트 |
|------|-----|-----------|
| 📊 **대시보드** | `/admin` | 월별 차트 · 반별 통계 · admin_logs |
| 👥 **회원 목록** | `/admin/members` | 표시 닉 통일 · 검색 · 관리자 지정/초기화 |
| 👨‍🏫 **선생님 관리** | `/admin/teachers` | 등록/수정 모달 → **즉시 DB 저장** |
| 📋 **신청 관리** | `/admin/applications` | **전체 신청** queryAll · 토스트 알림 |
| 🎓 **졸업면담** | `/admin/interviews` | 월별 통계 · 반별 닉네임 조회 · 삭제 |
| 🔑 **권한 관리** | `/admin/roles` | admin / teacher / user |

### 🏷️ 닉네임 표시 우선순위

사이트 전체(`display_name` / `getDisplayNickname`)에서 동일한 순서를 사용합니다.

1. **관리자·사용자 지정 닉네임** (`name` + `nickname_configured`)
2. **평겜마 Discord 서버 nick** (`discord_guild_nickname`)
3. **Discord 전역 표시 이름** (`discord_global_name`)
4. **Discord username** (`discord_username`)

> Discord 재로그인·동기화 시에도 **지정 닉네임은 덮어쓰지 않습니다.**  
> 상세: [`docs/discord-nickname-sync-report.md`](./docs/discord-nickname-sync-report.md)

---

## 🧰 사용 기술 (Tech Stack)

### 🖥️ 프론트엔드 — `app/frontend`

| 분류 | 기술 | 버전 / 비고 |
|------|------|------------|
| **언어** | TypeScript | ^5.5 |
| **UI 프레임워크** | **React** | ^18.3 — 컴포넌트 기반 SPA |
| **빌드 도구** | **Vite** | ^5.4 — HMR, 빠른 dev 서버 |
| **라우팅** | React Router | ^6.30 — 페이지 전환 |
| **스타일** | Tailwind CSS | ^3.4 — 유틸리티 CSS |
| **UI 컴포넌트** | shadcn/ui + Radix UI | Dialog, Select, Toast, Sheet … |
| **아이콘** | Lucide React | ^0.462 |
| **차트** | Recharts | ^2.12 — 관리자 대시보드 |
| **폼** | React Hook Form + Zod | 유효성 검사 |
| **데이터** | TanStack React Query | ^5.56 |
| **HTTP / SDK** | `@metagptx/web-sdk` | Auth · Entity CRUD · API |
| **기타** | axios, date-fns, sonner, canvas-confetti | |
| **린트** | ESLint 9 + typescript-eslint | |
| **E2E (선택)** | Playwright | ^1.55 |

### ⚙️ 백엔드 — `app/backend`

| 분류 | 기술 | 비고 |
|------|------|------|
| **언어** | **Python** | 3.10+ 권장 |
| **웹 프레임워크** | **FastAPI** | ≥0.110 — async REST API |
| **ASGI 서버** | Uvicorn | ≥0.29 |
| **ORM** | SQLAlchemy | ≥2.0 — async |
| **DB (로컬)** | SQLite + aiosqlite | `gamema.db` 자동 생성 |
| **DB (배포)** | PostgreSQL + asyncpg | `.env`로 전환 |
| **마이그레이션** | Alembic | ≥1.13 |
| **검증** | Pydantic v2 | 스키마 / 설정 |
| **인증** | Discord OAuth2 + JWT | HttpOnly Cookie · 길드 멤버 검증 |
| **배포** | Vercel (프론트+API) | Neon Postgres · FastAPI 서버리스 |
| **테스트** | pytest + httpx | |
| **기타** | Stripe, OpenAI (aihub), cryptography | 필요 시 사용 |

### 🛠️ 개발 · 운영 도구

| 도구 | 용도 |
|------|------|
| **npm** | 프론트 의존성 · 루트 스크립트 |
| **pip** | Python 패키지 |
| **cross-env** | Windows/Mac 환경 변수 |
| **concurrently** | `dev:all` — 프론트+백 동시 실행 |
| **Git** | 버전 관리 |

---

## 🏗️ 아키텍처

```mermaid
flowchart LR
    subgraph Browser["🌐 브라우저"]
        UI["React SPA\n(Vite :3000)"]
    end

    subgraph DevProxy["⚡ Vite Proxy"]
        P["/api/* → :8000"]
    end

    subgraph Backend["🐍 FastAPI :8000"]
        R["routers/"]
        S["services/"]
        M["models/ (ORM)"]
    end

    subgraph DB["💾 Database"]
        SQLite["SQLite (로컬)"]
        PG["PostgreSQL (배포)"]
    end

    UI --> P --> R --> S --> M
    M --> SQLite
    M -.-> PG
```

```
gamema/
├── 📦 package.json              ← dev:all, dev:backend …
├── 📜 README.md                 ← 지금 보고 있는 문서!
├── 🧪 scripts/
│   └── e2e-teachers.py          ← 선생님 CRUD 스모크 테스트
├── 🖼️ docs/assets/
│   └── gamema-banner.png
└── app/
    ├── frontend/                ← React + Vite + shadcn
    │   └── src/
    │       ├── pages/           home · class · teacher · admin …
    │       ├── components/      layout · admin · common · ui
    │       ├── lib/api/         teachers-admin, applications-admin …
    │       ├── hooks/           use-toast, use-mobile …
    │       ├── styles/          CSS 모듈 분리
    │       └── utils/           teacher-form, dashboard-stats …
    └── backend/                 ← FastAPI
        ├── main.py              API 엔트리
        ├── run_dev.py           로컬 서버 (조용한 로그)
        ├── routers/             /api/v1/ …
        ├── services/            비즈니스 로직
        ├── models/              ORM (자동 생성)
        ├── .env.example
        └── gamema.db            ← 로컬 SQLite (gitignore)
```

---

## 🚀 빠른 시작

### 사전 준비

| 프로그램 | 버전 | 설치 확인 |
|---------|------|----------|
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **Python** | 3.10+ | `python --version` |
| **pip** | 최신 | `pip --version` |
| **Git** | 아무거나 | `git --version` |

### 1️⃣ 클론 & 의존성 설치 (최초 1회)

```bash
git clone <your-repo-url> gamema
cd gamema
npm run install:all
```

<details>
<summary>📦 <code>install:all</code>이 하는 일</summary>

1. 루트 npm 패키지 (`concurrently`, `cross-env`)
2. `app/frontend` — React, Vite, shadcn …
3. `app/backend` — `pip install -r requirements.txt`

</details>

### 2️⃣ 개발 서버 실행

#### ⭐ 한 번에 (가장 편해요!)

```bash
npm run dev:all
```

| 서비스 | 주소 | 설명 |
|--------|------|------|
| 🖥️ 프론트 | http://localhost:3000 | React 앱 |
| 🐍 백엔드 | http://localhost:8000 | FastAPI |
| ❤️ 헬스체크 | http://localhost:8000/database/health | DB 연결 확인 |

#### 터미널 2개로 나누기

```bash
# 터미널 1 — 백엔드
npm run dev:backend

# 터미널 2 — 프론트
npm run dev
```

> ⚠️ **주의:** 백엔드가 꺼져 있으면 `ECONNREFUSED` / 저장 실패가 납니다!  
> 포트 8000이 이미 사용 중이면 기존 백엔드를 `Ctrl+C`로 끄고 다시 실행하세요.

---

## 📜 npm 스크립트 치트시트

| 명령 | 설명 |
|------|------|
| `npm run dev:all` | 🚀 프론트 + 백엔드 **동시 실행** |
| `npm run dev` | 프론트만 (Vite `:3000`) |
| `npm run dev:backend` | 백엔드만 (SQLite + 조용한 로그) |
| `npm run build` | 프로덕션 빌드 → `dist/` |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run install:all` | 전체 의존성 설치 |
| `npm run install:frontend` | 프론트만 |
| `npm run install:backend` | Python만 |
| `npm run test:e2e:teachers` | 선생님 CRUD API 스모크 테스트 |

---

## ⚙️ 백엔드 설정

### 환경 변수

```bash
cp app/backend/.env.example app/backend/.env
```

| 변수 | 필수 | 설명 |
|------|:----:|------|
| `DATABASE_URL` | ✅ | 로컬: `sqlite:///./gamema.db` / 운영: Neon Postgres |
| `LOG_LEVEL` | | `INFO`(기본) / `DEBUG`(SQL 상세) |
| `JWT_SECRET_KEY` | ✅ 배포 | JWT 서명 키 (또는 `JWT_SECRET`) |
| `FRONTEND_URL` | ✅ 배포 | 예: `https://peaceful-game-villige.vercel.app` |
| `DISCORD_CLIENT_ID` | ✅ | Discord Application ID |
| `DISCORD_CLIENT_SECRET` | ✅ | Discord Client Secret |
| `DISCORD_GUILD_ID` | ✅ | 평겜마 서버 ID (멤버만 로그인) |
| `DISCORD_REDIRECT_URI` | ✅ | `{FRONTEND_URL}/api/v1/auth/discord/callback` |
| `DISCORD_GUILD_CHECK` | | 기본 `true` |
| `DISCORD_ADMIN_IDS` | | 관리자 Discord User ID (쉼표) |
| `COOKIE_SECURE` | 배포 | HTTPS면 `true` |
| `PORT` | | 기본 `8000` (Railway/Render는 `$PORT`) |

> 💡 `npm run dev:backend`는 `.env` 없이도 SQLite + `LOG_LEVEL=INFO`로 바로 동작합니다.  
> 💡 OAuth scopes: `identify guilds guilds.members.read email` (서버 nick 조회)

### Discord Redirect URI

| 환경 | URL |
|------|-----|
| 개발 | `http://localhost:3000/api/v1/auth/discord/callback` |
| 운영 | `https://peaceful-game-villige.vercel.app/api/v1/auth/discord/callback` |

### 데이터베이스

| 환경 | DB | 파일/설정 |
|------|-----|----------|
| 🏠 로컬 | SQLite | `app/backend/gamema.db` (첫 실행 시 테이블·목 데이터 자동 생성) |
| 🌍 배포 (Vercel) | **Neon Postgres** | Vercel env `DATABASE_URL` |
| 기타 | PostgreSQL | `DATABASE_URL=postgresql://user:pass@host:5432/gamema` |

닉네임 컬럼 마이그레이션(운영 적용 전 백업 권장):

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_global_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_guild_nickname VARCHAR(255);
```

또는 `alembic upgrade head` (`a1b2c3d4e5f6_add_discord_nickname_fields`).

---

## 🔌 API & 프록시

개발 중 Vite가 API를 백엔드로 넘겨줍니다:

```
브라우저  →  /api/v1/...  →  Vite Proxy  →  http://localhost:8000/api/v1/...
```

```bash
# DB 헬스 체크
curl http://127.0.0.1:8000/database/health

# 선생님 목록
curl http://127.0.0.1:8000/api/v1/entities/teachers
```

---

## 🧪 테스트

백엔드가 켜진 상태에서:

```bash
npm run test:e2e:teachers
```

```
==> Health check
==> CREATE teacher
==> UPDATE status -> closed
==> VERIFY persisted
==> DELETE teacher
==> VERIFY deleted (404)
OK - teacher CRUD E2E passed
```

---

## 🎨 UI / UX 하이라이트

- 🌌 **우주 테마** — 네bula, 별, 행성 애니메이션 (`styles/animations/`)
- 📱 **모바일 반응형** — Sheet 메뉴, `page-container`, 반별 카드
- 🔔 **토스트 알림** — 신청 관리 상태 변경 · 삭제 피드백
- 📝 **관리자 모달** — 선생님/신청 수정 → 저장 즉시 DB 반영
- 📊 **Recharts** — 월별 신청·졸업면담 차트
- ✏️ **EditableStatCard** — 대시보드 수치 localStorage 오버라이드

---

## 🦦🦁🦊 반(클래스) 안내

| 반 | 마스코트 | 게임 | API category |
|----|---------|------|--------------|
| 🦦 **수달반** | 수달 | **Overwatch** (오버워치) | `overwatch` |
| 🦁 **사자반** | 사자 | **PUBG** (배틀그라운드) | `pubg` |
| 🦊 **여우반** | 여우 | **Valorant** (발로란트) | `valorant` |

---

## 🩹 트러블슈팅

| 😵 증상 | 💊 해결 |
|--------|--------|
| `ECONNREFUSED` | `npm run dev:backend` 또는 `dev:all` 실행 |
| 포트 8000 사용 중 | 기존 백엔드 `Ctrl+C` → 재실행 (터미널 하나만!) |
| `ModuleNotFoundError: pydantic_settings` | `npm run install:backend` |
| SQL 로그가 너무 많음 | `LOG_LEVEL=INFO` (dev:backend 기본값) |
| 신청 목록 일부만 보임 | ✅ `queryAll` 적용 완료 — 최신 코드인지 확인 |
| Discord 로그인 후 서버 닉이 안 보임 | Discord 앱에서 **재동의**(scope에 `guilds.members.read`) · `DISCORD_GUILD_ID` 확인 |
| Vercel `/api` 503 | Neon `DATABASE_URL` · Discord/JWT env · `api/index.py` 배포 로그 확인 |
| Windows 한글 curl 오류 | `npm run test:e2e:teachers` (Python 스크립트 사용) |

---

## 🚀 배포 (Vercel + Neon)

| 항목 | 값 |
|------|-----|
| Root Directory | `app/frontend` |
| Framework | Vite |
| DB | Neon Postgres → `DATABASE_URL` |
| API | `app/frontend/api/index.py` → FastAPI ASGI |
| Env 예시 | `app/frontend/vercel.env.example` |

```
브라우저 → peaceful-game-villige.vercel.app
         ├─ /          React SPA
         └─ /api/*     FastAPI (Vercel Python) → Neon
```

---

## 📚 관련 문서

| 문서 | 내용 |
|------|------|
| [프론트엔드 README](app/frontend/README.md) | shadcn, 빌드, 컴포넌트 규칙 |
| [백엔드 README](app/backend/README.md) | Atoms Cloud, 테이블 규칙, API |
| [Discord 닉네임 동기화 보고서](docs/discord-nickname-sync-report.md) | 표시 우선순위 · 마이그레이션 · 위험 요소 |
| [Vercel env 예시](app/frontend/vercel.env.example) | Neon · Discord · JWT 운영 변수 |

---

## 🤝 기여 & 라이선스

버그 제보 · 기능 제안은 Issue / PR 환영합니다! 🎉

---

<div align="center">

**Made with 💙 React · TypeScript · FastAPI · Python**

🦦 수달반 · 🦁 사자반 · 🦊 여우반 — **Gamema**와 함께 게임 실력 UP!

</div>
