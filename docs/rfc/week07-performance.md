# Week 07 성능 측정 RFC

## 기준선과 현재 상태

- StartSHA: `4e53e545863f5ad184137f58569cc0942d405a64`
- StartSHA 확인 명령: `git rev-parse HEAD`
- 작업 시작 전 `git status --porcelain`: 출력 없음
- 현재: 기존 Before 근거를 재사용한 Todo 8 displayed-candidate audit에서 oversized gate 충족을
  확인하고, source 변경 전 `next/image` 최소 실험과 판정 기준을 고정했다.
- 대기: Todo 8 구현·candidate 측정·After 판정, 상품 여섯 상태, metadata, Basic After와
  최종 회귀 검증이다.

## 범위와 불변 조건

### 포함 범위

- Week 07 Basic 0-4단계
- Hero LCP 원인 분석과 필요한 최소 변경
- 상품 목록의 여섯 상태와 URL/query/request 일치
- metadata, Open Graph, 초기 HTML, 서버 호출 계수와 응답 시점
- Before/After 비교와 기능·접근성·아키텍처 회귀 확인
- 측정 근거가 진입 조건을 충족할 때만 Advanced A 수행

### 변경하지 않을 조건

- production build만 측정하고 `pnpm dev`는 측정에 사용하지 않는다.
- slow API의 1.5초 지연을 줄이거나 제거하지 않는다.
- Hero의 시각적 크기·비율·주요 피사체·문구를 수치 개선 목적으로 바꾸지 않는다.
- Lighthouse 점수나 향상률을 합격 기준으로 사용하지 않는다.
- 측정 근거 없이 preload, prefetch, placeholder data, `AbortSignal`, memoization,
  Bundle Analyzer를 추가하지 않는다.
- 서버 응답을 Zustand나 별도 로컬 상태에 복사하지 않는다.
- 서버 QueryClient singleton, 영속 서버 캐시, Route Handler 재설계, FSD 우회를 하지
  않는다.
- `scenario`는 진단용 URL 제어값으로만 사용하고 사용자 필터 상태로 노출하지 않는다.
- 임시 서버 호출 계측은 제출 브랜치에 남기거나 병합하지 않는다.
- localhost Open Graph URL을 배포 증거로 사용하지 않는다.

## SHA와 체크포인트

| 역할                        | SHA                                        | 작업 트리 | 기록 시점                   | 상태    |
| --------------------------- | ------------------------------------------ | --------- | --------------------------- | ------- |
| StartSHA                    | `4e53e545863f5ad184137f58569cc0942d405a64` | clean     | Week 07 작업 시작 전        | current |
| 프로토콜 문서 체크포인트    | `d3da682`                                  | clean     | RFC 프로토콜 커밋 후        | current |
| BeforeSHA                   | `e2e608b3c46e1003b44c1919b10906f78f1dc64b` | clean     | baseline Hero 통합 커밋 후  | current |
| Todo 7 final source SHA     | `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd` | clean     | semantic shell candidate 후 | current |
| BasicAfterSHA               | Pending                                    | Pending   | 최종 source 검증·커밋 후    | pending |
| Advanced Before/After SHA   | Pending                                    | Pending   | Advanced A 진입 시          | pending |
| 최종 evidence 문서 커밋 SHA | Pending                                    | Pending   | RFC와 근거 확정 후          | pending |

## 환경

| 항목                  | 확인 명령 또는 위치                  | 값                                                                                              | 상태    |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- | ------- |
| Node.js               | `node --version`                     | `v24.9.0`                                                                                       | current |
| pnpm                  | `pnpm --version`                     | `10.15.1`                                                                                       | current |
| OS                    | `sw_vers`                            | macOS 27.0 (26A5388g)                                                                           | current |
| Chrome 전체 버전      | Chrome executable version            | `150.0.7871.187`                                                                                | current |
| Lighthouse 버전       | Lighthouse 결과 export               | `13.3.0`                                                                                        | current |
| 브라우저 프로필       | 측정 전용, 확장 프로그램 없음        | Chrome Guest profile                                                                            | current |
| 확장 프로그램 상태    | Guest profile                        | 기존 profile 확장 프로그램과 분리                                                               | current |
| APP_ORIGIN            | build/runtime 공통                   | `http://127.0.0.1:3000`                                                                         | current |
| production PID        | Before 측정 서버                     | `53177` (Before 수집 후 종료)                                                                   | current |
| Todo 7 production PID | candidate 측정 서버                  | `30363` (Todo 7 수집 후 종료·포트 해제 확인)                                                    | current |
| production 로그 경로  | 서버 시작 후 기록                    | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-server.log` | current |
| `pnpm test`           | Todo 7 source                        | 17 files, 160 tests passed                                                                      | current |
| `pnpm check`          | source 변경 전·BasicAfterSHA 확정 전 | exit 0                                                                                          | current |

현재 실행 환경에는 `nvm`이 없으므로 `.nvmrc`의 `24.17.0` 대신 `package.json`의
지원 범위(`>=22.12.0`)에 포함되는 `v24.9.0`을 사용한다. Before와 After에서 같은
버전을 유지하고 이 차이를 재현 조건에 명시한다.

source 변경 전 `APP_ORIGIN=http://127.0.0.1:3000 pnpm check`는 test, lint,
typecheck, production build를 모두 통과했다. lint에는 최적화 전 Hero의 raw `<img>`에
대한 `@next/next/no-img-element` warning 1건이 있으며 error는 없다. 이 warning은
baseline source를 임의로 최적화하지 않고 해당 실험 단계에서 판단한다.

production lifecycle 확인에서 시작 전 포트 3000은 비어 있었다. 서버 PID `31004`로
`/`와 `/api/home`이 모두 HTTP 200을 반환했으며, 종료 후 PID가 사라지고 포트 3000이
해제된 것을 확인했다.

## 측정 프로토콜

### 공통 원칙

- 각 유효 측정 직전에 `git status --porcelain`이 비어 있어야 한다.
- 측정 URL, source SHA, build mode, production PID, Chrome/Lighthouse 버전을 기록한다.
- build와 runtime에 `APP_ORIGIN=http://127.0.0.1:3000`을 동일하게 적용한다.
- Before와 After는 SHA를 제외한 URL, 행동, 브라우저 프로필, viewport, throttling,
  cache 조건을 동일하게 유지한다.
- 측정 프로세스가 실행되는 동안 tracked RFC나 screenshot을 수정하지 않는다.
- 실행 중에는 제외된 로컬 evidence 디렉터리에만 기록하고, 프로세스를 종료한 뒤
  선별 근거를 RFC와 tracked image 디렉터리에 옮긴다.

### Lighthouse

