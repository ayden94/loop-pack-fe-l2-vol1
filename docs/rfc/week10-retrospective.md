# 10주 기술 회고 — 검증 경계를 코드와 CI로 연결하기

이 문서는 저장소의 RFC·실행 결과를 바탕으로 작성한 기술 회고다.
AI가 초안을 구성하고 실제 측정·diff·실패 실험으로 확인했다.
작성자의 개인 경험이나 감정을 대신 만들어 쓰지 않으며, 아래 판단은 프로젝트의
관측 근거와 자율 진행 요청에 따라 채택한 기술 정책이다.

## 프로젝트와 구조 변화

상품 목록·필터·장바구니·위시리스트·로그인·주문 흐름을 가진 Next.js 커머스다.
초기의 화면 중심 조합에서 책임·상태 소유권을 구분하는 쪽으로 발전했다.
2~3주차의 컴포넌트·렌더링 규칙은 파생 값의 effect 동기화를 피하고
실제 생명주기에 맞는 경계를 두는 기준이 됐다. 이 원칙과 현재 코드 구조를 연결한
6주차 결정은 [FSD RFC](./week06-fsd.md)에 기록돼 있다.

6주차에서 중요한 변화는 폴더 이름 자체가 아니었다. 상품 표현 entity가 cart 같은
상위 행동 feature를 알지 않게 하고, 상위 조합 지점에서 action을 연결하는 방식이었다.
URL 상태·상품 요청·캐시 키도 각 소유자에 모았다. slice root barrel보다 실제 파일
import를 쓰는 것은 이 저장소가 의도적으로 선택한 정책이며 일반 FSD 예제를 그대로
적용하지 않았다.

## 결정 1 — 상태의 소유자와 인증 판정의 책임 분리

9주차 proxy는 쿠키 존재만 확인하고 서명·만료는 서버/API가 판정하도록 유지했다.
이 분리는 요청마다 비싼 검증을 반복하지 않는다는 장점이 있지만, 후방 판정이 실제
클라이언트 상태까지 전달되는지를 시험해야 완성된다.

피드백에서 root AuthProvider의 초기 session 고착, 실제 OrderService 만료 연결의
검증 누락, 계정 교차 장바구니가 지적됐다. 이에 `/api/auth/me` query cache로
클라이언트 인증 상태를 통일하고, 실제 주문 서비스와 provider를 연결한 테스트,
로그아웃 시 cart 제거와 계정 교차 E2E를 추가했다.
근거는 [피드백 RFC](./week10-feedback.md)와 `733fda56`, `94920eb4`, `278c2224`다.

이 결정의 교훈은 “각 함수가 맞다”와 “실제 연결이 보호된다”가 다르다는 점이다.
앞단 가드만 시험하거나 meta를 임의로 만든 가짜 쿼리만 시험하면 연결이 사라져도
테스트가 통과할 수 있다. 이후 CI 분류기·환경 검증도 실제 CLI와 원격 PR로 시험했다.

## 결정 2 — 같은 검증을 유지하면서 중복 작업만 제거

10주차 Before는 cold `[136,145,148]`초, warm `[135,119,139]`초였다.
가장 긴 개별 step은 6회 모두 build를 포함한 E2E였고 중앙값은 양쪽 모두 35초였다.
로그에서 `next build`가 두 번 실행되는 것도 확인했다.

따라서 job을 무작정 늘리는 대신, 같은 job에서 이미 만든 production 산출물을
E2E가 재사용하도록 한 줄을 바꿨다(`9301b358`). 로컬 독립 E2E 명령은 계속 자체
build를 수행한다. 검증을 지우거나 worker·cache 조건을 바꿔 시간을 줄이지 않았다.

After cold는 `[134,132,132]`초, warm은 `[116,128,116]`초였고 E2E step 중앙값은
35→23초로 감소했다. 하지만 사전 기준 `감소량 > max(전후 범위 폭)`에서 cold의
13초는 12초를 넘었고 warm의 19초는 20초를 넘지 못했다.
**cold의 수치 기준 충족과 warm 개선 확정 보류를 함께 기록**했다.
CPU·이미지 혼합 때문에 이를 통계적 유의성이나 보편적 속도 보장으로 확대하지 않는다.

