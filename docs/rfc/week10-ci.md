# Week 10 CI 파이프라인·AI 협업 실행 RFC

## 문서 역할과 현재 상태

[10주차 과제](../assignments/week-10.md)의 요구사항을 실제 실행·검증·커밋 단위로
재구성한다. 과제 원문이 범위의 기준이며, 이 문서는 실행 순서와 결정·증거의 기준이다.
요약 과정에서 요구사항을 줄이지 않고 마지막 추적표로 원문과 연결한다.

| 항목              | 값                                               |
| ----------------- | ------------------------------------------------ |
| 상태              | S3 결과 승인 — 단계 전환 커밋                    |
| 현재 단계         | Stage 4 실험 준비 진입 승인                      |
| 작성 기준         | `volume-10`, `278c2224`                          |
| 본 과제 구현·측정 | S3 후보 원격 1회 성공, 공식 After 측정·S4 미실행 |
| 다음 행동         | S3 결과 커밋 후 S4 lockfile·캐시 실험 범위 확인  |

`week10-feedback.md`는 **9주차 피드백 수정 기록**이다. 이번 CI 과제의 완료 증거로
대체하지 않는다. 기존 문서의 미완료 표시도 이 RFC에서 임의로 완료 처리하지 않는다.

### 참고한 RFC와 계승하는 방식

- [6주차 FSD](./week06-fsd.md): 기준선·비목표·아키텍처 경계와 미검증 항목 구분.
- [7주차 성능](./week07-performance.md): SHA·측정 조건 고정, raw 값·중앙값·범위,
  실패한 시도와 보류 판단도 증거로 남김.
- [8주차 테스트](./week08-test-plan.md): 검증 방법의 책임 분리, 실제 연결과 변이 검증.
- [9주차 구현](./week09-implementation.md): 사용자 결정 → 구현 → 검증 → 확인 → 커밋.
- [9주차 E2E](./week09-e2e-scope.md): 실행 비용·실패 비용·대체 검증에 따른 범위 판단.
- [9주차 피드백 대응](./week10-feedback.md): 존재 여부를 확인한 근거, 실제 Service 배선,
  상태 소유권을 중심으로 반복 결함을 방지.

## 운영 원칙

1. 각 Stage에서 목표·선택지·예상 영향·완료 조건을 먼저 설명한다.
2. 아래 사용자 결정표의 해당 항목을 확정한 뒤 구현한다. 측정으로 알 수 있는 사실을
   사용자에게 추측하게 하거나, AI가 예산·required·비용 정책을 대신 확정하지 않는다.
3. 동작·게이트 변경은 실패 사례를 먼저 실행한 뒤 최소 구현으로 통과시킨다.
   문서에는 문구 고정 테스트를 만들지 않고 포맷·링크·요구사항 대조를 적용한다.
4. 구현 결과와 관측한 검증을 기록한다. 계획·로컬 성공·원격 성공을 구분한다.
5. **S 단계가 넘어갈 때만 커밋한다.** 단계 내부에서는 결정 RFC·구현·테스트·검증
   기록을 변경사항으로 유지한다. 단계 완료를 보고하고 다음 S 진입에 대한 명시적
   확인을 받은 뒤, 해당 단계의 변경을 커밋하고 이동한다.
6. 실험용 실패는 제출 브랜치와 분리한다. 실험 PR은 머지하지 않는다.
   다른 사람의 변경·캐시·branch protection을 임의로 바꾸지 않는다.
7. 모든 Stage 상태를 이 문서의 진행표에서 갱신한다. 오래된 완료 숫자를 새 실행에
   재사용하지 않는다. 막힌 원격 검증은 이유·필요 권한·다음 행동을 적고 완료로 세지 않는다.
8. **매 단계 사이에는 사용자의 명시적 확인을 받는다.** S0부터 하나씩 진행하라는
   2026-09-09 요청을 적용한다. S0의 범위 승인이나 원격 작업 허용을 S1~S16의 일괄
   실행 승인으로 해석하지 않는다. 각 단계 결과 보고 후 다음 단계 진입을 별도로 묻는다.

### 상태와 커밋

- `초안`: 선택지와 실행 조건 작성. `결정`: 사용자 확인 완료.
- `구현 중`: 승인된 단계만 변경. `검증 완료`: 완료 조건의 실제 증거 확보.
- `보류`: 진행 불가 사유와 해제 조건 명시. 선택 항목의 미채택과 구분한다.
- 커밋은 `type: 한국어 설명`, scope 없이 작성하고 lint-staged·commitlint를 통과한다.
- 2026-09-09의 “S가 넘어갈 때만 커밋” 요청으로 단계 내부 관심사별 커밋 방식을 대체한다.
  아래 각 Stage의 `커밋 경계`는 단계 종료 때 포함할 작업 묶음이며, 중간 커밋 지시가 아니다.
  이미 완료된 S0 커밋은 유지하고, 현재 S1 변경은 다음 단계 전환 승인 전까지 커밋하지 않는다.
- 원격 CI·실험 PR 검증을 위해 단계 완료 전에 커밋이 필요한 경우, 이 규칙과의 충돌을
  설명하고 예외 범위를 먼저 확인받는다. 임의로 중간 커밋하거나 원격 검증을 생략하지 않는다.
- 원격 실행·실험 PR·캐시 삭제·설정 변경은 Stage 0에서 승인 범위를 명시한다.
  이 RFC 작성 자체는 push·PR·보호 규칙 변경이나 유료 서비스 사용의 승인이 아니다.

## 기준선과 비목표

작성 시 읽은 실행 설정은 다음과 같다. Stage 1에서 실제 HEAD와 다시 대조한다.

| 영역      | 현재 확인한 사실                                               | 다음 확인                                                |
| --------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| Node·pnpm | `.nvmrc`: 24.17.0, `packageManager`: pnpm 10.15.1              | CI 로그의 실제 버전·runner image                         |
| CI 진입   | `.github/workflows/quality.yml`: `main` push, 모든 PR          | 실행 저장소·PR base·승인/권한                            |
| 기본 검증 | `pnpm check`: test → lint → typecheck → build                  | 실패 없이 도는 원격 기준선                               |
| E2E       | `pnpm test:e2e`: build → Playwright, Chromium production 서버  | check 뒤 실행하므로 build 중복 여부와 소요 시간          |
| mutation  | 세 순수 정책 파일 변경 시 `pnpm test:mutate`                   | Before/After에서 동일한 분기 조건                        |
| 캐시      | setup-node의 pnpm 캐시 설정 존재                               | 실제 exact/partial hit와 miss 로그                       |
| 보안      | 기본 `contents: read`, 액션 SHA 핀, checkout credential 비영속 | job별 추가 권한·fork PR 동작                             |
| 미설정    | workflow에 timeout·concurrency 없음                            | timeout 보강, concurrency 필요성은 측정·운영 근거로 판단 |
| 성능 근거 | 7주차 RFC에 전송량·LCP·CLS 근거 존재                           | JS 번들과 이미지 전송량을 구별해 원시 자료 확인          |

**빌드 중복은 후보이지 아직 측정된 최대 병목이 아니다.** `pnpm check`와 E2E의
검증 범위를 유지한 채 같은 SHA의 production artifact를 재사용할 수 있는지 검토한다.
로컬 `pnpm test:e2e`의 독립 실행 계약은 보존한다.

비목표는 새 커머스 기능, 테스트 삭제·약화로 숫자 개선, 측정 없는 병렬화·캐시 추가,
기존 ESLint 규칙의 재포장을 새 룰 승격으로 주장하는 것, 유료 AI·배포 강제다.
배포 자체는 채점 대상이 아니며 CI 측정의 기술적 선행 조건도 아니다. 다만 원문이
권장하는 Preview/Production URL 확보 여부와 운영 근거의 한계는 반드시 기록한다.

### 공통 workflow 보안 기준

- 기본 권한은 `contents: read`다. 추가 권한은 사용하는 job에만 명시하고 이유를 기록한다.
  PR 코멘트에 필요한 `pull-requests: write`를 검증 job 전체에 확장하지 않는다.
- 현재 액션의 SHA 핀을 유지한다. 신규·갱신 액션은 출처와 SHA를 확인하고,
  공식 액션의 major 태그 허용 여부도 정책으로 기록한다. 예제 버전으로 임의 교체하지 않는다.
- `pull_request_target`은 기본적으로 사용하지 않는다. 예외가 필요하면 별도 승인과
  위협 검토를 거치며, 권한 있는 컨텍스트에서 신뢰하지 않는 PR 코드를 checkout·실행하지 않는다.
- AI 키·세션 secret·환경 변수 값은 로그·artifact·PR 코멘트에 남기지 않는다.
  fork PR에서 secrets를 읽을 수 있는 실행 경로를 만들지 않는다.
- 각 workflow 변경과 최종 제출에서 이 기준을 다시 대조한다.

## 사용자 결정표

D1은 S0에서 확정했다. D2에 따른 S1 로컬 준비 후 사용자의 “승인” 응답으로
단일 커밋·push·origin 실험 PR·smoke 최대 2회를 승인받았다.
S2~S5는 각 단계에서 별도로 확인받는다. 나머지 결정은 해당 Stage에서 갱신한다.

| ID  | 결정할 것                                          | 결정 시점 | 확정에 필요한 근거                                      |
| --- | -------------------------------------------------- | --------- | ------------------------------------------------------- |
| D1  | 확정: origin 측정·실험, upstream ayden94 최종 제출 | S0        | 아래 D1 확정표의 제한과 단계별 확인 유지                |
| D2  | cold/warm 정의·수집 방식·timeout                   | S1        | 실제 캐시 종류, runner, 명령과 정상 실행 시간           |
| D3  | 확정: 같은 job production 산출물을 E2E에 재사용    | S3        | Before 6회 모두 E2E가 최대 step, 실제 build 중복 확인   |
| D4  | E2E 실행 조건·스킵 안전성·flaky 정책               | S6        | 의존 경로, 보호 규칙, merge queue 지원 여부             |
| D5  | 번들 측정 대상·단위·도구·임계값·여유폭             | S8        | 7주차 자료와 현재 반복 측정값                           |
| D6  | 환경별 필수 변수·비밀 이름·허용 origin             | S10       | 실제 소비 코드, Preview/Production 구분                 |
| D7  | required/advisory check와 리포트 방식              | S11       | 실행 비용·변동성·리스크, skip/failure 동작              |
| D8  | AI 리뷰 도구·로컬/CI·트리거·비용 상한              | S12       | 사용할 수 있는 도구와 권한·비용                         |
| D9  | 반복 지적 중 승격할 규칙 하나                      | S14       | 실제 리뷰 이력, 기존 게이트와 차이, 참/거짓 판별 가능성 |
| D10 | Lighthouse CI·배포 근거·rollback 선택 항목         | S0·S8·S15 | 7주차 지표, 실행 환경, 운영 범위                        |

## 실행 단계와 진행표

기본 진행은 S0 → S16 순서다. 자료 읽기는 병행할 수 있지만, 측정 축을 바꾸는
Stage는 앞 단계 증거를 닫기 전에 진행하지 않는다. 전 단계가 끝나기 전 다음 단계의
제품·workflow 변경을 섞지 않는다.

| Stage | 실행 단위                         | 과제 연결 | 핵심 산출물                        | 상태                        |
| ----- | --------------------------------- | --------- | ---------------------------------- | --------------------------- |
| S0    | 실행 범위·권한·RFC 확정           | 공통      | 결정표·브랜치/PR 역할              | 검증 완료·사용자 승인       |
| S1    | 측정 가능한 Before 준비           | 1         | 고정 프로토콜·baseline SHA         | 검증 완료·결과 승인         |
| S2    | Before cold/warm 수집             | 1         | 6회 raw·중앙값·범위·병목           | 검증 완료·결과 승인         |
| S3    | 병목 한정 최적화                  | 1         | 선택 근거·동등 검증 CI             | 검증 완료·결과 승인         |
| S4    | 캐시 hit/miss 실험                | 1         | 복원/미복원 로그·install 비교·원복 | 진입 승인·실험 범위 확인 전 |
| S5    | After 측정·비교 판정              | 1         | 6회 raw·Before/After 결론          | 초안                        |
| S6    | 조건부 실행·실패 정책 구현        | 2         | 실행 행렬·스킵 안전 논리           | 초안                        |
| S7    | 조건에 걸리는/안 걸리는 PR 검증   | 2         | 양쪽 PR·run·머지 가능 상태         | 초안                        |
| S8    | 번들 측정과 예산 결정             | 3         | 7주차→현재 대응표·임계값           | 초안                        |
| S9    | 번들 예산 게이트 구현             | 3         | 측정 코드·정상/초과 검증           | 초안                        |
| S10   | 빌드 전 환경 변수 게이트          | 3         | 검증 코드·환경별 실패 사례         | 초안                        |
| S11   | required·결과 가시성·실패 PR 검증 | 3         | 보호 규칙·빨강/초록 PR 리포트      | 초안                        |
| S12   | 팀 규칙 기반 AI 리뷰 기준 작성    | 4         | 프롬프트·실행/비용 정책            | 초안                        |
| S13   | 실제 AI 리뷰 판별·프롬프트 개선   | 4         | 유효 지적 1개·오탐 1개·개선 근거   | 초안                        |
| S14   | 반복 지적의 결정적 룰 승격        | 5         | 룰·위반/정상 fixture·책임 표       | 초안                        |
| S15   | 질문 답변·10주 기술 회고          | 6·질문    | 회고·질문 4개 답변                 | 초안                        |
| S16   | 최종 품질·제출물·원복 확인        | 공통      | 최종 SHA·검증·제출 인덱스          | 초안                        |