| 설정                   | 고정값 또는 확인 방법                          |
| ---------------------- | ---------------------------------------------- |
| Mode                   | Navigation                                     |
| Device                 | Desktop                                        |
| Categories             | Performance only                               |
| 측정 횟수              | Before 5회, After 5회                          |
| authoritative settings | 각 export JSON의 `configSettings`              |
| formFactor             | Pending                                        |
| screenEmulation        | width/height/deviceScaleFactor를 JSON에서 기록 |
| throttlingMethod       | JSON에서 기록                                  |
| CPU/network parameters | JSON에서 기록                                  |
| benchmarkIndex         | 각 run에서 기록                                |
| 결과                   | FCP/LCP는 ms, CLS는 단위 없는 raw 값으로 기록  |

Device Toolbar 값은 Lighthouse export JSON과 일치한다고 확인되지 않는 한 Lighthouse
설정으로 주장하지 않는다.

### Supporting trace

| 설정               | 고정값                            |
| ------------------ | --------------------------------- |
| Device Toolbar     | `1365 × 768`                      |
| DPR                | `1`                               |
| Browser zoom       | `100%`                            |
| Network cache      | Disable cache 체크                |
| Preserve log       | 끔                                |
| Network throttling | Slow 4G                           |
| Performance CPU    | 4× slowdown                       |
| cold trace 동작    | Start profiling and reload page   |
| secondary viewport | `375 × 812`, DPR과 zoom 별도 기록 |

Chrome UI의 라벨이 다르면 임의로 같은 설정이라고 가정하지 않고 실제 표시 문구를 기록한다.

### Cold와 warm 정의

| 용어 | 정의    | 실제 절차 |
| ---- | ------- | --------- |
| cold | Pending | Pending   |
| warm | Pending | Pending   |

### 무효 측정 규칙

다음 조건의 run은 무효로 표시하고 원인을 기록한 뒤 다시 측정한다.

- URL, source SHA, production PID, build mode가 계획과 다르다.
- Lighthouse `configSettings`나 Chrome 버전이 비교군과 다르다.
- 측정 직전 작업 트리가 깨끗하지 않다.
- 예상하지 않은 cache hit, 확장 프로그램, 다른 탭의 간섭이 있다.
- navigation이 실패했거나 측정 resource가 정상적으로 로드되지 않았다.

LCP candidate가 run마다 바뀐 것은 무효 사유가 아니다. 유효 run으로 유지하고 candidate
분포와 불안정성을 분석한다.

### 통계와 판정 규칙

- 다섯 raw 값으로 median, min, max, `range = max - min`을 계산한다.
- `Before median - After median`의 절댓값이 Before range를 초과할 때만 방향성 변화로
  판정한다.
- 변화가 Before range 이내이면 `inconclusive`로 기록한다.
- FCP/LCP/CLS는 낮을수록 개선 방향이다.
- 필수 동작 계약을 고친 변경은 성능 수치가 그대로여도 비성능 유지 근거를 기록할 수
  있다.

## Artifact manifest

큰 Lighthouse HTML/JSON, HAR, Performance trace는
`.local/week07-performance-evidence/<sha>/`에 보관한다. 제출 판단에 필요한 수치와 선별
화면은 RFC 및 `docs/images/week07-performance/`에도 남긴다.

| ID      | 상대 경로                                                                                                                    | SHA-256                                                            | byte 크기 | 캡처 시각                | source SHA                                 | URL                           | 도구·버전             | 프로토콜                             | 용도·연결된 주장                             | 상태    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------- | ------------------------ | ------------------------------------------ | ----------------------------- | --------------------- | ------------------------------------ | -------------------------------------------- | ------- |
| B-LH1   | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-1.json`                   | `d69b492eaff22f1b34ec0f38ae4c1e7c9b56bb27e7fc53349901b73e50d269ec` | 466393    | 2026-08-04T13:20:18.971Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | Navigation/Desktop/Performance       | Before raw 1                                 | local   |
| B-LH2   | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-2.json`                   | `69d1b378063d194e045bc75addf7e96b18f9a68b4449c146aeab5aa8b2f37d7e` | 474698    | 2026-08-04T13:30:03.892Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                        | Before raw 2                                 | local   |
| B-LH3   | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-3.json`                   | `cdc26771bc5dfdcfc25f720fe3cda02b49d0c47dcaf6dfc22d9e500bf5abfa75` | 467595    | 2026-08-04T13:32:48.183Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                        | Before raw 3                                 | local   |
| B-LH4   | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-4.json`                   | `e83a967f043f0cfe6c5058f47ca7bf0ae1cb2e05b4b4f36c4662f44b495d2e29` | 428235    | 2026-08-04T13:34:31.388Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                        | Before raw 4                                 | local   |
| B-LH5   | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-5.json`                   | `6fef73195fa7be9b677163ea343d499016c533132082a09c289a31129e33b08a` | 444500    | 2026-08-04T13:38:32.633Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                        | Before raw 5                                 | local   |
| B-HTR   | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-home-performance-trace.json.gz`          | `802d2f63f2fc739440f3ff7d89ab050748a75801575dc8badde98c6d457d20ef` | 705378    | 2026-08-04T14:07:41.430Z | `e2e608b`                                  | `/?scenario=slow`             | Chrome DevTools 150   | 1365×768/DPR1/Slow 4G/CPU4×          | Home insertion, discovery, filmstrip, shifts | local   |
| B-HHAR  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-home-network.har`                        | `a14231315363dee427d0356376b41f98f9dbac0dda232450005eb0c21fd39554` | 11536130  | 2026-08-04T14:12:58.185Z | `e2e608b`                                  | `/?scenario=slow`             | WebInspector HAR 1.2  | Slow 4G/cache disabled               | Document/API/Hero waterfall                  | local   |
| B-PCTR  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-cold-performance-trace.json.gz` | `54c0572c6f972927370580b6befbecf7c90818abec30508424704da317ca3572` | 846954    | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`     | Chrome DevTools 150   | supporting trace                     | Cold pending, product render, CLS            | local   |
| B-PRTR  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-rapid-filter-trace.json.gz`     | `797423daf09f14035f71d8d62aac080a53164924f5d556f70cf5c0a9e6936d99` | 1900314   | 2026-08-04T14:21:20.490Z | `e2e608b`                                  | `/products?...&scenario=slow` | Chrome DevTools 150   | manual warm interaction              | No cancellation, repeated shifts             | local   |
| B-PRHAR | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-rapid-filter.har`               | `ae44e83106d272d38fded4ba6d97e09b7a2a8e80bf81cbdb84536a6960846ea4` | 573887    | 2026-08-04T14:21:26.142Z | `e2e608b`                                  | `/products?...&scenario=slow` | WebInspector HAR 1.2  | Slow 4G/cache disabled               | 11 completed product requests                | local   |
| B-IMG1  | `docs/images/week07-performance/01-before-lighthouse.png`                                                                    | `0043040f552d82faaeb9fdd6676a3fa82b06dddfd0d42327781e8ba3f9818000` | 140322    | 2026-08-04T13:20:18.971Z | `e2e608b`                                  | `/?scenario=slow`             | selected PNG          | Lighthouse final screenshot          | Original Hero Before                         | tracked |
| B-IMG2  | `docs/images/week07-performance/02-products-initial-pending.png`                                                             | `368251e3954f8d896094feb6f1c1cb28f70329e658bc5d6501a757ea1d1d2bf6` | 12317     | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`     | selected PNG          | trace filmstrip                      | Initial pending                              | tracked |
| B-IMG3  | `docs/images/week07-performance/03-products-loaded.png`                                                                      | `bbb812532a00fd2cdbbc5706719808bfcee9518abc5c5f907335d8988e3ae7a6` | 92864     | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`     | selected PNG          | trace filmstrip                      | Loaded list                                  | tracked |
| T7-LH1  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-1.json`                    | `c1a7cc7614789460b5d077676a66c2f516a3f47eb0b839e28037d333451ffe69` | 491695    | 2026-08-05T12:56:30.081Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | headed Chrome/config parity          | Todo 7 raw 1                                 | local   |
| T7-LH2  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-2.json`                    | `c96fe7edaad5ae66cf6fbd51a161e5708b62f9acd201a582486cb3b89d9e2894` | 541685    | 2026-08-05T12:57:20.418Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                       | Todo 7 raw 2                                 | local   |
| T7-LH3  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-3.json`                    | `031f77408e77d14027a7c29f6cac240da1a04f0afca39078211e22095e2dca87` | 543290    | 2026-08-05T12:57:35.141Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                       | Todo 7 raw 3                                 | local   |
| T7-LH4  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-4.json`                    | `37a271a38a33d161e5da8266d3c08fe4008778589444cbe5a98c27fbbae7b03d` | 521849    | 2026-08-05T12:57:49.662Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                       | Todo 7 raw 4                                 | local   |
| T7-LH5  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-5.json`                    | `eec339bc1d3cc7adfd012472a35b96bb0e8a2601b0393ed49b42cc600baac095` | 521670    | 2026-08-05T12:58:08.423Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                       | Todo 7 raw 5                                 | local   |
| T7-TR   | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-home-playwright-trace.zip`                | `c7c5274485547518f370724ae5abc39cd50691b3255b167980b0bb04f1277268` | 260211    | 2026-08-05T13:01:18.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | Playwright/Chrome 150 | 1365×768/cache off/Slow 4G/CPU4×     | Shell/API/Hero timeline·bounds·shift         | local   |
| T7-IMG1 | `docs/images/week07-performance/04-home-semantic-shell-desktop.png`                                                          | `c097baa436332b58a96f2100a1052d393f53460a7b25e70f3e0448e76e57fdbd` | 21770     | 2026-08-05T12:38:23.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 1365 desktop pending                 | API 전 semantic shell                        | tracked |
| T7-IMG2 | `docs/images/week07-performance/05-home-hero-resolved-desktop.png`                                                           | `b709f9f3ffd95247f54ccbada9cbee13691dfd6129b0e678c6ef260ac602ead4` | 1512074   | 2026-08-05T12:38:25.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 1365 desktop resolved                | Final Hero 동일 geometry                     | tracked |
| T7-IMG3 | `docs/images/week07-performance/06-home-semantic-shell-mobile.png`                                                           | `6b5582414428c9b7e3fa0a8e74d8015b0fcb20ebf86822678150c4308d5f63f4` | 17962     | 2026-08-05T12:38:25.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 375 mobile pending                   | Mobile semantic shell                        | tracked |
| T7-IMG4 | `docs/images/week07-performance/07-home-hero-resolved-mobile.png`                                                            | `39bb1d36168e9b56cdbf09774c27300ad808ea0bc7d664ffa490b1d2ff777c5e` | 564643    | 2026-08-05T12:38:27.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 375 mobile resolved                  | Mobile final Hero 동일 geometry              | tracked |
| T8-AUD  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo8-candidate-audit.md`                       | `a8f01739d5bdb335f89aae4c58dffb375524b8a46ca768e3dd61c8b2572df1cc` | 18760     | 2026-08-05T14:30:22Z     | `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd` | `/?scenario=slow`             | independent audit     | existing B-HHAR/T7 evidence re-audit | Todo 8 displayed candidate·oversized gate    | local   |

