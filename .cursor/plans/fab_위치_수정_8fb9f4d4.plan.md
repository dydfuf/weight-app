---
name: FAB 위치 수정
overview: FAB 버튼이 하단 탭바와 겹치는 문제를 해결하기 위해 safe-area-inset-bottom을 반영한 동적 bottom 값으로 수정합니다.
todos:
  - id: fix-fab-bottom
    content: FAB.tsx의 bottom 값에 safe-area-inset-bottom 추가
    status: completed
---

# FAB 위치 수정

## 문제

FAB의 `bottom-20`(80px)이 고정값이라 iPhone 등 safe-area가 있는 기기에서 탭바 영역(56px + safe-area ~34px = ~90px)과 겹침

## 수정 대상

[src/components/fab/FAB.tsx](src/components/fab/FAB.tsx)

## 변경 내용

```tsx
// Before
className="fixed bottom-20 right-4 z-40 ..."

// After
className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-40 ..."
```

이렇게 하면 safe-area가 없는 기기에서는 기존과 동일하게 80px, safe-area가 있는 기기에서는 80px + safe-area 값으로 동적 계산됩니다.