## S0 — 실행 범위·권한·체크포인트

**진입:** 이 RFC와 과제 원문을 읽은 상태.

1. `git status`, HEAD, remote, 원격 PR·Actions·branch protection·merge queue
   지원과 권한을 확인한다. 지원 여부나 유료 플랜을 추측하지 않는다.
2. 제출 PR은 저장소 규칙대로 upstream `ayden94` 대상이다. CI 실험을 origin에서
   해야 한다면 실험 전용 PR의 예외 범위와 대상 브랜치를 먼저 승인받는다.
   origin/main 보호 증거를 upstream/ayden94 보호 증거라고 표현하지 않는다.
3. 기존 9주차 피드백을 먼저 머지해야만 시작할 수 있다는 제약은 두지 않는다.
   현재 push 트리거는 main 한정이므로 branch push만으로 CI가 돌았다고 보지 않는다.
4. 측정 run 비용, 테스트용 PR 생성·닫기, 전용 캐시 정리와 설정 변경 범위를 확인한다.
   전체 캐시 삭제나 관리자 우회 머지는 허용하지 않는다.
5. Preview/Production URL 확보 여부와 Lighthouse·rollback 선택 항목의 판단 시점을 기록한다.

**완료:** D1과 실행 순서가 확인되고, 미지원 기능의 대안/보류 조건이 있다.
**커밋 경계:** 실행 RFC. 원격 조작은 아직 하지 않는다.

### S0 조사 기록 — 2026-09-09

조사 시 읽기 전용 조회만 수행했다. 조사 기준 HEAD는 `278c2224`이며 당시
`volume-10`과 `origin/volume-10`이 일치했다. 당시 이 RFC는 untracked였고,
제품·workflow 변경은 없었다.

| 확인 대상                   | origin: ayden94/loop-pack-fe-l2-vol1 | upstream: loopers-labs/loop-pack-fe-l2-vol1   |
| --------------------------- | ------------------------------------ | --------------------------------------------- |
| 공개 범위·기본 브랜치       | public, main                         | public, main                                  |
| 현재 계정 권한              | admin/maintain/push 가능             | push 가능, admin/maintain 불가                |
| 대상 브랜치 보호 REST 조회  | main: 404 `Branch not protected`     | ayden94: 404 `Not Found`, 보호 유무 확정 불가 |
| 대상 브랜치 적용 rules 조회 | main: 빈 목록                        | ayden94: 빈 목록                              |
| GraphQL mergeQueue          | main: null                           | ayden94: null                                 |
| Actions 정책 조회           | enabled=true, allowed_actions=all    | 403, 정책 조회 불가                           |
| volume-10 PR                | 없음                                 | 없음                                          |
| 캐시 목록 조회              | 가능, 조회 당시 총 1개               | 미조회                                        |

mergeQueue의 null은 활성 queue가 확인되지 않았다는 뜻이다. 플랜상 지원 불가라고
단정하지 않는다. upstream의 빈 rules 목록만으로 classic protection까지 없다고
단정하지 않는다. 관리자 권한 없는 upstream의 보호 정책 변경은 실행 범위에서 제외하는 안이다.

- origin의 최근 main push CI는
  [run 34299274558](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34299274558)
  에서 성공했다. 이는 Actions 사용 가능 근거일 뿐 volume-10의 측정 baseline은 아니다.
- 현재 volume-10의 PR은 두 저장소 모두 없고, 조회한 upstream의 해당 head run도 없다.
- origin GitHub deployments API 최근 목록은 비어 있다. 외부 플랫폼 배포가 없다는
  뜻은 아니며 Preview/Production URL 확보 여부는 미확인으로 남긴다.
- 조사 명령: `gh api repos/{owner}/{repo}`, `branches/{branch}/protection`,
  `rules/branches/{branch}`, `actions/permissions`, `actions/caches`,
  `deployments`, `gh pr list`, `gh run list`, GraphQL `mergeQueue(branch: ...)`.
  404·403은 그대로 기록했으며 권한을 넓히거나 우회하지 않았다.

### D1 확정 — 2026-09-09 사용자 승인

| 구분             | 제안                                               | 제한                                                                      |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| 제출 브랜치·PR   | volume-10 유지, 최종 PR은 upstream ayden94 대상    | 생성·push는 해당 단계에서 확인 후 실행, 자동 머지 금지                    |
| 측정·실험 저장소 | 관리 권한이 있는 origin 사용                       | upstream 제출과 구분해 증거에 저장소·base/head 명시                       |
| 실험 PR          | origin/main 대상 전용 실험 브랜치에서 생성·닫기    | 실험용 예외 범위 승인 완료, 구체 실행은 해당 단계에서 확인, 머지하지 않음 |
| 보호 게이트 실험 | origin/main을 대상으로 S11에서 구체 설정 제안      | S0에서는 보호 규칙을 변경하지 않음, upstream 설정은 변경하지 않음         |
| Actions 측정     | Before/After 최소 12회와 필요한 자가 검증          | S1에서 실행 수·조건·비용을 설명하고 확인, 유료 추가 지출 자동 승인 아님   |
| 캐시             | 전용 namespace 우선, 필요 시 해당 실험 캐시만 정리 | 기존 공유 캐시·전체 캐시 삭제 금지, 삭제 전 별도 확인                     |
| 대외 설정·배포   | 기존 공개 정보 조회만                              | secrets 변경·유료 서비스·새 배포는 별도 승인                              |

보호 규칙 적용·PR/캐시 조작을 직접 검증해야 하므로 origin 실험을 채택했다.
이를 upstream의 사전 차단 증거로 주장하지 않는다. upstream 적용이 필요한 경우에는
관리자 협조를 별도 요청하고 미적용 상태를 명시한다.

### D10 확인 시점과 다음 게이트

- Preview/Production URL: 아직 미확인. 배포 유무를 가정하거나 새로 배포하지 않고,
  S1 준비 시 기존 설정·배포 근거를 추가 확인한 뒤 필요한 사용자 정보만 묻는다.
- Lighthouse CI: S8에서 측정 근거를 보고 채택 여부 결정. 지금 필수로 추가하지 않는다.
- rollback 심화 답변: S15에서 채택 여부 확인. 기본 과제 범위를 늘리지 않는다.
- 사용자의 **“확정하고 커밋하고 다음 단계로 진행해”** 요청으로 D1 범위·제한,
  S0 커밋과 S1 진입을 승인받았다. S0는 완료이며, S1의 구체 측정 조건은 D2에서 정한다.
- 이번 승인은 S2 이후 진입이나 캐시 삭제·보호 규칙 변경·유료 지출의 일괄 승인이 아니다.
  단계 사이 명시적 확인 원칙을 계속 적용한다.

## S1 — 측정 가능한 Before 준비

**진입:** S0 승인.

1. 기존 workflow를 보강한다. `.nvmrc`·packageManager·frozen lockfile을 유지하고
   각 job에 `timeout-minutes`를 둔다. lint/type/unit/build를 모두 실행한다.
2. 최소 권한을 확인한다. PR 파일 조회에 `pull-requests: read`가 필요한지 검증하고
   필요한 job에만 부여한다. 코멘트 쓰기는 해당 job에만 허용한다.
3. 측정에 필요한 trigger·시간 수집만 보강하고, 병렬화·조건부 skip·빌드 제거는 하지 않는다.
   한 `pnpm check` 안의 명령 시간도 수집해 가장 긴 구간을 분리한다.
4. 아래 측정 프로토콜을 확정하고 성공한 원격 baseline SHA를 고정한다.
   사전 준비 변경은 Before/After 양쪽에 같게 포함한다.
5. 로컬 명령과 실제 Actions에서 같은 검증 집합이 실행되는지 확인한다.

**완료:** D2, baseline SHA, 정상 CI run URL, 재실행 가능한 프로토콜.
**커밋 경계:** CI 기준선/수집 준비와 직접 테스트 → 프로토콜 기록.

### S1 준비 조사 — 2026-09-09

S0 확정 커밋은 `2897b993`이다. 그 이후 S1 진입 승인에 따라 기존 로그·설정만 조사했다.
아래 값은 main의 기존 run이며 현재 volume-10 Before 결과가 아니다.

| 참조 run 34299274558                  | 소요 시간           |
| ------------------------------------- | ------------------- |
| quality job: 01:27:43Z~01:29:34Z      | 111초               |
| Install dependencies                  | 6초                 |
| Install Playwright Chromium when used | 21초                |
| Run quality checks                    | 38초                |
| Run production end-to-end tests       | 28초                |
| mutation                              | 조건에 의해 skipped |

`Run quality checks`는 test/lint/typecheck/build가 합쳐져 있어 내부 병목은 아직
구분할 수 없다. 따라서 S1에서 실행 순서를 바꾸지 않고 명령별 시간을 드러내야 한다.

캐시 API에는 main ref의 pnpm 캐시 1개가 있었고 크기는 `212651438 bytes`였다.
해당 run 로그에는 `Cache saved with the key: node-cache-Linux-x64-pnpm-...`가 확인됐다.
이 저장 로그만으로 warm hit을 증명하지 않는다. 공유 캐시를 지우지 않고 별도 키로
측정 상태를 통제하는 안을 아래에 제시한다.

origin의 기본 workflow token 권한은 read이며 PR review 자동 승인은 비활성화돼 있다.
PR changed-files 조회용 `pull-requests: read`의 필요성을 준비 구현에서 검증하고,
필요한 job에만 명시한다. 쓰기 권한이나 review 승인 권한은 추가하지 않는다.

공개 배포 추가 조회: origin homepage는 null, GitHub Pages는 비활성이다.
README·7주차 RFC·workflow에서 vercel.app/netlify.app 주소도 찾지 못했다.
이는 외부 배포 부재의 증거가 아니며 URL 미확인 상태를 유지한다. 측정 준비를 막지는 않는다.

### D2 작업 조건 — S1 원격 준비 검증 최대 2회 승인

| 결정 항목      | 제안                                                                        | 이유·제한                                                            |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 실행 환경      | ubuntu-latest, Node 24.17.0, pnpm 10.15.1 유지                              | 실제 runner image·CPU·버전은 run마다 기록                            |
| job timeout    | 10분                                                                        | 기존 단일 참조 run은 111초. 설치 변동 여유를 두되 무한 대기 방지     |
| 검증 순서      | test → lint → typecheck → build → 기존 조건부 mutation → build+E2E 유지     | 중복 빌드 제거·병렬화·E2E skip은 아직 하지 않음                      |
| 내부 시간 수집 | check의 네 명령을 같은 순서의 명명된 Actions step으로 분리                  | `pnpm check`와 명령·순서의 동등성을 검증. 로컬 script는 유지         |
| 관리 캐시      | pnpm store만 전용 실험 키로 restore/save                                    | setup-node의 암묵 캐시와 중복 사용하지 않음. 기존 캐시 삭제 없음     |
| Cold 키        | 실험 namespace+OS/arch+Node/pnpm+run_id+lockfile hash, restore-keys 없음    | 새 run_id에서 정확한 miss를 확인. partial hit을 cold로 세지 않음     |
| Warm 키        | 같은 run_id의 전체 재실행(run_attempt만 증가)                               | 같은 SHA·lockfile·키의 실제 hit을 확인. attempt는 키에 넣지 않음     |
| 비관리 캐시    | Next build·브라우저 별도 캐시 추가 없음                                     | fresh hosted runner의 같은 조건으로 유지                             |
| S1 원격 검증   | origin의 전용 기준선 브랜치 → origin/main 실험 PR, 정상 run와 재실행 각 1회 | 준비 smoke 최대 2회. S2의 공식 6회에 포함하지 않음                   |
| 이후 반복 생성 | 같은 PR·head/base에서 승인된 재개 이벤트 등으로 새 run_id 확보              | S2 진입 승인 때 횟수·조건 재확인. source 변경으로 cold를 만들지 않음 |