## Before

### 측정 대상

| 항목        | 값                                                            |
| ----------- | ------------------------------------------------------------- |
| BeforeSHA   | `e2e608b3c46e1003b44c1919b10906f78f1dc64b`                    |
| URL         | `http://127.0.0.1:3000/?scenario=slow`                        |
| load 조건   | Lighthouse Navigation/Desktop/Performance, 5 cold navigations |
| source 상태 | clean; 각 run 직전 확인                                       |
| PID         | `53177` (수집 후 종료)                                        |

### Lighthouse raw 값

| Run | FCP (ms) | LCP (ms)    | CLS | LCP element/candidate | config parity | evidence ID | 유효 여부·사유                       |
| --- | -------- | ----------- | --- | --------------------- | ------------- | ----------- | ------------------------------------ |
| 1   | 237.7291 | 6981.484125 | 0   | original Hero image   | match         | B-LH1       | valid                                |
| 2   | 215.6347 | 6875.178075 | 0   | original Hero image   | match         | B-LH2       | valid                                |
| 3   | 233.0785 | 6967.505125 | 0   | original Hero image   | match         | B-LH3       | valid                                |
| 4   | 292.4904 | 7144.9808   | 0   | original Hero image   | match         | B-LH4       | valid; benchmark index 1152 recorded |
| 5   | 239.0073 | 6986.277375 | 0   | original Hero image   | match         | B-LH5       | valid                                |

| 지표 | median      | min         | max       | range      |
| ---- | ----------- | ----------- | --------- | ---------- |
| FCP  | 237.7291    | 215.6347    | 292.4904  | 76.8557    |
| LCP  | 6981.484125 | 6875.178075 | 7144.9808 | 269.802725 |
| CLS  | 0           | 0           | 0         | 0          |

### LCP와 supporting trace

| 관찰 항목                  | 값·시각                                                                   | evidence ID | 상태    |
| -------------------------- | ------------------------------------------------------------------------- | ----------- | ------- |
| LCP element/candidate 분포 | 5/5 original Hero image                                                   | B-LH1-B-LH5 | current |
| TTFB                       | median 64.792ms (24.374-124.327ms)                                        | B-LH1-B-LH5 | current |
| resource load delay        | median 1738.374ms (1661.244-2295.92ms)                                    | B-LH1-B-LH5 | current |
| resource load duration     | median 196.617ms (81.445-624.318ms)                                       | B-LH1-B-LH5 | current |
| element render delay       | median 135.646ms (93.406-269.886ms)                                       | B-LH1-B-LH5 | current |
| Hero DOM insertion         | API 완료 뒤 Hero가 삽입됨; 정확한 insertion event는 trace에서 unavailable | B-HTR       | current |
| Hero request discovery     | navigation 이후 4656.848ms                                                | B-HTR       | current |
| document request           | 200, 3869 transfer bytes, 590.917ms                                       | B-HHAR      | current |
| home API request           | 200, 4179 transfer bytes, 1527.653ms                                      | B-HHAR      | current |
| Hero image URL/bytes       | `/images/week-07/hero-original.jpg`, 7545525 transfer bytes               | B-HHAR      | current |
| filmstrip 표시 순서        | loading text → Hero h2; auto trace는 image 완료 전 종료                   | B-HTR       | current |
| Layout Shifts              | Home trace 0 events                                                       | B-HTR       | current |

