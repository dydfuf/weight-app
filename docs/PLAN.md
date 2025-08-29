## 개발 계획 체크리스트

> 작은 단위의 체크리스트로 실행/추적 가능한 형태로 구성

### 0) 프로젝트/DX 준비

- [x] `package.json` 스크립트 정리: `dev`, `build`, `start`, `lint`, `format`, `typecheck`
- [x] `biome.json` 규칙 확인 및 원클릭 포맷/린트 동작 확인
- [x] 타입체크 워크플로우 확립: 로컬 `pnpm typecheck` 정상 작동
- [x] README 최상단에 로컬 실행 방법/필수 ENV 문서화

### 1) 인증 · 내비게이션

- [ ] `.env.local` 생성: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `src/lib/supabase/client.ts`에서 ENV 로드 및 클라이언트 생성 확인
- [ ] `src/lib/supabase/server.ts`에서 서버 클라이언트 생성 확인
- [ ] `src/app/auth/login/page.tsx`에 `src/components/login-form.tsx` 연동
- [ ] `src/app/auth/oauth/route.ts` OAuth 콜백 플로우 정상 동작 점검
- [ ] 보호 라우팅 통일: `src/middleware.ts`에서 `(mobile)` 이하 인증 가드 적용
- [ ] `src/components/mobile/mobile-header.tsx`에 `src/components/logout-button.tsx` 노출
- [ ] 로그인/로그아웃 후 리다이렉트 경로 일관화(`dashboard` 기본)

### 2) 데이터 모델 · RLS (Supabase)

- [ ] 테이블 생성: `profiles`
  - [ ] 컬럼: `id (uuid, pk, ref auth.users)`, `nickname`, `unit (kg|lb)`, `target_weight`, `created_at`
- [ ] 테이블 생성: `weights`
  - [ ] 컬럼: `id`, `user_id`, `recorded_at (date)`, `weight_kg (numeric)`, `note`, `created_at`
- [ ] 테이블 생성: `workouts`
  - [ ] 컬럼: `id`, `user_id`, `performed_at (timestamptz)`, `title`, `note`
- [ ] 테이블 생성: `workout_sets`
  - [ ] 컬럼: `id`, `workout_id`, `exercise`, `weight_kg`, `reps`, `rpe`
- [ ] RLS ON: 각 테이블에 유저 격리 정책(SELECT/INSERT/UPDATE/DELETE)
- [ ] 인덱스: `weights.user_id + recorded_at`, `workout_sets.workout_id`

### 3) 타입 생성 파이프라인

- [ ] Supabase 타입 생성 스크립트 추가: `pnpm gen:types`
- [ ] 생성 산출물 저장: `src/types/supabase.ts`
- [ ] `src/lib/supabase/*`에서 DB 타입 적용(타입 안전한 쿼리 응답)

### 4) 대시보드(핵심 흐름)

- [ ] `src/components/weight-entry-form.tsx` 생성(오늘 체중 입력 폼)
  - [ ] 입력 유효성: 최소/최대, 소수점 자릿수
  - [ ] 단위 전환: kg↔lb 표시/저장은 kg 기준
  - [ ] 낙관적 업데이트 + 실패 시 롤백
- [ ] `src/app/(mobile)/dashboard/page.tsx` 요약 카드 추가
  - [ ] 최근 체중/주간 변화/월간 변화 카드
  - [ ] 최근 입력 목록(5~10개)
- [ ] 서버 동작: 체중 INSERT/SELECT 서버 액션 또는 서버 컴포넌트에 구현

### 5) 통계

- [ ] 집계 유틸 작성: `src/lib/stats.ts` (주/월 단위 변화량 계산)
- [ ] 통계 페이지 구현: `src/app/(mobile)/stats/page.tsx`
  - [ ] `src/components/ui/chart.tsx` 사용해 라인 차트 렌더
  - [ ] 빈 데이터/로딩/에러 상태 처리
- [ ] 단위 변환 유틸 강화: `src/lib/utils.ts`에 kg↔lb 함수 및 테스트 케이스 정리

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