키 제어에 필요한 restore/save 구현은 선택 액션의 지원 입력·출처·SHA를 확인한 뒤
Before/After 양쪽에 동일하게 적용한다. 이는 측정 하네스이며 캐시 최적화 효과로
계산하지 않는다. 정확한 miss/hit이 관측되지 않으면 준비 단계에서 원인을 해결한다.

10분 timeout 기준 S1 준비 2회의 job 실행 상한은 20 runner-minutes다.
공개 저장소 표준 runner의 실제 과금·조직 정책을 실행 전에 확인하며 유료 runner나
추가 유료 지출은 자동 승인하지 않는다. 준비 실패 시 반복 실행을 임의로 늘리지 않는다.

위 조사 당시에는 workflow를 수정하지 않았다. 이후 “S5까지 진행하되 각 단계마다
멈춰 확인받고 커밋” 요청으로 아래 로컬 준비를 수행한다. 커밋·push·PR 생성·
원격 실행·캐시 조작은 아직 하지 않았고, S2 진입도 승인받지 않았다.

### S1 로컬 구현과 원격 검증 전 체크포인트

변경 대상은 `.github/workflows/quality.yml`, 이 RFC, 검증 명령을 설명하는 규칙
11·15다. package.json·lockfile·제품 코드·기존 테스트·Playwright 설정은 바꾸지 않는다.

- 10분 timeout, job 단위 `contents: read`·`pull-requests: read`를 명시했다.
  pinned paths-filter의 PR 파일 API 조회에 읽기 권한이 필요함을 소스 문서로 확인했다.
- `pnpm check`와 같은 네 명령을 같은 순서의 Actions step으로 나눴다.
  조건부 mutation, 두 번째 build를 포함하는 `pnpm test:e2e`, 기존 trigger와 SHA 핀은 유지했다.
- pnpm/action-setup의 cache와 setup-node의 자동 package-manager-cache를 명시적으로 껐다.
  pnpm store 경로만 `actions/cache/restore`·`save`로 관리하며, v4.2.4의 commit
  `0400d5f644dc74513175e3cd8d07132dd4860809`를 원격 태그·입력·출력 소스와 대조했다.
- key는 OS/arch·실제 Node/pnpm·run_id·lockfile SHA256으로 구성한다.
  run_attempt는 key에서 제외해 동일 run 재실행이 같은 key를 사용한다.
- **restore-keys가 없어도 기본 key의 prefix 부분 복원이 가능하다.**
  cache-matched-key가 비어 있는 정상 miss만 cold, primary와 matched가 같고
  cache-hit=true인 실제 복원만 warm이다. 부분 복원·출력 누락/불일치는 실패시킨다.
- cache save는 모든 앞 검증이 성공하고 exact hit이 아닐 때만 같은 primary key로 실행한다.
  cache save의 경고/저장 실패까지 원격 로그에서 확인해야 warm 준비 완료로 인정한다.
- metadata는 저장소·event/action·run/attempt·head/base·실제 checkout·workflow SHA,
  runner image/CPU·Node/pnpm·lock hash·store/key·mutation 여부·UTC만 allowlist로 기록한다.
  전체 env/context나 secrets를 출력하지 않는다.
- 실행 시간은 종료 후 **attempt별 Jobs API**로 수집한다. setup과 cache save,
  액션 post 단계까지 포함한다. workflow 안에서 아직 끝나지 않은 전체 시간을 추정하지 않는다.
- PR 재개로 새 run을 만들면 merge SHA가 달라질 수 있다. head/base뿐 아니라 실제
  checkout SHA와 mutation 출력도 대조하고, 변경된 표본은 같은 조건으로 합산하지 않는다.
  측정 중 PR을 동결하고, S1 원격 smoke에서 이 조건을 먼저 확인한다.

로컬 정적·셸 검증은 GitHub의 캐시 저장/복원·PR 토큰 권한·재실행 SHA를 증명하지 않는다.
이 항목들은 아래 원격 smoke 2회로 추가 검증했다. baseline 후보 head는 `37233786`,
실제 검증한 merge SHA는 `b2b31e00`이다. runner 이미지·CPU 차이는 S2 진입 전
측정 환경 결정에 반영해야 하며, 이 smoke를 동등 환경의 성능 비교로 사용하지 않는다.

사용자 확인으로 정한 커밋·원격 검증 순서:

1. S1 변경 네 파일을 **원격 검증용 커밋 1회**로 묶어 `origin/volume-10`에 push한다.
2. 동일 commit의 `experiment/week10-s1-baseline` 전용 브랜치를 origin에 만들고,
   origin/main 대상 draft 실험 PR을 생성한다. 첫 실행 1회와 같은 run 재실행 1회만 확인한다.
3. PR은 머지하지 않는다. 준비 run은 S2의 공식 Before 측정 6회에 포함하지 않는다.
4. 원격 결과를 기록한 뒤 다시 멈춘다. 결과 문서의 추가 커밋과 S2 진입은 별도 확인받는다.
   두 번 안에 실패하면 승인 없이 수정 커밋·추가 실행으로 범위를 늘리지 않는다.

단계 내부 커밋 금지 원칙에 대한 **이번 S1 원격 검증용 한 번의 예외**만 승인됐다.
S1 완료 조건을 줄이거나 원격 검증을 S2로 옮기지는 않는다.

### S1 로컬 검증 기록

검증은 `.nvmrc`와 같은 Node `v24.17.0`, pnpm `10.15.1`에서 실행했다.
이는 로컬 실행이며 Actions의 공식 Before/After 시간 표본은 아니다.

| 검증                         | 관측 결과                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| YAML 파싱 계약 5개           | 수정 전 timeout·전용 캐시·개별 검증 명령 3개 실패, 기존 E2E/mutation·trigger/pin 2개 통과 → 수정 후 5개 통과 |
| 실제 workflow의 bash 문법    | 모든 run 블록 `bash -n` 통과                                                                                 |
| 캐시 판정 셸 fixture 7개     | cold·warm은 exit 0, 부분 복원·primary 누락·출력 불일치 등 5개는 exit 1                                       |
| 실제 metadata 셸 fixture 3개 | 동일 run_id의 attempt 1·2 key 동일, 다른 run_id는 key 다름. 실제 Node/pnpm 출력 확인                         |
| actionlint 1.7.12            | 공식 darwin/arm64 배포 checksum 대조 후 workflow 검사 exit 0                                                 |
| `pnpm check`                 | 63 files / 409 tests, lint·typecheck·production build 모두 exit 0                                            |
| `pnpm test:e2e`              | 독립 production build 후 Chromium 16 passed, exit 0                                                          |

YAML LSP는 설치되어 있지 않아 해당 진단은 실행하지 못했다. 프로젝트 의존성이나
lockfile에 도구를 추가하지 않고 actionlint·YAML 파싱·실제 셸 실행으로 대체했다.
정적 계약과 fixture는 로컬 검증이다. 원격 캐시/권한/재실행 결과는 아래에 별도로 기록한다.

### S1 원격 준비 검증 — 2026-09-10

