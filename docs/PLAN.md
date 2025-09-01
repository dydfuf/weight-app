## 개발 계획 체크리스트

> 작은 단위의 체크리스트로 실행/추적 가능한 형태로 구성

### 0) 프로젝트/DX 준비

- [x] `package.json` 스크립트 정리: `dev`, `build`, `start`, `lint`, `format`, `typecheck`
- [x] `biome.json` 규칙 확인 및 원클릭 포맷/린트 동작 확인
- [x] 타입체크 워크플로우 확립: 로컬 `pnpm typecheck` 정상 작동
- [x] README 최상단에 로컬 실행 방법/필수 ENV 문서화

### 1) 인증 · 내비게이션

- [x] `.env.local` 생성: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `src/lib/supabase/client.ts`에서 ENV 로드 및 클라이언트 생성 확인
- [x] `src/lib/supabase/server.ts`에서 서버 클라이언트 생성 확인
- [x] `src/app/auth/login/page.tsx`에 `src/components/login-form.tsx` 연동
- [x] `src/app/auth/oauth/route.ts` OAuth 콜백 플로우 정상 동작 점검
- [x] 보호 라우팅 통일: `src/middleware.ts`에서 `(mobile)` 이하 인증 가드 적용
- [x] `src/components/mobile/mobile-header.tsx`에 `src/components/logout-button.tsx` 노출
- [x] 로그인/로그아웃 후 리다이렉트 경로 일관화(`dashboard` 기본)

### 2) 데이터 모델 · RLS (Supabase)

- [x] 테이블 생성: `profiles`
  - [x] 컬럼: `id (uuid, pk, ref auth.users)`, `nickname`, `unit (kg|lb)`, `target_weight`, `created_at`
- [x] 테이블 생성: `weights`
  - [x] 컬럼: `id`, `user_id`, `recorded_at (date)`, `weight_kg (numeric)`, `note`, `created_at`
- [x] 테이블 생성: `workouts`
  - [x] 컬럼: `id`, `user_id`, `performed_at (timestamptz)`, `title`, `note`
- [x] 테이블 생성: `workout_sets`
  - [x] 컬럼: `id`, `workout_id`, `exercise`, `weight_kg`, `reps`, `rpe`
- [x] 테이블 생성: `exercises`
  - [x] 컬럼: `id`, `name`, `primary_muscle`, `secondary_muscles`, `is_compound (bool)`, `created_at`
- [x] 테이블 생성: `program_templates` (프리셋: 무분할/2분할/3분할/5분할/크리스범스테드/5x5 등)
  - [x] 컬럼: `id`, `key (unique)`, `name`, `description`, `days_per_week`, `template_json (jsonb)`, `created_at`
- [x] 테이블 생성: `user_programs` (유저가 선택/생성한 프로그램 인스턴스)
  - [x] 컬럼: `id`, `user_id`, `template_key`, `name`, `start_date`, `status (active|paused|archived)`, `created_at`
- [x] 테이블 생성: `user_maxes` (1RM/체중 베이스라인)
  - [x] 컬럼: `user_id (pk)`, `squat_kg`, `bench_kg`, `deadlift_kg`, `ohp_kg`, `bodyweight_kg`, `source (user|estimate)`, `updated_at`
- [x] 테이블 생성: `planned_workouts` (오늘의 운동 제안/스케줄)
  - [x] 컬럼: `id`, `user_program_id (nullable)`, `user_id`, `planned_for (date)`, `title`, `status (planned|in_progress|done|skipped)`, `created_at`
- [x] 테이블 생성: `planned_sets` (예정 세트/반복/무게)
  - [x] 컬럼: `id`, `planned_workout_id`, `exercise_id`, `target_sets`, `target_reps`, `target_weight_kg`, `rpe`, `percent_of (squat|bench|deadlift|ohp|null)`, `percent_value`
- [x] RLS ON: 각 테이블에 유저 격리 정책(SELECT/INSERT/UPDATE/DELETE)
- [x] 인덱스: `weights.user_id + recorded_at`, `workout_sets.workout_id`
- [x] 인덱스: `planned_workouts.user_id + planned_for`, `planned_sets.planned_workout_id`, `user_programs.user_id`

