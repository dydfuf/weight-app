# REST API 전환 가이드

이 문서는 현재 IndexedDB 기반 로컬 데이터 계층을 REST API로 전환할 때 참고하는 가이드입니다.

---

## 현재 아키텍처

```
UI (MealsPage)
    ↓
Features (queries.ts / mutations.ts)
    ↓
Repository Interface (MealRepository)
    ↓
IndexedDB 구현체 (mealRepository)
    ↓
idb 라이브러리 → IndexedDB
```

**핵심 원칙**: UI/Query 레이어는 `MealRepository` 인터페이스만 바라봅니다. 구현체(IndexedDB → HTTP)는 교체 가능합니다.

---

## 전환 시 변경 범위

| 레이어                | 파일                              | 변경 여부                             |
| --------------------- | --------------------------------- | ------------------------------------- |
| Domain                | `src/domain/meals/types.ts`       | 변경 없음 (API 스펙에 맞게 조정 가능) |
| Query Keys            | `src/features/meals/keys.ts`      | 변경 없음                             |
| Query Hooks           | `src/features/meals/queries.ts`   | 변경 없음                             |
| Mutation Hooks        | `src/features/meals/mutations.ts` | 변경 없음                             |
| Repository 인터페이스 | `MealRepository` interface        | 변경 없음                             |
| **Repository 구현체** | `mealRepository` export           | **HTTP 구현으로 교체**                |

---

## 전환 단계

### 1. HTTP 클라이언트 설정

API 호출용 기본 클라이언트를 생성합니다.

```typescript
// src/data/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Authorization 헤더는 Clerk getToken()으로 추가
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### 2. HTTP Repository 구현

IndexedDB 구현체와 동일한 인터페이스로 HTTP 버전을 작성합니다.

```typescript
// src/data/repositories/mealRepository.http.ts
import { apiFetch } from "@/data/api/client";
import type { FoodEntry, FoodEntryInput } from "@/domain/meals/types";
import type { MealRepository } from "./mealRepository";

export const mealRepositoryHttp: MealRepository = {
  async getByDate(date: string): Promise<FoodEntry[]> {
    return apiFetch<FoodEntry[]>(`/meals?date=${date}`);
  },

  async getById(id: string): Promise<FoodEntry | undefined> {
    return apiFetch<FoodEntry>(`/meals/${id}`);
  },

  async create(input: FoodEntryInput): Promise<FoodEntry> {
    return apiFetch<FoodEntry>("/meals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: Partial<FoodEntryInput>): Promise<FoodEntry> {
    return apiFetch<FoodEntry>(`/meals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/meals/${id}`, { method: "DELETE" });
  },
};
```

### 3. Repository Export 교체

#### 옵션 A: 직접 교체 (단순)

```typescript
// src/data/repositories/mealRepository.ts

// Before (IndexedDB)
export { mealRepository } from "./mealRepository.indexeddb";

// After (HTTP)
export { mealRepositoryHttp as mealRepository } from "./mealRepository.http";
```

#### 옵션 B: 환경 변수로 분기

```typescript
// src/data/repositories/mealRepository.ts
import { mealRepositoryIndexedDB } from "./mealRepository.indexeddb";
import { mealRepositoryHttp } from "./mealRepository.http";

const USE_API = import.meta.env.VITE_USE_API === "true";

export const mealRepository = USE_API
  ? mealRepositoryHttp
  : mealRepositoryIndexedDB;
```

---

## Clerk 인증 토큰 연동

API 호출 시 Clerk 토큰을 포함하려면:

```typescript
// src/data/api/client.ts
import { useAuth } from "@clerk/clerk-react";

// 또는 컴포넌트 외부에서 사용 시:
// Clerk.session?.getToken() 사용

export function createAuthenticatedFetch(
  getToken: () => Promise<string | null>
) {
  return async function authFetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  };
}
```

---

## QueryClient 설정 조정

REST API 사용 시 권장 설정:

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      staleTime: 30_000, // 30초 (API 기준 적절)
      // IndexedDB일 때는 더 길게 잡아도 됨: Infinity
    },
  },
});
```

---

## 파일 구조 (전환 후)

```
src/data/
├── api/
│   └── client.ts                    # HTTP 클라이언트 (신규)
├── db.ts                            # IndexedDB 초기화 (유지 또는 삭제)
└── repositories/
    ├── mealRepository.ts            # Export 지점 (분기 로직)
    ├── mealRepository.indexeddb.ts  # IDB 구현 (기존 코드 이동)
    └── mealRepository.http.ts       # HTTP 구현 (신규)
```

---

## 체크리스트

- [ ] API 서버 엔드포인트 확정
- [ ] `VITE_API_BASE_URL` 환경 변수 설정
- [ ] HTTP 클라이언트 생성 (`src/data/api/client.ts`)
- [ ] HTTP Repository 구현 (`mealRepository.http.ts`)
- [ ] Clerk 토큰 연동 (필요 시)
- [ ] Repository export 교체
- [ ] 기존 IndexedDB 데이터 마이그레이션 (필요 시)
- [ ] QueryClient staleTime 등 옵션 조정
- [ ] E2E 테스트

---

## 주의사항

1. **타입 일관성**: API 응답 스키마가 `FoodEntry` 타입과 일치하는지 확인. 불일치 시 `types.ts` 수정 또는 변환 레이어 추가.

2. **에러 핸들링**: HTTP 구현체에서 네트워크 에러, 4xx/5xx 응답을 적절히 처리.

3. **낙관적 업데이트**: 필요 시 mutation의 `onMutate`에서 optimistic update 로직 추가.

4. **오프라인 지원**: PWA 오프라인 모드가 필요하면 IndexedDB를 캐시로 유지하고 동기화 전략 설계 필요.
