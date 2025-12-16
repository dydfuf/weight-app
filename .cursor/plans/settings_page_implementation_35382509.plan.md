---
name: Settings Page Implementation
overview: 프로토타입 Variant B(settings_2) 기준으로 SettingsPage를 대시보드형 Goals & Milestones UI로 재구현합니다. Profile Header는 placeholder로 처리하고, 기존 Goals 데이터 구조를 활용합니다.
todos:
  - id: settings-hook
    content: localStorage 기반 설정 관리 훅 생성 (useSettings.ts)
    status: completed
  - id: profile-header
    content: ProfileHeaderPlaceholder 컴포넌트 생성 (Clerk 연동 + 목업 스탯)
    status: completed
  - id: stats-cards
    content: StatsCards 컴포넌트 생성 (Streak/Lost placeholder)
    status: completed
  - id: goals-section
    content: GoalsSection 컴포넌트 생성 (실제 Goals/Metrics 데이터 연동)
    status: completed
  - id: preferences-section
    content: PreferencesSection 컴포넌트 생성 (Units 토글, Reminders 스위치)
    status: completed
  - id: account-section
    content: AccountSection 컴포넌트 생성 (Clerk signOut 연동)
    status: completed
  - id: settings-page
    content: SettingsPage 리팩토링 - 컴포넌트 조합
    status: completed
---

# Settings 페이지 구현 (Variant B 기준)

## 현재 상태

[SettingsPage.tsx](src/pages/SettingsPage.tsx)는 일일 칼로리 입력 폼과 Clerk UserProfile만 있는 간단한 구조입니다.

## 목표 UI 구조 (프로토타입 settings_2 기준)

```
┌─────────────────────────────────┐
│  ← Profile             ⋮       │  TopAppBar
├─────────────────────────────────┤
│     [Avatar]                    │
│   Alex Johnson                  │  Profile Header
│   Pro Member                    │  (placeholder)
│  Weight | Height | Age          │
│  [Edit Profile Details]         │
├─────────────────────────────────┤
│  🔥 Streak    📉 Lost           │  Stats Cards
│   12 Days      4.5 kg           │  (placeholder)
├─────────────────────────────────┤
│  Goals & Milestones [Edit]      │
│  ┌─────────────────────────┐    │
│  │ Target Weight           │    │  Goals Section
│  │ 75kg  ████████░░ 64%    │    │  (실제 데이터)
│  └─────────────────────────┘    │
│  ┌──────────┐ ┌──────────┐      │
│  │ Body Fat │ │ Daily Cal│      │  Sub-goals Grid
│  │ 18%/12%  │ │ 1800/2000│      │
│  └──────────┘ └──────────┘      │
├─────────────────────────────────┤
│  Preferences                    │
│  ┌─────────────────────────┐    │
│  │ 📏 Units    [Metric|Imp]│    │
│  │ 🔔 Reminders    [toggle]│    │  Preferences
│  │ 🔗 Integrations     >   │    │  (localStorage)
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  Account                        │
│  ┌─────────────────────────┐    │
│  │ 💳 Subscription      >  │    │
│  │ 🚪 Log Out              │    │  Account
│  └─────────────────────────┘    │
│       Version 1.0.0             │
└─────────────────────────────────┘
```

## 데이터 연동

### 활용할 기존 데이터

- **Goals** (`src/domain/goals/types.ts`): `dailyCalories`, `macroTargets`, `weightGoal`, `workoutGoal`
- **Metrics** (`src/domain/metrics/types.ts`): `weight`, `bodyFat` - 현재 체중/체지방 조회용

### 새로 추가할 설정 (localStorage 기반)

- `units`: "metric" | "imperial"
- `workoutReminders`: boolean

## 구현 계획

### 1. 설정 상태 관리 훅 생성

`src/features/settings/useSettings.ts` - localStorage 기반 preferences 관리

```typescript
interface AppSettings {
  units: "metric" | "imperial";
  workoutReminders: boolean;
}
```

### 2. UI 컴포넌트 분리

`src/pages/settings/` 폴더 내 컴포넌트 분리:

- `ProfileHeaderPlaceholder.tsx` - 아바타, 이름(Clerk), 스탯 placeholder
- `StatsCards.tsx` - Streak/Lost placeholder 카드
- `GoalsSection.tsx` - Goals & Milestones (실제 데이터 연동)
- `PreferencesSection.tsx` - Units, Reminders, Integrations
- `AccountSection.tsx` - Subscription, Log Out

### 3. SettingsPage 리팩토링

기존 파일을 위 컴포넌트들을 조합하는 형태로 변경

### 4. 스타일링

- 프로토타입의 다크모드 기반 디자인을 shadcn/tailwind로 변환
- 기존 앱의 `Card`, `Button` 컴포넌트 재활용
- 세그먼트 토글, 스위치 컴포넌트 추가 (필요시)

## 파일 변경 목록

| 파일 | 작업 |

|------|------|

| `src/features/settings/useSettings.ts` | 생성 - localStorage 설정 관리 |

| `src/pages/settings/ProfileHeaderPlaceholder.tsx` | 생성 |

| `src/pages/settings/StatsCards.tsx` | 생성 |

| `src/pages/settings/GoalsSection.tsx` | 생성 |

| `src/pages/settings/PreferencesSection.tsx` | 생성 |

| `src/pages/settings/AccountSection.tsx` | 생성 |

| `src/pages/SettingsPage.tsx` | 수정 - 컴포넌트 조합 |

## 제외 항목 (placeholder/향후 확장)

- Profile 데이터 (Height, Weight, Age) 입력/저장 기능
- Integrations 서브페이지 (Apple Health, Fitbit 연동)
- Subscription 서브페이지
- Streak 계산 로직