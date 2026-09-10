# Week 10 결정적 룰 승격

## 반복 지적과 기존 공백

6주차 RFC의 처음 문제는 entity의 product 표현이 상위 feature 행동을 직접 import하는
의존 방향이었다(`week06-fsd.md:32`). 같은 문서의 116·350행에서도 상위 layer 의존을
금지하고 조합을 상위에서 수행한다고 반복 명시한다.

기존 ESLint는 any/assertion·React import 등은 제한하지만 FSD layer 간 방향을 검사하지
않았다. 문서 규칙을 이미 자동화한 것처럼 재포장하지 않고 이 공백 하나를 승격한다.

## 구현 범위

`scripts/ci/check-layer-boundaries.mjs`가 기존 TypeScript compiler API로 AST를 읽는다.
`app → views → widgets → features → entities → shared`에서 상위로 향하는
정적 import, re-export, 문자열 dynamic import/require, import type을 차단한다.
alias와 상대 경로를 모두 확인한다. 문자열·주석 안의 가짜 import는 무시한다.

테스트 파일과 layers 밖의 `analytics` 같은 인프라는 제외한다.
같은 layer의 cross-slice 정책이나 상태 소유권·의미적 설계 판단까지 자동화했다고
주장하지 않는다. 계산된 동적 모듈 경로는 사람/AI의 문맥 검토 영역이다.

`pnpm lint`가 ESLint 다음 이 검사를 실행하므로 모든 PR의 기존 required quality에
연결된다. 새 패키지 의존성은 추가하지 않았다.

## 자가 검증

- 위반 fixture 4개가 기존 무검사 구현에서 실패하지 않는 RED를 확인했다.
- AST 구현 후 위반 4개 차단, 정상/외부 패키지/문자열 5개 통과.
- 실제 전체 `src` 검사에서 위반 0개, exit 0.
- 실패 출력은 file·line·from/to·specifier의 machine-readable JSON이다.
- 새로운 위반 fixture를 source directory에 놓고 CLI exit 1도 직접 확인한다.

## 책임 분담

기계에는 문법적으로 판별 가능한 의존 방향·타입·테스트·예산·환경 검증을 맡긴다.
AI는 컴포넌트 경계나 상태 복제 같은 설계 냄새의 후보를 제안하고,
사람은 제품 맥락과 트레이드오프를 판단한다. AI/리뷰어의 승인으로 정확성이 보장되는
것은 아니며, 작성자가 동작과 검증·버그에 대한 1차 책임을 가진다.
