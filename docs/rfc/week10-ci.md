# Week 10 CI 파이프라인·AI 협업 실행 RFC

## 문서 역할과 현재 상태

[10주차 과제](../assignments/week-10.md)의 요구사항을 실제 실행·검증·커밋 단위로
재구성한다. 과제 원문이 범위의 기준이며, 이 문서는 실행 순서와 결정·증거의 기준이다.
요약 과정에서 요구사항을 줄이지 않고 마지막 추적표로 원문과 연결한다.

| 항목              | 값                                                              |
| ----------------- | --------------------------------------------------------------- |
| 상태              | S7 실행·skip·required 차단/복구 검증과 정리 완료                |
| 현재 단계         | Stage 7 결과 확인 대기, S8 미진입                               |
| 작성 기준         | `volume-10`, `278c2224`                                         |
| 본 과제 구현·측정 | S7 문서 skip·코드 실행·실패 차단·정상 복구 확인, 임시 보호 제거 |
| 다음 행동         | S7 결과 문서 commit 및 S8 진입 명시적 확인                      |

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

**2026-09-10 자율 진행 변경:** 사용자의 “이제 나한테 묻지 말고 끝까지 진행해줘”
요청으로 남은 S8~S16의 반복 승인 대기를 해제한다. 아래의 이전 단계별 확인 문구는
이전 진행 이력이며, 남은 작업은 측정·검증 근거로 결정하고 검증된 단계별로 커밋한다.
원격 실험은 origin에서 격리·미머지로 수행하고 secrets·유료 지출·upstream 설정은
변경하지 않는다. 실패한 검증을 감추거나 실제 작성자 경험을 만들어내지 않는다.

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

| ID  | 결정할 것                                               | 결정 시점 | 확정에 필요한 근거                                      |
| --- | ------------------------------------------------------- | --------- | ------------------------------------------------------- |
| D1  | 확정: origin 측정·실험, upstream ayden94 최종 제출      | S0        | 아래 D1 확정표의 제한과 단계별 확인 유지                |
| D2  | cold/warm 정의·수집 방식·timeout                        | S1        | 실제 캐시 종류, runner, 명령과 정상 실행 시간           |
| D3  | 확정: 같은 job production 산출물을 E2E에 재사용         | S3        | Before 6회 모두 E2E가 최대 step, 실제 build 중복 확인   |
| D4  | 확정: 허용 문서 전용 PR만 Chromium·E2E skip, 재시도 0회 | S6        | 좁은 허용 목록·unknown 실행·기존 quality 유지           |
| D5  | 번들 측정 대상·단위·도구·임계값·여유폭                  | S8        | 7주차 자료와 현재 반복 측정값                           |
| D6  | 환경별 필수 변수·비밀 이름·허용 origin                  | S10       | 실제 소비 코드, Preview/Production 구분                 |
| D7  | required/advisory check와 리포트 방식                   | S11       | 실행 비용·변동성·리스크, skip/failure 동작              |
| D8  | AI 리뷰 도구·로컬/CI·트리거·비용 상한                   | S12       | 사용할 수 있는 도구와 권한·비용                         |
| D9  | 반복 지적 중 승격할 규칙 하나                           | S14       | 실제 리뷰 이력, 기존 게이트와 차이, 참/거짓 판별 가능성 |
| D10 | Lighthouse CI·배포 근거·rollback 선택 항목              | S0·S8·S15 | 7주차 지표, 실행 환경, 운영 범위                        |

## 실행 단계와 진행표

기본 진행은 S0 → S16 순서다. 자료 읽기는 병행할 수 있지만, 측정 축을 바꾸는
Stage는 앞 단계 증거를 닫기 전에 진행하지 않는다. 전 단계가 끝나기 전 다음 단계의
제품·workflow 변경을 섞지 않는다.

| Stage | 실행 단위                         | 과제 연결 | 핵심 산출물                        | 상태                           |
| ----- | --------------------------------- | --------- | ---------------------------------- | ------------------------------ |
| S0    | 실행 범위·권한·RFC 확정           | 공통      | 결정표·브랜치/PR 역할              | 검증 완료·사용자 승인          |
| S1    | 측정 가능한 Before 준비           | 1         | 고정 프로토콜·baseline SHA         | 검증 완료·결과 승인            |
| S2    | Before cold/warm 수집             | 1         | 6회 raw·중앙값·범위·병목           | 검증 완료·결과 승인            |
| S3    | 병목 한정 최적화                  | 1         | 선택 근거·동등 검증 CI             | 검증 완료·결과 승인            |
| S4    | 캐시 hit/miss 실험                | 1         | 복원/미복원 로그·install 비교·원복 | 검증 완료·결과 승인            |
| S5    | After 측정·비교 판정              | 1         | 6회 raw·Before/After 결론          | 검증 완료·결과 승인            |
| S6    | 조건부 실행·실패 정책 구현        | 2         | 실행 행렬·스킵 안전 논리           | 로컬 검증 완료·결과 승인       |
| S7    | 조건에 걸리는/안 걸리는 PR 검증   | 2         | 양쪽 PR·run·머지 가능 상태         | 검증·정리 완료, 결과 확인 대기 |
| S8    | 번들 측정과 예산 결정             | 3         | 7주차→현재 대응표·임계값           | 초안                           |
| S9    | 번들 예산 게이트 구현             | 3         | 측정 코드·정상/초과 검증           | 초안                           |
| S10   | 빌드 전 환경 변수 게이트          | 3         | 검증 코드·환경별 실패 사례         | 초안                           |
| S11   | required·결과 가시성·실패 PR 검증 | 3         | 보호 규칙·빨강/초록 PR 리포트      | 초안                           |
| S12   | 팀 규칙 기반 AI 리뷰 기준 작성    | 4         | 프롬프트·실행/비용 정책            | 초안                           |
| S13   | 실제 AI 리뷰 판별·프롬프트 개선   | 4         | 유효 지적 1개·오탐 1개·개선 근거   | 초안                           |
| S14   | 반복 지적의 결정적 룰 승격        | 5         | 룰·위반/정상 fixture·책임 표       | 초안                           |
| S15   | 질문 답변·10주 기술 회고          | 6·질문    | 회고·질문 4개 답변                 | 초안                           |
| S16   | 최종 품질·제출물·원복 확인        | 공통      | 최종 SHA·검증·제출 인덱스          | 초안                           |

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

### S4 조사와 대조 실험의 필요성 — 2026-09-10

S3 결과를 `e2ea575f`로 커밋했다. 아직 이 문서 커밋은 push하지 않았다.
Before PR #13과 후보 PR #14의 head/base는 그대로이며, 둘 다 OPEN·draft·미머지다.
main·PR #13·PR #14 캐시 세 항목을 읽기 전용으로 확인했고 삭제·갱신하지 않았다.

현재 production 측정 키에는 **run_id와 lockfile SHA256이 함께 포함**된다.
lockfile 변경 commit을 push하면 새 run_id도 생기므로, 그때의 miss만 보면
lockfile hash에 의한 무효화인지 run_id 변화에 의한 것인지 구분할 수 없다.
S2의 캐시 삭제 실험도 cold 생성 검증이지 lockfile hash 변경 실험의 대체가 아니다.

S4는 별도 PR scope에서 **실험 namespace를 고정하고 key의 lock hash 외 변수는
유지**하는 대조 실험으로 진행하는 안이다. main·Before·After 후보의 workflow는
변경하지 않고, 실험 종료 후 임시 workflow도 원본으로 복구한다.

### Lockfile 변경 후보 — 의존성 그래프 불변

무관한 의존성을 추가·업그레이드하면 설치량과 패키지 구성이 바뀐다. 캐시 키의
해시 무효화만 확인하려면 그 변수를 섞지 않는 편이 낫다.
따라서 실험 브랜치에서만 `pnpm-lock.yaml` 맨 앞에 아래 주석 한 줄을 추가하는 안을 제안한다.

```yaml
# S4 cache-key probe: temporary comment; dependency graph unchanged.
```

- 원본 SHA256: `0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`
- 주석 추가 후보 SHA256: `10ca351f2b025798867739cd25d01a1845995938049c2827a98273a7577bae0c`
- 메모리에서 원본과 후보의 YAML 전체 파싱 결과가 동일함을 확인했다.
  importer·package·snapshot·설정의 의미는 그대로다. 실제 lockfile은 아직 수정하지 않았다.
- 후보 주석을 제거하면 원본 바이트 해시로 복구되는 것도 메모리에서 확인했다.
- 이 실험은 **유효한 lockfile 바이트 변경이 키를 바꾸는지**를 검증한다.
  의존성 버전 변경에 대한 설치 동작을 검증했다고 주장하지 않는다.
- 실제 실행에서는 commit hook 이후 해시·YAML 의미를 다시 확인하고,
  `pnpm install --frozen-lockfile`이 성공해야 한다. 이 옵션을 끄거나 실패를 우회하지 않는다.

### S4 구체 실행안 — 2026-09-10 사용자 승인

기준은 현재 S3 코드가 있는 `e2ea575f`다. 별도 worktree의
`experiment/week10-s4-cache-key`에서 수행하고, origin/main 대상 draft 실험 PR을 만든다.
volume-10과 PR #13/#14의 head는 변경하지 않는다.

실험 workflow는 기존 metadata·검증·cache guard를 유지하고 cache key만
`week10-s4` 전용 고정 namespace+OS/arch+실제 Node/pnpm+lock hash로 만든다.
run_id·run_attempt·commit SHA는 **실험 key에서만 제외**하고 metadata에는 계속 기록한다.
restore-keys는 두지 않는다. 실제 matched key가 primary와 다르면 기존 guard대로 실패한다.

