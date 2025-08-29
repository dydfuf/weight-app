## Weight App

Next.js 15 + React 19 + Supabase 기반의 개인 체중/운동 기록 앱입니다.

### 로컬 실행 방법
1. 의존성 설치
   ```bash
   pnpm install
   ```
2. 환경변수 파일 생성: 프로젝트 루트에 `.env.local`
   ```ini
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. 개발 서버 실행
   ```bash
   pnpm dev
   ```
4. 타입/린트 확인(선택)
   ```bash
   pnpm typecheck
   pnpm lint
   ```

### 기술 스택
- Next.js(App Router), React 19
- Supabase(Auth/DB)
- Biome(포맷/린트), TypeScript 5, Tailwind CSS 4

### 프로젝트 스크립트
- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
- `pnpm typecheck`: 타입 검사(emit 없음)
- `pnpm lint`: Biome 체크 및 자동 수정

### 주의사항
- Supabase 프로젝트 생성 후 URL/Anon Key를 `.env.local`에 반드시 설정하세요.
- `(mobile)` 라우트는 인증 사용자를 기준으로 접근하도록 구성 예정입니다.
