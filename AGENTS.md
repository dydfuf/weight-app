# AGENTS.md

이 문서는 AI 에이전트가 코드베이스를 이해하고 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

- **이름**: weight-app
- **목적**: 체지방 감소 및 웨이트 트레이닝 관리를 위한 모바일 퍼스트 PWA
- **주요 기능**: 식단 추적, 운동 추적, 신체 지표 기록, 진행 상황 시각화

## 기술 스택

| 영역             | 기술                       |
| ---------------- | -------------------------- |
| 프레임워크       | React 19 + TypeScript 5.9  |
| 빌드 도구        | Vite 7                     |
| 스타일링         | Tailwind CSS 4, shadcn/ui  |
| 라우팅           | react-router 7             |
| 상태/데이터 페칭 | TanStack React Query 5     |
| 인증             | Clerk (clerk-react-router) |
| 로컬 데이터 저장 | IndexedDB (idb 라이브러리) |
| 차트             | Recharts 3                 |
| PWA              | vite-plugin-pwa            |
| 패키지 매니저    | pnpm                       |

## 디렉토리 구조

```
src/
├── config/           # 앱 메타 정보 (PWA 설정)
├── domain/           # 도메인 타입 정의 (순수 TypeScript)
│   ├── meals/        # FoodEntry, MealType
│   ├── workouts/     # WorkoutSession, WorkoutExercise, WorkoutSet
│   ├── metrics/      # MetricEntry, MetricType
│   └── goals/        # Goals, MacroTargets
├── data/             # 데이터 레이어
│   ├── db.ts         # IndexedDB 스키마 및 연결
│   └── repositories/ # Repository 패턴 구현
├── features/         # React Query 기반 훅 (queries, mutations, keys)
├── layouts/          # 레이아웃 컴포넌트
├── pages/            # 페이지 컴포넌트 (서브 컴포넌트 포함)
├── components/       # 공용 컴포넌트
│   ├── ui/           # shadcn/ui 컴포넌트
│   ├── navigation/   # BottomTabBar
│   ├── date-navigation/
│   └── fab/
└── lib/              # 유틸리티 (queryClient, cn)
```

## 라우팅 구조

```
/                     # LandingPage (Public)
/sign-in/*            # Clerk SignIn
/sign-up/*            # Clerk SignUp
/app/dashboard        # 대시보드 (인증 필요)
/app/meals            # 식단 트래커
/app/workouts         # 운동 트래커
/app/progress         # 진행 상황 (그래프)
/app/settings/*       # 프로필/설정
```

## 아키텍처 패턴

### 1. Repository 패턴

`data/repositories/`에서 데이터 접근을 추상화합니다. 현재는 IndexedDB를 사용하지만, 추후 HTTP API로 교체할 수 있습니다.

```typescript
// 인터페이스 정의
export interface MealRepository {
  getByDate(date: string): Promise<FoodEntry[]>;
  create(input: FoodEntryInput): Promise<FoodEntry>;
  // ...
}

// IndexedDB 구현
export const mealRepository: MealRepository = { ... };
```

### 2. Feature Hooks

`features/*/`에서 TanStack Query 훅을 제공합니다.

```
features/{domain}/
├── keys.ts       # Query key factory
├── queries.ts    # useQuery 훅
└── mutations.ts  # useMutation 훅
```

### 3. 페이지 구조

각 페이지는 `pages/{feature}/` 디렉토리에 서브 컴포넌트와 함께 위치합니다.

```
pages/meals/
├── MealsPage.tsx       # 메인 페이지
├── MealSection.tsx     # 식사 섹션
├── AddFoodDrawer.tsx   # 음식 추가 Drawer
└── index.ts            # 배럴 export
```

## 코딩 컨벤션

### 파일/폴더 명명

- 컴포넌트: `PascalCase.tsx`
- 훅: `useCamelCase.ts`
- 타입: `types.ts`
- 유틸리티: `camelCase.ts`

### 타입 정의

- 도메인 타입은 `domain/{feature}/types.ts`에 정의
- `Input` 타입: 생성/수정 시 사용 (id, createdAt, updatedAt 제외)

```typescript
export interface FoodEntry {
  id: string;
  date: string;
  // ...
}

export type FoodEntryInput = Omit<FoodEntry, "id" | "createdAt" | "updatedAt">;
```

### 날짜 처리

- 날짜 문자열: ISO 형식 `YYYY-MM-DD`
- 타임스탬프: `Date.now()` (밀리초)
- 라이브러리: `date-fns`

### 스타일링

- Tailwind CSS 클래스 사용
- 반응형: 모바일 퍼스트, `max-w-md` 기준
- 색상: CSS 변수 사용 (`--primary`, `--background` 등)
- `cn()` 유틸리티로 조건부 클래스 병합

### Query Key 패턴

```typescript
export const mealKeys = {
  all: ["meals"] as const,
  byDate: (date: string) => [...mealKeys.all, "byDate", date] as const,
  detail: (id: string) => [...mealKeys.all, "detail", id] as const,
};
```

## 주요 명령어

```bash
pnpm dev      # 개발 서버 시작
pnpm build    # 프로덕션 빌드 (tsc + vite)
pnpm lint     # ESLint 실행
pnpm preview  # 빌드 결과 미리보기
```

## 환경 변수

```
VITE_CLERK_PUBLISHABLE_KEY  # Clerk 인증 키 (필수)
```

## 데이터베이스 스키마

IndexedDB `weight-app` (version 2):

| Store            | Key | Indexes                                           |
| ---------------- | --- | ------------------------------------------------- |
| foodEntries      | id  | by-date                                           |
| workoutSessions  | id  | by-date (unique)                                  |
| workoutExercises | id  | by-sessionId, by-date                             |
| workoutSets      | id  | by-sessionId, by-exerciseId, by-date              |
| metricEntries    | id  | by-type, by-date, by-type-date, by-type-createdAt |
| goals            | id  | -                                                 |

## 작업 시 주의사항

1. **모바일 퍼스트**: 하단 탭 네비게이션 고려, safe-area-inset 적용
2. **로컬 퍼스트**: 서버 없이 IndexedDB만으로 동작해야 함
3. **Drawer UX**: 모바일에서는 Modal 대신 바텀 Drawer 사용 (vaul)
4. **날짜 기반 필터링**: 모든 기록은 `date` 필드 기준으로 조회
5. **Optimistic Updates**: mutation 시 UI 즉시 반영 고려
6. **한국어 UI**: 사용자 인터페이스는 한국어로 작성

## 참고 문서

- `docs/spec.md` - 앱 기획 명세서
- `docs/ia.md` - 정보구조(IA) 및 라우팅 설계
- `docs/user-flow.md` - MVP 사용자 플로우
- `docs/migrate-to-rest-api.md` - REST API 마이그레이션 가이드
