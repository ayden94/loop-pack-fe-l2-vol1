# Week 10 AI 리뷰 계약과 판별 기록

## S12 실행 계약

AI 리뷰는 **advisory**다. 비결정적인 결과나 서비스 인증 장애를 required로 만들지 않는다.
작성자는 실제 diff·현재 규칙·실행 증거로 각 지적을 검증하고, 결정적인 규칙은 별도 게이트로 승격한다.
CI에 유료 AI API를 추가하지 않는다. 대화형 AI 도구에서 실제 diff를 수동 검토하며
코드 공개 저장소의 비밀이 없는 내용만 전달한다.

CLI subagent는 `Provided authentication token is expired`로 실패했다.
실행되지 않은 결과를 리뷰 증거로 세지 않는다. 기존 접근 가능한 대화형 도구를 대안으로 사용한다.

## 재사용할 팀 규칙 리뷰 프롬프트

```text
Review the supplied actual Git diff for correctness and this repository's conventions.
Return findings only with exact file/symbol, mechanism, confidence and a falsifiable check.
Do not claim you ran tests. Treat missing context as a question, not a proven defect.

Repository rules:
- TypeScript strict; no meaningless any, type-error suppression, blanket assertions or disable comments.
- Derived React state must not be synchronized with effects. Server responses belong to query cache,
  not duplicated client stores. Respect URL state ownership.
- FSD imports flow app -> views -> widgets -> features -> entities -> shared.
- This repo deliberately imports actual files, not slice root index barrels.
- Use @suspensive/react boundaries and @suspensive/react-query components.
- CI must preserve test/lint/type/build. Only whitelisted docs-only PRs can skip E2E.
- Missing/unreadable measurements must fail; output must not leak secret values.
- Node 24.17.0, Next 16.2.10, pnpm 10.15.1. The workflow uses public test-only env fixtures,
  not production credentials. Live server measurements run on local HTTP intentionally.
- Pure prose is not pinned by tests. Machine outputs and actual CLI behavior are tested.

Separate real findings from optional improvements. Avoid proposing generic fallback layers,
new dependencies, barrel files, retries, or deleting tests without evidence.
```

## 판별 방식

실제 diff의 base/head, 도구, 프롬프트, 응답을 기록한다.
참 지적은 재현 가능한 실패나 코드 경로로 확인하고, 오탐은 현재 정책·코드·실측으로 반박한다.
프롬프트 개선은 같은 diff에 재적용하며 모델의 자신감 자체를 근거로 삼지 않는다.
`max_turns` 같은 CI 안전장치는 AI workflow를 도입하지 않아 해당하지 않는다.
도구 사용은 실제 결과를 얻는 제한된 리뷰로 끝내고 자동 반복을 만들지 않는다.

## S13 실제 리뷰 실행 — 2026-09-10

- 도구: 로그인된 ChatGPT 웹을 Aside로 조작. 모델 세부 버전은 확인하지 못했다.
- 검토 diff: `git diff b48e5f5d..6df02466 -- scripts/ci/bundle-budget.mjs scripts/ci/validate-env.mjs .github/workflows/quality.yml package.json`.
- 실제 1차 요청은 diff 전체와 correctness·메커니즘·확신도·반증 방법을 요청하고
  Node 24.17.0/Next 16.2.10, 테스트 실행을 주장하지 말라는 조건을 전달했다.
  팀 프롬프트 전체를 그대로 실행했다고 주장하지 않는다. 누락된 정책 맥락은 2차에서 보강했다.
- 두 번의 실제 응답을 읽었으며 2차도 **같은 원본 diff**를 재검토하게 했다.

### 유효 지적

> 원래 validator는 loopers-week09-secret만 거부하고, workflow에 공개 fixture라고
> 명시한 week10-ci-only-not-a-production-secret은 preview/production에서도 허용했습니다.

실제로 production origin과 공개 CI fixture secret을 넣으면 오류가 0개였다.
`validateEnvironment: public CI fixture used in production -> fails` 테스트를 먼저
추가해 실패를 확인한 뒤 preview/production에서 문서화된 CI/local fixture secret을
거부하도록 수정했다. 수정 후 환경 테스트 13개가 통과했다.
이는 secret의 난수성·외부 유출 여부를 완전히 검증한다는 뜻은 아니다.

### 기각한 오탐과 근거

1차 응답은 `APP_ENV=test` 때문에 production이 아닌 test-mode bundle을 측정할 수
있다고 우려했다. 모델도 이 항목은 확정 버그가 아닌 concern으로 표시했다.
실제 `git grep APP_ENV -- src`는 일치가 없고 이 값은 gate/CI 분류에만 사용된다.
Next는 여전히 production build를 하므로 이 저장소에서는 성립하지 않는 우려다.

추가로 inline Flight 제외·Content-Encoding 강제를 지적했지만, S8은 **초기 외부
script URL의 실제 encoded 응답 bytes**를 단위로 정의했다. 명시적 제외 항목을
포함하라는 지적은 구현 수정이 아니라 다른 예산 정책이다.

### 개선한 실제 2차 요청

```text
Re-review the SAME original diff, not hypothetical changed code.
Verified repository context:
1. APP_ENV has no uses under src; it is only a validator/CI classification variable.
   Next still makes a production build.
2. S8 defines actual encoded HTTP response bytes of unique initial external script
   URLs with Accept-Encoding:gzip requested. Inline Flight/CSS/images/lazy chunks
   are excluded. Missing scripts must fail.
Withdraw context-only false positives but keep real findings.
The public CI-secret issue was reproduced with a failing test; a follow-up fix
rejects documented CI/local fixture values in preview/production.
Summarize the original true finding and withdrawn concerns with reasons.
```

2차 실제 응답은 공개 fixture 허용을 유효 지적으로 유지했고, 나머지 세 우려는
metric/저장소 맥락의 과도한 일반화로 철회했다.

> 원래 diff에서 실제 correctness issue로 남는 것은 1건뿐입니다.
> 나머지 세 항목은 ... false positive이므로 철회해야 합니다.

향후 팀 프롬프트에는 **측정 단위·명시적 비목표·환경 변수의 실제 소비 위치**를
함께 제공한다. 참 지적은 실패 테스트로 수정하고 오탐은 근거와 함께 기각했다.