### 최초 가설

- 관찰한 사실: slow home API가 시작된 뒤 약 1.56초가 지나 Hero 요청이 발견되고,
  원본 JPEG 7.55MB는 supporting Slow 4G에서 약 42.86초를 수신에 사용한다.
- 원인 가설: 데이터 응답 뒤 Hero가 삽입되는 경계가 request discovery를 늦추며, 이후
  oversized 원본 전송이 추가 대기 시간을 만든다.
- 반증 방법: static semantic shell과 data-dependent Hero의 경계를 분리한 trace에서
  shell 표시가 빨라지되 Hero request discovery가 그대로인지 확인하고, 별도 candidate
  audit에서 실제 표시 크기 대비 요청 크기를 비교한다.
- 먼저 시도할 가장 작은 변경: Todo 6에서 인과를 확정한 뒤 mandatory semantic shell
  boundary만 먼저 실험한다. 이미지 변경은 displayed-candidate audit 전에는 하지 않는다.

### LCP causal attribution

| 근거                 | 관찰한 사실                                                                                                                        | 인과 해석                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| baseline source      | pending 동안 `HomeView`는 loading text만 반환하고 `h1`, 설명, Hero는 success branch에만 있다.                                      | slow query가 semantic shell과 Hero DOM insertion을 직접 막는다.                                                              |
| Lighthouse 5회       | 5/5 LCP candidate는 original Hero이고 simulated LCP median은 6981.484ms, range는 269.803ms다.                                      | 동일 Lighthouse 조건의 end-to-end 비교에서 Hero가 일관되게 LCP를 결정한다.                                                   |
| Lighthouse insight   | observed breakdown median에서 resource load delay 1738.374ms가 TTFB 64.792ms, transfer 196.617ms, render delay 135.646ms보다 길다. | observed breakdown 내부에서는 discovery/load delay가 지배적이며 TTFB나 render delay만으로 변경을 처방할 수 없다.             |
| supporting trace     | API start 3097.182ms, Hero request start 4656.848ms로 1559.666ms 차이가 나며 Home Layout Shift는 0건이다.                          | API 응답 뒤 Hero가 삽입되는 현재 query boundary가 late discovery를 설명한다. API 시작 전 시간은 아직 attribution하지 않는다. |
| separate Slow 4G HAR | API는 1527.653ms, Hero는 7545525 bytes이며 receive에 42859.522ms를 사용한다.                                                       | oversized transfer는 late discovery 이후의 독립 병목이지만 Todo 8 candidate audit 전에는 변경하지 않는다.                    |

Lighthouse의 simulated LCP와 insight의 observed phase는 같은 값이 아니다. 예를 들어
B-LH3의 top-level simulated LCP는 `6967.505ms`이지만 같은 export의
`observedLargestContentfulPaint`는 약 `2138ms`이며 insight phase 합계와 대응한다.
따라서 simulated LCP는 동일 config의 Before/After end-to-end 비교에, observed phase는
원인 분류에, Slow 4G trace/HAR는 요청 순서와 전송 관찰에 각각 사용한다. 서로 다른
측정값을 합치거나 하나가 다른 값을 재현한다고 주장하지 않는다.

### Todo 7 predeclared semantic-shell decision

- 가설: `/?scenario=slow`에서 `h1`과 페이지 설명을 data-dependent subtree 밖으로 옮기고,
  local Suspense 안에 고정 geometry Hero fallback을 두면 home API 완료와 final Hero 삽입
  전에 semantic shell과 reserved Hero frame이 표시된다. LCP 감소는 예측하지 않는다.
- keep threshold: 같은 run의 trace와 filmstrip에서 `h1`, 설명, reserved Hero frame이 API
  완료 및 final Hero insertion 전에 보이고, `1365 × 768`과 `375 × 812`에서 fallback과
  final Hero bounds가 일치하며, 정확히 하나의 `h1`, Hero replacement 기인 Layout Shift
  0건, hydration·접근성·시각적 역할·error/retry·build 회귀 0건이면 유지한다.
- timing classification: 같은 config의 isolated 5회 측정을 수행한 경우 LCP median이
  `6711.6814ms` 미만이면 directional improvement, `7251.28685ms` 초과이면 regression,
  그 사이면 inconclusive다. mandatory shell contract를 만족하면 inconclusive LCP는
  revert 사유가 아니다.
- falsification/revert: shell이 API 전에 나타나지 않거나, duplicate `h1`, fallback/final
  bounds mismatch, Hero-attributed shift, hydration·접근성·기능 회귀가 있으면 가설은 현재
  구현으로 반증된 것이다. 먼저 수정하고 재측정하며, candidate에 귀속되는 range 초과
  timing regression을 수정할 수 없으면 별도 revert commit 후 중단한다.
- stop rule: Todo 7 final SHA, trace, candidate distribution, keep/fix/revert 결정을 기록하기
  전에는 Todo 8을 시작하지 않는다. 이 실험에는 `next/image`, priority, preload, candidate,
  format, quality 변경을 섞지 않는다.

## Hero 실험과 결정

| 순서 | 실험                            | 사전 가설                                                            | 판정 threshold                                                                                     | 반증 조건                                                                                      | candidate SHA | 측정 결과                                    | 결정·이유                  | evidence ID                                       |
| ---- | ------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------- | -------------------------- | ------------------------------------------------- |
| 1    | semantic shell/loading boundary | API 전 shell+reserved frame, LCP 개선 예측 없음                      | semantic contract 전부 통과; timing은 <6711.6814 improved, >7251.28685 regression                  | API 전 shell 실패, duplicate h1, bounds/shift/hydration/a11y/function regression               | `ca2b6a7`     | shell 계약 통과; LCP 6913.341ms              | keep; timing inconclusive  | T7-LH1-T7-LH5/T7-TR/T7-IMG1-T7-IMG4               |
| 2    | displayed size/candidate audit  | raw 3840×2160 request is oversized; responsive delivery lowers bytes | right-sized optimizer candidate+material byte reduction; geometry/crop/CLS/a11y/function unchanged | raw/original-size candidate, no byte reduction, or visual/crop/quality/CLS/function regression | Pending       | audit gate met; implementation·After Pending | locked; source result 아님 | B-HHAR/T7-LH1-T7-LH5/T7-TR/T7-IMG2/T7-IMG4/T8-AUD |
| 3    | optional discovery/priority     | Pending                                                              | Pending                                                                                            | Pending                                                                                        | Pending       | Pending                                      | Pending                    | Pending                                           |

### Todo 7 semantic shell 결과

