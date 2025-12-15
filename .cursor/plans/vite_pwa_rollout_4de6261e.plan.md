---
name: Vite PWA Rollout
overview: "Vite(React/TS) 앱에 vite-plugin-pwa를 추가하고, `registerType: prompt` + React용 업데이트 토스트 UX를 도입합니다. 앱 메타(name/short_name/theme_color)는 한 곳에서 관리하도록 분리해 추후 변경을 쉽게 합니다."
todos:
  - id: add-pwa-deps
    content: "`vite-plugin-pwa`(및 필요 시 `workbox-window`) 의존성 추가"
    status: completed
  - id: centralize-app-meta
    content: "`src/config/app-meta.ts`에 name/short_name/theme_color를 단일 소스로 정의 (`weight app`, theme_color는 `src/index.css :root --primary` 기반)"
    status: completed
  - id: configure-vitepwa
    content: "`vite.config.ts`에 `VitePWA` 설정 추가: `registerType: prompt`, manifest에 `APP_META` 반영, dev 비활성화"
    status: completed
    dependencies:
      - add-pwa-deps
      - centralize-app-meta
  - id: inject-theme-color-meta
    content: "`vite.config.ts`에서 `transformIndexHtml`로 `<meta name=\"theme-color\">` 등을 `APP_META.themeColor` 기반으로 주입(HTML 하드코딩 제거)"
    status: completed
    dependencies:
      - centralize-app-meta
  - id: add-reload-prompt-ui
    content: React `ReloadPrompt` 컴포넌트 추가(`useRegisterSW` 기반) 및 `src/App.tsx`에 렌더링
    status: completed
    dependencies:
      - configure-vitepwa
  - id: verify-preview
    content: "`pnpm build` + `pnpm preview`에서 Manifest/SW/업데이트 토스트 동작 확인"
    status: completed
    dependencies:
      - add-reload-prompt-ui
      - inject-theme-color-meta
---

# Vite + PWA (prompt) 적용 플랜

## 목표

- `vite-plugin-pwa`를 추가해 **manifest 생성/주입 + service worker 생성**을 구성합니다.
- `registerType`은 **`prompt`**로 설정하고, React에서 **업데이트 토스트(ReloadPrompt)** UX를 제공합니다.
- `name`, `short_name`, `theme_color`는 **하나의 설정 모듈**에 모아 하드코딩이 흩어지지 않게 합니다.
- 캐싱 전략(`runtimeCaching`)은 **추후 react-query 도입을 고려해 이번 범위에서는 추가하지 않습니다**(기본 precache만).
- 개발 환경에서는 SW 캐시 이슈를 피하기 위해 **dev에서는 비활성화**, `build` + `preview`로만 검증합니다.

## 결정사항(요구사항 반영)

- **앱 이름**: `weight app`
- **theme_color 소스**: `src/index.css`의 라이트 모드 `:root --primary` (현재 `oklch(0.65 0.18 132)`)
- **registerType**: `prompt`

## 구현 개요

### 1) 단일 소스 설정 모듈 추가

- 새 파일: [`src/config/app-meta.ts`](/Users/raon/Desktop/Development/weight-app/src/config/app-meta.ts)
- `APP_META` 같은 객체로 `name`, `shortName`, `themeColor`를 보관
- `themeColor`는 **manifest 요구사항(문자열 색상)**에 맞게 **hex 문자열**로 유지
- 코드 주석에 “원본은 `src/index.css :root --primary`”임을 남겨 추후 변경 시 연결고리 유지

> 이유: `vite.config.ts`(Node)와 React UI(브라우저) 양쪽에서 재사용 가능하고, 값 변경이 1곳으로 모입니다.

### 2) `vite-plugin-pwa` 설치 및 Vite 설정

- 수정 파일: [`vite.config.ts`](/Users/raon/Desktop/Development/weight-app/vite.config.ts)
- `VitePWA({...})` 추가
- `registerType: 'prompt'`
- React에서 `useRegisterSW`를 쓸 예정이므로 **앱 쪽에서 SW 등록/업데이트 이벤트를 제어**하는 구성이 되도록 정리
- `manifest`는 `APP_META`를 참조해 설정
- `includeAssets`에 기존 public 아이콘 포함(예: `apple-touch-icon-180x180.png`, `pwa-192x192.png` 등)
- `devOptions.enabled`는 **false** (dev 비활성)

