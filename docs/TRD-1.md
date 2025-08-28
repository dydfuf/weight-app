# 기술 요구사항 정의서 (TRD): 웨잇(We-it) PoC

**문서 버전:** 1.0
**작성일:** 2025년 8월 29일
**작성자:** Gemini
**참조 문서:** [PRD-1.md](PRD-1.md) (제품 요구사항 정의서)

## 1. 기술 요구사항 (Technical Requirements)

### 플랫폼

**PWA (Progressive Web App)** - 단일 코드베이스로 웹, Android, iOS 환경을 지원한다.

- **'홈 화면에 추가'** 기능을 통해 네이티브 앱과 유사한 사용 경험을 제공한다

### 핵심 아키텍처: 로컬 퍼스트 (Local-First)

- 모든 데이터(운동 목록, 기록 등)는 우선적으로 사용자 기기(브라우저)에 저장된다
- **오프라인 상태**에서 모든 기능이 완벽하게 동작해야 한다
- _(PoC 이후)_ 온라인 상태가 되면 서버와 데이터를 동기화하는 로직을 추가한다

### 초기 데이터

약 **100개 내외**의 필수 웨이트 트레이닝 운동 목록을 기본 데이터베이스로 내장한다

- 운동명, 주 자극 부위 등

### 데이터 백업 (내보내기/가져오기)

- 설정 화면에서 전체 데이터 **내보내기(.json)/가져오기(.json)** 제공
- 파일 기반 백업만 지원(서버 동기화 없음)
- 스키마 버전 필드 포함으로 이후 마이그레이션 대비

### 기술 스택 (Technical Stack)

#### 프론트엔드

- **Framework**: Next.js 15+ (React 기반, PWA 지원)
- **언어**: TypeScript (타입 안전성 및 개발 생산성)
- **스타일링**: Tailwind CSS (빠른 개발, 작은 번들 사이즈)
- **상태 관리**: Zustand (가벼운 클라이언트 사이드 상태 관리)

#### 데이터 저장소

- **로컬 데이터베이스**: IndexedDB (브라우저 내장, 오프라인 지원)
- **ORM**: Dexie.js (IndexedDB를 위한 쉬운 API)
- **데이터 동기화**: _(PoC 이후)_ Supabase/PostgreSQL
- **(선택 검토)** RxDB는 PoC 이후 리서치 항목으로 유지(초기 복잡도, 번들 사이즈, 암호화 플러그인 검토 필요)

#### 개발 도구

- **빌드 도구**: Next.js 내장 (SWC 컴파일러)
- **코드 품질**: ESLint, Prettier, Biome
- **타입 체크**: TypeScript 컴파일러

#### 프로젝트 구조 (단일 레포지토리, Next.js)

```
src/
  app/                 # Next.js App Router
    (routes)/
      layout.tsx
      page.tsx
  modules/             # 기능(Feature) 단위 모듈
    workout/
      ui/              # 페이지/프리젠테이셔널 컴포넌트
      view-models/     # 유스케이스 호출/상태 바인딩
      services/        # 포트 구현체 연결(IndexedDB/Dexie 등)
  db/
    dexie/
      schema.ts        # Dexie 테이블/인덱스 정의
      mappers.ts       # 저장 모델 ↔ 도메인 매핑
  stores/              # Zustand 상태
  lib/                 # 공용 유틸(포매터, helpers)
  styles/              # 전역 스타일
```

#### 스크립트

