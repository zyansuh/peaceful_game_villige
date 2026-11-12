# Discord 닉네임 표시·동기화 개선 보고서

작성일: 2026-11-13  
대상: 평화로운게임마을 (SQLAlchemy User — Prisma 아님)

---

## 1. 닉네임이 일치하지 않았던 원인

1. **로그인 시 Discord `username`만 저장**  
   `global_name`(개인 표시 이름)과 평겜마 **서버 nick**을 조회·저장하지 않음.
2. **Guild Member API 미호출**  
   OAuth scope에 `guilds.members.read`가 없어 서버 닉네임을 가져올 수 없었음.
3. **표시 경로 불일치**  
   - 일부 화면: `users.name`  
   - 졸업면담: 구 `members.username`  
   - 선생님 담당 학생: `applications.nickname` 스냅샷  
   - 헤더: `user.name`만  
4. **공통 표시 함수 부재** → 화면마다 다른 필드를 직접 참조.

---

## 2. 수정한 파일 목록

### Backend
- `models/auth.py` — `discord_global_name`, `discord_guild_nickname` 추가
- `services/nickname.py` — **신규** 표시 우선순위 헬퍼
- `services/discord_auth.py` — guild member nick 조회·동기화, scope 확장
- `services/user.py` — 검색, 지정 닉 초기화
- `services/auth.py` — JWT claims에 Discord 닉 필드·display_name
- `dependencies/auth.py` — `UserResponse.display_name` 포함
- `schemas/auth.py` — 응답 스키마 확장
- `routers/user.py` — directory `?q=` 검색, `DELETE .../nickname` 초기화
- `alembic/versions/a1b2c3d4e5f6_add_discord_nickname_fields.py` — **마이그레이션 작성만 (미적용)**

### Frontend
- `src/lib/nickname.ts` — **신규** `getDisplayNickname` / `getNicknamePrefill`
- `src/types/auth.ts`, `lib/api/members-admin.ts`, `lib/api/users-admin.ts`
- `pages/admin/AdminMembers.tsx` — 표시·검색·지정/초기화
- `pages/admin/AdminInterviews.tsx` — users directory 기반 표시명
- `pages/admin/AdminTeachers.tsx` — 담당 학생 표시명 보강
- `pages/admin/AdminRoles.tsx`, `components/admin/AdminStaffGate.tsx`
- `pages/auth/SetupNickname.tsx` — 서버 닉 우선 프리필
- `components/layout/Layout.tsx`, `pages/member/MyPage.tsx`
- `vercel.env.example`

---

## 3. 닉네임 표시 우선순위

1. **관리자/사용자 지정** (`name` + `nickname_configured=true`)
2. **평겜마 서버 nick** (`discord_guild_nickname`)
3. **Discord global_name** (`discord_global_name`)
4. **Discord username** (`discord_username`)

API 응답의 `display_name`과 프론트 `getDisplayNickname()`이 동일 규칙을 사용합니다.

---

## 4. 관리자 수정값 보존 방식

- 지정 닉 = `name` + `nickname_configured=True`
- Discord 재로그인/동기화 시 **`name` / `nickname_configured`는 절대 덮어쓰지 않음**
- 동기화 대상: `discord_username`, `discord_global_name`, `discord_guild_nickname`, avatar, email
- 초기화: `DELETE /api/v1/users/staff/{id}/nickname` → `name=null`, `nickname_configured=false` → 서버 닉으로 복귀

---

## 5. 기존 회원 데이터 처리 방식

- 기존 `name` / `nickname_configured` **삭제·일괄 변환하지 않음**
- 이미 `nickname_configured=true`인 값은 **관리자/사용자 지정으로 보존**
- `nickname_configured=false`인 기존 회원: 재로그인 시 서버 nick·global_name이 채워지며, 표시는 helper 우선순위 따름
- 임의로 전원을 지정 닉으로 간주하지 않음

---

## 6. 테스트 결과

| 시나리오 | 결과 |
|----------|------|
| 코드 경로: guild nick 저장·표시 | 구현 완료 |
| 지정 닉 보존 (재로그인) | 동기화 로직에서 name 미갱신 확인 |
| 지정 닉 초기화 API | DELETE 엔드포인트 추가 |
| 검색 (지정/서버/global/username) | directory `?q=` |
| 졸업면담·담당 학생 표시 | users directory 연동 |
| 실제 Discord E2E | **운영 재로그인·scope 재동의 후 수동 확인 필요** |

> Discord Developer Portal에서 앱이 `guilds.members.read`를 쓰려면 사용자가 **재동의(consent)** 해야 서버 nick이 채워집니다.

---

## 7. DB 마이그레이션 필요 여부

**필요함** (컬럼 2개 추가).

- 파일: `alembic/versions/a1b2c3d4e5f6_add_discord_nickname_fields.py`
- **본 작업에서는 DB에 적용하지 않음** (요청사항)
- 런타임: `core.database`의 auto-add-column이 로컬/일부 환경에서 컬럼을 추가할 수 있음
- **Neon 운영**: 백업 후 `alembic upgrade head` 권장

```sql
-- 수동 적용 예시 (PostgreSQL)
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_global_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_guild_nickname VARCHAR(255);
```

---

## 8. 추가로 확인해야 할 위험 요소

1. **OAuth scope 재동의** — 기존 로그인 유저는 한 번 더 Discord 동의 필요
2. **Guild Member API Rate Limit** — 로그인당 1회 호출로 제한 (배치 동기화 없음)
3. **서버 탈퇴** — guild check로 로그인 차단; nick 조회 404 시 `discord_guild_nickname`만 비움 (지정 닉 유지)
4. **API 일시 실패** — `fetched=False`면 기존 서버 닉 **보존**
5. **applications.nickname** — 신청 시점 스냅샷은 유지; 관리 화면은 Discord ID로 현재 표시명 보강
6. **선생님 프로필 `teachers.nickname`** — 선생님 카드용 별도 필드 (회원 Discord 닉과 무관)

---

## 동기화 정책 요약

| 동작 | 정책 |
|------|------|
| 신규 가입 | username / global_name / guild nick 저장, 지정 닉 없음 |
| 재로그인 | Discord 필드 최신화, 지정 닉 유지 |
| 관리자 수정 | `name` + configured=true |
| 관리자 초기화 | configured=false → 서버 닉 표시 |
| API 오류 | 기존 서버 닉 유지 |
