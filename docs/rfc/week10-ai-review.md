# Week 10 AI 리뷰 계약과 판별 기록

## S12 실행 계약

AI 리뷰는 **advisory**다. 비결정적인 결과나 서비스 인증 장애를 required로 만들지 않는다.
작성자는 실제 diff·현재 규칙·실행 증거로 각 지적을 검증하고, 결정적인 규칙은 별도 게이트로 승격한다.
CI에 유료 AI API를 추가하지 않는다. 대화형 AI 도구에서 실제 diff를 수동 검토하며
코드 공개 저장소의 비밀이 없는 내용만 전달한다.

CLI subagent는 `Provided authentication token is expired`로 실패했다.
실행되지 않은 결과를 리뷰 증거로 세지 않는다. 기존 접근 가능한 대화형 도구를 대안으로 사용한다.

## 리뷰 프롬프트 v1

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

## 判別方式

실제 diff의 base/head, 도구, 프롬프트, 응답을 기록한다.
참 지적은 재현 가능한 실패나 코드 경로로 확인하고, 오탐은 현재 정책·코드·실측으로 반박한다.
프롬프트 개선은 같은 diff에 재적용하며 모델의 자신감 자체를 근거로 삼지 않는다.
`max_turns` 같은 CI 안전장치는 AI workflow를 도입하지 않아 해당하지 않는다.
도구 사용은 실제 결과를 얻는 제한된 리뷰로 끝내고 자동 반복을 만들지 않는다.
