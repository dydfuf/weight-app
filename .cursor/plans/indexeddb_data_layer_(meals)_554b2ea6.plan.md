---
name: IndexedDB Data Layer (Meals)
overview: 식단(Meals) 도메인을 기준으로 IndexedDB 기반 데이터 계층을 구축합니다. Repository 패턴을 적용해 추후 REST API로 교체 가능한 구조를 만듭니다.
todos:
  - id: add-idb
    content: idb 의존성 추가 (pnpm add idb)
    status: completed
  - id: domain-types
    content: src/domain/meals/types.ts - FoodEntry 타입 정의
    status: completed
  - id: db-init
    content: src/data/db.ts - IndexedDB 초기화 (openDB, foodEntries store)
    status: completed
  - id: repository
    content: src/data/repositories/mealRepository.ts - 인터페이스 + IDB 구현
    status: completed
  - id: query-keys
    content: src/features/meals/keys.ts - Query key 팩토리
    status: completed
  - id: queries
    content: src/features/meals/queries.ts - useQuery hooks (useFoodEntriesByDate)
    status: completed
  - id: mutations
    content: src/features/meals/mutations.ts - useMutation hooks (add/update/delete)
    status: completed
  - id: lint-check
    content: 타입/린트 확인
    status: completed
---

# IndexedDB Data Layer (Meals First)

## 아키텍처 개요

```mermaid
flowchart TB
    subgraph UI ["UI Layer"]
        MealsPage["MealsPage.tsx"]
    end

    subgraph Features ["Feature Layer"]
        Queries["queries.ts<br/>useQuery hooks"]
        Mutations["mutations.ts<br/>useMutation hooks"]
        Keys["keys.ts<br/>queryKey 정의"]
    end

    subgraph Data ["Data Layer"]
        Repo["mealRepository<br/>(interface)"]
        IDBImpl["indexeddb 구현체"]
        HTTPImpl["http 구현체<br/>(추후)"]
    end

    subgraph Infra ["Infrastructure"]
        DB["db.ts<br/>IndexedDB 초기화"]
        IDB["idb 라이브러리"]
    end

    MealsPage --> Queries
    MealsPage --> Mutations
    Queries --> Keys
    Mutations --> Keys
    Queries --> Repo
    Mutations --> Repo
    Repo --> IDBImpl
    Repo -.-> HTTPImpl
    IDBImpl --> DB
    DB --> IDB
```

**핵심 원칙**: UI/Query 레이어는 `mealRepository` 인터페이스만 바라봄. 구현체(IndexedDB → HTTP)는 나중에 교체 가능.

---

## 1. 의존성 추가

`idb` 라이브러리 설치 (IndexedDB 래퍼, 스키마/인덱스 지원)

```bash
pnpm add idb
```

---

## 2. 도메인 타입 정의

**파일**: `src/domain/meals/types.ts`

`docs/user-flow.md` 기준 FoodEntry 스펙:

```typescript
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodEntry {
  id: string;           // nanoid or crypto.randomUUID
  date: string;         // ISO date string (YYYY-MM-DD)
  mealType: MealType;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: number;
  createdAt: number;    // timestamp
  updatedAt: number;
}

export type FoodEntryInput = Omit<FoodEntry, "id" | "createdAt" | "updatedAt">;
```

---

## 3. IndexedDB 초기화

**파일**: `src/data/db.ts`

- `idb`의 `openDB`로 DB 생성
- object store: `foodEntries` (keyPath: `id`)
- index: `by-date` (date 필드)
```typescript
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "weight-app";
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("foodEntries")) {
        const store = db.createObjectStore("foodEntries", { keyPath: "id" });
        store.createIndex("by-date", "date");
      }
    },
  });
}
```


---

## 4. Repository 인터페이스 + IndexedDB 구현

**파일**: `src/data/repositories/mealRepository.ts`

인터페이스와 구현체를 한 파일에 두고, 추후 HTTP 구현 시 분리.

```typescript
// --- Interface ---
export interface MealRepository {
  getByDate(date: string): Promise<FoodEntry[]>;
  getById(id: string): Promise<FoodEntry | undefined>;
  create(input: FoodEntryInput): Promise<FoodEntry>;
  update(id: string, input: Partial<FoodEntryInput>): Promise<FoodEntry>;
  delete(id: string): Promise<void>;
}

// --- IndexedDB Implementation ---
export const mealRepository: MealRepository = { ... };
```

---

## 5. Query Keys 정의

**파일**: `src/features/meals/keys.ts`

```typescript
export const mealKeys = {
  all: ["meals"] as const,
  byDate: (date: string) => ["meals", "byDate", date] as const,
  detail: (id: string) => ["meals", "detail", id] as const,
};
```

---

## 6. Query Hooks

**파일**: `src/features/meals/queries.ts`

```typescript
export function useFoodEntriesByDate(date: string) {
  return useQuery({
    queryKey: mealKeys.byDate(date),
    queryFn: () => mealRepository.getByDate(date),
  });
}
```

---

## 7. Mutation Hooks

**파일**: `src/features/meals/mutations.ts`

```typescript
export function useAddFoodEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FoodEntryInput) => mealRepository.create(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: mealKeys.byDate(variables.date) });
    },
  });
}

export function useUpdateFoodEntry() { ... }
export function useDeleteFoodEntry() { ... }
```

---

## 8. QueryClient 설정 조정

**파일**: `src/lib/queryClient.ts`

IndexedDB는 로컬이라 staleTime을 더 길게 잡아도 됨 (옵션).

---

## 파일 구조 요약

```
src/
├── data/
│   ├── db.ts                      # IndexedDB 초기화
│   └── repositories/
│       └── mealRepository.ts      # 인터페이스 + IDB 구현
├── domain/
│   └── meals/
│       └── types.ts               # FoodEntry 타입
├── features/
│   └── meals/
│       ├── keys.ts                # Query keys
│       ├── queries.ts             # useQuery hooks
│       └── mutations.ts           # useMutation hooks
└── pages/
    └── MealsPage.tsx              # (기존, 훅 연동은 별도 작업)
```

---

## 추후 확장 패턴 (운동/지표/목표)

동일한 패턴으로 확장:

- `src/domain/workouts/types.ts`
- `src/data/repositories/workoutRepository.ts`
- `src/features/workouts/keys.ts`, `queries.ts`, `mutations.ts`

REST API 전환 시:

- `mealRepository.http.ts` 구현 후 export 교체 (또는 환경 변수로 분기)