`src/app/page.tsx`는 Promise인 `searchParams`를 직접 await하지 않고 `main`, 하나의 `h1`,
설명을 즉시 반환한다. `@suspensive/react`의 local `Suspense`는 client-only fallback을 먼저
보이고, 내부 `HomeSearchParams`가 React `use()`로 params를 해제한 뒤
`@suspensive/react-query`의 `SuspenseQuery`가 data-dependent Hero와 섹션만 렌더한다.
query error는 같은 local `ErrorBoundary`와 TanStack reset boundary를 통해 기존 API 메시지와
재시도 버튼을 유지한다. root `loading.tsx`나 이미지 정책 변경은 추가하지 않았다.

| Run | FCP (ms) |  LCP (ms) | CLS | LCP candidate       | config parity | evidence ID |
| --- | -------: | --------: | --: | ------------------- | ------------- | ----------- |
| 1   | 219.0556 | 6878.1112 |   0 | original Hero image | match         | T7-LH1      |
| 2   | 236.6091 | 6933.2182 |   0 | original Hero image | match         | T7-LH2      |
| 3   | 221.0499 | 6882.0998 |   0 | original Hero image | match         | T7-LH3      |
| 4   | 234.4272 | 6928.8544 |   0 | original Hero image | match         | T7-LH4      |
| 5   | 226.6705 |  6913.341 |   0 | original Hero image | match         | T7-LH5      |

| 지표 |   median |       min |       max |   range | Before median 차이 | 판정                                |
| ---- | -------: | --------: | --------: | ------: | -----------------: | ----------------------------------- |
| FCP  | 226.6705 |  219.0556 |  236.6091 | 17.5535 |         -11.0586ms | Before range 이내; inconclusive     |
| LCP  | 6913.341 | 6878.1112 | 6933.2182 |  55.107 |       -68.143125ms | Todo 7 threshold 중간; inconclusive |
| CLS  |        0 |         0 |         0 |       0 |                  0 | no change                           |

다섯 run 모두 original Hero image가 LCP이며 `configSettings`와 Chrome/Lighthouse 버전이
Before와 일치했다. 브라우저 조작 위임에 따라 Lighthouse 13.3.0 runner가 headed Chrome
Stable을 실행해 JSON을 자동 export했다. 이는 DevTools panel click sequence 대신 자동화된
capture path이며, 판정에는 export의 authoritative `configSettings`를 사용했다.

| 계약              | 관찰                                                                           | 결과 | evidence ID            |
| ----------------- | ------------------------------------------------------------------------------ | ---- | ---------------------- |
| API 전 shell      | pending 관찰 525.6ms, home API start 2183.929ms, Hero request start 3747.402ms | pass | T7-TR/T7-IMG1/T7-IMG3  |
| desktop bounds    | fallback/final `1104 × 621`, `y=185`                                           | pass | T7-TR/T7-IMG1/T7-IMG2  |
| mobile bounds     | fallback/final `327 × 408.75`, `y=185`                                         | pass | T7-IMG3/T7-IMG4        |
| landmark/heading  | pending·success·error·retry 모두 `main=1`, `h1=1`                              | pass | T7-TR/T7-IMG1-T7-IMG4  |
| replacement shift | Lighthouse CLS 5/5 `0`; no-recent-input observer shift 없음                    | pass | T7-LH1-T7-LH5/T7-TR    |
| error/retry       | API 메시지·focus 가능한 native retry·동일 GET 재요청·local fallback 복귀       | pass | T7-TR                  |
| visual/CJK review | 독립 reviewer 2개 모두 PASS; 기존 Hero 줄바꿈은 Todo 7 귀속 아님               | pass | T7-IMG1-T7-IMG4/B-IMG1 |

결정은 **keep**이다. mandatory semantic contract가 전부 통과했고 LCP median
`6913.341ms`는 `6711.6814-7251.28685ms` 중간이라 timing은 **inconclusive**다.
사전 규칙상 inconclusive timing만으로는 revert하지 않는다. Todo 8 전까지 final Todo 7
source SHA는 `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd`다.

### 이미지 candidate audit

기존 Before와 Todo 7 evidence를 독립 재검증했으며 Before dataset을 다시 측정하거나
수정하지 않았다. supporting protocol의 DPR 1은 고정 조건이지만 T7 trace 자체에 직렬화된
값은 아니다.

| 시점   | CSS 표시 크기                                             | DPR                                                  | intrinsic/request candidate         | format  | compression                     | resource/transfer bytes   | quality·crop                                                   | CLS     | evidence ID                                       |
| ------ | --------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- | ------- | ------------------------------- | ------------------------- | -------------------------------------------------------------- | ------- | ------------------------------------------------- |
| Before | desktop `1104×621`; tablet `720×405`; mobile `327×408.75` | supporting protocol `1`; trace에는 독립 직렬화 안 됨 | raw original `3840×2160`, no srcset | JPEG    | HAR content `0` (B-HHAR/T8-AUD) | `7,545,239` / `7,545,525` | numeric quality unavailable; object-cover; mobile `56% center` | `0`     | B-HHAR/T7-LH1-T7-LH5/T7-TR/T7-IMG2/T7-IMG4/T8-AUD |
| After  | Pending                                                   | Pending                                              | Pending                             | Pending | Pending                         | Pending                   | Pending                                                        | Pending | Pending                                           |

Before의 HAR content `compression = 0`은 transport/body-size accounting 값이며 numeric
JPEG encoder quality 값이 아니다. JPEG encoder quality는 계속 unavailable이다 (B-HHAR/T8-AUD).

desktop DPR 1의 pixel-area oversize는
`(3840 × 2160) / (1104 × 621) = 12.098299×`다. 따라서 Todo 8의 conditional source-change
gate는 **met**이다. tablet/mobile 비율과 단위 구분, raw URL, resource/transfer byte 교차
검증은 T8-AUD에 기록했다.

### Todo 8 predeclared responsive-candidate decision

- 가설: 현재 page content width보다 큰 raw `3840×2160` JPEG 요청을 responsive Next Image
  candidate로 바꾸면 브라우저가 실제 rendered width/DPR에 적절한 optimizer candidate를
  선택하고 transfer bytes를 실질적으로 줄일 수 있다. LCP 개선은 예측하거나 주장하지 않는다.
- 가장 작은 source 실험: raw Hero `<img>`만 Next Image `fill`로 교체하고 `sizes`를
  `(max-width: 1152px) calc(100vw - 48px), 1104px`로 지정한다. 기존 positioned wrapper,
  desktop/tablet `16:9`, mobile `4:5`, `object-cover`, mobile `56% center`, 문구, 시각적 역할,
  `alt=""`를 그대로 유지한다.
- keep threshold: clean committed candidate의 실제 Network 요청이 rendered width/DPR에
  적절한 responsive optimizer candidate이고 transfer bytes가 `7,545,525`보다 실질적으로
  작으며, 기존 geometry·crop·시각적 역할·CLS·접근성·기능이 모두 동일하면 유지한다.
- timing classification: 같은 config의 측정 timing이 기존 noise 안이면
  **inconclusive**다. candidate correctness와 byte threshold를 충족한 경우 timing
  inconclusive만으로는 revert하지 않는다.