승인된 S1 단일 커밋은 `3723378634bcd498962b28bacee4f55300b0ec88`이다.
`origin/volume-10`과 전용 실험 브랜치 `experiment/week10-s1-baseline`에 같은
commit을 push하고 [origin draft PR #13](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/13)을 생성했다.
대상은 origin/main이며, 최종 upstream 제출 PR이 아니다. **머지하지 않는다.**

GitHub 공식 과금 문서와 저장소 visibility를 확인했다. public 저장소의 표준
`ubuntu-latest` runner를 사용하며 유료 runner·설정·캐시 삭제는 추가하지 않았다.
참고: [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

| 실행                                                                                                               | 관측 상태              | job 시작~종료 UTC | wall-clock | 결과                       |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------- | ---------- | -------------------------- |
| [run 34427219215 / attempt 1](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/1) | cold, matched key 없음 | 01:52:51~01:55:10 | 139초      | success, 캐시 저장 완료    |
| [동일 run / attempt 2](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/2)        | warm, exact hit=true   | 01:56:18~01:58:50 | 152초      | success, 중복 저장 skipped |

attempt 1에서 확인한 고정 식별자:

- head: `3723378634bcd498962b28bacee4f55300b0ec88`
- base: `72a49cd1ed26a9721f0c9e5eea37996fb20ee824`
- event/실제 checkout/workflow SHA: `b2b31e0065d1ca9528bf135f778cd194b72c4164`
- runner: Linux/X64, `ubuntu24 / 20260831.293.1`, AMD EPYC 7763, parallelism 4
- Node/pnpm: `v24.17.0 / 10.15.1`
- lockfile SHA256: `0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`
- pnpm store: `/home/runner/setup-pnpm/node_modules/.bin/store/v10`
- mutation: `false`, 해당 step은 기존 정책대로 skipped
- cache key: `week10-s1-pnpm-Linux-X64-node-v24.17.0-pnpm-10.15.1-run-34427219215-0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`

첫 실행 로그의 `Cache not found for input keys`와 마지막 `Cache saved with key`를
위 동일 key로 확인했다. PR 파일 조회, 409개 테스트·lint·타입·build와 E2E 16개가
두 attempt에서 모두 성공했다. 두 번째 실행은 `Cache restored successfully`와
`Cache restored from key`가 위 primary key와 일치하며 exact hit=true다.
불필요한 cache save는 skipped다. head/base, event/checkout/workflow SHA,
Node/pnpm, OS/arch, lock hash, store/key, mutation=false가 두 attempt에서 동일하다.

이번 전용 cache ID는 `7527248927`, scope는 `refs/pull/13/merge`,
크기는 `212703908 bytes`다. 기존 main 캐시를 삭제하거나 덮어쓰지 않았다.

#### 환경 차이와 해석 한계

| 항목         | attempt 1                       | attempt 2                 |
| ------------ | ------------------------------- | ------------------------- |
| Runner image | ubuntu24 / 20260831.293.1       | ubuntu24 / 20260907.300.1 |
| CPU          | AMD EPYC 7763 64-Core Processor | Intel(R) Xeon(R) 6973P-C  |
| parallelism  | 4                               | 4                         |

같은 `ubuntu-latest`와 같은 run 재실행이어도 이미지 빌드와 CPU가 바뀌었다.
**139초→152초를 캐시의 개선·악화로 해석하지 않는다.** 의존성 설치는 6초→5초였지만
pnpm 설정·브라우저 설치 등 다른 구간의 변동과 환경 차이가 있다.
이번 증거는 캐시 상태 제어·검증 실행·메타데이터 수집 기능의 정상 동작을 보여준다.

S2 실행 전에 동일 환경 표본의 인정 기준과 hosted runner 변동을 어떻게 통제할지
명시적으로 결정해야 한다. 예를 들어 허용한 image/CPU 조합별로 표본을 분리할지,
기존 프로토콜의 환경 조건을 재정의할지를 근거와 함께 결정한다.
현재 조건을 만족시키려고 무제한 재실행하거나, 고정할 수 없는 환경을 고정했다고
주장하지 않는다. runner·측정 횟수·제외 기준을 바꾸려면 먼저 확인받는다.

#### 실제 step 시간

단위는 초, attempt별 Jobs API의 `started_at`·`completed_at` 차이다.
합산 step 시간과 job wall-clock은 step 사이 구간 때문에 같지 않을 수 있다.
job 종료에는 액션 post/cleanup도 포함했으며 큐 대기는 포함하지 않았다.

| Step                                   | attempt 1 | attempt 2 |
| -------------------------------------- | --------- | --------- |
| Set up job                             | 2         | 3         |
| Checkout                               | 2         | 3         |
| Detect mutation target changes         | 1         | 1         |
| Set up pnpm                            | 3         | 16        |
| Set up Node.js                         | 5         | 5         |
| Record measurement context             | 1         | 0         |
| Restore measurement pnpm store         | 0         | 4         |
| Verify exact cache condition           | 0         | 0         |
| Install dependencies                   | 6         | 5         |
| Install Playwright Chromium when used  | 24        | 39        |
| Run tests                              | 19        | 12        |
| Run lint                               | 18        | 13        |
| Run typecheck                          | 4         | 3         |
| Run production build                   | 11        | 10        |
| Run mutation tests for changed targets | skipped   | skipped   |
| Run production end-to-end tests        | 34        | 33        |
| Save measurement pnpm store            | 4         | skipped   |
| Post Set up Node.js                    | 0         | 0         |
| Post Set up pnpm                       | 0         | 0         |
| Post Checkout                          | 0         | 0         |
| Complete job                           | 0         | 0         |
| 전체 job wall-clock                    | 139       | 152       |

이 두 run attempt는 S1 준비 smoke이며 **S2의 공식 Before 6회에 포함하지 않는다.**
사용자의 “커밋하고 넘어가” 요청으로 S1 결과 기록 커밋과 S2 진입을 승인받았다.
S2의 환경 변동 처리·캐시 조작 같은 구체 실행 조건은 별도로 설명하고 확정한다.
S3 이후로 자동 진행하지 않는다.

### 측정 프로토콜

- 모든 run에 repository, event, head/base/실제 checkout SHA, workflow revision,
  runner image·CPU, Node/pnpm, lockfile hash, 실행 시각·attempt를 기록한다.
- wall-clock은 **첫 job 시작부터 마지막 필수 job 종료까지**로 정의한다.
  큐 대기와 billed job 합계는 별도 기록한다. 병렬 job 시간을 더해 wall-clock으로 쓰지 않는다.
- Cold는 관리 대상 캐시가 실제로 복원되지 않은 fresh runner 실행이다.
  Warm은 동일 키의 캐시가 실제 복원된 실행이다. OS 사전 설치 캐시는 별도 조건으로 기록한다.
- pnpm store·Next build·브라우저 등 사용 중인 캐시를 열거한다. 관리하지 않는 캐시는
  고정 조건으로 표시한다. exact miss라도 restore-key partial hit면 cold로 세지 않는다.
- 전용 key namespace 또는 승인된 전용 캐시 정리로 cold를 만든다.
  warm용 준비 run은 측정 3회와 분리하고 Before/After에서 같은 정책을 사용한다.
- runner 종류·Node 버전·앱 소스·의존성·검증 집합·mutation 분기·E2E workers를 고정한다.
  Before/After의 workflow 차이는 최적화로 한정하고 불가피한 차이를 공개한다.
- 실패·취소·설정 오류 run은 삭제하지 않고 제외 이유를 적는다.
  각 조건에서 유효한 3회가 채워져야 한다. 최선의 run만 골라 평균처럼 보고하지 않는다.
- B-C1~3, B-W1~3, A-C1~3, A-W1~3 **총 최소 12회**.
  캐시 실험·조건부 PR·실패 PR 검증은 별도이며 조건이 다르면 이 12회에 섞지 않는다.

## S2 — Before 6회와 병목 지목

**진입:** baseline SHA와 프로토콜 고정.

1. B-C1~3와 B-W1~3을 실행하고 run/step 타임스탬프·캐시 로그를 수집한다.
2. install·브라우저 설치·test·lint·typecheck·build 각각의 시간과 전체 시간을 기록한다.
3. raw 값·중앙값·min~max 범위를 cold/warm별로 계산한다.
4. 가장 긴 구간과 전체 critical path를 구분해 병목을 한 문단으로 설명한다.
   빌드 2회가 실제 실행됐는지 확인하되 결론은 로그로 낸다.

**완료:** 유효한 Before 6회와 병목 근거, 최적화 전 검증 집합 고정.
**커밋 경계:** Before 측정 기록. 코드 변경 없음.

### S2 진입과 조사 결과 — 2026-09-10

S1 결과 기록을 `560f7098`로 커밋했다. 이 문서 커밋은 아직 push하지 않았다.
실험 PR #13의 head `37233786`, base `72a49cd1`, 기존 run의 attempt 2 성공 상태는
읽기 전용 조회에서 유지되고 있었다. 현재 S2 공식 실행·캐시 삭제는 **0회**다.

GitHub 공식 계약을 확인했다.

- [동일 run 재실행](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)은
  원래 event의 `GITHUB_SHA`·`GITHUB_REF`와 최초 실행자의 권한을 사용한다.
  PR을 닫았다 다시 열어 새 run을 만드는 것보다 checkout 기준을 유지하기 쉽다.
- [Hosted runner](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)는
  매 job 새 환경을 제공한다. `ubuntu-latest`는 고정 image build/CPU를 뜻하지 않는다.
  [runner-images 정책](https://github.com/actions/runner-images/blob/main/README.md)도
  이미지 갱신을 설명한다. `ubuntu-24.04`로만 바꿔도 특정 이미지 빌드·CPU까지 고정되지는 않는다.
- [cache ID 삭제 API](https://docs.github.com/en/rest/actions/cache#delete-a-github-actions-cache-for-a-repository-using-a-cache-id)로
  특정 항목만 삭제할 수 있다. 현재 실험 cache는 ID `7527248927`,
  `refs/pull/13/merge` scope이며 main cache ID `7480586644`와 구분된다.

### S2 실행 조건 — 2026-09-10 사용자 승인

새 workflow나 중간 구현 커밋을 만들지 않고 기존 run `34427219215`를 재사용하는 안이다.
동일 run의 key가 유지되므로, cold 생성 직전에 **이번 실험의 정확한 key/ref 항목만**
삭제한다. 이는 S1의 “새 run_id로 cold 생성” 안을 대체하며, 위 사용자 승인으로 확정했다.

| 표본 | 예정 attempt | 캐시 조작                                  | 기대 상태               |
| ---- | ------------ | ------------------------------------------ | ----------------------- |
| B-C1 | 3            | 정확한 실험 key/ref의 현재 ID 1개 삭제     | miss → 정상 검증 → save |
| B-W1 | 4            | 삭제 없음, 직전 cold에서 저장한 cache 사용 | exact hit               |
| B-C2 | 5            | 직전 save로 생성된 현재 실험 ID 1개 삭제   | miss → 정상 검증 → save |
| B-W2 | 6            | 삭제 없음                                  | exact hit               |
| B-C3 | 7            | 현재 실험 ID 1개 삭제                      | miss → 정상 검증 → save |
| B-W3 | 8            | 삭제 없음                                  | exact hit               |

- 승인 요청 범위는 **추가 attempt 최대 6회 + 특정 실험 cache 삭제 3회**다.
  실행 한도는 10분/job 기준 최대 60 runner-minutes이며, 큐 대기는 별도다.
- 삭제 전 매번 목록을 조회해 key 전체 문자열과 ref가 모두 일치하는 항목이 정확히
  하나인지 확인한다. 현재 알려진 ID를 반복 재사용하지 않는다. 목록 불일치·권한 오류가
  있으면 멈춘다. main·다른 PR·전체 cache 삭제는 승인 범위가 아니다.
- C1 → W1 → C2 → W2 → C3 → W3를 직렬 실행한다. 소스·workflow·lockfile·
  head/base·worker 설정·mutation 조건을 바꾸지 않고, 기존 smoke 1/2는 다시 세지 않는다.
- cold 측정의 save를 다음 warm 표본의 준비로 쓴다. 별도 warm-up 실행은 추가하지 않는다.
  준비 run과 warm 표본을 혼동하지 않으며, 이 방식도 Before/After에서 동일하게 유지한다.
- 실패·조건 불일치가 생기면 기록하고 멈춘다. 승인 없이 대체 run·수정 커밋·cache 추가
  조작을 하지 않는다. 최대 6회는 실행 상한이지, 유효 표본 6개 확보를 보장하는 말이 아니다.
- S2 동안 main/실험 PR head를 동결한다. 재실행의 checkout은 고정돼도 paths-filter는
  PR 파일 목록을 조회하므로 실행 전후 head/base와 mutation 출력을 대조한다.

### 실행 유효성과 환경 비교 가능성 — 승인된 판정 기준

원문은 hosted runner 변동을 전제로 반복 측정과 범위를 요구한다. 반면 같은 runner
라벨만으로 실제 image/CPU가 동일했다고 주장할 수는 없다. 다음 두 판정을 구분한다.

1. **실행 유효:** 모든 필수 검증 성공, 예상 cold/warm 증거, 시간 로그 완전성,
   head/base/checkout·workflow·lock hash·실제 Node/pnpm·runner 종류·OS/arch·
   parallelism·mutation·worker 설정이 기준선과 일치한다.
2. **환경 관측과 비교:** runner 설정·OS/arch·parallelism·실제 Node/pnpm·검증
   집합은 고정한다. image build·CPU model은 관측 변수로 기록·구분하며, 이미지
   빌드 차이만으로 실행 유효 표본을 탈락시키지 않는다. 전체 raw와 cold/warm 통계를
   제시하되 환경별 분포도 함께 보인다. Before/After의 환경 분포 차이가 있으면
   단순 중앙값 차이만으로 인과적 개선을 주장하지 않는다.

각 attempt의 raw 시간·환경·채택/보류 이유는 빠짐없이 남긴다. 혼합 환경의 cold/warm
중앙값·min~max는 **관측 요약**으로 표시하고, 통제된 성능 비교의 증거로 바꾸지 않는다.
느린 결과를 이유로 제외하거나 동일 환경이 나올 때까지 재시도하지 않는다.
같은 image/CPU도 host contention·네트워크 변동을 없애는 것은 아니다.

최초 승인한 image build+CPU 완전 일치 조건은 아래 중단 뒤 사용자 확인으로 대체했다.
고정 가능한 설정과 관측 환경을 구분하는 변경이지, 실패 검증·틀린 캐시 상태를
허용하는 변경은 아니다. 전체 실행 한도 6회와 전용 캐시 삭제 한도 3회는 유지한다.
추가 표본·대체 인프라는 별도 승인 사항이며 유료/self-hosted runner를 자동 도입하지 않는다.

사용자의 **“진행해”** 요청으로 위의 전용 캐시 삭제 범위·최대 6회 수집·환경 판정
기준을 승인받았다. S1의 준비 attempt 1/2는 제외하며 attempt 3부터 공식 수집한다.
main/다른 PR 캐시 삭제·추가 실행·설정 변경·S3 진입은 승인 범위가 아니다.
결과 문서는 S2 결과 확인과 단계 전환 승인 전까지 커밋하지 않는다.

### S2 초기 수집과 일시 중단 기록 — 2026-09-10

아래는 환경 기준 변경 승인 **전**의 관측과 당시 중단 판단이다. 원시 값과 의사결정
이력은 유지하며, 재개 이후 상태는 다음 기록에서 갱신한다.

승인된 추가 실행 6회 중 **2회**, 전용 cache 삭제 3회 중 **1회**만 수행했다.
run은 동일한 `34427219215`이며, attempt 3/4가 B-C1/B-W1이다.
S1 smoke attempt 1/2를 이번 통계에 포함하거나 재분류하지 않았다.

| 항목                     | B-C1 / attempt 3                                                                                 | B-W1 / attempt 4                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Run URL                  | [attempt 3](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/3) | [attempt 4](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/4) |
| 시작~종료 UTC            | 02:16:03~02:18:19                                                                                | 02:19:01~02:21:16                                                                                |
| job wall-clock           | 136초                                                                                            | 135초                                                                                            |
| 캐시                     | 실제 cold miss·save 성공                                                                         | 같은 key exact hit                                                                               |
| 필수 검증                | 409 tests·lint·type·build·E2E 16개 성공                                                          | 동일하게 성공                                                                                    |
| Runner image             | ubuntu24 / 20260831.293.1                                                                        | ubuntu24 / 20260907.300.1                                                                        |
| CPU/parallelism          | AMD EPYC 7763 / 4                                                                                | AMD EPYC 7763 / 4                                                                                |
| 실행 유효성              | 충족                                                                                             | 충족                                                                                             |
| 최초 cold 기준 환경 일치 | 기준 표본                                                                                        | **이미지 빌드 불일치**                                                                           |

두 표본의 head/base/checkout·workflow SHA, 실제 Node/pnpm, OS/arch,
lock hash, pnpm store/key, mutation=false와 Playwright `16 tests / 2 workers`는 동일하다.
조건부 mutation은 두 번 모두 skipped, warm의 cache save도 의도대로 skipped였다.

삭제한 cache는 ID `7527248927` 한 개이며 HTTP 204와 목록 조회로 삭제를 확인했다.
main cache ID `7480586644`는 보존했다. cold 3이 새로 저장한 실험 cache ID는
`7527770790`이다. B-C2 준비 중 이 새 ID를 조회했지만 **삭제하지 않았다.**

#### 중단 이유와 완료 판정

승인된 보수적 기준은 최초 cold의 동일 image build+CPU에 cold 3개·warm 3개가
모두 모여야 통제된 Before 기준선으로 인정한다. B-W1이 이미 기준 환경과 달라,
남은 4회로 같은 환경의 warm 3개를 확보할 수 없다. 따라서 불가능한 완료 조건을
위해 승인 한도를 소모하지 않고 B-C2 직전에 멈췄다.

- **중단 당시 S2 미완료**였다. 그 시점에는 예정 attempt 5~8을 요청하지 않았다.
- raw 값은 136초·135초로 보존한다. cold/warm 각각 표본 1개이므로 공식
  3회 중앙값·범위와 병목 결론을 산출하지 않는다.
- 1초 차이를 캐시 효과·성능 개선으로 해석하지 않는다.
- source/workflow 변경·새 커밋·push·S3 진입은 하지 않았다.

#### 환경 기준 변경과 재개 승인

image build+CPU의 완전 일치는 이 RFC에서 제안한 보수적 통제 조건이다.
과제 원문은 hosted runner의 시간 변동을 전제로 같은 runner 종류·설정과 반복 측정·
범위를 요구하며, 특정 이미지 빌드가 다시 배정될 것을 보장하지 않는다.

실행 가능한 대안으로 **runner 설정·OS/arch·parallelism·실제 Node/pnpm·검증 집합을
고정하고 image build/CPU를 관측 변수로 기록·구분**하는 방법을 제안한다.
이미지 빌드 차이만으로 표본을 자동 탈락시키지 않되, 환경 혼합과 Before/After 분포
차이를 공개하고 단순 중앙값만으로 인과적 개선을 단정하지 않는다.
이를 채택하면 기존 2개 raw 표본을 보존한 채 남은 승인 한도의 4회를 수집할 수 있다.

사용자의 **“진행해”** 응답으로 위의 환경 기준 변경과 기존 두 표본을 보존한 채
남은 **4회** 재개를 승인받았다. attempt 5~8만 추가하며, cold 5·7 직전 각각
현재의 정확한 실험 cache key/ref 항목 1개를 삭제한다. 현재까지 실행 2회·삭제 1회를
초기화하지 않으며, 전체 6회·삭제 3회 한도를 넘기지 않는다.

S2의 Before 관측값은 변경한 기준으로 정리하되 물리 환경이 완전히 통제된 데이터라고
표현하지 않는다. 표본을 속도에 따라 교체하거나 S1 smoke를 공식 표본으로 바꾸지 않는다.
재개 결과 보고 후 커밋·S3 진입은 다시 명시적으로 확인받는다.

### S2 최종 Before 결과 — 2026-09-10

변경한 환경 판정 기준의 승인 후 남은 네 표본을 수집했다. 공식 표본은 동일
run `34427219215`의 attempt **3~8**이며 cold 3개·warm 3개가 모두 실행 유효성
검증을 통과했다. 중단 전에 수집한 attempt 3/4도 원시 값 그대로 포함했다.
S1 smoke attempt 1/2는 제외했다.

- 고정 head: `3723378634bcd498962b28bacee4f55300b0ec88`
- 고정 base: `72a49cd1ed26a9721f0c9e5eea37996fb20ee824`
- 실제 event/checkout/workflow SHA: `b2b31e0065d1ca9528bf135f778cd194b72c4164`
- 설정: `ubuntu-latest`, Linux/X64, parallelism 4, Node `v24.17.0`,
  pnpm `10.15.1`, Playwright `16 tests / 2 workers`
- lockfile SHA256: `0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`
- 검증 집합: 모든 표본에서 409 tests·lint·typecheck·production build·E2E 16개 성공.
  mutation=false에 따라 해당 step은 모두 skipped. 소스·설정·검증 순서 변경 없음.
- 캐시: cold는 실제 miss와 save 성공, warm은 동일 key의 exact hit을 확인했다.
  warm에서 cache save는 skipped였다.

#### 원시 시간과 환경

시각은 UTC다. wall-clock은 quality job의 시작부터 post/cleanup을 포함한 종료까지이며
큐 대기 시간을 포함하지 않는다. image 열은 모두 ubuntu24의 image build다.

| 표본 / attempt                                                                                  | 시작     | 종료     | wall-clock | image build    | CPU model                 |
| ----------------------------------------------------------------------------------------------- | -------- | -------- | ---------- | -------------- | ------------------------- |
| [B-C1 / 3](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/3) | 02:16:03 | 02:18:19 | 136초      | 20260831.293.1 | AMD EPYC 7763             |
| [B-W1 / 4](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/4) | 02:19:01 | 02:21:16 | 135초      | 20260907.300.1 | AMD EPYC 7763             |
| [B-C2 / 5](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/5) | 02:32:09 | 02:34:34 | 145초      | 20260907.300.1 | Intel Xeon Platinum 8573C |
| [B-W2 / 6](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/6) | 02:35:12 | 02:37:11 | 119초      | 20260907.300.1 | Intel Xeon Platinum 8573C |
| [B-C3 / 7](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/7) | 02:38:32 | 02:41:00 | 148초      | 20260907.300.1 | AMD EPYC 9V74             |
| [B-W3 / 8](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/8) | 02:41:37 | 02:43:56 | 139초      | 20260831.293.1 | AMD EPYC 7763             |

#### Cold/Warm 요약

| 상태        | raw 값(초)    | n   | 중앙값 | min~max   | 범위 폭 |
| ----------- | ------------- | --- | ------ | --------- | ------- |
| Before cold | 136, 145, 148 | 3   | 145초  | 136~148초 | 12초    |
| Before warm | 135, 119, 139 | 3   | 135초  | 119~139초 | 20초    |

이는 **혼합된 hosted 환경에서 관측한 Before 통계**다. cold/warm 중앙값의 10초
차이를 캐시의 인과적 효과나 최적화 성과로 단정하지 않는다. 아직 After가 없으며,
이 수집에서는 최적화를 적용하지 않았다.

#### 환경별 분포

| image build / CPU                          | cold raw(초) | warm raw(초) |
| ------------------------------------------ | ------------ | ------------ |
| 20260831.293.1 / AMD EPYC 7763             | 136 (n=1)    | 139 (n=1)    |
| 20260907.300.1 / AMD EPYC 7763             | 없음         | 135 (n=1)    |
| 20260907.300.1 / Intel Xeon Platinum 8573C | 145 (n=1)    | 119 (n=1)    |
| 20260907.300.1 / AMD EPYC 9V74             | 148 (n=1)    | 없음         |

각 층에 3개씩 있지 않으므로 환경별 확정적 성능 결론은 내리지 않는다.
S5에서는 전체 분포와 환경별 분포를 함께 대조한다. 비교군 구성이 달라 설명이
어려우면 인과적 개선 판단을 보류하고, 승인 없이 유리한 표본으로 교체하지 않는다.

#### Step별 원시 시간

단위는 초, 열 순서는 실행 순서다. `skip`은 의도된 미실행이며 0초 실행과 구분한다.
원천은 `GET /repos/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215/attempts/{attempt}/jobs`
응답의 step별 `started_at`·`completed_at`이다. job 사이의 사용자 확인 대기 시간은
wall-clock 표본에 넣지 않았다.

| Step                                   | C1   | W1   | C2   | W2   | C3   | W3   |
| -------------------------------------- | ---- | ---- | ---- | ---- | ---- | ---- |
| Set up job                             | 2    | 1    | 7    | 2    | 2    | 2    |
| Checkout                               | 1    | 1    | 2    | 2    | 2    | 2    |
| Detect mutation target changes         | 0    | 1    | 1    | 0    | 1    | 0    |
| Set up pnpm                            | 4    | 5    | 4    | 3    | 3    | 5    |
| Set up Node.js                         | 5    | 5    | 7    | 5    | 5    | 6    |
| Record measurement context             | 1    | 1    | 0    | 1    | 1    | 1    |
| Restore measurement pnpm store         | 0    | 3    | 1    | 3    | 0    | 5    |
| Verify exact cache condition           | 0    | 0    | 0    | 0    | 0    | 0    |
| Install dependencies                   | 7    | 3    | 6    | 2    | 7    | 2    |
| Install Playwright Chromium when used  | 23   | 24   | 29   | 24   | 26   | 25   |
| Run tests                              | 19   | 19   | 15   | 14   | 19   | 19   |
| Run lint                               | 18   | 18   | 16   | 15   | 20   | 18   |
| Run typecheck                          | 4    | 4    | 4    | 4    | 5    | 5    |
| Run production build                   | 11   | 12   | 9    | 10   | 12   | 11   |
| Run mutation tests for changed targets | skip | skip | skip | skip | skip | skip |
| Run production end-to-end tests        | 33   | 35   | 35   | 32   | 36   | 35   |
| Save measurement pnpm store            | 4    | skip | 5    | skip | 6    | skip |
| Post Set up Node.js                    | 1    | 0    | 0    | 0    | 0    | 0    |
| Post Set up pnpm                       | 0    | 0    | 0    | 0    | 0    | 0    |
| Post Checkout                          | 0    | 0    | 1    | 0    | 0    | 0    |
| Complete job                           | 0    | 0    | 0    | 0    | 0    | 1    |
| 전체 job wall-clock                    | 136  | 135  | 145  | 119  | 148  | 139  |

step 합계와 job 시간의 차이는 step 사이 간격 등에서 발생한다. 합계를 전체
wall-clock으로 대신 사용하지 않았다.

#### 병목 지목과 S3 판단 자료

**가장 긴 개별 step은 6회 모두 `Run production end-to-end tests`**였다.
raw는 33·35·35·32·36·35초, cold/warm 중앙값은 모두 35초다.
다음으로 Chromium 설치가 cold 중앙값 26초·warm 24초였다. test는 각각 19초,
lint는 18초였다. 전체 job은 직렬이므로 모든 구간이 critical path에 있지만,
개별 최대 구간을 `pnpm check` 같은 여러 작업의 합과 혼동하지 않는다.

`package.json`의 `test:e2e`는 `pnpm build && playwright test`이며, 각 attempt 로그에서
`Run production build`와 `Run production end-to-end tests` 양쪽에 실제 `> next build`
실행이 있는 것을 확인했다. 단순히 명령 문자열만 보고 중복이라 추정하지 않았다.
E2E 35초 전체가 build 비용은 아니므로 그 전체를 절감 가능 시간으로 주장하지 않는다.

S3의 우선 검토 후보는 **같은 job·같은 SHA에서 먼저 만든 production 산출물을
E2E에 재사용해 두 번째 build를 제거**하는 것이다. 실제 Playwright 16개와 앞선
build 검증, 로컬 `pnpm test:e2e`의 독립 실행 계약은 유지해야 한다.
pnpm 설치는 cold 7초·warm 2초 중앙값으로 최대 병목이 아니어서, 그 캐시만 더
최적화하는 것을 우선안으로 잡지 않는다. 병렬 job·추가 브라우저 캐시·concurrency는
효과와 설치·artifact 비용을 별도로 검토하고, 지금 구현하거나 확정하지 않는다.

#### 한도·보존·완료 확인

- 요청한 공식 attempt는 `[3, 4, 5, 6, 7, 8]` 정확히 6개다. 전부 성공했고
  대체·제외 run은 없다. S1 smoke는 별도다.
- 삭제한 ID는 `7527248927`(3 직전), `7527770790`(5 직전),
  `7528147606`(7 직전)이다. 매번 정확한 key/ref를 조회해 한 항목만 삭제했다.
- 마지막 실험 cache ID `7528287115`는 `refs/pull/13/merge`에 남겨뒀다.
  main cache ID `7480586644`는 보존했다. 추가 삭제를 하지 않았다.
- 6개 job wall-clock 합계는 822초다. 큐 대기·대화 대기·S1 smoke는 이 합계에서 제외한다.
  청구 금액이나 실제 billing 집계로 표현하지 않는다.
- PR #13은 OPEN·draft·미머지이며 head/base는 고정됐다. 같은 run은 attempt 8 success로 종료됐다.
- source/workflow·공유 캐시·보호 규칙 변경, 추가 실행·커밋·push·S3 진입은 하지 않았다.

**S2의 변경된 승인 기준에 따른 수집·분석은 완료**했다. 사용자의 “그렇게해” 요청으로
S2 결과 기록 커밋과 S3의 동일 job production 산출물 재사용 방안 진행을 승인받았다.
S3 변경의 커밋·원격 검증이나 S4 진입은 별도로 확인받는다.
Before/After의 개선 판정은 S5에서 하며 지금 성공을 선고하지 않는다.

## S3 — 병목 한정 최적화

**진입:** S2 수집 완료, D3 사용자 결정.

1. 병렬화·중복 빌드 재사용·concurrency·캐시 중 실제 병목에 맞는 전략만 채택한다.
   채택하지 않은 전략의 이유도 기록한다.
2. 병렬화 시 job별 중복 install과 artifact 업로드·다운로드 비용을 포함한다.
   artifact는 같은 SHA·빌드 설정인지 확인하고 다른 PR의 산출물을 실행하지 않는다.
3. concurrency를 도입하면 workflow와 ref/PR 기준으로 그룹을 분리한다.
   같은 PR의 이전 run만 취소되는지, main·다른 PR 실행이 잘못 취소되지 않는지 검증한다.
4. 같은 검증을 유지하고 로컬 독립 `pnpm check`·`pnpm test:e2e` 계약을 보존한다.
   CI 명령 구성이 달라지면 `docs/rules/15-Husky-품질-게이트.md`의 관련 계약도 동기화한다.
5. 기존 조건부 mutation은 보존한다. E2E skip은 S6 전까지 도입하지 않는다.

**완료:** 동등한 검증 집합의 정상 CI, 선택/비선택 근거, After 후보 SHA.
**커밋 경계:** 검증된 최적화 관심사별 구현 → 결정 기록.

### D3 결정과 로컬 구현 — 2026-09-10

S2 결과는 `02a7629e`로 커밋했다. 사용자가 “그렇게해”로 S2 결과 커밋과
S3의 중복 build 재사용 방안을 승인했다. 이후 로컬 검증 결과를 보고하고,
단일 커밋·push·원격 준비 검증 1회에 대한 추가 승인을 받았다.

| 전략                              | 판단                 | 근거                                                                                       |
| --------------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| 같은 job production 산출물 재사용 | 채택                 | 최대 step인 E2E 구간에서 중복 build를 실제 로그로 확인. artifact 전송 없이 한 줄 변경 가능 |
| job 병렬화                        | 이번 변경에서 미채택 | job별 설치·artifact 전송 비용과 데이터 의존성을 추가 검토해야 함. 우선 확인된 중복만 제거  |
| pnpm 캐시 추가 최적화             | 우선순위 낮음        | install 중앙값 cold 7초·warm 2초로 최대 병목이 아님. 기존 정확한 캐시 측정은 유지          |
| 브라우저 캐시                     | 보류                 | 설치 구간은 두 번째로 크지만 다운로드·OS 의존성 비용을 분리해 검증해야 함                  |
| concurrency                       | 이번 변경에서 미채택 | 중복 push 작업 취소 정책이며 고정된 단일 run의 critical path를 직접 줄이지 않음            |

제품·의존성·테스트·캐시·timeout·권한·trigger·worker 설정은 변경하지 않았다.
실행 가능한 workflow 변경은 아래 한 줄뿐이다.

```diff
       - name: Run production end-to-end tests
-        run: pnpm test:e2e
+        run: pnpm exec playwright test
```

앞의 `Run production build`가 같은 job에서 성공해야 E2E가 실행되며, 기존 fail-fast
순서를 유지한다. Playwright의 webServer는 `pnpm start`다. 다른 job·PR의 artifact를
가져오거나, dev 서버로 바꾸거나, 테스트를 생략하지 않는다.

로컬 `package.json`의 `test:e2e = pnpm build && playwright test`와 `pnpm check`는
수정하지 않는다. 검증 규칙 11·15만 CI의 재사용 경로와 로컬 독립 실행 경로에 맞췄다.
단위·통합 테스트와 E2E 개수도 줄이지 않았다.

YAML 계약 검증은 변경 전 CI 재사용·단일 변경 조건 2개가 실패했고,
로컬 E2E 독립 실행 조건은 통과했다. workflow 수정 후 3개 모두 통과했다.
기존 YAML을 파싱한 결과와 비교해 E2E run 값 외에는 차이가 없음을 확인했다.
actionlint도 통과했다. YAML LSP는 기존 미설치 상태라 actionlint로 보완했다.

S3의 효과 크기는 아직 측정하지 않았다. Before E2E 35초 전체를 절감 가능 시간으로
취급하거나 첫 build의 중앙값 11초가 그대로 절감된다고 주장하지 않는다.
원격에서 한 번의 build와 같은 검증 집합을 확인하고, S5의 After 측정으로 판단한다.

### S3 로컬 검증 결과와 환경 제약

Node `v24.17.0`·pnpm `10.15.1`을 사용했다. 로컬 실행 시간은 S2/S5의 원격
성능 비교에 사용하지 않는다.

| 검증                                    | 관측 결과                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 파싱된 YAML 계약 3개                    | CI 단일 build·같은 job의 선행 build 순서·E2E 무조건 실행, 로컬 독립 script 보존, 다른 workflow 값 불변 모두 통과 |
| actionlint                              | exit 0. YAML LSP 미설치의 대체 정적 검증                                                                         |
| `pnpm check`                            | 63 files / 409 tests, lint·typecheck·production build 모두 통과                                                  |
| 기본 설정 `pnpm exec playwright test`   | 3000번 포트 충돌로 서버 시작 전 실패. 테스트 실패가 아니며 성공으로 세지 않음                                    |
| 격리 포트의 `pnpm exec playwright test` | 기존 production 산출물로 16 passed, 실행 전후 BUILD_ID 동일                                                      |
| 격리 포트의 `pnpm test:e2e`             | 자체 production build 후 16 passed. 새 BUILD_ID 생성 확인                                                        |

처음 3000번 포트를 사용하던 프로세스는 다른 프로젝트의 서버였다.
해당 프로세스에 종료 명령을 보내거나 `reuseExistingServer: true`로 우회하지 않았다.
검증 중 3000번 리스너 PID가 바뀌었지만 포트는 계속 사용 중이어서 기본 포트 재실행은 하지 않았다.

저장소 밖의 임시 설정은 원래 `playwright.config.ts`를 가져와 `baseURL`·server URL을
3100으로, server command를 `pnpm exec next start -p 3100`으로만 조정했다.
테스트 디렉터리는 기존 `e2e`이며, 결과는 임시 경로에 격리했다.
서버 내부 API origin은 `APP_ORIGIN=http://127.0.0.1:3100`으로 맞췄다.
실제 저장소의 Playwright 설정·테스트·package.json·lockfile은 변경하지 않았다.

- 재사용 검증의 BUILD_ID: `iNvyKGfwnt8M3h8sl4jXQ` — 전후 동일.
- 독립 로컬 명령의 새 BUILD_ID: `5-mMEvhikcmYkmmMpKtca`.
- 임시 production 서버는 테스트 종료 후 3100번 포트에서 더 이상 listen하지 않았다.
- 이 증거는 로컬 production 산출물 재사용과 로컬 독립 build 계약을 검증한다.
  GitHub의 기본 3000번 환경 검증이나 After 개선 수치로 대체하지 않는다.

### S3 커밋·원격 준비 검증 — 사용자 승인

승인 요청 당시 S2 결과 커밋 `02a7629e`와 이전 S1 결과 커밋은 아직 push하지 않았고,
S3 변경도 미커밋이었다. 아래 승인 범위에 따라 단일 S3 구현 커밋과 원격 준비 검증을
진행했으며, 실제 결과는 다음 절에 기록한다.

사용자의 “진행해” 응답으로 다음 범위를 승인받았다.

1. S3 변경을 단일 커밋으로 만들고 `origin/volume-10`에 push한다.
2. 같은 commit의 별도 `experiment/week10-s3-candidate` 브랜치로 origin/main 대상
   draft 실험 PR을 만든다. Before PR #13의 head는 변경하지 않는다.
3. 기본 환경에서 원격 준비 검증 **최대 1회**를 실행한다. 실제 build가 한 번이고,
   동일 409 tests·lint·type·E2E 16개가 수행됐는지 확인한다.
4. 이 run은 S3 준비 검증이며 S5의 공식 After 6회로 세지 않는다.
   실패하면 승인 없이 수정 커밋·재실행으로 확대하지 않는다.
5. 결과를 보고하고 멈춘다. 원격 결과 기록 커밋과 S4 진입은 별도 확인받는다.

이번 승인은 위 단일 커밋·push·별도 draft PR·원격 준비 1회에 한정한다.
Before PR #13 변경·cache 삭제·추가 재실행·S4/S5 진입은 승인 범위가 아니다.
원격 검증 결과는 별도로 기록하고, 그 결과 문서의 커밋도 다음 확인 전에는 하지 않는다.

### S3 원격 준비 검증 결과 — 2026-09-10

S3 구현 커밋은 `9301b35861380fe3b03f772a8b7f0de07f076b51`이다.
`origin/volume-10`과 별도 `experiment/week10-s3-candidate`에 같은 commit을
push하고 [origin draft PR #14](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/14)를 만들었다.
로컬에 남아 있던 S1·S2 결과 커밋도 volume-10 push에 함께 반영됐다.
Before PR #13의 head `37233786`과 base `72a49cd1`은 변경하지 않았다.
두 PR 모두 OPEN·draft·미머지 상태다.

| 항목                             | 관측 결과                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 실행                             | [run 34436736719 / attempt 1](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/1) |
| 결과                             | success, 승인된 1회만 실행                                                                                         |
| job 시작~종료 UTC                | 04:19:31~04:21:45                                                                                                  |
| 전체 job wall-clock              | 134초, post/cleanup 포함·큐 대기 제외                                                                              |
| head/base                        | `9301b35861380fe3b03f772a8b7f0de07f076b51` / `72a49cd1ed26a9721f0c9e5eea37996fb20ee824`                            |
| event/실제 checkout/workflow SHA | `888dc0d59f0e5ceb8dd453b986ca49bd016a0c48`                                                                         |
| runner                           | Linux/X64, ubuntu24 / 20260907.300.1, AMD EPYC 7763 / parallelism 4                                                |
| Node/pnpm                        | v24.17.0 / 10.15.1                                                                                                 |
| lockfile SHA256                  | `0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`                                                 |
| 실제 테스트                      | 63 files / 409 tests, production Playwright 16 tests / 2 workers                                                   |
| mutation                         | false, 기존 정책대로 해당 step skipped                                                                             |
| 캐시                             | 새 run_id의 cold miss, 같은 primary key로 save 성공                                                                |

캐시 키는
`week10-s1-pnpm-Linux-X64-node-v24.17.0-pnpm-10.15.1-run-34436736719-0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`다.
matched key와 exact-hit 출력은 비어 있었으며, 실제 로그에 `Cache not found for input keys`와
`Cache saved with key`가 확인됐다. 저장된 cache ID는 `7530572515`, scope는
`refs/pull/14/merge`, 크기는 `212730028 bytes`다. 기존 main cache `7480586644`와
Before PR cache `7528287115`는 보존했다. 이번 S3 작업에서는 캐시를 삭제하지 않았다.

#### 실제 build·검증 범위 확인

- 로그의 `> next build`는 **04:21:04.052Z에 선행 production build에서 한 번만**
  나타났다. E2E step에서 두 번째 build를 실행하지 않았다.
- E2E는 `pnpm exec playwright test`로 production 서버를 시작했고, 기본 CI 설정에서
  `Running 16 tests using 2 workers`와 `16 passed`를 확인했다.
- 409개 테스트·lint·typecheck·선행 production build·production E2E가 모두 성공했다.
  mutation=false에 따른 skip 외에는 필요한 검증을 생략하지 않았다.
- Before workflow와 커밋된 S3 workflow를 비교하면 실행 코드 차이는 E2E의
  `pnpm test:e2e` → `pnpm exec playwright test` 한 줄뿐이다.
  package.json·lockfile·테스트·제품 코드·Playwright 설정은 그대로다.

#### Step별 시간

원천은 attempt 1의 Jobs API이며 단위는 초다. step 사이 간격 때문에 합계가
전체 job wall-clock과 같지 않을 수 있다.

| Step                                   | 시간    |
| -------------------------------------- | ------- |
| Set up job                             | 1       |
| Checkout                               | 1       |
| Detect mutation target changes         | 1       |
| Set up pnpm                            | 6       |
| Set up Node.js                         | 5       |
| Record measurement context             | 0       |
| Restore measurement pnpm store         | 0       |
| Verify exact cache condition           | 0       |
| Install dependencies                   | 8       |
| Install Playwright Chromium when used  | 28      |
| Run tests                              | 18      |
| Run lint                               | 19      |
| Run typecheck                          | 4       |
| Run production build                   | 11      |
| Run mutation tests for changed targets | skipped |
| Run production end-to-end tests        | 24      |
| Save measurement pnpm store            | 5       |
| Post Set up Node.js                    | 0       |
| Post Set up pnpm                       | 0       |
| Post Checkout                          | 1       |
| Complete job                           | 0       |
| 전체 job wall-clock                    | 134     |

이 실행은 **S3 후보 정상 동작 확인용 smoke**다. S5의 공식 After 6회에 포함하지
않으며, 134초나 E2E 24초를 Before 중앙값과 단순 비교해 절감 효과를 확정하지 않는다.
실제 중복 build 제거와 검증 집합 보존은 확인했고, 성능 개선 판단은 동일 방법의
After 반복 측정과 환경 분포 대조 후 S5에서 한다.

**S3의 로컬·원격 준비 검증은 완료**했다. After 후보 head는 `9301b358`,
실제 검증된 merge SHA는 `888dc0d5`다. 사용자의 “진행해” 요청으로 S3 결과 문서
커밋과 S4 실험 준비 진입을 승인받았다. S4의 임시 lockfile·키 변경과 원격 실행·
실험 커밋 범위는 구체안을 확인받은 뒤 실행한다. S5는 별도 승인 없이 진입하지 않는다.

## S4 — 캐시 hit/miss와 원복

**진입:** S3 후보, 승인된 실험 범위.

1. warm 로그에서 실제 복원 key·캐시 종류·install 시간을 캡처한다.
2. 별도 실험 브랜치에서 유효한 lockfile 변경으로 hash/key를 바꿔 miss를 재현한다.
   `--frozen-lockfile`을 끄거나 깨진 lockfile로 install 오류만 만드는 실험은 인정하지 않는다.
3. `Cache not found` 등 실제 미복원과 재설치를 확인하고 hit/miss install 시간을 비교한다.
   partial restore가 발생하면 이를 miss 증거로 오인하지 않고 실험 조건을 교정한다.
4. lockfile·실험 설정을 원본 hash로 복구한다. 실험 branch와 제출 branch의 차이를 확인한다.

**완료:** hit/miss 로그·시간 차이·원복 SHA/hash. 실패 실험은 제출 이력에 병합하지 않음.
**커밋 경계:** 증거 기록만. 실험 코드는 전용 브랜치에 한정.

## S5 — After 6회와 개선 판정

**진입:** 실험 원복, After 후보의 검증 집합이 Before와 동일.

1. A-C1~3, A-W1~3을 S1 프로토콜로 측정한다.
2. cold/warm별 Before/After raw·중앙값·범위를 나란히 비교한다.
3. 감소 폭이 측정 흔들림보다 큰지, 지목한 병목의 감소로 설명되는지 판단한다.
4. 증거가 부족하면 개선을 확정하지 않고 보류하거나 S3으로 돌아간다.
   조건부 skip으로 생긴 시간 감소는 이 최적화 효과로 합산하지 않는다.

**완료:** 과제 1단계 전체 증거와 채택/보류 결론, 최적화 전후 동일 검증 확인.
**커밋 경계:** 비교 결과와 최종 결정.

## S6 — 조건부 실행과 실패 정책

**진입:** S5 비교 종료, D4 결정.

1. lint/type/unit은 모든 PR에서 실행한다. workflow 전체 `paths` 필터로 이 검증을
   건너뛰지 않는다. build는 소스·설정 변경을 반드시 포함하는 정책을 명시한다.
2. E2E 또는 측정된 최고비용 검증 하나 이상에 실행 조건을 정한다.
   관련 UI뿐 아니라 인증·API·공유 코드·의존성·설정·테스트·workflow 변경도 검토한다.
3. 실행 행렬에 docs-only, 관련/무관 소스, 설정/lockfile, draft→ready, label,
   main, merge_group, fork PR을 열거한다. 미사용 수단은 미채택 이유를 적는다.
4. merge queue는 지원·활성화가 확인된 경우에만 사용한다.
   미사용이면 승인된 좁은 skip 범위와 merge 전 검증으로 안전성을 설명한다.
   **main push 후 검증은 이미 들어온 코드를 검사하므로 사전 차단의 대체가 아니다.**
5. required에는 항상 결과를 내는 집계 check를 검토한다. 의도된 skip만 성공이며
   필요한 job의 failure·cancelled·예상 밖 skip은 성공으로 바꾸지 않는다.
6. label 채택 시 추가/제거/재추가 이벤트와 실행 권한을 실제 확인한다.
   flaky 정책은 CI retry 여부·최초 실패 보존·이슈화·해결 기준을 1~2문장으로 정한다.
   프로젝트 규칙상 실패 테스트를 skip/fixme하거나 약화해 초록불을 만들지 않는다.

**완료:** 실행 행렬, 스킵 안전 논리, 집계 결과 테스트, flaky 정책.
**커밋 경계:** 조건 로직과 테스트 → workflow 연결 → 정책 기록.

## S7 — 실제 PR 양쪽과 required 검증

**진입:** S6 구현, 실험 PR 허용 범위 확인.

1. 동일 기준 commit에서 관련 경로 변경 PR과 docs-only 등 비관련 PR을 각각 만든다.
   누적된 `volume-10` diff를 docs-only PR이라고 부르지 않는다.
2. 두 PR에서 저비용 검증은 모두 실행되고 E2E는 행렬대로 실행/skip되는지 확인한다.
3. check 이름·conclusion·PR 머지 가능 상태를 수집한다.
   S11에서 required를 최종 적용한 뒤 같은 계약을 다시 확인한다.
4. 채택한 label/draft/merge queue 경로도 검증한다. 실패한 필수 job이 집계 check를
   실패시키는지 확인한다. 관리자 bypass 결과는 안전성 증거가 아니다.

**완료:** 양쪽 PR·run URL과 실행/skip 로그, required 대기 교착이 없다는 증거.
**커밋 경계:** 실험 결과와 교정된 정책. 테스트용 PR은 머지하지 않음.

## S8 — 번들 측정과 예산 결정

**진입:** S7 완료, 7주차 원시 근거 확보.

1. 7주차 RFC와 artifact에서 주요 진입점별 실제 전송 크기를 찾는다.
   Hero 이미지 bytes를 JavaScript 번들 예산으로 전용하지 않는다.
2. 현재 production 빌드의 동일 진입점을 반복 측정해 범위를 구한다.
   경로·공유/라우트 chunk 중복 제거·단위(bytes/KiB)·raw/gzip/brotli를 명시한다.
3. 7주차 자료와 현재 측정 단위가 다르면 변환/재측정한다. 자료가 없으면 당시 SHA의
   재현 측정을 별도 표시하고, 동등 조건 확보 전까지 예산 결정을 보류한다.
4. `size-limit` 또는 동등 도구가 Next 산출물의 선택한 지표를 실제 측정하는지 확인한다.
   디스크 전체 `.next` 크기를 브라우저 전송량이라고 주장하지 않는다.
5. D5의 대상·도구·임계값·여유폭을 사용자와 확정한다.
   Lighthouse CI 선택 시 7주차 LCP·CLS를 근거로 threshold·변동성·실행 조건을 정한다.
   미채택해도 이유와 질문 답변은 남긴다.

**완료:** 7주차→현재 대응표, 반복 측정 범위, 임계값·여유폭 산식과 사용자 결정.
**커밋 경계:** 측정 근거와 예산 결정. 임의 숫자를 먼저 게이트에 넣지 않음.

## S9 — 번들 게이트 구현

**진입:** D5 확정.

1. 선택한 진입점과 shared chunk를 재현 가능하게 측정하는 설정·스크립트를 작성한다.
   경로를 못 찾거나 측정값이 없으면 0으로 통과시키지 않는다.
2. 정상·경계·초과 fixture를 먼저 실행해 판정·종료 코드·출력 형식을 검증한다.
3. build 산출물 뒤에 게이트를 연결하고 대상, 실측값, 한도, 초과량을 출력한다.
4. 실제 production 산출물로 실행하고 임계값이 근거와 일치하는지 확인한다.

**완료:** `.size-limit.*` 또는 확정된 동등 설정·실행 명령·정상/초과 증거.
**커밋 경계:** 게이트와 직접 테스트 → CI 연결. 신규 명령은 package.json에 만든 후 사용.

## S10 — 빌드 전 환경 변수 검증

**진입:** 실제 변수 소비 코드 확인, D6 확정.

1. 환경별 필수/선택·서버 전용/공개 변수와 URL 허용 기준을 목록화한다.
2. 누락·빈 값·잘못된 URL·민감 변수의 `NEXT_PUBLIC_` 변형에 실패하는 테스트를 만든다.
   Preview가 production API로 연결되는 경우도 정한 환경 정책으로 차단한다.
3. `scripts/validate-env.*` 또는 확정한 위치에 경계 검증을 구현한다.
   이 프로젝트는 Zod를 사용하며 오류는 변수 이름·이유만, 값·토큰은 출력하지 않는다.
4. 로컬과 CI의 **build 전**에 연결하고 실패 시 build가 시작하지 않는지 확인한다.
   fork PR에는 실제 비밀 대신 테스트 전용 값을 사용하고 불필요한 secrets 접근을 없앤다.
5. 각 실패 입력과 정상 입력을 실제 명령으로 실행해 exit code·메시지를 기록한다.

**완료:** env 목록·검증 코드·모든 실패/정상 사례·build 선행 차단 증거.
**커밋 경계:** 환경 계약 → 검증과 테스트 → build/CI 연결.

## S11 — required·결과 가시성·빨간불 PR

**진입:** S9·S10 게이트 정상 실행, D7 사용자 결정.

1. 각 check의 이름·비용·결정성·리스크·required/advisory 이유를 표로 확정한다.
   승인받은 저장소/브랜치에만 protection/ruleset을 적용하고 실제 설정을 확인한다.
2. job summary 또는 PR 코멘트로 예산 대상·실측·한도·초과량, env 실패 변수·이유,
   CI 성공/실패/의도된 skip이 PR에서 보이게 한다. 실패 시에도 리포트가 남아야 한다.
3. 전용 PR에서 실제 번들 예산을 초과시켜 빨간불과 머지 차단을 확인한다.
   잘못된 env 입력의 원격 실패도 확인하되, 이것만으로 번들 초과량 검증을 대신하지 않는다.
4. PR 화면만 보고 원인을 알 수 있는지 직접 확인하고 스크린샷·run URL을 남긴다.
   로그를 열어야만 알 수 있으면 리포트를 수정한다.
5. 같은 PR을 정상 코드로 고쳐 초록불을 확인한 뒤 **머지하지 않고** 종료한다.
6. 최종 required 설정으로 S7의 실행/skip·failure 전파를 다시 확인한다.
   권한/플랜 제한이 있으면 적용 완료라고 쓰지 않고 미충족 항목을 명시한다.

**완료:** required 표·실제 설정, 빨강/초록 PR, PR 가시성 캡처, 원복 확인.
**커밋 경계:** 리포트 구현 → 보호 정책·자가 검증 기록.

## S12 — 팀 규칙 기반 AI 리뷰 계약

**진입:** workflow·게이트 diff가 리뷰 가능한 상태, D8 결정.

1. `AGENTS.md`, `docs/rules/**`, 2~3주차 컴포넌트·5주차 상태·6주차 FSD·7주차
   성능·8~9주차 테스트/인증 결정을 실제 규칙과 파일 경로로 프롬프트에 명시한다.
2. 파생 상태 effect·서버 상태 복제·import 경계·assertion 우회·검증 누락을 확인하게 한다.
   이 저장소는 slice root barrel이 아닌 **실제 파일 import** 정책이므로 일반 FSD 예제를
   그대로 강요하지 않는다. 기존 lint가 막는 항목과 맥락 판단 항목을 구분한다.
3. 리뷰할 base/head SHA, diff, 규칙 출처, 출력 형태(위치·주장·근거·확신도)를 고정한다.
   읽지 않은 코드나 테스트 성공을 만들어내지 않게 한다.
4. 로컬 CLI·구독·무료 경로를 우선 검토한다. AI 리뷰는 비결정적 advisory를 추천하되
   배치 이유는 사용자 판단으로 기록한다. 특정 유료 API를 필수로 만들지 않는다.
5. CI 통합 선택 시 max_turns·timeout·PR/ref별 concurrency·트리거·허용 사용자·비용 상한,
   secrets/fork 경계를 설정한다. 자동 실행과 명시 호출 중 선택 이유를 적는다.

**완료:** 재사용 가능한 팀 리뷰 프롬프트와 로컬/CI·advisory·비용 정책.
**커밋 경계:** 리뷰 기준 문서, 선택 시 CI 연결은 별도 커밋.

## S13 — 실제 AI 리뷰와 판별

**진입:** S12 프롬프트와 실행 경로 준비.

1. 실제 PR diff를 리뷰하고 도구·모델/버전·실행 시각·base/head·프롬프트를 기록한다.
2. 잘 잡은 리뷰 1개와 틀린 리뷰 1개를 원문 위치·실제 코드·재현/반증으로 구분한다.
   오탐이 없으면 다른 실제 diff/이력을 검토하고, 제출 수를 맞추려고 리뷰를 꾸며내지 않는다.
3. 오탐의 원인(누락된 컨텍스트·규칙 오해 등)을 분석하고 프롬프트를 개선한다.
4. 같은 diff에 다시 적용해 변화·남은 한계를 기록한다. 도구 장애는 리뷰 결과로 세지 않는다.

**완료:** 유효 지적 1·오탐 1·판별 근거·프롬프트 전후·재검증.
**커밋 경계:** 실제 지적의 수정은 직접 테스트와 묶고, 리뷰/프롬프트 기록은 별도.

## S14 — 반복 지적을 결정적 게이트로 승격

**진입:** S13와 과거 사람 리뷰 근거, D9 확정.

1. 반복 지적의 실제 사례를 모아 아직 자동화되지 않은 규칙 하나를 선정한다.
   이미 존재하는 금지 규칙을 새 성과로 세거나, 설계 취향을 무조건 금지하지 않는다.
2. import 경계는 ESLint 경계 규칙, AST 패턴은 custom rule/no-restricted-syntax,
   파일 구조는 CI 스크립트 등 판별 대상에 맞는 수단을 선택한다.
3. 위반 fixture가 실패하는 것을 먼저 확인하고 정상·유사 정상·허용 예외를 함께 검증한다.
   오탐은 fixture를 삭제하지 않고 판정 범위를 좁혀 해결한다.
4. 항상 실행되는 결정적 게이트에 연결하고 실제 위반이 차단되는지 확인한다.
5. 기계/AI/사람/작성자의 책임을 아래 표와 한 문단으로 정리한다.

| 주체        | 맡길 책임                                         |
| ----------- | ------------------------------------------------- |
| 기계        | 결정 가능한 lint·type·test·build·예산·env·승격 룰 |
| AI          | 컨벤션·설계 냄새의 비결정적 후보 탐지, 참고 의견  |
| 사람 리뷰어 | 설계 조언과 리스크 식별, 버그 부재 보증은 아님    |
| 작성자      | 정확성·동작·검증·버그의 1차 책임과 최종 판단      |

**완료:** 반복 근거·선정 이유·위반 차단/정상 통과·오탐 교정·책임 판단.
**커밋 경계:** 룰과 fixture → CI 연결 → 판단 근거.

## S15 — 질문 답변과 10주 기술 회고

**진입:** S1~S14의 실제 증거 확보.

1. 아래 네 질문에 **각각 2~4문장**, 사용자가 내린 판단과 근거를 적는다.
   AI가 작성자의 경험이나 의견을 확정한 것처럼 대신 쓰지 않는다.
   - E2E를 모든 PR에 required로 걸 때 비용·flaky·skip 교착을 어떻게 다룰까?
   - Lighthouse 점수 하락을 항상 merge blocker로 삼아야 할까?
   - Preview가 production API를 바라볼 때 어떤 사고가 나며 어떻게 차단할까?
   - AI가 만든 workflow의 권한·트리거·캐시·필터를 무엇으로 검증할까?
2. `docs/rfc/week10-retrospective.md`를 작성한다. 프로젝트 요약, 2~3·6주차 구조 변화,
   주요 결정 2~3개와 근거, 8~10주차 테스트/게이트, 7주차 성능, CI/CD·AI 협업,
   AI와 기계의 역할, 다시 만든다면을 포함한다.
3. 기능 목록 대신 숫자·commit·PR/run·로그·배포 URL로 기술 결정을 설명한다.
   S14의 책임 분담을 10주 전체 결론과 연결한다.
4. Preview/Production URL이 있으면 운영 근거로 연결하고 없으면 한계를 적는다.
   선택 rollback 질문은 DB·캐시·진행 중 요청·flag를 포함해 답하거나 미채택을 명시한다.

**완료:** 필수 질문 4개·회고·확인 가능한 근거·작성자 검토.
**커밋 경계:** 질문/판단 기록 → 회고.

## S16 — 최종 검증과 제출

**진입:** 필수 Stage 완료, 선택 항목의 채택/미채택 명시.

1. 현재 SHA에서 `pnpm check`, `pnpm format:check`, production E2E를 실행한다.
   새 env·번들·룰 게이트도 직접 실행하고 실제 CI 결과와 대조한다.
2. 변경 유형에 맞는 실제 사용자 흐름·PR 화면을 확인한다. 조건부 skip을 도입했어도
   최종 전체 E2E 실행 증거는 별도로 확보한다.
3. 실험 코드·lockfile·임시 환경값·캐시 namespace·실패 PR이 제출 브랜치에 남지 않았는지 확인한다.
   유효한 부정 테스트 fixture는 회귀 자산으로 보존한다. 필요한 측정 자료는 비밀을 제거해 보관한다.
4. 아래 추적표의 모든 필수 행을 artifact/run/PR에 연결한다. 문서의 미결정·미실행을
   실제 결과로 갱신하며, 미충족을 체크박스만으로 완료 처리하지 않는다.
5. upstream 제출 PR에 설계 의도·이번 주 학습·피드백 질문·AI 작성/사람 검토 범위,
   실행/미실행 검증과 남은 위험을 요약한다.

**완료:** 어떤 코드가 어떤 검증을 통과해 보호 브랜치에 들어가는지 증거로 설명 가능.
**커밋 경계:** 검증된 잔여 구현 → 최종 RFC/회고 증거. 실험 실패 커밋은 제출하지 않음.

## 증거 기록 형식과 제출 위치

긴 로그를 본문에 붙이지 않는다. run URL과 필요한 로그 발췌·캡처·작은 raw 표를 연결한다.
로컬 절대 경로나 곧 만료될 artifact만 유일한 근거로 두지 않고 보존 위치·만료도 기록한다.

| 증거        | 필수 필드                                                                           | 기록 위치                                    |
| ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| 실행별 측정 | run/attempt·SHA·환경·cold/warm·cache key/result·시각·step별 초·wall-clock·제외 이유 | 이 RFC의 측정 결과 부록                      |
| 통계        | B-C/B-W/A-C/A-W 각각 raw 3개·중앙값·min~max·차이·판정                               | 측정 결과 부록                               |
| 캐시 실험   | 원본/변경/복원 lock hash·hit/miss 로그·install 시간·PR/SHA                          | 캐시 결과 부록                               |
| 조건 실험   | 변경 경로·event·예상/실제 실행·check conclusion·mergeability·PR/run                 | 조건 결과 부록                               |
| 예산        | 7주차 근거·현재 범위·단위·한도·여유폭·실측/초과량                                   | 예산 결과 부록·선택한 설정                   |
| env         | 변수 이름/분류·정상/누락/URL/노출 사례·exit code·build 차단                         | 환경 계약 부록·검증 코드                     |
| 실패 PR     | 실패/수정 SHA·빨강/초록 run·PR 리포트 캡처·미머지 종료                              | 게이트 결과 부록                             |
| AI 리뷰     | 도구·base/head·프롬프트 전후·유효/오탐 원문과 근거                                  | 리뷰 결과 부록                               |
| 승격 룰     | 반복 사례·기존 규칙과 차이·위반/정상/예외 결과                                      | 룰 결과 부록·ESLint/스크립트                 |
| 회고·답변   | 결정·근거 링크·필수 질문 4개                                                        | 이 RFC의 답변 부록·`week10-retrospective.md` |

부록은 해당 Stage에서 실제 결과가 생길 때 추가한다. 현재 수치·PR·스크린샷은 미기록이다.
예정 파일은 구현 단계에서 생성한다: `.size-limit.*` 또는 동등 설정,
`scripts/validate-env.*` 또는 프로젝트에 맞게 확정한 위치, 필요 시 리뷰 프롬프트 문서.
이름을 확정하면 실행표·package.json 명령·제출 위치를 함께 갱신한다.

## 원문 요구사항 추적표

각 행은 원문의 필수 요구 또는 선택 항목이다. 단계 작성 완료가 과제 완료를 뜻하지 않는다.
최종 증거 칸은 S16 전에 채운다.

| ID  | 원문 요구사항                                                 | 실행 Stage     | 최종 증거        |
| --- | ------------------------------------------------------------- | -------------- | ---------------- |
| R01 | 기존 CI 계승·실제 명령·Node/pnpm·frozen lockfile·job timeout  | S1             | 미실행           |
| R02 | Before cold/warm 각각 3회·raw/중앙값/범위                     | S1~S2          | 미실행           |
| R03 | Actions step 타임스탬프로 최대 병목 지목                      | S2             | 미실행           |
| R04 | 같은 검증 유지·병목에 맞는 전략만·비채택 근거                 | S3             | 미실행           |
| R05 | concurrency main 오취소 방지·병렬 install 비용 확인           | S3             | 미실행           |
| R06 | warm 복원 로그 캡처·key 변경 miss·install 차이·lockfile 원복  | S4             | 미실행           |
| R07 | After cold/warm 각각 3회·동등 조건·흔들림 대비 개선 판정      | S5             | 미실행           |
| R08 | lint/type/unit 모든 PR·build 소스/설정 보호                   | S6~S7          | 미실행           |
| R09 | 비싼 검증 하나 이상 조건부·조건/스킵 이유·main 진입 안전성    | S6             | 미실행           |
| R10 | 필요한 경로 누락 방지·required skip 교착/실패 전파 검증       | S6~S7·S11      | 미실행           |
| R11 | 조건에 걸리는/안 걸리는 실제 PR·Actions 로그·머지 가능 상태   | S7·S11         | 미실행           |
| R12 | 채택한 label 재실행/권한·draft/merge queue 동작               | S6~S7          | 채택 여부 미결정 |
| R13 | flaky 정책·재시도로 실패 숨기지 않음                          | S6             | 미실행           |
| R14 | 주요 진입점 번들 예산·7주차 전송량+현재 범위·여유폭 근거      | S8~S9          | 미실행           |
| R15 | build 전 env 게이트·누락/URL/민감 NEXT_PUBLIC 실패            | S10            | 미실행           |
| R16 | required/excluded 판단·비용/변동성/리스크 근거                | S11            | 미실행           |
| R17 | PR 코멘트/summary 결과 가시성·초과 대상/양 표시               | S9~S11         | 미실행           |
| R18 | 실제 예산 초과 PR 빨강·PR 리포트 캡처·수정 후 초록·미머지     | S11            | 미실행           |
| R19 | 실제 PR diff AI 리뷰·특정 유료 API 강제 없음                  | S12~S13        | 미실행           |
| R20 | 1~9주 합의 규칙을 프로젝트 맞춤 프롬프트로 명문화             | S12            | 미실행           |
| R21 | AI 비결정성·required/advisory 배치 근거                       | S12            | 미실행           |
| R22 | CI AI 선택 시 max_turns·timeout·concurrency·trigger·비용 안전 | S12            | 채택 여부 미결정 |
| R23 | 잘 잡은 리뷰 1개·오탐 1개·근거·프롬프트 개선                  | S13            | 미실행           |
| R24 | AI/사람의 실제 반복 지적 중 결정 가능한 하나 선정             | S14            | 미실행           |
| R25 | 적합한 결정적 룰·위반 차단/정상 통과·오탐 교정                | S14            | 미실행           |
| R26 | AI/사람에 남긴 것·기계로 내린 것 판단 1문단                   | S14~S15        | 미실행           |
| R27 | 지정 경로 10주 회고·기능 아닌 결정·수치/URL/로그/CI 근거      | S15            | 미실행           |
| R28 | 4개 필수 질문 각각 2~4문장·본인 판단                          | S15            | 미실행           |
| R29 | 최소 권한·코멘트 job 권한 한정·SHA 핀 정책                    | S1·S11~S12·S16 | 미실행           |
| R30 | pull_request_target 위험 회피·fork/secrets·로그 노출 방지     | S1·S10~S12·S16 | 미실행           |
| R31 | AI 활용·직접 판단/검증·역할과 책임·작성/검토 범위 기록        | S0~S16         | 미실행           |
| R32 | workflow·측정·조건·예산·env·리뷰·룰·답변·회고 제출물 연결     | S16            | 미실행           |
| R33 | 최종 pnpm check·실험 코드 원복·회귀 검증                      | S16            | 미실행           |
| O01 | 선택 Lighthouse: 7주차 LCP/CLS 근거·조건·변동성 판단          | S8·S11         | 채택 여부 미결정 |
| O02 | Preview/Production URL 확보 권장·배포 자체는 채점 제외        | S0·S15         | 확보 여부 미확인 |
| O03 | 선택 rollback 질문: DB·캐시·트랜잭션·flag                     | S15            | 채택 여부 미결정 |

## 결정 변경 기록

결정이 바뀔 때만 기존 값·새 값·이유·영향받는 Stage를 적는다. 일상 로그는 넣지 않는다.
| 일자 | Stage·결정 | 확정 내용 | 승인 범위 |
| --- | --- | --- | --- |
| 2026-09-09 | S0·D1 | origin 측정·실험과 upstream 제출 분리, 제한 조건 채택 | S0 커밋·S1 진입. S2 이후는 별도 확인 |

S1 원격 smoke 2회는 사용자의 단일 커밋·push·실험 PR 승인 범위에서 수행했다.
공식 Before/After 측정은 아직 하지 않았고, 이후 단계는 별도 확인받는다.

AI가 과제 원문·기존 RFC·설정을 대조해 실행 단계와 추적표 초안을 작성했다.
예산·required·조건부 실행·리뷰 도구·승격 룰의 최종 판단과 각 Stage 진행 확인은
사용자가 맡으며, 실제 실행 증거 없이 완료를 주장하지 않는다.