근거: [CI RFC S2·S5](./week10-ci.md),
[Before run](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34427219215),
[After run](https://github.com/ayden94/loop-pack-fe-l2-vol1/actions/runs/34436736719).

## 결정 3 — 넓은 실행 허용보다 좁은 skip 허용

E2E를 실행할 코드 경로를 열거하면 새로운 경로를 빠뜨릴 수 있다.
반대로 README·RFC·과제 Markdown만 순수 문서로 허용하고 다른 변경은 실행하면
누락 쪽으로 실패하지 않는다. 저비용 검증과 build는 모든 PR에서 유지했다.

실제 [문서 PR #16](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/16)은 E2E를
skip해도 required quality가 success/CLEAN이었다. [코드 PR #17](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/17)은
전체 실행, 합성 fixture 실패 시 BLOCKED, 원본 복구 후 CLEAN을 확인했다.
이 실험은 관리자 적용을 켠 격리 base에서 수행했고, 이후 임시 보호를 제거했다.
최종 origin/main에는 예산·환경 게이트가 포함된 quality를 required로 유지한다.

GitHub 파일 API의 3000개 상한도 중요한 경계였다. 조회 목록이 잘렸을 수 있는데
앞부분만 문서라면 잘못 skip할 수 있어, 상한 이상 집계는 E2E 실행으로 돌렸다.
이는 “불명확할 때 성공”이 아니라 보수적으로 검증하는 선택이다.

## 테스트·품질 게이트

8주차의 책임별 테스트 전략과 9주차의 비용 중심 E2E 선별을 CI에 연결했다.
최종 로컬 검증은 67개 파일·464개 테스트이며 production E2E는 별도 16개다.
게이트는 다음 책임을 가진다.

| 기계 검사           | 보호하는 것                                               |
| ------------------- | --------------------------------------------------------- |
| Vitest/타입/ESLint  | 단위·통합 계약, 타입 오류, 문법·규칙 위반                 |
| 실제 production E2E | 인증·주문·URL·persist의 사용자 흐름                       |
| 문서 분류 CLI       | 순수 문서만 skip, 오류·불완전 집계는 보수적으로 처리      |
| 초기 JS 예산        | 실제 HTML의 초기 외부 JS encoded bytes                    |
| env gate            | 필수 값·origin·Preview 경계·민감 공개 변수, build 전 차단 |
| FSD AST gate        | 상위 layer로 향하는 정적 import/export 의존               |

예산·환경 실패는 [실험 PR #18](https://github.com/ayden94/loop-pack-fe-l2-vol1/pull/18)에서
실제로 빨간불과 BLOCKED를 확인하고 원복 후 CLEAN을 확인했다.
예산 초과 299730 bytes와 환경 변수 오류가 PR run summary에서 바로 보이는 것도
브라우저로 확인했다. 실험 PR은 모두 미머지 종료했고 결함을 제출 브랜치에 합치지 않았다.

## 성능 근거와 한계

7주차 RFC에 기록된 After Lighthouse LCP 중앙값은 693.173ms,
범위는 673.227~764.594ms, CLS는 0이었다. 이는 당시 지정된 production URL·
Lighthouse 프로토콜의 결과이지 현재 재실행 결과가 아니다.

10주차에 원시 artifact가 남아 있지 않아, 7주차 최종 SHA를 별도 worktree에서
보충 재현했다. 초기 gzip 응답 JS는 `/` 296375 bytes, `/products` 297973 bytes였고
현재는 299731·301370 bytes였다. 이를 근거로 경로당 348160 bytes 예산을 정했다.
현재 최대값 대비 약 15.5% 여유이며, 이미지 전송량을 JS 예산으로 바꿔 쓰지 않았다.
측정은 초기 외부 JS에 한정되며 inline Flight·lazy chunk 등은 포함하지 않는다.
자세한 단위·원시값·한계는 [예산 RFC](./week10-budgets.md)에 기록했다.

## AI 협업과 룰 승격

실제 diff를 ChatGPT 웹에서 검토했다. 공개 CI secret이 production validation도
통과한다는 지적은 실패 테스트로 재현한 뒤 수정했다.
반면 `APP_ENV=test`가 제품 bundle을 바꾼다는 우려는 src에 해당 변수 사용이 없어
기각했다. 측정 단위와 실제 소비 위치를 추가한 동일 diff 재리뷰에서 그 오탐을 철회했다.
근거: [AI 리뷰 기록](./week10-ai-review.md).

반복된 entity→feature 역참조 문제는 문맥 판단만으로 남길 필요가 없었다.
TypeScript AST로 상위 FSD 의존을 검사하는 gate로 승격했고 위반·정상 fixture와
실제 CLI에서 차단/통과를 검증했다([룰 승격](./week10-rule-promotion.md)).
AI에는 설계 후보 탐지, 기계에는 결정 가능한 참/거짓, 사람에게는 제품 맥락과
최종 책임을 남긴다. 리뷰어가 버그 부재를 보증하는 것은 아니다.

## 다시 만든다면

측정 단위와 환경 고정 가능 범위를 먼저 정했을 것이다. hosted runner의 image/CPU
완전 일치를 가정해 S2를 한 번 중단했고, 이후 관측 변수로 분리하는 기준을 승인받았다.
또한 상태 소유권과 실제 서비스 배선을 더 일찍 테스트했을 것이다.
검증을 많이 만드는 것보다 어떤 결함을 놓치는지 부정 사례로 확인하는 편이 중요했다.

공개 배포 URL은 확인되지 않았고 이 작업에서 새 배포는 하지 않았다.
따라서 이 회고는 로컬 production·실제 GitHub CI 근거이지 실사용 운영 지표가 아니다.
향후에는 실제 트래픽·실패율·배포 rollback 근거를 별도로 쌓아야 한다.

## 필수 질문 4개

### 1. 모든 PR의 E2E required가 왜 문제가 될 수 있는가?

E2E는 설치·build·브라우저 비용이 크고 환경 변동으로 잘못된 실패를 만들 수 있다.
이 프로젝트는 코드/설정 PR에서 E2E를 유지하고, 검증된 문서 전용 PR만 생략한다.
required는 항상 결과를 내는 quality에 연결하고 실제 skip/CLEAN·실패/BLOCKED를 시험해 pending 교착을 피했다.

### 2. Lighthouse 하락은 항상 merge blocker여야 하는가?

단일 점수 하락은 CPU·네트워크·이미지 후보 변동과 분리하기 어려워 항상 차단 근거로 삼지 않는다.
여기서는 Lighthouse를 advisory로 남기고 동일 단위의 JS bytes·env·타입·테스트를 결정적 gate로 쓴다.
사용자 영향이 크고 재현 가능한 지표 회귀가 확보되면 별도 기준과 반복 측정으로 blocker 승격을 검토한다.

### 3. Preview가 production API를 보면 무엇이 위험한가?

미완성 기능이나 실험이 실제 주문·결제·메일·사용자 데이터를 건드릴 수 있다.
이 프로젝트의 서버 API origin인 APP_ORIGIN을 Preview에서는 production origin과 분리하고,
검증에 필요한 PRODUCTION_APP_ORIGIN이 없거나 같으면 build 전에 차단한다.
현재 mock 서비스라고 이 경계를 생략하면 나중에 실제 백엔드 연결 시 위험이 커진다.

### 4. AI가 만든 workflow를 그대로 merge하면 왜 위험한가?

과도한 권한·`pull_request_target`·잘못된 cache key·경로 필터로 secrets 노출이나 검증 누락이 생길 수 있다.
최소 권한·SHA 핀·fork 경계를 직접 확인하고, 실행/skip과 실패/복구를 실제 PR에서 검증해야 한다.
이 작업에서는 분류·예산·env를 부정 사례로 시험했고 AI 지적도 재현 가능한 것만 수정했다.

### 선택: rollback은 코드만 되돌리면 되는가?

DB migration·cache 형식·진행 중 요청·feature flag는 코드 버전과 별개로 남을 수 있다.
이 저장소에는 실제 운영 DB나 배포 rollback 실험 근거가 없으므로 수행했다고 주장하지 않는다.
실서비스에서는 호환 migration, flag 비활성화, cache 버전, 진행 중 작업 처리 순서를 함께 설계해야 한다.