### 3) Manifest 아이콘/메타데이터 정리

- 확인/정리 대상: `/Users/raon/Desktop/Development/weight-app/public/`
- 최소: `pwa-192x192.png`, `pwa-512x512.png` (없으면 추가)
- iOS 홈화면용: `apple-touch-icon-180x180.png`
- `manifest.icons`에 192/512(+ `purpose: 'any maskable'` 권장) 구성

### 4) 업데이트 UX(React ReloadPrompt) 추가

- 새 파일: [`src/components/pwa/ReloadPrompt.tsx`](/Users/raon/Desktop/Development/weight-app/src/components/pwa/ReloadPrompt.tsx)
- 문서 패턴대로 `useRegisterSW`(`virtual:pwa-register/react`)를 사용해
- `offlineReady`일 때 “오프라인 사용 가능”
- `needRefresh`일 때 “새 버전 있음 → Reload 버튼” 제공
- 스타일은 현재 프로젝트가 Tailwind/shadcn 기반이므로
- 별도 CSS 파일 대신 Tailwind 클래스 또는 기존 `src/components/ui` 컴포넌트(`button`, `card` 등)로 구현

- 수정 파일: [`src/App.tsx`](/Users/raon/Desktop/Development/weight-app/src/App.tsx)
- 최상단에 `<ReloadPrompt />`를 렌더링(앱 전역에서 업데이트 알림을 보이게)

### 5) `index.html`의 theme-color 메타 처리(하드코딩 분산 방지)

- 목표: `theme_color`를 `index.html`에 또 하드코딩하지 않도록 함
- 접근:
- `vite.config.ts`에서 `transformIndexHtml` 훅을 가진 **작은 Vite 플러그인**을 추가해
- `<meta name="theme-color" ...>`를 `APP_META.themeColor`로 주입
- 필요하면 `<link rel="apple-touch-icon" ...>` 같은 태그도 함께 주입

> 이렇게 하면 theme color를 바꾸더라도 `src/config/app-meta.ts`만 수정하면 됩니다.

### 6) 검증 방법(개발/운영)

- dev에서는 SW를 끄므로, 로컬 검증은:
- `pnpm build` → `pnpm preview`
- Chrome DevTools → Application 탭에서 Manifest / Service Worker 확인
- Lighthouse(PWA)로 installable/offline 기본 요건 점검

## 변경 파일 목록(예상)

- 수정: [`vite.config.ts`](/Users/raon/Desktop/Development/weight-app/vite.config.ts)
- 수정: [`src/App.tsx`](/Users/raon/Desktop/Development/weight-app/src/App.tsx)
- 추가: [`src/config/app-meta.ts`](/Users/raon/Desktop/Development/weight-app/src/config/app-meta.ts)
- 추가: [`src/components/pwa/ReloadPrompt.tsx`](/Users/raon/Desktop/Development/weight-app/src/components/pwa/ReloadPrompt.tsx)
- (필요 시 추가/정리): `/Users/raon/Desktop/Development/weight-app/public/pwa-512x512.png` 등 아이콘

## 구현 TODO

- `add-pwa-deps`: `vite-plugin-pwa`(필요 시 `workbox-window`) 의존성 추가
- `centralize-app-meta`: `src/config/app-meta.ts` 추가 및 `weight app` 메타 정의
- `configure-vitepwa`: `vite.config.ts`에 `VitePWA` + `registerType: prompt` + manifest 설정
- `inject-theme-color-meta`: `transformIndexHtml`로 theme-color 메타를 설정 모듈에서 주입
- `add-reload-prompt-ui`: `ReloadPrompt` 컴포넌트 추가 및 `App.tsx`에 장착
- `verify-preview`: `build + preview`에서 SW 등록/업데이트 토스트 동작 확인