| 순서 | 실험 브랜치 작업                                                           | 예상 원격 동작                                                           | 필수 확인                                                         |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1    | 임시 고정 key workflow commit·push, draft PR 생성                          | 첫 run: 원본 hash key miss → install → save                              | 새 namespace, 정상 `--frozen-lockfile`, full 검증과 save 성공     |
| 2    | commit 없이 같은 run 전체 재실행                                           | 원본 hash key exact hit                                                  | 실제 복원 메시지·matched key·install 시간                         |
| 3    | lockfile에 위 주석만 추가해 commit·push                                    | 새 run: 다른 hash key miss → install → save                              | run_id 외 key 변수는 고정, hash만 달라졌는지·YAML 의미 동일성     |
| 4    | 주석 제거로 원본 lockfile byte hash 복구, commit·push                      | 새 run: 원래 hash key exact hit                                          | 원본 hash 완전 복구, 기존 원본 cache 재사용                       |
| 5    | PR을 머지하지 않고 닫은 뒤 임시 workflow를 원본으로 복구, 정리 commit·push | 활성 PR 없음, branch push는 main이 아니므로 새 CI를 유발하지 않는지 확인 | 최종 실험 tree가 기준 commit과 동일, 원본 workflow·lock hash 복구 |

승인받을 범위는 **원격 실행 최대 4회 + 실험 브랜치에서 commit/push 최대 4회**다.
두 번째 run은 같은 run의 재실행이므로 별도 commit이 없다.
마지막 정리 commit은 PR을 닫은 뒤 수행해 불필요한 다섯 번째 실행을 만들지 않는다.
실행 전에 실제 trigger 계약도 재확인한다.

이는 단계 전환 때만 commit하는 원칙의 **S4 전용 실험 예외**다.
제출 브랜치에는 실험 commit을 merge/cherry-pick하지 않고 결과 문서만 남긴다.
실험 commit 제목은 일반 규칙과 hook을 지키며, 원복에 force-push·reset을 사용하지 않는다.

10분/job 기준 실행 상한은 40 runner-minutes다. 기존 public 표준 runner를 유지하고
유료 runner를 추가하지 않는다. 캐시 삭제는 계획에 없으며, 새로운 PR scope에 원본/변경
hash의 두 cache만 생기는 것을 확인한다. 기존 main·Before·후보 캐시는 보존한다.
실패·예상 밖 키/환경 변화가 있으면 추가 실행으로 채우지 않고 기록·안전 원복 후 멈춘다.

### S4 증거와 완료 판정

- 모든 run/attempt·head/base/checkout·workflow·lock hash·key·runner 환경을 남긴다.
  commit 변경 때문에 checkout SHA가 바뀌는 것은 예상된 변수이며,
  원격 head 간 실질 diff가 임시 workflow/lockfile 주석에 한정됐는지 확인한다.
- 원본 hash의 warm 로그, 변경 hash의 `Cache not found`와 실제 install, 원본 복구 후
  exact hit을 연결한다. cache 삭제로 만든 miss나 run_id만 바뀐 miss를 증거로 쓰지 않는다.
- 원본 warm·변경 miss·복구 warm의 install 시간을 비교하되, image/CPU·네트워크
  변동을 함께 공개한다. 이 소수 표본을 S5 성능 개선 수치로 사용하지 않는다.
- 모든 run에서 기존 409 tests·lint·type·build·E2E 16개를 유지한다.
  시험용 실패를 만들기 위해 제품 기능이나 검증을 고장 내지 않는다.
- 종료 시 lockfile·workflow의 원본 byte hash와 최종 tree 동등성을 확인한다.
  실험 PR은 닫되 머지하지 않는다. 필요 없는 새 배포·secrets·보호 규칙 변경은 하지 않는다.

사용자의 **“진행해”** 응답으로 위 lockfile 주석 방식·임시 key·실험 commit 최대
4회·원격 실행 최대 4회·실험 PR 미머지 종료·원복 범위를 승인받았다.
기존 main·Before·S3 후보의 cache 삭제나 head 변경은 승인 범위에 없다.
S4 결과 보고 후 제출 브랜치의 결과 문서 commit과 S5 진입은 다시 확인받는다.

### S4 실제 실행 결과 — 2026-09-10