- correction/revert threshold: raw/original-size candidate가 계속 선택되거나 transfer byte가
  줄지 않거나, 시각 품질·crop·geometry·CLS·접근성·기능 회귀가 생기면 먼저 정확한 `sizes`와
  primitive 사용을 수정해 재측정한다. 수정 후에도 조건을 충족하지 못하면 별도 revert한다.
- falsification: 실제 optimizer URL·선택 width·DPR·format·resource/transfer bytes가 가설과
  맞지 않거나 보존 계약 중 하나라도 실패하면 현재 구현 가설은 반증된다. After candidate
  row와 keep/fix/revert 결과는 clean candidate 측정 전까지 채우지 않는다.
- scope exclusions: 이 실험에는 priority, preload, `fetchPriority`, `loading`, custom quality,
  format/AVIF 설정, image config, placeholder, art direction 또는 다른 source 변경을 추가하지
  않는다. discovery hint는 Todo 9의 별도 현재-SHA 근거 없이는 다루지 않는다.
- evidence identity: audit source는 Todo 7 final source
  `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd`이며, report `T8-AUD`의 SHA-256은
  `a8f01739d5bdb335f89aae4c58dffb375524b8a46ca768e3dd61c8b2572df1cc`, 크기는
  `18,760` bytes, audit 시각은 `2026-08-05T14:30:22Z`다. 현재 HEAD와 Todo 7 source의
  `src/`·`public/`은 동일함을 재확인했다.

## 상품 목록 여섯 시나리오

각 행에는 시작 cache, 수행 행동, 최종 URL, active query key, 실제 GET, 화면의 product ID,
pending/fetching/error 상태, cancellation, 복구 결과를 기록한다.

| #   | 시나리오                    | 시작 cache | 행동·URL 순서                               | active key/GET                                                                  | 보이는 상태·IDs                                        | 취소·늦은 완료                           | 복구·최종 결과                         | evidence ID    |
| --- | --------------------------- | ---------- | ------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------- | -------------------------------------- | -------------- |
| 1   | cold slow 최초 진입         | empty      | direct `/products?scenario=slow`            | `sort=latest&page=1&pageSize=12&scenario=slow`                                  | loading text → 12 cards                                | 해당 없음                                | GET 200; list replacement CLS 0.017433 | B-PCTR         |
| 2   | warm 뒤 slow 연속 필터 변경 | success    | q intermediate → stanley → home → price-asc | final `q=stanley&category=home&sort=price-asc&page=1&pageSize=12&scenario=slow` | 기존 grid가 loading text로 교체; final IDs p17,p20,p19 | 11 requests 모두 완료; cancellation 없음 | final totalCount 3; page 2 미실행      | B-PRTR/B-PRHAR |
| 3   | cold empty                  | Pending    | Pending                                     | Pending                                                                         | Pending                                                | Pending                                  | Pending                                | Pending        |
| 4   | cold error                  | Pending    | Pending                                     | Pending                                                                         | Pending                                                | Pending                                  | Pending                                | Pending        |
| 5   | warm 뒤 refresh error       | Pending    | Pending                                     | Pending                                                                         | Pending                                                | Pending                                  | Pending                                | Pending        |
| 6   | cold slow 뒤 q 두 번 변경   | Pending    | Pending                                     | Pending                                                                         | Pending                                                | Pending                                  | Pending                                | Pending        |

## Server request와 QueryClient 계약

| 계약                                                | 자동 검증                           | 브라우저·서버 관찰                  | 결과    | 상태    |
| --------------------------------------------------- | ----------------------------------- | ----------------------------------- | ------- | ------- |
| browser request는 same-origin이며 signal을 소비한다 | Pending                             | Pending                             | Pending | pending |
| metadata/body server URL과 options가 동일하다       | Pending                             | Pending                             | Pending | pending |
| server options에는 signal이 없다                    | Pending                             | Pending                             | Pending | pending |
| scenario가 key와 실제 GET에 함께 반영된다           | Vitest 159개 중 contract tests 통과 | home/products HAR에서 slow GET 확인 | 일치    | current |
| `getQueryClient()`는 호출마다 새 인스턴스다         | Pending                             | Pending                             | Pending | pending |

## Metadata와 초기 HTML

### 문서 시나리오

| 문서            | URL·조건 | title   | description | Open Graph | 초기 h1·설명·링크 | 최종 URL | evidence ID | 결과    |
| --------------- | -------- | ------- | ----------- | ---------- | ----------------- | -------- | ----------- | ------- |
| Home normal     | Pending  | Pending | Pending     | Pending    | Pending           | Pending  | Pending     | Pending |
| Products normal | Pending  | Pending | Pending     | Pending    | Pending           | Pending  | Pending     | Pending |
| Products empty  | Pending  | Pending | Pending     | Pending    | Pending           | Pending  | Pending     | Pending |
| Query failure   | Pending  | Pending | Pending     | Pending    | Pending           | Pending  | Pending     | Pending |

### Metadata 보장과 관찰

| 항목                             | 문서화된 보장·설계 | 직접 관찰 | evidence ID | 판정    |
| -------------------------------- | ------------------ | --------- | ----------- | ------- |
| root/page metadata shallow merge | Pending            | Pending   | Pending     | Pending |
| 공통 OG field 유지               | Pending            | Pending   | Pending     | Pending |
| URL 정규화와 query factory 공유  | Pending            | Pending   | Pending     | Pending |
| 정상 empty와 query failure 구분  | Pending            | Pending   | Pending     | Pending |
| 기본 색인 가능 상태              | Pending            | Pending   | Pending     | Pending |

### 응답 시점

| URL     | User-Agent                | time_starttransfer | time_total | source SHA | PID     | evidence ID |
| ------- | ------------------------- | ------------------ | ---------- | ---------- | ------- | ----------- |
| Pending | normal                    | Pending            | Pending    | Pending    | Pending | Pending     |
| Pending | `facebookexternalhit/1.1` | Pending            | Pending    | Pending    | Pending | Pending     |

### 서버 호출 계수

| 측정 branch/SHA | 시작 counter | 행동    | Route Handler 횟수 | Network 상관관계 | 계측 제거·미병합 확인 | evidence ID |
| --------------- | ------------ | ------- | ------------------ | ---------------- | --------------------- | ----------- |
| Pending         | Pending      | Pending | Pending            | Pending          | Pending               | Pending     |

Browser Network만으로 서버 호출 횟수를 판정하지 않는다.

## After

### Lighthouse raw 값

| Run | FCP (ms) | LCP (ms) | CLS     | LCP element/candidate | config parity | evidence ID | 유효 여부·사유 |
| --- | -------- | -------- | ------- | --------------------- | ------------- | ----------- | -------------- |
| 1   | Pending  | Pending  | Pending | Pending               | Pending       | Pending     | Pending        |
| 2   | Pending  | Pending  | Pending | Pending               | Pending       | Pending     | Pending        |
| 3   | Pending  | Pending  | Pending | Pending               | Pending       | Pending     | Pending        |
| 4   | Pending  | Pending  | Pending | Pending               | Pending       | Pending     | Pending        |
| 5   | Pending  | Pending  | Pending | Pending               | Pending       | Pending     | Pending        |

