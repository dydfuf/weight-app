---
name: tanstack_query_setup_no_persist
overview: React Router + Clerk + Vite PWA 구조에서 TanStack Query(v5)를 기본 서버상태 레이어로 도입하되, 캐시 persistence 없이 QueryClientProvider 구성만 추가합니다.
todos:
  - id: add-deps
    content: "@tanstack/react-query(필수) 및 devtools(선택) 의존성 추가"
    status: completed
  - id: create-query-client
    content: "`src/lib/queryClient.ts`에 QueryClient 단일 인스턴스와 기본 옵션 정의"
    status: completed
  - id: wire-provider
    content: "`src/main.tsx`에서 QueryClientProvider로 App을 감싸기"
    status: completed
  - id: optional-smoke
    content: (선택) 최소 예제로 useQuery 동작 확인
    status: completed
  - id: lint-typecheck
    content: 수정된 파일 범위로 타입/린트 확인 및 수정
    status: completed
---

## 목표

- TanStack Query(v5)만 도입해서 앱 전역에서 `useQuery`/`useMutation`을 사용할 수 있게 합니다.
- PWA persistence(IndexedDB/localStorage persister)는 **추가하지 않습니다**.

## 현재 구조 요약(근거)

- 엔트리: `src/main.tsx`에서 `BrowserRouter` + `ClerkProvider`로 `App`을 감쌉니다.
- 라우팅: `src/App.tsx`에서 `Routes/Route` 기반.
- PWA: `vite-plugin-pwa` + `virtual:pwa-register/react`로 SW 업데이트 프롬프트만 존재.
- 현재 `fetch/axios` 등 API 호출 코드는 아직 없음 → 도입은 “인프라 준비” 단계가 됩니다.

## 구현 방안

### 1) 의존성 추가

- `@tanstack/react-query`를 dependencies에 추가.
- (선택) 개발용 디버깅이 필요하면 `@tanstack/react-query-devtools`를 devDependencies로 추가하되, **필수는 아님**.

### 2) QueryClient 생성(단일 인스턴스)

- 새 파일로 `src/lib/queryClient.ts`를 만들어 `QueryClient`를 생성/내보냅니다.
- 기본 옵션은 PWA/모바일 UX에 맞게 과도한 재요청을 줄이는 쪽으로 설정합니다.
  - 예: `refetchOnWindowFocus: false`, `retry: 1~2`, `staleTime` 소량, `gcTime` 기본 유지
  - (선택) 오프라인 세션 내 UX를 위해 `networkMode: 'offlineFirst'`를 기본값으로 둘지 검토 후 설정

### 3) Provider 연결

- `src/main.tsx`에서 `QueryClientProvider`로 앱을 감싸서 어디서든 `useQuery`를 쓸 수 있게 합니다.
- Provider 계층은 다음 중 하나로 배치합니다.
  - 기본 권장: `BrowserRouter`/`ClerkProvider` 바깥 혹은 안쪽 어느 쪽도 가능하지만, 향후 Clerk 토큰 기반 fetcher를 만들 가능성을 고려해 `ClerkProvider` **안쪽**에 두는 구성을 기본으로 합니다.

### 4) (선택) 동작 확인용 최소 예제

- 실제 API가 아직 없으므로, 실사용 코드에 영향 없는 수준으로만 확인합니다.
  - 예: `DashboardPage`에서 `useQuery`로 `Promise.resolve(...)` 또는 공개 엔드포인트(있는 경우) 호출 등
- 예제는 원치 않으면 생략 가능합니다(도입만 해도 앱에는 영향 없음).

### 5) 품질 체크

- 변경 파일에 대해 타입/린트 에러를 확인하고 즉시 수정합니다.

## 변경될 파일

- `package.json` (의존성 추가)
- `src/main.tsx` (Provider 래핑)
- `src/lib/queryClient.ts` (신규)
- (선택) `src/pages/DashboardPage.tsx` 또는 예제 컴포넌트 1곳

## 참고(문서 근거)

- `QueryClientProvider`로 `QueryClient`를 주입하는 패턴은 TanStack Query v5 공식 문서에 있습니다.
- `useQuery` 옵션(`retry`, `staleTime`, `gcTime`, `networkMode`)도 v5 문서 기준으로 설정합니다.
```tsx
// 개념 예시(실제 적용은 main.tsx):
// <QueryClientProvider client={queryClient}>...</QueryClientProvider>
```