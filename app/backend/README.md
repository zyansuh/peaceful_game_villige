<div align="center">

![Gamema](../../docs/assets/gamema-banner.png)

# 🐍 Gamema Backend

**FastAPI · SQLAlchemy · Pydantic** 기반 REST API 서버

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?style=flat-square)](https://www.sqlalchemy.org/)
[![SQLite](https://img.shields.io/badge/SQLite-로컬-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

![스택 아이콘](https://skillicons.dev/icons?i=python,fastapi,postgres,sqlite,docker&perline=5)

[← 루트 README](../../README.md) · [프론트엔드 README](../frontend/README.md)

</div>

---

## 📖 개요

Gamema 백엔드는 **FastAPI** async REST API입니다. [Atoms Cloud](https://github.com) 플랫폼 위에서 Auth · Database · Storage · AI 기능을 제공합니다.

| 항목 | 내용 |
|------|------|
| **로컬 URL** | http://localhost:8000 |
| **헬스체크** | `GET /database/health` |
| **API prefix** | `/api/v1/` (Lambda 프록시 호환) |
| **로컬 DB** | SQLite `gamema.db` (자동 생성) |
| **배포 DB** | PostgreSQL (`.env` 설정) |

프론트엔드 Vite가 `/api/*` → `:8000`으로 프록시합니다.

---

## 🧰 Tech Stack

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 언어 | **Python** | 3.10+ | |
| 프레임워크 | **FastAPI** | ≥0.110 | async REST API |
| 서버 | Uvicorn | ≥0.29 | ASGI |
| ORM | SQLAlchemy | ≥2.0 | async session |
| DB (로컬) | SQLite + aiosqlite | | `gamema.db` |
| DB (배포) | PostgreSQL + asyncpg | | 프로덕션 |
| 마이그레이션 | Alembic | ≥1.13 | 스키마 버전 |
| 검증 | Pydantic v2 | | request/response |
| 설정 | pydantic-settings | | env 변수 |
| 인증 | python-jose | | JWT |
| Lambda | Mangum | 0.19 | AWS 배포 |
| 테스트 | pytest, httpx | | |
| 결제 (선택) | Stripe | | |
| AI (선택) | OpenAI (aihub) | | |

---

## 🚀 실행 방법

### 루트에서 (권장)

```bash
# 프로젝트 루트 (gamema/)
npm run dev:all       # 프론트 + 백엔드
npm run dev:backend   # 백엔드만
```

`dev:backend`는 `DATABASE_URL=sqlite:///./gamema.db`, `LOG_LEVEL=INFO`를 자동 설정합니다.

### 이 디렉터리에서 직접

```bash
cd app/backend
pip install -r requirements.txt

# .env 사용 (권장)
cp .env.example .env

# 로컬 개발 서버 (조용한 로그)
python run_dev.py

# 또는 main.py 직접 (DEBUG 로그 많음)
python main.py
```

| 스크립트 | 설명 |
|----------|------|
| `python run_dev.py` | **권장** — aiosqlite/SQLAlchemy 노이즈 억제 |
| `python main.py` | 표준 엔트리 (verbose DEBUG) |
| `npm start` (package.json) | `run_dev.py` 실행 |

---

## ⚙️ 환경 변수

`.env.example` → `.env` 복사:

```bash
cp app/backend/.env.example app/backend/.env
```

| 변수 | 필수 | 설명 | 예시 |
|------|:----:|------|------|
| `DATABASE_URL` | ✅ | DB 연결 | `sqlite:///./gamema.db` |
| `LOG_LEVEL` | | 로그 레벨 | `INFO` / `DEBUG` |
| `PORT` | | 서버 포트 | `8000` |
| `HOST` | | 바인드 주소 | `0.0.0.0` |
| `JWT_SECRET_KEY` | 배포 | JWT 서명 | |
| `JWT_ALGORITHM` | | | `HS256` |
| `JWT_EXPIRE_MINUTES` | | | `10080` |
| `ADMIN_USER_ID` | | 시작 시 admin 생성 | `admin` |
| `ADMIN_USER_EMAIL` | | | `admin@example.com` |
| `OIDC_*` | 배포 | Atoms Cloud 로그인 | |
| `STRIPE_SECRET_KEY` | 선택 | 결제 | |

동적 env: `settings.xxx` → 환경 변수 `XXX` (`core/config.py`)

---

## 💾 데이터베이스

### 로컬 SQLite

- 파일: `app/backend/gamema.db`
- 첫 실행 시 `initialize_database()` → 테이블 생성
- `initialize_mock_data()` → teachers 등 목 데이터 삽입 (비어 있을 때만)

### PostgreSQL (배포)

```env
DATABASE_URL=postgresql://user:password@host:5432/gamema
```

SQLAlchemy가 `postgresql+asyncpg`로 자동 변환합니다.

### Alembic

```bash
cd app/backend
alembic upgrade head
```

마이그레이션: `alembic/versions/`

---

## 📁 디렉터리 구조

```
app/backend/
├── main.py                 # [PROTECTED] FastAPI 엔트리, router auto-discovery
├── lambda_handler.py       # [PROTECTED] AWS Lambda
├── run_dev.py              # 로컬 dev (조용한 로그)
├── package.json            # npm start → run_dev.py
├── requirements.txt
├── .env.example
├── gamema.db               # 로컬 SQLite (gitignore)
├── logs/                   # 실행 로그 (gitignore)
│
├── core/                   # [PROTECTED] config, database, auth, crypto
├── models/                 # [PROTECTED] ORM (BackendManager 자동 생성)
│
├── routers/                # API 라우트 (자동 등록, /api/v1/ prefix)
├── services/               # 비즈니스 로직
├── schemas/                # Pydantic 모델
├── dependencies/           # FastAPI Depends (auth, db)
├── middlewares/
├── alembic/                # DB 마이그레이션
├── data_models/            # JSON 스키마 / mock 소스
├── mock_data/              # mock JSON
└── skills_docs/            # web-sdk, custom_api, aihub, storage 가이드
```

---

## 🔌 API 엔드포인트

라우터는 `routers/` 패키지에서 **자동 discovery** (`main.py`).

### 헬스 · 시스템

| Method | Path | 설명 |
|--------|------|------|
| GET | `/database/health` | DB 연결 상태 |

### 인증

| Prefix | 설명 |
|--------|------|
| `/api/v1/auth` | OIDC, JWT, login/logout |

### Entity CRUD (web-sdk 연동)

공통 패턴: `GET/POST ""`, `GET/PUT/DELETE "/{id}"`, `GET "/all"` (관리자·전체 조회)

| Entity | Prefix | Gamema 용도 |
|--------|--------|-------------|
| teachers | `/api/v1/entities/teachers` | 선생님 프로필 |
| applications | `/api/v1/entities/applications` | 수강 신청 |
| graduation_interviews | `/api/v1/entities/graduation_interviews` | 졸업면담 |
| admin_logs | `/api/v1/entities/admin_logs` | 관리자 활동 로그 |
| members | `/api/v1/entities/members` | 멤버 |
| reviews | `/api/v1/entities/reviews` | 리뷰 |

### Gamema 커스텀 동작

| 기능 | 위치 | 설명 |
|------|------|------|
| 졸업면담 admin 삭제 | `graduation_interviews.py` | `DELETE /all/{id}` (소유권 무시) |
| 졸업면담 admin 수정 | `graduation_interviews.py` | `PUT /all/{id}` |
| 졸업 시 담당 해제 | `graduation_interviews.py` create | `approved` → `graduated`, `current_students` 감소 |
| teachers-admin | `/api/v1/teachers-admin` | 추가 admin API |

### 기타

| Prefix | 설명 |
|--------|------|
| `/api/v1/storage` | Object Storage |
| `/api/v1/aihub` | AI 생성 · PDF 분석 |
| `/api/v1/admin/settings` | env 설정 (admin) |
| `/api/v1/users` | 유저 |

### curl 예시

```bash
# 헬스
curl http://127.0.0.1:8000/database/health

# 선생님 목록
curl "http://127.0.0.1:8000/api/v1/entities/teachers?limit=20"

# 선생님 생성
curl -X POST http://127.0.0.1:8000/api/v1/entities/teachers \
  -H "Content-Type: application/json" \
  -d '{"game_category":"pubg","class_name":"사자반","nickname":"테스트", ...}'
```

---

## 🏗️ 시작 · 종료 흐름

```mermaid
sequenceDiagram
    participant U as Uvicorn
    participant M as main.py
    participant DB as Database
    participant Mock as mock_data

    U->>M: startup (lifespan)
    M->>DB: initialize_database()
    M->>DB: create_tables()
    M->>Mock: initialize_mock_data()
    M->>M: initialize_admin_user()
    Note over M: 서버 ready :8000
    U->>M: shutdown
    M->>DB: close_database()
```

---

## 🛡️ Protected 경로 (수정 금지)

Atoms Cloud 자동 생성 영역 — **직접 수정하지 마세요.**

| 경로 | 내용 |
|------|------|
| `core/**` | config, database, auth, crypto |
| `models/**` | ORM 모델 |
| `main.py` | 앱 엔트리 |
| `lambda_handler.py` | Lambda 라우팅 |

✅ 수정 가능: `routers/`, `services/`, `schemas/`, `run_dev.py`, `alembic/`

---

## 📋 테이블 · 데이터 규칙

- **유저 테이블 직접 생성 금지** — Atoms Cloud builtin `users` 사용
- `created_at`, `updated_at` — ORM 자동 관리 (payload에 넣지 않음)
- `id` — Integer autoincrement (UUID 사용 금지)
- 공개 데이터 테이블 — `create_only=False` (BackendManager)

### Gamema 주요 테이블

| 테이블 | 설명 |
|--------|------|
| teachers | 선생님 (반, 인원, 상태) |
| applications | 수강 신청 (user_id, teacher_id, status) |
| graduation_interviews | 졸업면담 |
| admin_logs | 관리자 CRUD 로그 |
| users | Atoms builtin (auth) |

---

## 🧪 테스트

### E2E (루트)

```bash
npm run test:e2e:teachers   # 선생님 CRUD 스모크
```

### pytest

```bash
cd app/backend
pytest
```

### Python 문법 검사

```python
python -m py_compile run_dev.py
python -m py_compile routers/graduation_interviews.py
```

---

## 📚 Skill Guides

| 문서 | 내용 |
|------|------|
| [web_sdk.md](./skills_docs/web_sdk.md) | **필독** — Auth, Entity CRUD, queryAll |
| [custom_api.md](./skills_docs/custom_api.md) | FastAPI 커스텀 API, Stripe |
| [ai_capability.md](./skills_docs/ai_capability.md) | AIHub 텍스트·이미지·PDF |
| [object_storage.md](./skills_docs/object_storage.md) | 파일 업로드 · presigned URL |

---

## 🔧 Router 개발 가이드

1. `routers/my_feature.py` 생성
2. `router = APIRouter(prefix="/api/v1/...", tags=[...])`
3. `services/my_feature.py`에 비즈니스 로직
4. **수동 include 불필요** — `main.py`가 패키지 scan

```python
# routers/example.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db

router = APIRouter(prefix="/api/v1/example", tags=["example"])

@router.get("/hello")
async def hello():
    return {"message": "hello"}
```

환경 변수는 `settings.my_key` → `MY_KEY` env.

---

## 🩹 트러블슈팅

| 증상 | 해결 |
|------|------|
| `DATABASE_URL environment variable is required` | `.env` 또는 `npm run dev:backend` |
| 포트 8000 사용 중 | 기존 프로세스 종료 후 재실행 |
| `ModuleNotFoundError: pydantic_settings` | `pip install -r requirements.txt` |
| SQL 로그 과다 | `LOG_LEVEL=INFO` + `run_dev.py` |
| Windows 한글 JSON curl 실패 | Python httpx/urllib 사용 |

---

## Atoms Cloud 개발 워크플로 (참고)

<details>
<summary>📦 신규 테이블 · 기능 추가 시 (BackendManager)</summary>

1. **DB First** — `BackendManager.create_tables` (json-schema)
2. **Mock Data** — `BackendManager.insert_table_data`
3. **Features** — `BackendManager.create_function`
4. **Payment** — `routers/payments.py` + Stripe
5. **Storage** — `BackendManager.create_bucket`

자세한 규칙은 위 Skill Guides 참고.

</details>

---

<div align="center">

**Made with 💚 FastAPI · SQLAlchemy · Python**

[루트 README](../../README.md) · [프론트엔드](../frontend/README.md)

</div>
