# 폴더 구조 가이드 (단일 레포, SOLID)

We-it PoC 단일 레포지토리를 SOLID 원칙에 맞춰 구성하는 가이드입니다. Next.js(App Router), IndexedDB(Dexie), Zustand 기반이며, 테스트 코드는 작성하지 않는 전제를 반영합니다.

## 목표

- 명확한 모듈 경계와 낮은 결합도 유지
- 프레젠테이션(UI)·애플리케이션(유스케이스)·도메인·인프라 계층 분리
- DIP: UI는 구현체가 아닌 인터페이스(Ports)에 의존, 구현체 선택은 조립층에서 주입
- 기능(Feature) 단위로 확장 가능하고 예측 가능한 변경 파급

## 상위 구조 (single repo)

```
src/
  app/                  # Next.js App Router (라우팅/페이지 셸)
  core/                 # 도메인 + 유스케이스 + 포트(인터페이스)
  infra/                # 구현체(Adapters) - Dexie 등 구체 기술 격리
  modules/              # 기능(Feature) 단위 UI 모듈
  ui/                   # 공용 프레젠테이셔널 컴포넌트
  stores/               # Zustand 전역/모듈 상태
  lib/                  # 공용 유틸(포매터/헬퍼)
  styles/               # 전역 스타일
```

### 예시 세부 트리

```
src/
  app/
    (routes)/
      layout.tsx
      page.tsx

  core/
    workout/
      domain/
        entities.ts          # 엔티티/값 객체
        errors.ts
      ports/
        workout-repo.ts      # Read/Write 분리 권장
      use-cases/
        log-set.ts           # 단일 책임 유스케이스(입출력 DTO 포함)
        list-sessions.ts
    index.ts

  infra/
    db/
      dexie/
        schema.ts            # Dexie 테이블/인덱스 정의
        mappers.ts           # 저장 모델 ↔ 도메인 매핑
        workout-repo.dexie.ts# 포트 구현체(Adapter)

  modules/
    workout/
      ui/
        pages/               # route-bound UI (필요 시)
        components/          # 프리젠테이셔널 컴포넌트
      view-models/           # 유스케이스 호출/상태 바인딩
      providers/             # DI: Ports → Infra 구현체 바인딩

  ui/
    form/
    layout/
    feedback/
    index.ts

  stores/
    app-store.ts

  lib/
    date.ts
    format.ts

  styles/
    globals.css
```

## 의존성 규칙(Import Boundaries)

- 허용: `app/modules/ui → core`, `infra → core`, `app/modules → ui`
- 금지: `core → infra/modules/ui`, `modules → infra` 직접 의존
- DI 위치: `modules/*/providers`에서 포트(interfaces)를 인프라 구현체로 바인딩
- 경계 강제: tsconfig path alias와 ESLint import 규칙으로 검증 권장
  - 예: `@core/*`, `@infra/*`, `@ui/*`, `@modules/*`

## SOLID 적용 요점

- SRP: 파일·폴더는 하나의 변경 이유만 갖도록(유스케이스/컴포넌트/리포지토리 분리)
- OCP: 기능 확장은 새 유스케이스·어댑터 추가로, 기존 도메인 최소 수정
- LSP: 포트 규약을 지키는 구현체는 자유롭게 대체 가능(Dexie↔Memory 등)
- ISP: 읽기/쓰기 포트 분리, 모듈이 필요한 메서드만 의존
- DIP: UI는 포트에 의존하고 구현체 선택은 Provider에서 해결

## 네이밍/파일 원칙

- 유스케이스: 동사-명사(`log-set.ts`, `list-sessions.ts`)
- 포트: `*-repo.ts`, `*Port.ts` 등 역할 기반
- 구현체: 기술 접미사(`*.dexie.ts`, `*.memory.ts`)
- 컴포넌트: 목적 기반(`*-form.tsx`, `*-list.tsx`)

## 도입 체크리스트

- [ ] `src/core` 생성: 도메인/포트/유스케이스 분리
- [ ] `src/infra` 생성: Dexie 등 구현체를 어댑터로 격리
- [ ] `src/modules/*/providers`에서 포트→구현체 DI 구성
- [ ] tsconfig path alias(`@core`, `@infra`, `@ui`, `@modules`) 설정
- [ ] ESLint import 규칙으로 의존 방향 검증

---

원하시면 위 구조에 맞춘 템플릿 파일과 tsconfig/eslint 설정 예시도 추가해드립니다.