| 지표 | median  | min     | max     | range   |
| ---- | ------- | ------- | ------- | ------- |
| FCP  | Pending | Pending | Pending | Pending |
| LCP  | Pending | Pending | Pending | Pending |
| CLS  | Pending | Pending | Pending | Pending |

### Before/After 비교

| 항목                | Before  | After   | 차이    | Before range 초과 여부 | 판정·인과관계 | evidence ID |
| ------------------- | ------- | ------- | ------- | ---------------------- | ------------- | ----------- |
| FCP median          | Pending | Pending | Pending | Pending                | Pending       | Pending     |
| LCP median          | Pending | Pending | Pending | Pending                | Pending       | Pending     |
| CLS median          | Pending | Pending | Pending | Pending                | Pending       | Pending     |
| LCP longest phase   | Pending | Pending | Pending | 해당 없음              | Pending       | Pending     |
| Hero request start  | Pending | Pending | Pending | 해당 없음              | Pending       | Pending     |
| Hero transfer bytes | Pending | Pending | Pending | 해당 없음              | Pending       | Pending     |

## 회귀 검증

| 범주                | 확인 시나리오                                       | 결과                          | evidence ID            | 상태            |
| ------------------- | --------------------------------------------------- | ----------------------------- | ---------------------- | --------------- |
| Home semantic shell | Header, 하나의 h1, 설명, Hero                       | 통과                          | T7-TR/T7-IMG1-T7-IMG4  | current         |
| Products states     | loading, refresh, empty, error, retry, cancellation | Pending                       | Pending                | pending         |
| URL restoration     | 검색·카테고리·정렬·페이지, 뒤로·앞으로              | Pending                       | Pending                | pending         |
| Commerce state      | cart, wishlist, Header count                        | Pending                       | Pending                | pending         |
| Hydration           | hydration warning과 초기 HTML                       | Todo 7 warning 없음           | T7-TR                  | current-partial |
| CLS                 | Hero fallback과 product list 교체                   | Hero 교체 0; products Pending | T7-LH1-T7-LH5/T7-TR    | current-partial |
| Accessibility       | landmark, heading, link, alt, focus                 | Todo 7 통과                   | T7-TR/T7-IMG1-T7-IMG4  | current-partial |
| Responsive          | desktop `1365 × 768`, mobile `375 × 812`            | Todo 7 통과                   | T7-IMG1-T7-IMG4        | current-partial |
| Image quality       | 시각적 역할, crop, 주요 피사체, 문구                | Todo 7 변경 없음·review PASS  | T7-IMG2/T7-IMG4/B-IMG1 | current-partial |
| FSD                 | 의존 방향, direct-file import, slice 경계           | Todo 7 direct import 유지     | source/tests           | current-partial |

## Advanced A 진입 게이트

Basic 완료 후 아래 네 조건을 모두 충족할 때만 진입한다.

| 조건                                     | Before 데이터 | 충족 여부 | evidence ID |
| ---------------------------------------- | ------------- | --------- | ----------- |
| processing duration이 3회 모두 50ms 이상 | Pending       | Pending   | Pending     |
| median total duration이 200ms 이상       | Pending       | Pending   | Pending     |
| processing duration이 지배적             | Pending       | Pending   | Pending     |
| Profiler가 관계없는 카드 render를 증명   | Pending       | Pending   | Pending     |

- Advanced A 결정: Pending
- 진입하지 않은 경우 이유: Pending
- 진입한 경우 실험·3회 Before/After·Profiler 결과: Pending

## 결정 로그

| 시각                 | source SHA | 관찰한 사실                                                                                       | 가설                                                                                | 반증 방법                                                                                  | 가장 작은 실험                                        | 사전 threshold                                                    | 결과   | keep/revert/reject와 이유              |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------- | ------ | -------------------------------------- |
| 2026-08-04T15:11:59Z | `e2e608b`  | slow query가 shell/Hero insertion을 막고, late discovery 뒤 7.55MB transfer가 별도 병목이다.      | shell boundary 분리로 API 전 semantic shell을 노출할 수 있다.                       | same-run filmstrip/trace에서 API 전 shell, bounds, shifts와 회귀를 확인한다.               | semantic shell + fixed-geometry local fallback만 변경 | semantic contract 전부 통과; timing 분류는 6711.6814/7251.28685ms | locked | source change 전 locked                |
| 2026-08-05T13:15:43Z | `ca2b6a7`  | API 전 shell, viewport별 동일 bounds, Hero replacement shift 0, LCP median 6913.341ms를 관찰했다. | semantic shell 계약은 충족하고 LCP 변화는 noise 안일 것이다.                        | tests·production browser·5회 JSON·독립 visual review로 회귀와 threshold를 확인했다.        | 변경 추가 없음; candidate를 그대로 판정               | semantic contract pass; 6913.341ms는 inconclusive band            | pass   | keep; timing inconclusive              |
| 2026-08-05T14:30:22Z | `ca2b6a7`  | raw 3840×2160 JPEG가 desktop DPR1 target보다 area 12.098299× 크고 7,545,525 bytes를 전송한다.     | accurate sizes의 Next Image가 width/DPR 적합 candidate와 실질적 byte 감소를 만든다. | actual optimizer URL·width·DPR·bytes와 geometry/crop/quality/CLS/a11y/function을 측정한다. | raw Hero `<img>`만 `fill`+accurate `sizes`로 교체     | right-sized candidate+material byte reduction+모든 보존 계약 통과 | locked | source result 아님; 구현·After pending |

## AI 활용

- AI가 도운 부분: 측정 프로토콜과 RFC 기록 틀, baseline source/test 구현, production
  명령 실행, JSON/HAR/trace parsing, 통계·hash 계산.
- 직접 수행한 부분: Chrome Guest profile과 DevTools 조작, Lighthouse/trace/HAR export,
  필터 변경, 화면 관찰.
- Todo 7에서는 사용자가 브라우저 조작까지 위임해 AI가 production Playwright 관찰,
  headed Chrome Lighthouse export, 통계·hash 계산과 시각 reviewer 실행을 수행했다.
- 직접 검토 기준: 과제 checklist, raw artifact, production 재현, 테스트와 회귀 결과.
- AI 제안은 측정 근거와 반증 결과 없이 구현 정답이나 통과 증거로 사용하지 않는다.

## Current와 Pending

### Current

- StartSHA와 작업 시작 전 clean 상태를 기록했다.
- 측정 및 판단을 기록할 RFC 틀을 만들었다.
- 원본 Hero와 home/products diagnostic scenario baseline을 구현하고 자동 검증했다.
- clean BeforeSHA에서 Lighthouse 5회와 Home/products supporting evidence를 수집했다.
- LCP 인과와 Todo 7 semantic-shell 가설·threshold·반증·stop rule을 source 변경 전에 고정했다.
- Todo 7 semantic shell을 `ca2b6a7`로 구현하고 17 files/160 tests, lint/typecheck/build를 통과했다.
- desktop/tablet/mobile에서 API 전 shell, 동일 fallback/final bounds, Hero 교체 shift 0,
  error/retry와 독립 visual review PASS를 확인해 candidate를 유지했다.