### 3) 타입 생성 파이프라인

- [x] Supabase 타입 생성 스크립트 추가: `pnpm gen:types`
- [x] 생성 산출물 저장: `src/types/supabase.ts`
- [x] `src/lib/supabase/*`에서 DB 타입 적용(타입 안전한 쿼리 응답)
- [x] 신규 테이블(`exercises`, `program_templates`, `user_programs`, `user_maxes`, `planned_workouts`, `planned_sets`) 포함하여 타입 반영

### 4) 대시보드(핵심 흐름)

- [x] `src/components/weight-entry-form.tsx` 생성(오늘 체중 입력 폼)
  - [x] 입력 유효성: 최소/최대, 소수점 자릿수
  - [x] 단위 전환: kg↔lb 표시/저장은 kg 기준
  - [x] 낙관적 업데이트 + 실패 시 롤백
- [x] `src/app/(mobile)/dashboard/page.tsx` 요약 카드 추가
  - [x] 최근 체중/주간 변화/월간 변화 카드
  - [x] 최근 입력 목록(5~10개)
- [x] 서버 동작: 체중 INSERT/SELECT 서버 액션 또는 서버 컴포넌트에 구현
- [ ] 오늘의 운동 섹션
  - [ ] 오늘 날짜의 `planned_workouts` 조회하여 있을 경우 카드 + CTA(시작하기)
  - [ ] 없을 경우: 프리셋 선택/자동 채우기 모달(무분할/2분할/3분할/5분할/CBum/5x5)
  - [ ] 1RM/체중 정보 결측 시 온보딩 유도(페이지 진입 또는 모달 내 링크)
  - [ ] "시작하기" 클릭 시 `src/app/(mobile)/workout/[slug]/page.tsx`로 이동
  - [ ] 예정 세트(`planned_sets`)를 실제 세트(`workout_sets`)로 전개/동기화
  - [ ] 서버 액션 확장: `src/app/(mobile)/workout/actions.ts`에 계획→실행 변환/완료 처리 추가

### 5) 통계

- [ ] 집계 유틸 작성: `src/lib/stats.ts` (주/월 단위 변화량 계산)
- [ ] 통계 페이지 구현: `src/app/(mobile)/stats/page.tsx`
  - [ ] `src/components/ui/chart.tsx` 사용해 라인 차트 렌더
  - [ ] 빈 데이터/로딩/에러 상태 처리
- [ ] 단위 변환 유틸 강화: `src/lib/utils.ts`에 kg↔lb 함수 및 테스트 케이스 정리

### 5.5) 온보딩 · 1RM/체중 설정

- [ ] 온보딩 라우트: `src/app/(mobile)/onboarding/` (보호 라우트, 최초 로그인/미완료 시 진입)
  - [ ] Step 1: 단위/체중 입력(`profiles.unit`, `user_maxes.bodyweight_kg` 저장)
  - [ ] Step 2: 1RM 또는 추정 정보 입력(스쿼트/벤치/데드/오버헤드프레스)
    - [ ] "모른다" 옵션 제공 → 추정 경로(반복수/무게 또는 건너뛰기)
    - [ ] 추정 공식: Epley/Brzycki (유틸 `src/lib/strength.ts` 제공)
  - [ ] 완료 시 대시보드로 리다이렉트, 프리셋 추천 표시
- [ ] 컴포넌트: `src/components/onboarding/maxes-form.tsx`, `src/components/onboarding/bodyweight-form.tsx`
- [ ] 저장 동작: 서버 액션 또는 RSC에서 `user_maxes` upsert

### 5.6) 프로그램 생성기 · 프리셋

- [ ] 프리셋/생성기 구조 정의: `src/lib/programs/`
  - [ ] `types.ts`: Template/Day/ExercisePrescription 타입 정의
  - [ ] `presets/` 디렉토리: 무분할/2분할/3분할/5분할/크리스범스테드/5x5 스펙 정의(JSON or TS)
  - [ ] `generator.ts`: `generateUserProgram({ templateKey, userMaxes, startDate })`
    - [ ] 퍼센트 기반 무게 산출(예: 5x5=85% 1RM), 2.5kg 라운딩, 단위 반영
  - [ ] `estimation.ts`: 1RM/반복-무게 상호 변환(Epley/Brzycki)
  - [ ] `progression.ts`: 주차/세션별 진행 로직(간단 선형, AMRAP 옵션 등)