- `pnpm dev`: 로컬 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm lint`: ESLint 검사

#### 배포 및 인프라

- **호스팅**: Vercel (PWA 최적화, Edge Functions 지원)

### 아키텍처 결정 근거

#### 로컬 퍼스트 선택 이유

- **네트워크 불안정한 헬스장 환경**에 최적화
- **빠른 로딩 속도** 및 즉각적인 반응성
- **프라이버시 보호** (데이터가 사용자 기기에만 저장)
- **오프라인 우선** UX 제공

#### PWA 선택 이유

- **크로스 플랫폼**: 단일 코드베이스로 웹/모바일 지원
- **앱 스토어 배포 불필요**: 웹 배포로 즉시 사용 가능
- **네이티브 앱 경험**: 홈 화면 추가, 푸시 알림, 오프라인 지원

#### 데이터 레이어 선택 (PoC 기준)

- **선정**: Dexie.js(+IndexedDB)
- **이유**: 러닝커브 낮음, 번들/의존성 최소화, 타입 친화적, PoC 속도에 유리
- **대안(후속 연구)**: RxDB(리액티브 쿼리/암호화/복제 강점) — PoC 안정화 후 필요 시 전환 검토

## 2. 데이터 모델 (Data Model)

### 핵심 엔티티

##### 운동 (Exercise)

```typescript
interface Exercise {
  id: string; // 고유 식별자
  name: string; // 운동명 (예: "벤치프레스")
  category: MuscleGroup; // 자극 부위 (가슴, 등, 하체 등)
  isCustom: boolean; // 사용자 정의 운동 여부
  createdAt: Date; // 생성일시
  lastUsedAt?: Date; // 마지막 사용일시
}
```

##### 운동 세션 (Workout Session)

```typescript
interface WorkoutSession {
  id: string; // 고유 식별자
  date: Date; // 운동 날짜
  sets: WorkoutSet[]; // 포함된 세트들
  duration?: number; // 총 운동 시간 (분)
  notes?: string; // 세션 메모
  createdAt: Date; // 생성일시
}
```

##### 운동 세트 (Workout Set)

```typescript
interface WorkoutSet {
  id: string; // 고유 식별자
  exerciseId: string; // 운동 ID
  sessionId: string; // 세션 ID
  weight: number; // 무게 (kg)
  reps: number; // 횟수
  restTime: number; // 휴식 시간 (초)
  completedAt: Date; // 완료 일시
  notes?: string; // 세트별 메모
}
```

##### 사용자 설정 (User Settings)

```typescript
interface UserSettings {
  id: string; // 고유 식별자 (항상 'default')
  defaultRestTime: number; // 기본 휴식 시간 (초)
  weightUnit: "kg" | "lbs"; // 무게 단위
  theme: "light" | "dark"; // 테마 설정
  notifications: boolean; // 알림 허용 여부
  vibration: boolean; // 진동 허용 여부
}
```

### 데이터베이스 스키마

#### IndexedDB 구조

- **exercises**: 운동 기본 정보 저장
- **workout_sessions**: 운동 세션 정보 저장
- **workout_sets**: 개별 세트 기록 저장
- **user_settings**: 사용자 설정 저장

#### 인덱스 전략

- 운동명으로 빠른 검색을 위한 name 인덱스
- 날짜별 세션 조회를 위한 date 인덱스
- 운동별 세트 조회를 위한 exerciseId 인덱스
- 세션별 세트 조회를 위한 sessionId 인덱스

## 3. 보안 및 개인정보 처리 (Security & Privacy)

### 데이터 보안 원칙

- **로컬 저장 우선**: 모든 데이터가 사용자 브라우저에만 저장되어 서버 전송 없음
- **최소 권한**: 필요한 최소한의 데이터만 수집 및 저장
- **데이터 암호화**: 민감한 데이터에 대한 브라우저 내 암호화 적용
- 푸시 알림 미사용(PoC): 서버 없는 오프라인 타이머 알림(진동/사운드)만 사용

### 개인정보 처리 방침

#### 수집하는 정보

- **자동 수집**: 없음 (완전 오프라인 앱)
- **사용자 입력**: 운동 기록 데이터 (무게, 횟수, 운동명 등)
- **선택적 정보**: 사용자 설정 (테마, 알림 설정 등)

#### 데이터 저장 및 관리

- **저장 위치**: 브라우저의 IndexedDB (사용자 기기 내)
- **데이터 백업**: 사용자 책임 (수동 내보내기 기능 제공)
- **데이터 삭제**: 앱 내 설정에서 언제든지 전체 삭제 가능

#### 개인정보 보호 조치

- **익명화**: 서버 전송 시 개인 식별 정보 완전 제거
- **접근 통제**: 브라우저 내 데이터로 외부 접근 불가
- **보존 기간**: 사용자 데이터는 앱 사용 기간 동안만 보존

#### 향후 온라인 기능 시 고려사항

- **데이터 동기화**: 익명화된 데이터만 서버 전송
- **사용자 동의**: 온라인 기능 사용 시 명시적 동의 획득
- **데이터 최소화**: 동기화에 필요한 최소 데이터만 전송

## 4. 배포 및 릴리즈 전략 (Deployment & Release Strategy)

### PoC 배포 계획

#### 1단계: 내부 테스트 (Week 1-2)

- **대상**: 개발팀 및 내부 테스터
- **환경**: 로컬 개발 환경
- **목표**: 기본 기능 검증 및 버그 수정

#### 2단계: 클로즈드 베타 (Week 3-4)

- **대상**: 초대된 베타 테스터 (20-30명)
- **환경**: Vercel 스테이징 환경
- **목표**: 사용자 피드백 수집 및 UX 개선

#### 3단계: 공개 베타 (Week 5-8)

- **대상**: 제한된 공개 (초보~중급 헬스爱好者)
- **환경**: 프로덕션 환경 (we-it.app)
- **목표**: 실제 사용자 환경에서의 성능 검증

### 기술적 배포 고려사항

#### PWA 최적화

- **Service Worker**: App Shell 캐싱 + 최근 7일 데이터 SWR 전략(오프라인 동작 보장)
- **Web App Manifest**: 홈 화면 추가 기능 설정
- **HTTPS 필수**: PWA를 위한 보안 요구사항 준수

#### 크로스 브라우저 지원

- **대상 브라우저**: Chrome, Safari, Firefox, Edge
- **모바일 우선**: iOS Safari, Chrome Mobile 최적화
- **기능 검증**: 각 브라우저별 PWA 기능 지원 여부 확인

#### 성능 최적화

- **번들 사이즈**: 100KB 미만의 초기 로딩
- **Core Web Vitals**: 우수한 성능 점수 목표
- **오프라인 성능**: 네트워크 없는 환경에서의 완전한 기능 동작

### 모니터링 및 분석

- **에러 추적**: Sentry를 통한 실시간 에러 모니터링
- **사용자 분석**: (PoC 제외) 추후 Plausible/GA 검토
- **성능 모니터링**: Core Web Vitals 및 로딩 성능 추적