기준 commit `e2ea575f`에서 별도 worktree와
`experiment/week10-s4-cache-key`를 만들고 [origin draft PR #15](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/15)에서 실험했다.
승인된 **원격 실행 4회·실험 commit 4회**를 사용했다. PR은 미머지 종료했고,
정리 commit까지 push한 실험 branch의 전체 tree가 시작점과 동일함을 확인했다.
제출 브랜치에 실험 commit을 merge/cherry-pick하지 않았다.

#### Hash와 고정 키

- `H0` 원본: `0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932`
- `H1` 주석 추가: `10ca351f2b025798867739cd25d01a1845995938049c2827a98273a7577bae0c`
- 공통 key prefix:
  `week10-s4-pnpm-Linux-X64-node-v24.17.0-pnpm-10.15.1-probe-lock-hash-v1-`
- `K0 = prefix + H0`, `K1 = prefix + H1`. 실제 원격 key의 prefix는 네 번 모두 같았다.
  run_id·commit이 달라도 key의 달라진 부분은 lockfile hash뿐이었다.

원본/변경 lockfile 전체의 YAML 파싱 결과가 같았고, importer·dependency graph·
snapshot 설정을 변경하지 않았다. 각 commit hook 이후에도 예상 hash와 일치했다.
네 원격 실행 모두 `pnpm install --frozen-lockfile`이 성공했고
`Lockfile is up to date, resolution step is skipped`를 확인했다.
이 실험은 유효한 lockfile 바이트 해시의 무효화 계약을 증명하며, 의존성 버전 변경
동작을 시험한 것으로 표현하지 않는다.

#### 실행·시간·환경

시간은 UTC, job wall-clock은 Jobs API의 시작~종료로 post/cleanup을 포함한다.
install 시간은 같은 API의 `Install dependencies` step이다. 큐 대기는 제외한다.

| 구간 / run attempt                                                                                               | head       | 시작~종료         | cache          | install | job wall-clock |
| ---------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- | -------------- | ------- | -------------- |
| [원본 준비 / 34438098631·1](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34438098631/attempts/1) | `772b4835` | 04:40:40~04:42:52 | K0 miss → save | 7초     | 132초          |
| [원본 warm / 34438098631·2](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34438098631/attempts/2) | `772b4835` | 04:43:44~04:45:48 | K0 exact hit   | 3초     | 124초          |
| [변경 hash / 34438554386·1](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34438554386/attempts/1) | `0cabeb59` | 04:47:44~04:49:47 | K1 miss → save | 7초     | 123초          |
| [원본 복구 / 34438789054·1](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34438789054/attempts/1) | `2f086fc7` | 04:51:27~04:53:28 | K0 exact hit   | 2초     | 121초          |

| 구간           | 실제 event/checkout/workflow SHA           | image build                               | CPU           |
| -------------- | ------------------------------------------ | ----------------------------------------- | ------------- |
| 원본 준비·warm | `3736e3a3ff9d3bf99427c0755606029cadcb980d` | 준비 20260831.293.1 / warm 20260907.300.1 | AMD EPYC 7763 |
| 변경 hash      | `dd9b888fb2e1e9a6fae13ee09bc3da45748ebcd6` | 20260831.293.1                            | AMD EPYC 9V74 |
| 원본 복구      | `cb2cd8c33a2d54c37dd843757f9552b6b8ae6ed2` | 20260831.293.1                            | AMD EPYC 9V74 |

base는 네 번 모두 `72a49cd1ed26a9721f0c9e5eea37996fb20ee824`였다.
Node `v24.17.0`·pnpm `10.15.1`·Linux/X64·ubuntu24·parallelism 4와
Playwright `16 tests / 2 workers`를 유지했다. 네 번 모두 409 tests·lint·typecheck·
production build 1회·E2E 16개가 통과했고 mutation=false는 기존 정책대로 skipped였다.

#### 실제 cache 증거와 설치 시간 해석

- 원본 준비 로그 04:40:54.431Z: `Cache not found for input keys: K0`,
  04:42:50.517Z: `Cache saved with key: K0`.
- 원본 warm 로그 04:44:03.966Z: `Cache restored from key: K0`,
  primary=matched=K0, exact hit=true.
- 변경 hash 로그 04:47:58.577Z: `Cache not found for input keys: K1`,
  04:49:45.195Z: `Cache saved with key: K1`.
- 원본 복구 로그 04:51:45.470Z: `Cache restored from key: K0`,
  primary=matched=K0, exact hit=true. 새 run에서도 원래 key가 복원됐다.

위 `K0`·`K1`은 긴 key의 문서용 별칭이며, 원격 로그에는 위 prefix와 H0/H1을
연결한 전체 key가 출력됐다. 부분 복원은 없었고 warm 실행은 cache save를 건너뛰었다.

원본 warm의 install 3초 → 변경 miss의 7초 → 원본 복구 warm의 2초를 관측했다.
이는 hit/miss에 따른 실제 설치 구간 기록이며, 이미지·CPU·네트워크 변동과 표본 수
한계 때문에 보편적인 절감률로 주장하지 않는다. S4의 네 실행은 S5 공식 After
6회에 포함하지 않는다. 특히 S4의 임시 key 설정도 공식 측정 설정과 다르다.

#### 실험 commit과 완전 원복

| 순서 | commit                                     | 목적                             |
| ---- | ------------------------------------------ | -------------------------------- |
| 1    | `772b48355674394edf009684e7733f7165f39155` | run_id 없는 고정 실험 key 한 줄  |
| 2    | `0cabeb5913fc9d122efeece5913e2b2c9cd8b8b6` | 임시 주석으로 lockfile hash 변경 |
| 3    | `2f086fc7a9c4888e1f59338ff2d3e3399d291e62` | lockfile 원본 바이트 복구        |
| 4    | `b726f004d40676ad0a222e042608a8d9259778c6` | PR 종료 후 임시 workflow 원복    |

모든 commit에서 lint-staged·commitlint를 통과했다. 강제 push·reset·hook 우회는
사용하지 않았다. PR #15가 **closed·merged=false**임을 확인한 뒤 네 번째 commit을
push했다. 현재 workflow의 main-only push와 기본 PR 이벤트 조건에서 추가 실행을
만들지 않았고, Actions 목록도 총 3개 run ID·4개 attempt만 보였다.

- 원복 lockfile SHA256: H0와 완전히 동일.
- 원복 workflow SHA256:
  `b6e66fd30fa1b15aec43f28891c129981582df68d2c903f4e7aa1ff6fc8e520b`.
- 시작 `e2ea575f`와 종료 `b726f004`의 Git tree:
  `64d368ba6ecc856523d12a6ef3ba1304e34846e2`, 로컬·원격 commit API에서 모두 동일.
- 실험 worktree는 clean이며 기준 tree 대비 diff가 없다.
  volume-10은 실험 전 HEAD를 유지하고 결과 RFC만 미커밋 변경으로 남긴다.
- 새 S4 cache는 `refs/pull/15/merge`의 K0(ID `7531031084`, 212715987 bytes)와
  K1(ID `7531177464`, 212706579 bytes) 두 개다. 삭제하지 않고 실험 scope에 남겨뒀다.
- 기존 main cache `7480586644`, Before cache `7528287115`, S3 후보 cache
  `7530572515`는 보존했다. PR #13/#14의 head·base도 변경하지 않았다.

로컬 격리 worktree 준비 중 offline install은 store 누락 패키지 때문에 실패했다.
같은 원본 lockfile과 `--frozen-lockfile`을 유지한 정상 install로 해결했고 lockfile이
변하지 않았음을 확인했다. YAML LSP는 미설치 상태라 actionlint·YAML 의미 비교·
실제 원격 frozen install로 검증했으며 도구 의존성을 추가하지 않았다.

**S4의 hit/miss·install 비교·원본 hash/tree 복구 검증은 완료**했다.
사용자의 “진행해” 요청으로 결과 문서 commit과 S5 측정 준비 진입을 승인받았다.
S5의 후보 전용 cache 삭제·공식 실행 횟수는 구체 범위를 확인받고 수행한다.
S4 실험 commit은 제출 브랜치에 합치지 않으며, S6 이후는 별도 승인 없이 진행하지 않는다.

## S5 — After 6회와 개선 판정

**진입:** 실험 원복, After 후보의 검증 집합이 Before와 동일.

1. A-C1~3, A-W1~3을 S1 프로토콜로 측정한다.
2. cold/warm별 Before/After raw·중앙값·범위를 나란히 비교한다.
3. 감소 폭이 측정 흔들림보다 큰지, 지목한 병목의 감소로 설명되는지 판단한다.
4. 증거가 부족하면 개선을 확정하지 않고 보류하거나 S3으로 돌아간다.
   조건부 skip으로 생긴 시간 감소는 이 최적화 효과로 합산하지 않는다.

**완료:** 과제 1단계 전체 증거와 채택/보류 결론, 최적화 전후 동일 검증 확인.
**커밋 경계:** 비교 결과와 최종 결정.

### S5 준비 확인 — 2026-09-10

S4 결과를 `66f8f2d9`로 커밋했다. 이 결과 커밋은 아직 push하지 않았다.
After 후보는 S3에서 원격 검증한 PR #14의
`9301b35861380fe3b03f772a8b7f0de07f076b51`이며 base는
`72a49cd1ed26a9721f0c9e5eea37996fb20ee824`로 유지된다.
현재 제출 브랜치와 이 후보 사이에 workflow·lockfile·package.json·제품 코드·
테스트·Playwright 설정의 diff는 없다. 새 실험 구현이나 중간 commit이 필요하지 않다.

후보 run `34436736719`는 attempt 1의 S3 smoke 성공 상태다.
후보 cache ID는 `7530572515`, scope는 `refs/pull/14/merge`,
key는 아래와 같다.

```text
week10-s1-pnpm-Linux-X64-node-v24.17.0-pnpm-10.15.1-run-34436736719-0138532944a9c6d465ebde42e3aebdbc51259594cc629a259ae70b72bddde932
```

S4 임시 고정 key는 원복됐으며 S5에 사용하지 않는다.
S1/S3 smoke와 S4 실험 run은 공식 After 표본으로 재분류하지 않는다.

### S5 수집 조건 — 사용자 승인

S2 Before와 동일하게 하나의 run을 재사용하고 cold 직전에 그 PR의 정확한
key/ref cache만 삭제한다. 같은 cold의 save를 다음 warm 준비로 사용하며,
별도 warm-up이나 조건부 skip을 추가하지 않는다.

| 표본 | 예정 attempt | 캐시 처리                                | 기대 결과           |
| ---- | ------------ | ---------------------------------------- | ------------------- |
| A-C1 | 2            | PR #14의 현재 정확한 key/ref ID 1개 삭제 | cold miss·save 성공 |
| A-W1 | 3            | 삭제 없음                                | 같은 key exact hit  |
| A-C2 | 4            | 직전 cold가 저장한 현재 ID 1개 삭제      | cold miss·save 성공 |
| A-W2 | 5            | 삭제 없음                                | 같은 key exact hit  |
| A-C3 | 6            | 현재 ID 1개 삭제                         | cold miss·save 성공 |
| A-W3 | 7            | 삭제 없음                                | 같은 key exact hit  |

- 승인된 범위: **공식 추가 실행 최대 6회·후보 전용 cache 삭제 3회**.
  10분/job 기준 최대 60 runner-minutes이며 큐 대기는 별도다.
- 매 삭제 직전 key 전체 문자열과 `refs/pull/14/merge`가 모두 일치하는 단일
  항목을 조회한다. ID를 고정 반복 사용하지 않는다.
  main·Before PR #13·S4 실험 PR #15의 cache는 삭제하지 않는다.
- 실행 전후 후보 head/base가 동결됐는지 확인한다. 실제 checkout/workflow SHA는
  S3 검증의 `888dc0d59f0e5ceb8dd453b986ca49bd016a0c48`와 일치해야 한다.
- 실제 Node/pnpm·OS/arch·parallelism·worker·lock hash·mutation 조건과
  409 tests·lint·type·E2E 16개를 유지한다. build 2회→1회는 승인된 최적화 차이다.
- 이미지 빌드·CPU는 Before에서 승인한 것처럼 관측 변수로 기록·구분한다.
  차이만으로 표본을 교체하지 않고, Before/After 환경 분포를 함께 공개한다.
- 실패·예상 밖 cache 상태·고정 조건 불일치 시 기록하고 멈춘다.
  추가 run·수정 commit으로 상한을 늘리지 않는다. S6 이후로 자동 진행하지 않는다.

### 사전 비교 판정 기준 — 사용자 승인

Before 원시 값과 통계는 S2 결과를 그대로 사용한다.

| 상태 | Before raw(초) | 중앙값 | min~max   | 범위 폭 |
| ---- | -------------- | ------ | --------- | ------- |
| cold | 136, 145, 148  | 145초  | 136~148초 | 12초    |
| warm | 135, 119, 139  | 135초  | 119~139초 | 20초    |

After도 상태별 raw 3개·중앙값·min~max·범위 폭과 모든 step 시간을 기록한다.
다음 보수적 기준을 결과 확인 전에 사용자 승인으로 고정했다.

1. cold와 warm을 따로 평가한다. 중앙값 감소량은 `Before 중앙값 - After 중앙값`이다.
2. 감소량이 양수이며 **Before와 After 중 더 큰 범위 폭보다 클 때**,
   이번 표본에서 흔들림보다 큰 감소로 분류한다. 이를 통계적 유의성이나 보편적 효과로
   표현하지 않는다. n=3의 한계와 환경 혼합은 별도로 명시한다.
3. 최대 병목이었던 E2E 구간 감소와 실제 중복 build 제거가 로그로 연결되는지 확인한다.
   install 등 무관한 구간의 변동만으로 전체 시간이 줄었다면 해당 최적화 효과로 단정하지 않는다.
4. 환경 구성 차이가 큰 경우 층별 관측도 비교하고 인과적 결론은 제한한다.
   비교 가능한 층의 표본이 부족하면 그 한계를 그대로 쓴다.
5. 조건별로 `감소 근거 있음 / 감소 관측이나 근거 부족 / 감소 없음`을 구분한다.
   일부 조건만 충족하면 전체 CI 개선으로 일반화하지 않는다. 코드의 검증 보존 여부와
   수치상 개선 확정 여부도 구분한다.
6. 근거가 부족하면 보류 결론과 후속 선택지를 보고한다. 추가 실행·최적화 확대·
   S3 재진입은 사용자 확인 없이 하지 않는다.

사용자의 **“진행해”** 응답으로 위 실행 범위·판정 기준을 승인받았다.
run `34436736719`의 attempt 2~7만 공식 After로 수집하고, S3 smoke는 제외한다.
결과에 맞춰 기준을 변경하거나 추가 실행하지 않는다. S5 결과 기록 commit과
그 이후 단계는 다시 명시적 승인을 받는다.

### S5 실제 After 결과 — 2026-09-10

후보 run `34436736719`의 attempt **2~7**을 공식 After로 수집했다.
cold 3개·warm 3개 모두 실행 유효성 검증을 통과했고, 사전에 승인한 판정식을
그대로 적용했다. S3 smoke attempt 1이나 S4의 임시 key 실험은 포함하지 않았다.

- head: `9301b35861380fe3b03f772a8b7f0de07f076b51`
- base: `72a49cd1ed26a9721f0c9e5eea37996fb20ee824`
- event/실제 checkout/workflow SHA: `888dc0d59f0e5ceb8dd453b986ca49bd016a0c48`
- 고정 설정: Linux/X64·ubuntu-latest·parallelism 4·Node `v24.17.0`·pnpm `10.15.1`,
  Playwright `16 tests / 2 workers`, 동일 lock hash·pnpm store·cache key.
- 모든 표본에서 409 tests·lint·typecheck·production build 1회·E2E 16개 성공.
  mutation=false에 따른 skip은 Before와 동일하고 다른 검증은 생략하지 않았다.
- cold는 예상 key의 miss·save, warm은 같은 primary/matched key의 exact hit을 확인했다.
  모든 attempt에서 `> next build`는 선행 build에서 정확히 1회였다.

#### 원시 시간과 관측 환경

시각은 UTC, wall-clock은 job 시작~종료이며 post/cleanup을 포함하고 큐 대기는 제외한다.
image build는 모두 ubuntu24다.

| 표본 / attempt                                                                                  | 시작     | 종료     | wall-clock | image build    | CPU model          |
| ----------------------------------------------------------------------------------------------- | -------- | -------- | ---------- | -------------- | ------------------ |
| [A-C1 / 2](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/2) | 05:09:33 | 05:11:47 | 134초      | 20260907.300.1 | AMD EPYC 7763      |
| [A-W1 / 3](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/3) | 05:12:34 | 05:14:30 | 116초      | 20260907.300.1 | Intel Xeon 6973P-C |
| [A-C2 / 4](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/4) | 05:15:35 | 05:17:47 | 132초      | 20260831.293.1 | AMD EPYC 7763      |
| [A-W2 / 5](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/5) | 05:18:33 | 05:20:41 | 128초      | 20260907.300.1 | AMD EPYC 7763      |
| [A-C3 / 6](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/6) | 05:21:52 | 05:24:04 | 132초      | 20260831.293.1 | AMD EPYC 9V74      |
| [A-W3 / 7](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719/attempts/7) | 05:24:51 | 05:26:47 | 116초      | 20260907.300.1 | AMD EPYC 9V74      |

#### Before/After 비교와 사전 기준 적용

| 조건 | Before raw(초) | After raw(초) | 중앙값 Before→After | 범위 Before / After | 감소량 | 비교할 범위 폭   | 수치 기준          |
| ---- | -------------- | ------------- | ------------------- | ------------------- | ------ | ---------------- | ------------------ |
| cold | 136, 145, 148  | 134, 132, 132 | 145→132초           | 136~148 / 132~134초 | 13초   | max(12, 2)=12초  | **13 > 12 충족**   |
| warm | 135, 119, 139  | 116, 128, 116 | 135→116초           | 119~139 / 116~128초 | 19초   | max(20, 12)=20초 | **19 > 20 미충족** |

각 조건·시점의 n은 3이다. cold의 감소량은 승인한 수치 기준을 넘었지만 경계와
차이가 1초뿐이고 환경도 혼합되어 있다. **통계적 유의성이나 보편적인 인과 효과를
확정한 것으로 표현하지 않는다.** warm은 감소를 관측했으나 사전 기준을 넘지 못했다.
결과를 본 뒤 범위 기준을 낮추거나 추가 표본으로 유리한 값을 찾지 않았다.

#### 환경 분포와 해석 한계

| image build / CPU                          | Before cold | Before warm | After cold | After warm |
| ------------------------------------------ | ----------- | ----------- | ---------- | ---------- |
| 20260831.293.1 / AMD EPYC 7763             | 136         | 139         | 132        | 없음       |
| 20260907.300.1 / AMD EPYC 7763             | 없음        | 135         | 134        | 128        |
| 20260907.300.1 / Intel Xeon Platinum 8573C | 145         | 119         | 없음       | 없음       |
| 20260907.300.1 / AMD EPYC 9V74             | 148         | 없음        | 없음       | 116        |
| 20260907.300.1 / Intel Xeon 6973P-C        | 없음        | 없음        | 없음       | 116        |
| 20260831.293.1 / AMD EPYC 9V74             | 없음        | 없음        | 132        | 없음       |

단위는 초이며 각 표시 값은 n=1이다. 같은 환경·같은 cache 상태의 비교가 가능한
층도 cold 136→132, warm 135→128의 각 1쌍뿐이다.
이는 전체 중앙값 감소 13초·19초와 다르므로 환경 분포의 영향을 배제할 수 없다.
고정 가능한 설정과 검증 집합은 유지했지만, 실제 CPU/image 배정까지 같다고 주장하지 않는다.

#### After step별 원시 시간

단위는 초, 열은 실행 순서다. 원천은 run `34436736719`의 각 attempt Jobs API이며
`skip`은 의도된 미실행이다. step 사이 간격 때문에 step 합계와 job wall-clock은
다를 수 있고, step 중앙값의 합이 전체 중앙값과 같다고 보지도 않는다.

| Step                                   | C1   | W1   | C2   | W2   | C3   | W3   |
| -------------------------------------- | ---- | ---- | ---- | ---- | ---- | ---- |
| Set up job                             | 2    | 2    | 2    | 2    | 1    | 1    |
| Checkout                               | 1    | 1    | 2    | 1    | 2    | 1    |
| Detect mutation target changes         | 1    | 1    | 1    | 1    | 0    | 0    |
| Set up pnpm                            | 3    | 10   | 5    | 4    | 5    | 3    |
| Set up Node.js                         | 5    | 5    | 5    | 5    | 5    | 5    |
| Record measurement context             | 1    | 1    | 1    | 1    | 0    | 0    |
| Restore measurement pnpm store         | 0    | 3    | 0    | 6    | 1    | 4    |
| Verify exact cache condition           | 0    | 0    | 0    | 0    | 0    | 0    |
| Install dependencies                   | 7    | 4    | 6    | 3    | 7    | 2    |
| Install Playwright Chromium when used  | 26   | 28   | 24   | 24   | 30   | 23   |
| Run tests                              | 19   | 12   | 20   | 19   | 18   | 17   |
| Run lint                               | 19   | 12   | 18   | 18   | 17   | 18   |
| Run typecheck                          | 5    | 3    | 5    | 4    | 5    | 4    |
| Run production build                   | 11   | 8    | 11   | 11   | 10   | 11   |
| Run mutation tests for changed targets | skip | skip | skip | skip | skip | skip |
| Run production end-to-end tests        | 24   | 23   | 23   | 24   | 23   | 22   |
| Save measurement pnpm store            | 5    | skip | 5    | skip | 5    | skip |
| Post Set up Node.js                    | 1    | 0    | 0    | 1    | 0    | 1    |
| Post Set up pnpm                       | 0    | 0    | 0    | 0    | 0    | 0    |
| Post Checkout                          | 0    | 1    | 0    | 0    | 0    | 0    |
| Complete job                           | 0    | 0    | 0    | 0    | 0    | 0    |
| 전체 job wall-clock                    | 134  | 116  | 132  | 128  | 132  | 116  |

#### 병목과 변경의 연결

| 구간                  | Before cold / warm 중앙값 | After cold / warm 중앙값 |
| --------------------- | ------------------------- | ------------------------ |
| E2E step              | 35 / 35초                 | 23 / 23초                |
| Chromium 설치         | 26 / 24초                 | 26 / 24초                |
| 선행 production build | 11 / 11초                 | 11 / 11초                |
| 테스트                | 19 / 19초                 | 19 / 17초                |
| lint                  | 18 / 18초                 | 18 / 18초                |

E2E step의 raw 범위는 Before 32~36초, After 22~24초다. 감소는 변경한 구간에서
관측됐고, 원격 로그의 실제 `next build` 횟수도 모든 Before 표본에서 2회,
모든 After 표본에서 1회였다. 선행 build와 production E2E 16개는 모두 성공했다.
따라서 불필요한 build 제거와 검증 집합 보존은 확인됐다.

E2E 중앙값의 12초 감소는 변경 의도와 부합하는 관측이다. 하지만 전체 warm의
19초 감소 전부를 이 한 줄의 효과로 환산하지 않는다. 환경·다른 step 변동과 n=3의
한계를 고려해 전체 CI의 보편적 개선으로 확대하지 않는다.

#### S5 판정과 권고

- **cold:** 사전 수치 기준을 충족한 감소 관측. 환경 혼합 때문에 인과적·통계적
  확정은 하지 않는다.
- **warm:** 중앙값 감소는 관측했지만 사전 흔들림 기준을 넘지 못해 **개선 확정 보류**.
- **구현:** 검증을 줄이지 않고 실제 중복 실행을 제거한 최소 변경은 유지 권고한다.
  이는 코드 유지 판단이며, 모든 환경에서 일정한 절감 효과가 보장된다는 뜻은 아니다.
- **종합:** 전체 cold/warm에 걸친 확정적 성능 개선 주장에는 근거가 부족하다.
  부분 결과와 한계를 그대로 제출하고, 추가 실행·최적화 확대는 사용자 판단에 맡긴다.
  이번 승인 범위에서 다시 S3로 돌아가거나 표본을 추가하지 않았다.

#### 한도·상태·검증

- 공식 After 요청은 `[2, 3, 4, 5, 6, 7]` 정확히 6회이며 모두 success다.
  job wall-clock 합계는 758초이며 큐 대기·준비 run·대화 대기는 제외했다.
- 삭제 ID는 `7530572515`(2 직전), `7531656601`(4 직전),
  `7531796611`(6 직전)이다. 모두 정확한 key와 `refs/pull/14/merge`를 대조해 삭제했다.
- 마지막 후보 cache ID `7531941201`(212708836 bytes)은 남겨뒀다.
  main `7480586644`, Before `7528287115`, S4 `7531031084`·`7531177464`는 보존했다.
- 후보 PR #14는 OPEN·draft·미머지이며 head/base는 유지됐다. run은 attempt 7 success다.
- 원격 metadata·테스트 결과·build 횟수·cache 상태를 전 표본에서 검증했다.
  수치 계산은 원시 Jobs API와 대조했다. 독립 해석 검토 호출은 인증 토큰 만료로
  실행되지 않아 독립 리뷰 통과를 주장하지 않는다.
- 제품·workflow 변경, 추가 실행·커밋·push·S6 진입은 하지 않았다.

**S5 수집·비교 판정은 완료**했다. 사용자의 “커밋하고 넘어가자” 요청으로 결과
문서 commit과 S6 진입을 승인받았다. 중복 build 제거 변경은 유지하고,
warm 전체 시간의 개선 확정은 보류한다는 판정도 그대로 기록한다.
S6의 D4 정책은 검토 후 확인받고, S7로 자동 진행하지 않는다.

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

### S6 준비 조사 — 2026-09-10

S5 결과를 `e8dbefa9`로 커밋했다. 아직 이 결과 문서는 push하지 않았다.
기존 workflow는 main push와 PR에서 단일 `quality` job을 실행한다.
test·lint·typecheck·build가 직렬 실행되고 mutation만 기존 세 파일 변경 시 실행한다.
Chromium 설치와 production E2E는 현재 모든 PR에서 실행된다.

origin/main의 보호 설정 조회는 `Branch not protected`, 적용 rules는 빈 목록,
mergeQueue는 null이었다. 따라서 지금 required 차단이 작동한다고 주장하지 않는다.
S6는 안전한 실행 계약을 만들고, 실제 PR 양쪽 검증은 S7, 최종 required 적용은 S11에서 한다.
S6에서 branch protection·merge queue·workflow trigger를 자동 변경하지 않는다.

### D4 확정 — 허용 문서만 변경된 PR의 E2E 생략

우선 **좁은 skip 허용 목록**을 택한다. 실행 대상 경로를 열거하다 새 코드·설정을
빠뜨리는 방식보다 알 수 없는 경로는 실행하는 편이 안전하다.

허용 목록은 정확히 다음 세 종류다.

- 루트의 `README.md`
- `docs/rfc/*.md` — 해당 디렉터리 바로 아래 Markdown 파일
- `docs/assignments/*.md` — 해당 디렉터리 바로 아래 Markdown 파일

현재 `src`·`e2e`·`tests`·`scripts`·workflow·package/Next/검증 설정에서 이 경로들을
실행 입력으로 참조하는 문자열은 찾지 못했다. 이는 모든 간접 사용을 증명하는 것은
아니므로, 이후 해당 문서를 실행 입력으로 쓰게 되면 허용 목록도 함께 수정해야 한다.
`docs/**` 전체나 모든 `*.md`를 허용하지 않는다.

**PR이며 변경 경로가 1개 이상이고, 모든 변경 경로가 허용 목록에 속한다는 사실을
정상적으로 확인했을 때만** Chromium 설치와 E2E를 함께 생략하는 안이다.
test·lint·typecheck·production build와 기존 mutation 정책은 유지한다.
실행 분류 오류나 불명확한 결과를 “문서 전용”으로 간주하지 않는다.

### 실행 행렬

| 상황                                                                     | test/lint/type/build | Chromium·E2E                        | 이유                                         |
| ------------------------------------------------------------------------ | -------------------- | ----------------------------------- | -------------------------------------------- |
| 허용 목록 Markdown만 바뀐 PR                                             | 실행                 | skip                                | 실행 코드·구성·의존성·테스트 변경 없음       |
| 허용 문서 + 코드/설정이 섞인 PR                                          | 실행                 | 실행                                | 한 경로라도 실행 영향 가능성이 있으면 검증   |
| `src/**`의 모든 변경                                                     | 실행                 | 실행                                | 특정 UI만 영향 있다고 가정하지 않음          |
| `e2e/**`, `tests/**`, script, package/lockfile, Next/TS/Playwright 설정  | 실행                 | 실행                                | 검증·빌드·런타임 동작에 영향                 |
| `.github/**`, `.husky/**`, 환경 파일, public/이미지/asset, 새 경로       | 실행                 | 실행                                | 알려지지 않은 영향은 skip하지 않음           |
| `docs/rules/**`, `docs/fixtures/**`, 문서 아래 비-Markdown·하위 디렉터리 | 실행                 | 실행                                | 규칙/fixture/asset을 순수 RFC 텍스트와 구별  |
| 코드/설정 → 허용 문서 경로 rename                                        | 실행                 | 실행                                | 이전 경로의 삭제도 실행 영향으로 취급        |
| 허용 문서 경로끼리 rename/삭제                                           | 실행                 | skip 가능                           | 이전/새 경로가 모두 허용 목록이면 문서 전용  |
| 파일 목록 비어 있음·결과 누락/불명확                                     | 실행                 | 기본 실행 또는 분류 오류로 job 실패 | 실패를 성공 skip으로 바꾸지 않음             |
| draft PR·ready PR·fork PR                                                | 같은 파일 기준       | 같은 파일 기준                      | draft/출처만으로 E2E를 자동 생략하지 않음    |
| main push                                                                | 실행                 | 항상 실행                           | 변경 분류와 무관하게 통합된 상태 검증        |
| label                                                                    | 채택하지 않음        | 파일 정책 유지                      | 새 이벤트·권한·재실행 복잡성 도입하지 않음   |
| merge_group                                                              | 현재 미사용          | 미채택                              | queue 미활성. 지원·운영이 확정되면 별도 설계 |

main push 검증은 merge **후**의 확인이다. PR 단계의 필요한 검증을 대신한다고
설명하지 않는다. 이 안은 코드·구성 변경 PR에서 E2E를 생략하지 않는 좁은 정책이다.

### 분류와 check 결과 안전성

- 현재 고정된 paths-filter는 GitHub API의 rename을 새 경로 added + 이전
  `previous_filename` deleted로 펼친다. 이전 경로까지 포함해 분류해야 한다.
  dotfile도 검사한다.
- 검토한 고정 소스:
  [main.ts](https://github.com/dorny/paths-filter/blob/0e4a8c6effa4802afeda77dc8d303f8176d7dfad/src/main.ts),
  [filter.ts](https://github.com/dorny/paths-filter/blob/0e4a8c6effa4802afeda77dc8d303f8176d7dfad/src/filter.ts).
- 최소 구현 후보는 기존 filter에 전체 변경·허용 문서 집계를 더하고,
  정상 숫자 집계에서 `전체 > 0 && 문서 == 전체`일 때만 docs-only를 만드는 방식이다.
  filter의 기본 OR 의미를 바꾸지 않는다. 전역 `predicate-quantifier: every`로
  바꿔 기존 세 mutation 경로가 동시에 일치해야만 실행되게 만드는 회귀를 피한다.
- API 조회 실패·파싱 오류는 `quality` 실패다. 정상 분류라도 출력이 없거나
  명시적인 docs-only=true가 아니면 E2E를 실행하는 방향으로 보수적으로 처리한다.
- workflow 전체나 job에 paths 조건을 붙이지 않는다. 기존 `quality` job을 항상
  실행하고 두 E2E 관련 step만 같은 조건으로 제어한다.
- 따라서 새 집계 job은 만들지 않는다. 기존 job이 aggregate 결과 역할을 하며,
  test/lint/type/build/분류 실패는 실패, 취소는 취소로 남는다.
  의도된 두 step skip만으로 job이 실패할 필요는 없지만 실패를 `continue-on-error`로
  숨기지 않는다. cache save도 기존 정상 완료 조건을 유지한다.
- 최종 required 이름은 S11에서 `quality`를 후보로 검토한다. S6의 구현만으로
  보호 규칙이 적용됐거나 모든 skip 조합의 실제 mergeability가 검증됐다고 쓰지 않는다.

### Flaky 정책

현재 기본값인 **Playwright retries=0**을 유지한다. 최초 실패와 trace를 보존하고
환경 문제/제품 결함을 구분해 이슈화하며, 승인 없는 재실행·skip·fixme·단언 약화로
초록불을 만들지 않는다.

### S6 구현 검증 범위와 다음 체크포인트

승인 후 분류 로직과 실제 workflow 연결을 아래 경계에서 검증한다.

1. 허용 문서 전용·혼합 변경·dotfile·알 수 없는 경로·빈 목록·출력 오류의 판정.
2. rename의 이전/새 경로, 삭제를 포함한 실제 pinned filter 계약과 연결.
3. mutation OR 계약 보존, main 강제 실행, draft/fork 동일 정책.
4. Chromium 설치와 E2E가 같은 조건으로 실행/skip되고, 저비용 검사와 build는
   항상 남는지. 분류/필수 검증 실패가 정상 결과로 바뀌지 않는지.
5. 고정 Node에서 관련 테스트·lint/type/build·production E2E와 actionlint 검증.
   동작 코드가 바뀌지 않아도 실행 연결 계약을 실패 사례로 먼저 확인한다.

S7의 docs-only 실험 PR은 **base에도 S6 workflow가 있어야** 한다.
S6 workflow 변경 자체가 PR diff에 있으면 그 PR은 문서 전용이 아니다.
S7에서 그 기준 branch를 어떻게 준비할지 먼저 확인받고, 정책을 입증하려고
`.github/**`를 허용 목록에 넣거나 실제 변경을 감추지 않는다.

별도 정책 검토 agent는 인증 오류로 실행되지 않았다. 위 고정 소스를 직접 읽고
rename·dotfile·filter 결합 계약을 확인했으며 독립 검토 통과를 주장하지 않는다.

사용자의 **“진행해”** 응답으로 D4 정책의 구현·로컬 검증을 승인받았다.
보호 설정·PR·원격 실행은 변경하지 않았다.
S6 변경 커밋·원격 검증·S7 진입은 별도 체크포인트에서 확인받는다.

### S6 로컬 구현

- 기존 `changes` filter에 `all: '**'`과 허용 문서 세 패턴의 `docs` 집계를 추가했다.
  mutation 필터·기본 OR 의미·고정 액션 SHA·최소 권한을 유지했다.
- `scripts/ci/classify-docs-only.mjs`는 Node 설정 뒤 실행된다. `CHANGED_COUNT`와
  `DOCS_COUNT`를 action output에서 env로 받아 검증하고 `GITHUB_OUTPUT`에
  `docs_only=true/false`를 쓴다. shell에서 파일명을 실행하거나 출력 전체를 eval하지 않는다.
- `GITHUB_EVENT_NAME`이 PR이며 전체 집계가 1개 이상이고 문서 수와 같을 때만
  docs-only가 될 수 있다. 누락·음수·소수·지수/공백 표기·안전 정수 범위 초과·
  문서 수가 전체보다 큼 등은 exit 1이며 skip 출력을 남기지 않는다.
- Chromium 설치와 production E2E 두 step에 같은 조건을 연결했다:
  `github.event_name != 'pull_request' || steps.e2e-policy.outputs.docs_only != 'true'`.
  main은 항상 실행하고, 출력 누락을 true로 간주하지 않는다.
- job 자체와 test·lint·typecheck·build에는 조건을 추가하지 않았다.
  분류기나 선행 검증 실패는 기존 fail-fast 경로로 `quality`를 실패시킨다.
- `scripts/ci/classify-docs-only.test.ts`는 실제 CLI를 child process로 실행하고 종료
  코드·실제 output 파일을 검증한다. Vitest node 프로젝트에 이 경로를 추가해
  `pnpm test`와 CI에서 항상 실행한다. 새 package나 lockfile 변경은 없다.
- 검증 규칙 11·15를 실제 실행 정책에 맞췄다. Playwright 설정·제품 코드는 바꾸지 않았다.

#### 파일 API 상한에 대한 보수적 처리

[GitHub PR 파일 API](https://docs.github.com/en/rest/pulls/pulls#list-pull-requests-files)는
pagination을 사용해도 최대 3000개 파일을 반환한다. 첫 3000개가 문서이고 이후에
코드가 있으면 단순 집계 동등 비교가 안전하지 않다.

따라서 **전체 filter 집계가 3000 이상이면 E2E를 실행**한다.
rename은 이전/새 경로로 확장돼 집계가 증가할 수 있으므로, 완전한 목록이어도
보수적으로 실행하는 경우는 있지만 잘렸을 수 있는 목록을 docs-only로 판정하지 않는다.
2999·3000·3001 경계 테스트에서 수정 전 두 실패를 확인한 뒤 차단 조건을 추가했다.
이는 승인한 “불명확하면 실행” 정책을 구현하는 보호 조건이지 skip 범위를 넓히는 변경이 아니다.

#### 로컬 검증 범위와 아직 남은 것

- CLI 테스트는 문서 전용·혼합·빈 목록·main/기타 이벤트·잘못된 집계·API 상한을 다룬다.
  단순 helper mock이 아니라 Node 프로세스와 `GITHUB_OUTPUT`의 실제 결과를 검사한다.
- YAML 파싱 계약은 정확한 허용 목록·mutation OR 보존·새 CLI 연결·두 step의 동일
  조건·나머지 workflow 불변을 확인했다. 변경 전 실패, 구현 후 통과했다.
- 별도 로컬 driver는 실제 YAML에서 추출한 패턴을 picomatch 2.3.2(dot=true)로
  실행하고 CLI에 집계를 전달해 문서·혼합·규칙·fixture·nested·dotfile·알 수 없는
  경로·이전/새 rename·삭제·빈 목록 16개를 통과했다. 이 matcher는 고정 액션의
  `^2.3.1` 범위와 호환되지만, 원격 action 자체를 실행한 증거로 대신하지 않는다.
- pinned action의 rename 확장과 API 처리 소스는 직접 확인했다.
  실제 GitHub 실행/skip 로그와 PR mergeability는 S7에서 검증해야 한다.
- YAML LSP는 기존 미설치 상태이며 actionlint로 대체한다. 임시 driver는 저장소 밖에
  두었고 실제 CLI 회귀 테스트는 저장소에 남겨 이후 `pnpm test`에서도 보호한다.

### S6 최종 로컬 검증과 체크포인트

| 검증                      | 관측 결과                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI 회귀 RED→GREEN        | 초기 항상 false 구현에서 문서 전용·잘못된 입력 17개 실패 확인 → 구현 후 통과. API 상한 보호 전 3000/3001 두 실패 추가 확인 → 최종 25개 통과 |
| YAML 연결 계약            | 변경 전 허용 목록·CLI 배선·조건 연결 실패 → 구현 후 2개 계약 통과                                                                           |
| 경로→집계→실제 CLI driver | 문서·혼합·규칙·fixture·nested·dotfile·rename·삭제·빈 목록 16개 통과                                                                         |
| CLI 실사용                | 정상 출력·잘못된 입력 exit 1·`--help` 실행 확인                                                                                             |
| actionlint                | 변경된 workflow 검사 exit 0                                                                                                                 |
| `pnpm check`              | Node v24.17.0 / pnpm 10.15.1에서 64 files / **434 tests**, lint·typecheck·production build 통과                                             |
| production E2E            | 기존 production 산출물로 **16 passed**, 전후 BUILD_ID 동일                                                                                  |

기존 409개 제품 테스트는 유지했고 CI 분류 회귀 25개를 추가했다.
새로운 package 의존성·lockfile 변경은 없다. TypeScript LSP의 fresh diagnostics는
timeout이 발생했으며 실제 `pnpm typecheck` 성공을 타입 검증 근거로 사용했다.

3000번 포트는 다른 서버가 사용 중이라 종료하거나 재사용하지 않았다.
S3에서 사용한 저장소 밖 임시 Playwright 설정으로 3100번 production 서버를 띄웠고,
`APP_ORIGIN=http://127.0.0.1:3100`만 검증 프로세스에 지정했다.
저장소의 `playwright.config.ts`·`package.json`·제품 코드·E2E 파일은 변경하지 않았다.
검증 전후 BUILD_ID는 `k2F8ni3mM-SaN2HFSAIg8`로 같았고 종료 후 3100번 리스너는 없었다.

실제 GitHub API·Actions 표현식·PR diff 기준의 실행/skip과 mergeability는 로컬
driver로 대체할 수 없다. 이 부분은 S7에서 두 실제 PR로 확인한다.
S6 변경은 아직 미커밋이며 push·PR 생성·보호 규칙 변경·원격 실행은 하지 않았다.

**S6의 승인된 정책 구현과 로컬 검증은 완료**했다. 사용자의 “그렇게 해” 응답으로
S6 변경의 단일 커밋과 S7 실험 준비 진입을 승인받았다.
S7의 실험 base·PR·원격 실행·보호 설정 범위는 구체 계획을 확인받고 수행한다.
S8로 자동 진행하지 않는다.

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

### S7 준비 확인 — 2026-09-10

준비 조사 당시 S6을 `f0dce100`으로 단일 커밋했고 아직 push 전이었다.
origin에 admin 권한이 있고 repository ruleset 목록은 비어 있었다.
main의 classic protection은 `Branch not protected`였다.
제안한 `experiment/week10-s7-base`, `experiment/week10-s7-docs`,
`experiment/week10-s7-code` 이름은 원격에 없었다.

S6 workflow가 없는 origin/main으로 새 문서 PR을 만들면, S6 도입 diff까지 포함돼
문서 전용 PR이 아니다. main을 먼저 변경하거나 `.github/**`를 skip 허용 목록으로
넓히는 대신 **동일 S6 commit의 격리 base**를 만드는 안을 제안한다.
이는 기존 origin/main 대상 실험 규칙의 S7 한정 예외로, 아래 구체 범위의 사용자 승인을 받았다.

### S7 원격 실험안 — 2026-09-10 사용자 승인

| 브랜치                    | 역할·기준                                              |
| ------------------------- | ------------------------------------------------------ |
| volume-10                 | S6 commit을 push하되 이 브랜치로 실험 PR을 만들지 않음 |
| experiment/week10-s7-base | S6 commit `f0dce100`을 그대로 가리키는 고정 base       |
| experiment/week10-s7-docs | 동일 base에서 허용 경로의 문서 fixture만 추가          |
| experiment/week10-s7-code | 동일 base에서 실행되는 CI 테스트 fixture만 추가        |

실험 head 두 개는 격리 worktree에서 준비한다. 문서 fixture는
`docs/rfc/week10-s7-probe.md`, 코드 fixture는 `scripts/ci/quality-gate-probe.test.ts`를
후보로 사용한다. 코드 fixture는 실제 Vitest가 실행하는 합성 게이트 검사이며,
기존 제품 테스트를 고치거나 약화하지 않는다. 이 파일은 실험 브랜치에만 두고
제출 브랜치로 merge/cherry-pick하지 않는다.

새 base에만 임시 classic protection을 적용하는 안이다.

- required status check는 기존 **`quality`** 하나, strict up-to-date 확인을 사용한다.
- 관리자에게도 check를 적용해 admin bypass로 안전성을 증명하지 않는다.
- PR 승인 review·새 권한·merge queue는 추가하지 않는다.
- 실제 GitHub Actions check의 이름/앱과 상태가 이 규칙에 연결되는지 읽어서 확인한다.
- origin/main·upstream의 보호 정책은 변경하지 않는다. S11의 최종 required 결정과
  구분되는 **격리 브랜치 실험용 설정**이다.
- API 권한·플랜 때문에 적용하지 못하면 우회하지 않고 중단한다.

### 실행 행렬과 관측 증거

| 실행 | PR·변경                                                 | 예상 Actions 결과                                                        | 확인할 PR 상태                             |
| ---- | ------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| 1    | docs PR: 허용 문서 fixture만 추가                       | 분류 true, test/lint/type/build 성공, Chromium·E2E skip, quality success | required가 pending에 남지 않음             |
| 2    | code PR: 정상 합성 테스트 fixture 추가                  | 분류 false, 전체 검증·Chromium·E2E 실행 성공                             | quality 충족으로 check에 의한 차단 없음    |
| 3    | 같은 code PR: 합성 fixture만 결정적으로 실패하도록 변경 | test 실패 → quality failure. 뒤 step 미실행을 의도된 docs skip과 구별    | required check 실패로 merge 차단           |
| 4    | 같은 code PR: fixture를 최초 정상 상태로 복구           | 같은 검증 다시 성공, 임의 retry·continue-on-error 없음                   | 실패 차단 해제, required pending 교착 없음 |

실험 PR은 처음부터 ready로 만들어 draft 제한과 required check의 영향을 구분한다.
D4 정책은 draft 여부로 실행을 생략하지 않으며, 별도 label/draft 전환/merge queue를
새로 도입하지 않는다. **어느 PR도 실제로 merge하지 않는다.**

원격 관측은 다음을 함께 기록한다.

- base/head/실제 checkout·workflow SHA, changed-file 목록과 all/docs 집계,
  `docs_only` 출력, 각 step의 success/failure/skipped.
- run URL·attempt·check 이름/앱·conclusion, required 설정 조회 결과.
- GitHub PR의 conflict 여부와 merge state를 구분한다.
  `mergeable`만 보고 check 차단이 없다고 판단하지 않고 status-check rollup과
  merge state도 함께 본다. GitHub가 상태를 계산 중이면 그 완료 신호를 기다린다.
- 실패 run은 지우지 않는다. 복구는 합성 fixture를 원래 정상 내용으로 되돌리는 것이며,
  실제 제품 테스트를 삭제·skip하거나 실패 단언을 완화하는 작업이 아니다.

### 승인된 횟수·정리 범위

사용자 승인 범위는 다음으로 한정한다.

1. S6 `volume-10` push와 세 실험 브랜치 게시.
2. **격리 base 대상 PR 2개** 생성, 실험 브랜치 commit/push **최대 4회**
   (문서 1회·코드 정상 1회·고의 실패 1회·복구 1회).
3. 기본 10분/job timeout을 유지한 **원격 run 최대 4회**.
   실패 run도 이 한도에 포함하며 예상 밖 실패를 추가 실행으로 채우지 않는다.
4. 새 실험 base에만 위 임시 required 규칙 설정·조회.
5. 증거 수집 후 두 PR을 **미머지 종료**하고, 이번에 생성한 base의 임시 보호 규칙만 제거.
   원래 없던 규칙임을 적용 전 확인하고 삭제 전에도 대상과 소유 범위를 확인한다.

source/workflow는 S6 상태를 유지하고 고의 실패는 전용 fixture에만 한정한다.
Before·After·S4 PR의 head, main/upstream 정책, 기존 캐시와 secrets는 건드리지 않는다.
실험 종료 후 정상 fixture 복구·추가 CI 없음·새 보호 규칙 제거를 확인한다.
남는 실험 브랜치는 증거용으로 보존하고 원격 브랜치를 임의 삭제하지 않는다.

이 실험은 S6 분류와 required 계약의 검증이며 성능 측정이 아니다.
이후 S11에서 실제 대상 브랜치의 최종 protection을 적용하면 그 설정으로 다시 검증한다.

사용자의 **“그렇게 해”** 응답으로 S6 push·격리 브랜치 3개·PR 2개·원격 실행
최대 4회·실험 commit 최대 4회·실험 base에만 임시 required 적용과 제거를 승인받았다.
required는 실제 GitHub Actions 앱 ID `15368`의 `quality`로 확인했다.
기존 main/upstream·다른 실험 PR·캐시는 변경하지 않는다.
S7 결과 commit과 S8 진입은 다시 명시적 확인을 받는다.

### S7 실제 원격 결과 — 2026-09-10

기준은 S6 commit `f0dce100e900917969d551afeae656f14c9c3363`이다.
이를 `origin/volume-10`과 고정 실험 base `experiment/week10-s7-base`에 게시하고,
같은 base에서 독립된 문서/코드 head를 만들었다. workflow·lockfile은 변경하지 않았다.

임시 classic protection은 **실험 base에만** 적용했다.
`quality`를 GitHub Actions 앱 ID `15368`에 묶어 required로 지정하고
`strict=true`, `enforce_admins.enabled=true`를 확인했다.
별도 승인 review·merge queue는 추가하지 않았고 두 PR은 처음부터 ready로 만들었다.
따라서 아래 상태는 draft 제한이나 admin bypass로 얻은 결과가 아니다.

#### 실행·skip·차단·복구

| 사례      | PR / run                                                                                                                                                    | 전체/문서 집계 | 분류            | 주요 결과                                                 | 보호 적용 중 PR 상태               | job 시간 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------- | --------------------------------------------------------- | ---------------------------------- | -------- |
| 문서 전용 | [PR #16](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/16) / [34447106282](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34447106282) | 1 / 1          | docs_only=true  | 434 tests·lint·type·build 성공, Chromium·E2E만 skip       | MERGEABLE / CLEAN, quality success | 84초     |
| 코드 정상 | [PR #17](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/17) / [34447480314](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34447480314) | 1 / 0          | docs_only=false | 합성 fixture 포함 435 tests·lint·type·build·E2E 16개 성공 | MERGEABLE / CLEAN, quality success | 131초    |
| 고의 실패 | 같은 PR / [34447885114](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34447885114)                                                           | 1 / 0          | docs_only=false | 합성 1개 실패·기존 434개 통과, quality failure            | MERGEABLE / BLOCKED                | 86초     |
| 정상 복구 | 같은 PR / [34448226857](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34448226857)                                                           | 1 / 0          | docs_only=false | 435 tests·lint·type·build·E2E 16개 다시 성공              | MERGEABLE / CLEAN, quality success | 124초    |

네 run은 모두 attempt 1이다. job 시작~종료 UTC는 차례대로
06:51:19~06:52:43, 06:56:06~06:58:17, 07:01:21~07:02:47,
07:05:21~07:07:25다. 시간은 post/cleanup을 포함한 기록이며 성능 비교 표본은 아니다.
S5의 Before/After에 합산하지 않는다.

문서 PR의 API 변경 목록은 `docs/rfc/week10-s7-probe.md` 한 개,
코드 PR은 `scripts/ci/quality-gate-probe.test.ts` 한 개였다.
분류 step의 실제 `CHANGED_COUNT`·`DOCS_COUNT`와 CLI 출력을 로그에서 대조했다.
누적된 제출 브랜치 변경을 문서-only로 오인하지 않았고, source/workflow diff를 숨기지 않았다.

#### 실패 차단이 의도된 skip과 다른 이유

| Step/결과       | 문서 PR      | 코드 정상     | 코드 실패     | 코드 복구     |
| --------------- | ------------ | ------------- | ------------- | ------------- |
| 분류            | success/true | success/false | success/false | success/false |
| Chromium 설치   | skipped      | success       | success       | success       |
| 테스트          | success      | success       | failure       | success       |
| lint/type/build | success      | success       | skipped       | success       |
| E2E             | skipped      | success       | skipped       | success       |
| cache save      | success      | success       | skipped       | success       |
| quality         | success      | success       | **failure**   | success       |

고의 실패는 `probeValue = 'ready'`를 `'blocked'`로 바꾼 합성 fixture 한 줄이다.
assertion `expect(probeValue).toBe('ready')`는 처음부터 끝까지 유지했다.
로컬과 원격에서 `expected 'blocked' to be 'ready'`를 확인했고, 실패 run의 집계는
`1 failed | 434 passed (435)`였다. 제품 테스트·검증 조건은 삭제하거나 완화하지 않았다.

코드 실패에서 뒤 step들이 skipped인 것은 test 실패 후의 fail-fast 동작이다.
docs-only skip으로 분류된 것이 아니며, job 전체는 failure로 남았다.
충돌 판정인 `MERGEABLE`과 보호 규칙 판정인 `BLOCKED`를 구분했고,
임시 required와 관리자 적용이 유지된 상태에서 차단을 확인했다.

복구는 합성 값만 원래 `'ready'`로 되돌렸다. fixture의 원본 바이트 hash와
전체 정상 코드 branch tree가 처음의 정상 commit과 같음을 확인했다.
**보호를 제거하기 전에** quality success와 MERGEABLE/CLEAN 복귀를 확인했다.
실패 run은 삭제하지 않았고, 관리자 우회 merge나 실제 merge는 수행하지 않았다.

#### 실험 커밋·기준선

| 목적              | commit                                     |
| ----------------- | ------------------------------------------ |
| 문서 fixture      | `184f145d78b7a4a884fb6c3d4b71edbc999d216c` |
| 정상 코드 fixture | `305a028c8e280f8426b3d89f63404c353d58f28f` |
| 고의 실패 값 주입 | `55b284bbeac82a8da3aa62c301d5c9773e0830c5` |
| 원래 정상 값 복구 | `ae5b60d86654e1358d5caf3b22cf09e02a68e320` |

실험 commit은 승인된 4회이며 모두 기존 lint-staged·commitlint를 통과했다.
고의 실패 commit은 required 동작을 검증하기 위한 격리 실험으로, 제출 브랜치에는 합치지 않았다.
정상 코드 commit `305a028c`와 복구 `ae5b60d8`의 tree는
`1cbac5f87f83b07a885ef959c02fa586957a7bab`로 같다.
합성 fixture hash도 `a6e2436f2d0c8e67831068e5d42ebdf36b2aed44e1878d13016c1f01e264db1d`로 복구됐다.
이는 정상 fixture를 포함한 tree이며, fixture가 없는 base tree와 같다는 뜻은 아니다.

각 run의 check API에서 이름 `quality`, 앱 ID `15368`, success/failure가
PR rollup과 일치함을 확인했다. base는 모든 PR에서 S6 commit으로 고정됐다.
head/실제 checkout·workflow SHA는 각 run의 measurement context 로그에 보존돼 있다.

#### 정리와 적용 범위의 한계

- 성공·차단 해제 증거를 수집한 뒤 PR #16/#17을 **closed·merged=false**로 종료했다.
- 제거 직전 보호 응답이 이번에 설정한 응답과 그대로 같은지 대조한 뒤,
  `experiment/week10-s7-base`의 보호만 DELETE했다. HTTP 204 후
  `Branch not protected` 404와 repository ruleset 빈 목록을 확인했다.
- origin/main은 실험 전후 모두 `Branch not protected`였다.
  upstream 보호를 변경하는 요청은 하지 않았다.
- 기존 PR #13/#14/#15의 head/base/state와 기존 캐시 IDs를 보존했다.
  캐시 삭제·remote branch 삭제·force-push·reset을 하지 않았다.
- 실험 code worktree는 clean이고 fixture는 정상 상태다. 실험 branches는 증거용으로
  남겼으며 제출 브랜치에는 문서·코드 fixture를 merge/cherry-pick하지 않았다.
- 원격 실험은 정확히 4회, 실험 commit도 4회다. 후속 실행을 추가하지 않았다.

이번 검증은 **격리 base에서의 required 계약과 조건부 실행**을 확인한 것이다.
현재 main이 보호된다는 뜻은 아니다. S11에서 최종 보호 대상을 확정·적용하면
그 설정에서 required·skip·실패 전파를 다시 확인해야 한다.

**S7 원격 검증과 정리는 완료**했다. 결과 RFC는 미커밋 상태로 사용자 확인 대기이며,
결과 commit과 S8 진입은 아직 수행하지 않았다.

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

| ID  | 원문 요구사항                                                 | 실행 Stage     | 최종 증거                                                                               |
| --- | ------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| R01 | 기존 CI 계승·실제 명령·Node/pnpm·frozen lockfile·job timeout  | S1             | S1 run 34427219215 attempts 1/2, 고정 버전·10분 timeout·원격 성공                       |
| R02 | Before cold/warm 각각 3회·raw/중앙값/범위                     | S1~S2          | S2 run 34427219215 attempts 3~8, raw·145/135초 중앙값·범위 기록                         |
| R03 | Actions step 타임스탬프로 최대 병목 지목                      | S2             | S2 step 원시값: 6회 모두 E2E가 최대, cold/warm 중앙값 35초                              |
| R04 | 같은 검증 유지·병목에 맞는 전략만·비채택 근거                 | S3             | S3 commit 9301b358·run 34436736719, 실제 build 1회·동일 테스트                          |
| R05 | concurrency main 오취소 방지·병렬 install 비용 확인           | S3             | D3에서 두 전략 미채택 이유 기록. 단일 job·기존 취소 정책 유지                           |
| R06 | warm 복원 로그 캡처·key 변경 miss·install 차이·lockfile 원복  | S4             | PR #15 원격 4회, K0 hit→K1 miss→K0 hit·전체 tree 원복                                   |
| R07 | After cold/warm 각각 3회·동등 조건·흔들림 대비 개선 판정      | S5             | run 34436736719 attempts 2~7. cold 기준 충족·warm 근거 부족, 환경 분포 공개             |
| R08 | lint/type/unit 모든 PR·build 소스/설정 보호                   | S6~S7          | S6 CLI 25개 회귀 + S7 PR #16/#17 정상 경로의 기본 검증 성공                             |
| R09 | 비싼 검증 하나 이상 조건부·조건/스킵 이유·main 진입 안전성    | S6             | D4 좁은 문서 허용 목록·unknown 실행·main 강제 실행 계약, S7 실제 분기 확인              |
| R10 | 필요한 경로 누락 방지·required skip 교착/실패 전파 검증       | S6~S7·S11      | S6 경계 검사·S7 임시 required의 CLEAN→BLOCKED→CLEAN 확인. S11 최종 대상 재검증 남음     |
| R11 | 조건에 걸리는/안 걸리는 실제 PR·Actions 로그·머지 가능 상태   | S7·S11         | PR #16 문서 skip·#17 전체 실행, 4개 run과 보호 적용 중 merge 상태 기록. S11 재검증 남음 |
| R12 | 채택한 label 재실행/권한·draft/merge queue 동작               | S6~S7          | label·queue 미채택. draft로 skip하지 않는 정책, S7은 ready PR로 보호 차단과 구분        |
| R13 | flaky 정책·재시도로 실패 숨기지 않음                          | S6             | retries=0 유지·trace/실패 보존. S7 고의 실패 후 같은 assertion·원본 값으로 복구         |
| R14 | 주요 진입점 번들 예산·7주차 전송량+현재 범위·여유폭 근거      | S8~S9          | 미실행                                                                                  |
| R15 | build 전 env 게이트·누락/URL/민감 NEXT_PUBLIC 실패            | S10            | 미실행                                                                                  |
| R16 | required/excluded 판단·비용/변동성/리스크 근거                | S11            | 미실행                                                                                  |
| R17 | PR 코멘트/summary 결과 가시성·초과 대상/양 표시               | S9~S11         | 미실행                                                                                  |
| R18 | 실제 예산 초과 PR 빨강·PR 리포트 캡처·수정 후 초록·미머지     | S11            | 미실행                                                                                  |
| R19 | 실제 PR diff AI 리뷰·특정 유료 API 강제 없음                  | S12~S13        | 미실행                                                                                  |
| R20 | 1~9주 합의 규칙을 프로젝트 맞춤 프롬프트로 명문화             | S12            | 미실행                                                                                  |
| R21 | AI 비결정성·required/advisory 배치 근거                       | S12            | 미실행                                                                                  |
| R22 | CI AI 선택 시 max_turns·timeout·concurrency·trigger·비용 안전 | S12            | 채택 여부 미결정                                                                        |
| R23 | 잘 잡은 리뷰 1개·오탐 1개·근거·프롬프트 개선                  | S13            | 미실행                                                                                  |
| R24 | AI/사람의 실제 반복 지적 중 결정 가능한 하나 선정             | S14            | 미실행                                                                                  |
| R25 | 적합한 결정적 룰·위반 차단/정상 통과·오탐 교정                | S14            | 미실행                                                                                  |
| R26 | AI/사람에 남긴 것·기계로 내린 것 판단 1문단                   | S14~S15        | 미실행                                                                                  |
| R27 | 지정 경로 10주 회고·기능 아닌 결정·수치/URL/로그/CI 근거      | S15            | 미실행                                                                                  |
| R28 | 4개 필수 질문 각각 2~4문장·본인 판단                          | S15            | 미실행                                                                                  |
| R29 | 최소 권한·코멘트 job 권한 한정·SHA 핀 정책                    | S1·S11~S12·S16 | 미실행                                                                                  |
| R30 | pull_request_target 위험 회피·fork/secrets·로그 노출 방지     | S1·S10~S12·S16 | 미실행                                                                                  |
| R31 | AI 활용·직접 판단/검증·역할과 책임·작성/검토 범위 기록        | S0~S16         | 미실행                                                                                  |
| R32 | workflow·측정·조건·예산·env·리뷰·룰·답변·회고 제출물 연결     | S16            | 미실행                                                                                  |
| R33 | 최종 pnpm check·실험 코드 원복·회귀 검증                      | S16            | 미실행                                                                                  |
| O01 | 선택 Lighthouse: 7주차 LCP/CLS 근거·조건·변동성 판단          | S8·S11         | 채택 여부 미결정                                                                        |
| O02 | Preview/Production URL 확보 권장·배포 자체는 채점 제외        | S0·S15         | 확보 여부 미확인                                                                        |
| O03 | 선택 rollback 질문: DB·캐시·트랜잭션·flag                     | S15            | 채택 여부 미결정                                                                        |

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