- [ ] UI 연동: `src/components/program/preset-picker.tsx` (모달/시트)
- [ ] 선택 결과 저장: `user_programs` 생성, `planned_workouts`/`planned_sets` 배치 생성

### 5.7) 사용자 지정 운동 등록

- [ ] 라우트: `src/app/(mobile)/workout/new/page.tsx`
  - [ ] 기존에 기록한 운동(최근 `workout_sets` 기준) 빠른 선택
  - [ ] `exercises` 검색/선택 → 세트/반복/무게 입력, 세트 복제/일괄 편집
  - [ ] 저장 시: `planned_workouts` + `planned_sets` 생성(오늘 날짜 기본)
- [ ] 컴포넌트: `src/components/workout/exercise-picker.tsx`, `src/components/workout/set-editor.tsx`
- [ ] 서버 액션: 새 계획 생성/업데이트 API(`src/app/(mobile)/workout/actions.ts`)

### 6) 프로필

- [ ] 프로필 표시: `src/app/(mobile)/profile/page.tsx`(닉네임/목표체중/단위)
- [ ] 프로필 수정 폼 및 저장(즉시 반영/토스트)
- [ ] 단위 변경 시 기존 컴포넌트 표시 동기화

### 7) 설정

- [ ] 설정 페이지: `src/app/(mobile)/settings/page.tsx`
- [ ] 테마 토글 연결: `src/components/theme-toggle.tsx` 통합
- [ ] 단위 선택 UI → `profiles.unit` 저장 연동
- [ ] 알림/백업(placeholder) 섹션 배치

### 8) PWA · 오프라인

- [ ] SW 등록: `src/components/common/sw-register.tsx`를 `src/app/layout.tsx`에 포함
- [ ] `public/sw.js` 정적 에셋/차트 폰트 캐싱 전략 추가
- [ ] 오프라인 입력 큐: `src/lib/offline-queue.ts` 작성
  - [ ] 온라인 복구 시 백그라운드 동기화 처리
- [ ] 오프라인 상태 UI 피드백(배너/토스트)

### 9) UX 안정화

- [ ] 로딩 상태 파일 추가: 각 주요 라우트에 `loading.tsx`
- [ ] 에러 상태 파일 추가: 각 주요 라우트에 `error.tsx`
- [ ] 토스트 일관화: `src/components/ui/sonner.tsx` 활용
- [ ] 모바일 키보드 대응(폼 포커스/스크롤, safe-area)

### 10) 품질 · 테스트 · CI

- [ ] 테스트 환경 도입: Vitest + Testing Library
- [ ] 유틸 단위 테스트: `src/lib/utils.ts`(단위 변환)
- [ ] 통계 유닛 테스트: `src/lib/stats.ts`
- [ ] 타입/린트/테스트 CI 워크플로우 초안 정리(로컬 우선)
- [ ] 간단 렌더 스냅샷: 핵심 페이지 최소 1개
- [ ] 브라우저 에러/Rejected promise 캡처(간단 로거나 Sentry 준비)

### 11) 배포 · 운영

- [ ] Vercel 프로젝트 연결 및 프리뷰 배포
- [ ] 환경 변수(Vercel/Supabase) 설정 확인
- [ ] 빌드 헬스체크(경고/에러 확인)
- [ ] Supabase 모니터링: 쿼리 성능/에러 로그 확인 루틴 문서화

### 12) 릴리즈 체크리스트

- [ ] DB 마이그레이션 적용 완료
- [ ] 타입 생성(`pnpm gen:types`) 실행
- [ ] 빌드/타입/린트/테스트 통과 확인
- [ ] E2E 스모크(핵심 유저 여정) 확인
- [ ] 태그/릴리즈 노트 작성 및 공유