- Todo 7 Lighthouse 5회 median은 FCP `226.6705ms`, LCP `6913.341ms`, CLS `0`이며
  LCP timing은 사전 threshold에 따라 inconclusive다.
- 기존 B-HHAR/T7 evidence와 T8-AUD를 독립 검증해 raw `3840×2160` JPEG의 desktop DPR1
  area oversize `12.098299×`와 `7,545,525` transfer bytes를 확인했고 Todo 8 gate를 충족했다.
- Todo 8의 가설, 최소 `fill`+`sizes` 실험, keep/correction/revert/falsification, timing
  classification, scope exclusions를 source 변경 전에 locked 상태로 기록했다.

### Pending

- 상품 목록 여섯 시나리오
- Todo 8 Next Image candidate 구현, clean candidate 측정, After row와 keep/fix/revert 판정
- metadata 문서·응답 시점·서버 호출 계수
- clean BasicAfterSHA와 After Lighthouse 5회
- 기능·접근성·반응형·FSD 회귀 검증
- Advanced A 진입 여부 판정
- 최종 assignment checklist와 artifact manifest 감사

## 과제 체크리스트

이 목록은 `docs/assignments/week-07.md`의 제출 checklist를 진행용으로 옮긴 것이다.
구현만으로 체크하지 않고, RFC 표나 manifest의 실제 근거와 연결된 뒤에만 완료로 바꾼다.

### 0단계 / Before

- [ ] production build에서 같은 조건으로 Before와 After를 측정했는가
- [ ] Before와 After의 SHA를 각각 기록하고, SHA를 제외한 측정 조건을 같게 두었는가
- [ ] FCP·LCP·CLS의 5회 raw 값과 중앙값·최솟값·최댓값을 남겼는가
- [ ] URL, 행동, viewport, throttling, 브라우저·Lighthouse 버전, load 조건과 별도
      브라우저 프로필을 같게 두었는가
- [x] LCP element, waterfall, filmstrip을 함께 확인했는가
- [x] DevTools에서 Layout Shifts와 document·API·image의 URL·전송 크기·요청 시작
      시점을 확인했는가
- [ ] 측정 흔들림보다 큰 변화인지 설명할 수 있는가

### 1단계 / Hero LCP

- [x] 고용량 Hero 원본을 사용한 Before를 먼저 남겼는가
- [x] 이미지 표시 크기·전송 크기·요청 시작 시점과 LCP 구간을 확인했는가
- [ ] Hero의 시각적 역할과 품질을 유지하면서 실제 병목을 줄였는가
- [ ] `next/image` 사용 여부가 아니라 실제 요청과 LCP 결과를 확인했는가
- [x] Header·`h1`·페이지 설명이 느린 Hero와 함께 막히지 않는가
- [x] fallback 교체가 눈에 띄는 layout shift를 만들지 않는가

### 2단계 / 목록과 CLS

- [ ] 데이터 없는 최초 진입, 이전 데이터가 있는 갱신, 성공 + 0건, 최초 실패, 갱신
      실패, 취소 화면을 구분했는가
- [ ] 현재 URL의 active query와 화면 결과가 일치하고, 이전 요청의 늦은 완료가 화면을
      덮지 않는가
- [ ] 취소된 요청을 별도로 관찰했고 오류로 보이지 않게 했는가
- [ ] 서버 응답을 Zustand나 로컬 상태에 복사하지 않았는가
- [ ] fallback과 실제 콘텐츠 교체에서 CLS가 생기지 않는가

### 3단계 / Metadata와 Open Graph

- [ ] Next App Router 서버 metadata 경로에서 `src/app/layout.tsx`, 홈 page, products
      page를 확인했는가
- [ ] JavaScript 실행 전에도 제목·설명·주요 링크와 구조를 확인할 수 있는가
- [ ] 주요 콘텐츠·탐색·상품 영역의 역할이 마크업에 드러나고, `href` 링크와 의미 있는
      이미지의 대체 텍스트가 있는가
- [ ] 루트 title template·공통 Open Graph와 페이지 metadata가 의도대로 합성되는가
- [ ] shallow merge에도 `siteName`·`locale`·`type` 등 공통 Open Graph 필드가
      유지되는가
- [ ] 홈과 목록 metadata가 본문 prefetch와 같은 query factory가 조회한 응답을
      사용했는가
- [ ] 검색어 우선 title, category·sort description, 2페이지 이상 page 번호 규칙을
      지켰는가
- [ ] 정상 empty는 URL 조건·0개를 설명하고 fallback image를 유지하며, query failure는
      root 공통 metadata를 상속하는가
- [ ] metadata와 본문이 같은 query factory·GET URL·options를 사용하는가
- [ ] 서버 `getQueryClient()` 호출마다 새 인스턴스가 만들어지고, 같은 render/request의
      동일 native fetch URL·options만 memoization 대상임을 설명했는가
- [ ] 모든 페이지가 기본 색인 가능 상태를 유지하는가
- [ ] Browser Network만으로 Route Handler 횟수를 판정하지 않고, 서버 측 계수로 확인한
      뒤 계측을 되돌렸는가
- [ ] normal·정상 empty·metadata query failure의 document 증거를 남겼는가
- [ ] `APP_ORIGIN`을 build와 runtime에 같은 값으로 두고, localhost Open Graph URL을
      배포 증거로 쓰지 않았는가
- [ ] 일반 document 요청과 `facebookexternalhit` 요청의 metadata 응답 시점을
      비교했는가

### 4단계 / After와 회귀

- [ ] 같은 조건의 5회 raw 값·중앙값·범위로 Before와 After를 비교했는가
- [ ] 검색·카테고리·정렬·페이지와 뒤로 가기·앞으로 가기가 같은 화면을 복원하는가
- [ ] 장바구니·위시리스트·Header 개수, 로딩·에러·빈 상태·재시도가 유지되는가
- [ ] FSD 의존 방향과 슬라이스 Public API를 우회하지 않았는가
- [ ] 효과가 없거나 악화된 결과도 남겼는가

### Advanced A를 선택한 경우에만

- [ ] Basic을 먼저 완료했는가
- [ ] 24개 카드를 유지한 같은 조건에서 Before와 After를 각각 3회 측정했는가
- [ ] Performance와 Profiler를 각각의 용도에 맞게 사용했는가
- [ ] 관계없는 카드 렌더가 줄고, 필수 계산과 즉각적인 찜 피드백이 유지되는가

### 공통

- [ ] 관찰한 사실, 원인 가설, 반증 방법, 가장 작은 변경을 기록했는가
- [ ] 왜 이렇게 설계했는가를 한 줄 근거로 설명할 수 있는가
- [ ] AI가 만든 부분을 표기하고 직접 검토했는가
- [x] 환경 블록의 `pnpm test`, `pnpm check`가 통과하는가
