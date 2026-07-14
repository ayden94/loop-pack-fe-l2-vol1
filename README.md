# Loopers Pack — Frontend L2 Vol.1

Loopers 프론트엔드 과정(TypeScript · React · Next.js)의 과제 제출 & 피드백 레포입니다.
4주차부터 이 레포가 **커머스 프로젝트(Next.js)** 본체가 됩니다.

## 시작하기

필수 도구는 Node.js 24.17.0과 pnpm 10.15.1입니다. `.nvmrc`는 현재 권장 LTS를 고정하고, `package.json`의 Node.js 범위(`>=22.12.0`)는 지원 가능한 Node.js 22 이상을 허용합니다.

```bash
nvm use
pnpm install
pnpm dev
```

`pnpm test`는 전체 Vitest 테스트가 통과해야 완료됩니다. `pnpm check`는 테스트, lint, 타입 검사, 프로덕션 빌드를 순서대로 실행하며 네 단계가 모두 통과해야 완료됩니다. GitHub Actions도 pull request와 `main` push에서 같은 `pnpm check`를 실행합니다.

> Next.js(App Router) + React 19 + TypeScript. 1~3주차 React+Vite 산출물은 개인 브랜치 히스토리에 남아 있습니다.

## 구조

```txt
src/
  app/                           # Next App Router entry
    _components/
      dialog-demos/              # Dialog demo components and tokenized styles
      DialogDemos.client.tsx
      select-demos/              # Select demo options, renderers, styles
      SelectDemos.client.tsx
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  shared/
    ui/
      select/                    # Select (Headless) — 4주차 1단계
        components/
        lib/
        types/
      dialog/                    # Dialog (Compound) — 4주차 2단계
docs/assignments/                # 주차별 과제 명세
```

> Next entry와 Select/Dialog 예시는 `src/app`에, 재사용 가능한 UI 구현은 `src/shared/ui`에 둡니다.

## 주차별 과제

- [1주차 — 코드 리뷰 & AI 협업 환경 구축](docs/assignments/week-01.md)
- [3주차 — 관심사 분리 & Custom Hook](docs/assignments/week-03.md)
- [4주차 — Next.js 커머스 프로젝트 골격](docs/assignments/week-04.md)
- 새 과제가 올라오면 **본인 포크의 `main`을 이 레포(upstream)와 동기화**해 받으세요.
  - GitHub: 포크 레포의 **Sync fork** 버튼
  - CLI: `git fetch upstream && git switch main && git merge upstream/main`

## 코드 품질 하네스

이 프로젝트는 AI가 생성한 코드도 동일한 기준으로 검증하기 위해 ESLint,
Prettier, Husky, lint-staged를 사용합니다.

### ESLint

ESLint는 포맷보다 코드 품질과 버그 가능성 검출에 집중합니다.

주요 설정은 다음과 같습니다.

- Next.js flat config(`core-web-vitals`, `typescript`)를 기본 baseline으로 사용합니다.
- TypeScript strict type-aware rules로 타입 회피와 불명확한 코드를 줄입니다.
- React Hooks / React Compiler lint rules로 Hook 호출 순서, dependency 누락, 렌더 중 state 변경, effect 내 동기 state 변경을 감지합니다.
- React JSX rules로 JSX 보안 및 React 작성 관습을 점검합니다.
- jsx-a11y로 접근성 문제를 정적으로 점검합니다.
- unused-imports / simple-import-sort로 사용하지 않는 import를 제거하고 import 순서를 일관되게 유지합니다.
- Next 라우트 파일(`src/app/**/{page,layout,loading,error,not-found}.tsx`)은 프레임워크 계약상 default export를 허용합니다.

### Prettier

Prettier는 코드 포맷팅만 담당합니다. ESLint와 포맷 책임이 겹치지 않도록
`eslint-config-prettier`를 사용합니다.

### Git Hook

커밋 전 `lint-staged`를 실행합니다.

- 변경된 TS/TSX 파일: ESLint 자동 수정 후 Prettier 적용
- 변경된 JS/JSON/CSS/MD 파일: Prettier 적용

검사를 통과하지 못하면 커밋되지 않습니다.

### Scripts

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm build
```

- `pnpm lint`: 전체 소스 ESLint 검사
- `pnpm lint:fix`: 자동 수정 가능한 ESLint 문제 수정
- `pnpm format`: Prettier로 포맷 적용
- `pnpm format:check`: 포맷 위반 여부 확인
- `pnpm typecheck`: Next 단일 TypeScript 프로젝트 타입 검사
- `pnpm build`: Next production 빌드

## 제출

1. 이 레포를 **포크**한다.
2. 포크에서 주차 작업 브랜치를 만든다 (예: `feat/week-04`).
3. 과제를 진행하고 커밋·푸시한다 (본인 포크에).
4. **메인 레포로 PR**을 연다. PR 템플릿(이번 주 학습 / 피드백 받고 싶은 부분)을 채운다.
5. 모든 PR이 한곳에 모이므로 서로 리뷰하고, 코치 피드백 + 다음 세션 구두 방어로 이어진다.

> PR은 **메인 레포(upstream)로** 올립니다 — 모두의 PR이 한곳에 모여 서로 리뷰할 수 있습니다. (협력자 추가는 필요 없습니다.)
