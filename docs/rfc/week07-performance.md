# Week 07 성능 측정 RFC

## 기준선과 현재 상태

- StartSHA: `4e53e545863f5ad184137f58569cc0942d405a64`
- StartSHA 확인 명령: `git rev-parse HEAD`
- 작업 시작 전 `git status --porcelain`: 출력 없음
- 현재: Todo 8 responsive candidate는 `f4167e9`의 mobile 품질 실패를 FIX 근거로 보존하고,
  `cee8cf7`의 공식 5회 측정과 viewport별 검증을 locked threshold로 판정해 최종 KEEP했다.
  Todo 9은 같은 `cee8cf7` 공식 trace를 재평가해 optional discovery/priority gate를 닫았고
  source를 변경하지 않았다.
- 대기: 상품 여섯 상태, metadata, Todo 13 hydration 후 Hero 재검증, Basic After와 최종 회귀
  검증이다.

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

| 역할                        | SHA                                        | 작업 트리 | 기록 시점                    | 상태          |
| --------------------------- | ------------------------------------------ | --------- | ---------------------------- | ------------- |
| StartSHA                    | `4e53e545863f5ad184137f58569cc0942d405a64` | clean     | Week 07 작업 시작 전         | current       |
| 프로토콜 문서 체크포인트    | `d3da682`                                  | clean     | RFC 프로토콜 커밋 후         | current       |
| BeforeSHA                   | `e2e608b3c46e1003b44c1919b10906f78f1dc64b` | clean     | baseline Hero 통합 커밋 후   | current       |
| Todo 7 final source SHA     | `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd` | clean     | semantic shell candidate 후  | current       |
| Todo 8 rejected source SHA  | `f4167e9afebb9f2ae93b0d09e158767e2b951a80` | clean     | initial responsive candidate | rejected; FIX |
| Todo 8 final source SHA     | `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c` | clean     | mobile candidate fix 후      | current; KEEP |
| BasicAfterSHA               | Pending                                    | Pending   | 최종 source 검증·커밋 후     | pending       |
| Advanced Before/After SHA   | Pending                                    | Pending   | Advanced A 진입 시           | pending       |
| 최종 evidence 문서 커밋 SHA | Pending                                    | Pending   | RFC와 근거 확정 후           | pending       |

## 환경

| 항목                    | 확인 명령 또는 위치                  | 값                                                                                              | 상태    |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- | ------- |
| Node.js                 | `node --version`                     | `v24.9.0`                                                                                       | current |
| pnpm                    | `pnpm --version`                     | `10.15.1`                                                                                       | current |
| OS                      | `sw_vers`                            | macOS 27.0 (26A5388g)                                                                           | current |
| Chrome 전체 버전        | Chrome executable version            | `150.0.7871.187`                                                                                | current |
| Lighthouse 버전         | Lighthouse 결과 export               | `13.3.0`                                                                                        | current |
| 브라우저 프로필         | 측정 전용, 확장 프로그램 없음        | Chrome Guest profile                                                                            | current |
| 확장 프로그램 상태      | Guest profile                        | 기존 profile 확장 프로그램과 분리                                                               | current |
| APP_ORIGIN              | build/runtime 공통                   | `http://127.0.0.1:3000`                                                                         | current |
| production PID          | Before 측정 서버                     | `53177` (Before 수집 후 종료)                                                                   | current |
| Todo 7 production PID   | candidate 측정 서버                  | `30363` (Todo 7 수집 후 종료·포트 해제 확인)                                                    | current |
| Todo 8 production PID   | final candidate 측정 서버            | wrapper `51823`, listener `51842` (수집 후 종료·포트 해제 확인)                                 | current |
| production 로그 경로    | 서버 시작 후 기록                    | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-server.log` | current |
| `pnpm test`             | Todo 7 source                        | 17 files, 160 tests passed                                                                      | current |
| `pnpm check`            | source 변경 전·BasicAfterSHA 확정 전 | exit 0                                                                                          | current |
| Todo 8 production build | final candidate source               | exit 0; 공식 측정 lifecycle에서 확인                                                            | current |

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

| ID          | 상대 경로                                                                                                                    | SHA-256                                                            | byte 크기 | 캡처 시각                | source SHA                                 | URL                           | 도구·버전             | 프로토콜                                 | 용도·연결된 주장                             | 상태    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------- | ------------------------ | ------------------------------------------ | ----------------------------- | --------------------- | ---------------------------------------- | -------------------------------------------- | ------- |
| B-LH1       | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-1.json`                   | `d69b492eaff22f1b34ec0f38ae4c1e7c9b56bb27e7fc53349901b73e50d269ec` | 466393    | 2026-08-04T13:20:18.971Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | Navigation/Desktop/Performance           | Before raw 1                                 | local   |
| B-LH2       | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-2.json`                   | `69d1b378063d194e045bc75addf7e96b18f9a68b4449c146aeab5aa8b2f37d7e` | 474698    | 2026-08-04T13:30:03.892Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                            | Before raw 2                                 | local   |
| B-LH3       | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-3.json`                   | `cdc26771bc5dfdcfc25f720fe3cda02b49d0c47dcaf6dfc22d9e500bf5abfa75` | 467595    | 2026-08-04T13:32:48.183Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                            | Before raw 3                                 | local   |
| B-LH4       | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-4.json`                   | `e83a967f043f0cfe6c5058f47ca7bf0ae1cb2e05b4b4f36c4662f44b495d2e29` | 428235    | 2026-08-04T13:34:31.388Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                            | Before raw 4                                 | local   |
| B-LH5       | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-5.json`                   | `6fef73195fa7be9b677163ea343d499016c533132082a09c289a31129e33b08a` | 444500    | 2026-08-04T13:38:32.633Z | `e2e608b`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as B-LH1                            | Before raw 5                                 | local   |
| B-HTR       | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-home-performance-trace.json.gz`          | `802d2f63f2fc739440f3ff7d89ab050748a75801575dc8badde98c6d457d20ef` | 705378    | 2026-08-04T14:07:41.430Z | `e2e608b`                                  | `/?scenario=slow`             | Chrome DevTools 150   | 1365×768/DPR1/Slow 4G/CPU4×              | Home insertion, discovery, filmstrip, shifts | local   |
| B-HHAR      | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-home-network.har`                        | `a14231315363dee427d0356376b41f98f9dbac0dda232450005eb0c21fd39554` | 11536130  | 2026-08-04T14:12:58.185Z | `e2e608b`                                  | `/?scenario=slow`             | WebInspector HAR 1.2  | Slow 4G/cache disabled                   | Document/API/Hero waterfall                  | local   |
| B-PCTR      | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-cold-performance-trace.json.gz` | `54c0572c6f972927370580b6befbecf7c90818abec30508424704da317ca3572` | 846954    | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`     | Chrome DevTools 150   | supporting trace                         | Cold pending, product render, CLS            | local   |
| B-PRTR      | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-rapid-filter-trace.json.gz`     | `797423daf09f14035f71d8d62aac080a53164924f5d556f70cf5c0a9e6936d99` | 1900314   | 2026-08-04T14:21:20.490Z | `e2e608b`                                  | `/products?...&scenario=slow` | Chrome DevTools 150   | manual warm interaction                  | No cancellation, repeated shifts             | local   |
| B-PRHAR     | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-rapid-filter.har`               | `ae44e83106d272d38fded4ba6d97e09b7a2a8e80bf81cbdb84536a6960846ea4` | 573887    | 2026-08-04T14:21:26.142Z | `e2e608b`                                  | `/products?...&scenario=slow` | WebInspector HAR 1.2  | Slow 4G/cache disabled                   | 11 completed product requests                | local   |
| B-IMG1      | `docs/images/week07-performance/01-before-lighthouse.png`                                                                    | `0043040f552d82faaeb9fdd6676a3fa82b06dddfd0d42327781e8ba3f9818000` | 140322    | 2026-08-04T13:20:18.971Z | `e2e608b`                                  | `/?scenario=slow`             | selected PNG          | Lighthouse final screenshot              | Original Hero Before                         | tracked |
| B-IMG2      | `docs/images/week07-performance/02-products-initial-pending.png`                                                             | `368251e3954f8d896094feb6f1c1cb28f70329e658bc5d6501a757ea1d1d2bf6` | 12317     | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`     | selected PNG          | trace filmstrip                          | Initial pending                              | tracked |
| B-IMG3      | `docs/images/week07-performance/03-products-loaded.png`                                                                      | `bbb812532a00fd2cdbbc5706719808bfcee9518abc5c5f907335d8988e3ae7a6` | 92864     | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`     | selected PNG          | trace filmstrip                          | Loaded list                                  | tracked |
| T7-LH1      | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-1.json`                    | `c1a7cc7614789460b5d077676a66c2f516a3f47eb0b839e28037d333451ffe69` | 491695    | 2026-08-05T12:56:30.081Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | headed Chrome/config parity              | Todo 7 raw 1                                 | local   |
| T7-LH2      | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-2.json`                    | `c96fe7edaad5ae66cf6fbd51a161e5708b62f9acd201a582486cb3b89d9e2894` | 541685    | 2026-08-05T12:57:20.418Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                           | Todo 7 raw 2                                 | local   |
| T7-LH3      | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-3.json`                    | `031f77408e77d14027a7c29f6cac240da1a04f0afca39078211e22095e2dca87` | 543290    | 2026-08-05T12:57:35.141Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                           | Todo 7 raw 3                                 | local   |
| T7-LH4      | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-4.json`                    | `37a271a38a33d161e5da8266d3c08fe4008778589444cbe5a98c27fbbae7b03d` | 521849    | 2026-08-05T12:57:49.662Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                           | Todo 7 raw 4                                 | local   |
| T7-LH5      | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-5.json`                    | `eec339bc1d3cc7adfd012472a35b96bb0e8a2601b0393ed49b42cc600baac095` | 521670    | 2026-08-05T12:58:08.423Z | `ca2b6a7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T7-LH1                           | Todo 7 raw 5                                 | local   |
| T7-TR       | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-home-playwright-trace.zip`                | `c7c5274485547518f370724ae5abc39cd50691b3255b167980b0bb04f1277268` | 260211    | 2026-08-05T13:01:18.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | Playwright/Chrome 150 | 1365×768/cache off/Slow 4G/CPU4×         | Shell/API/Hero timeline·bounds·shift         | local   |
| T7-IMG1     | `docs/images/week07-performance/04-home-semantic-shell-desktop.png`                                                          | `c097baa436332b58a96f2100a1052d393f53460a7b25e70f3e0448e76e57fdbd` | 21770     | 2026-08-05T12:38:23.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 1365 desktop pending                     | API 전 semantic shell                        | tracked |
| T7-IMG2     | `docs/images/week07-performance/05-home-hero-resolved-desktop.png`                                                           | `b709f9f3ffd95247f54ccbada9cbee13691dfd6129b0e678c6ef260ac602ead4` | 1512074   | 2026-08-05T12:38:25.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 1365 desktop resolved                    | Final Hero 동일 geometry                     | tracked |
| T7-IMG3     | `docs/images/week07-performance/06-home-semantic-shell-mobile.png`                                                           | `6b5582414428c9b7e3fa0a8e74d8015b0fcb20ebf86822678150c4308d5f63f4` | 17962     | 2026-08-05T12:38:25.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 375 mobile pending                       | Mobile semantic shell                        | tracked |
| T7-IMG4     | `docs/images/week07-performance/07-home-hero-resolved-mobile.png`                                                            | `39bb1d36168e9b56cdbf09774c27300ad808ea0bc7d664ffa490b1d2ff777c5e` | 564643    | 2026-08-05T12:38:27.000Z | `ca2b6a7`                                  | `/?scenario=slow`             | selected PNG          | 375 mobile resolved                      | Mobile final Hero 동일 geometry              | tracked |
| T8-AUD      | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo8-candidate-audit.md`                       | `a8f01739d5bdb335f89aae4c58dffb375524b8a46ca768e3dd61c8b2572df1cc` | 18760     | 2026-08-05T14:30:22Z     | `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd` | `/?scenario=slow`             | independent audit     | existing B-HHAR/T7 evidence re-audit     | Todo 8 displayed candidate·oversized gate    | local   |
| T8-R-AUD    | `.local/week07-performance-evidence/f4167e9afebb9f2ae93b0d09e158767e2b951a80/todo8-official-candidate-audit.md`              | `cee6914433e0e3c7850952e852d51e955fb7ef5a0c3987006a22dec56fafdc68` | 15027     | 2026-08-05T15:35:37Z     | `f4167e9afebb9f2ae93b0d09e158767e2b951a80` | `/?scenario=slow`             | independent audit     | production/clean SHA/5 Lighthouse runs   | Rejected candidate FIX decision              | local   |
| T8-F-AUD    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-candidate-audit.md`          | `504e47ce1cd7c118ce34aba1eae4dcf9830fc3069f19b877a03c77f6b4533fc4` | 16568     | 2026-08-05T16:33:23Z     | `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c` | `/?scenario=slow`             | independent audit     | production/clean SHA/final official wave | Todo 8 final KEEP decision                   | local   |
| T8-F-LH1    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-1.json`       | `81d825f01b1439c28f9c3424ce87f302fbecbdd926836e280211e0ba658d0838` | 497866    | 2026-08-05T16:14:50Z     | `cee8cf7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | Todo 7 config parity                     | Todo 8 final raw 1                           | local   |
| T8-F-LH2    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-2.json`       | `99b9858fe0a6542eb751b5ce5854325e100c9bd9a4afbdb9d9bca43cc8e13827` | 497772    | 2026-08-05T16:15:04Z     | `cee8cf7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T8-F-LH1                         | Todo 8 final raw 2                           | local   |
| T8-F-LH3    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-3.json`       | `3a52fe6487233ce11d210d7d3a5feb8e19fff2f5f0930f30773e72107a9c34d2` | 497593    | 2026-08-05T16:15:17Z     | `cee8cf7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T8-F-LH1                         | Todo 8 final raw 3                           | local   |
| T8-F-LH4    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-4.json`       | `bfc543ba822ae3e68a0b3d1410a427571c2152d32bd80abe925bcacca8d882e9` | 497580    | 2026-08-05T16:15:31Z     | `cee8cf7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T8-F-LH1                         | Todo 8 final raw 4                           | local   |
| T8-F-LH5    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-5.json`       | `e2c8b2c193c230ac1641b0af935565413bd848db1a8778e1202a719b1f0c754b` | 497761    | 2026-08-05T16:15:44Z     | `cee8cf7`                                  | `/?scenario=slow`             | Lighthouse 13.3.0     | same as T8-F-LH1                         | Todo 8 final raw 5                           | local   |
| T8-F-TR     | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-home-playwright-trace.zip`   | `61c60e5ff534820ad3f5b3b5746d92b15e5486885916e5f4b4f59eb2a41ca239` | 585407    | 2026-08-05T16:18:05Z     | `cee8cf7`                                  | `/?scenario=slow`             | Playwright/Chrome 150 | 1365×768/DPR1/cache off/Slow 4G/CPU4×    | candidate network·geometry·shift             | local   |
| T8-F-BR     | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-browser-observations.json`   | `b87e911e8982074c6dcbc8f6db69bc4a0111e2612e1aa30b52445ba59d55fd0e` | 4351      | 2026-08-05T16:19:28Z     | `cee8cf7`                                  | `/?scenario=slow`             | Playwright/Chrome 150 | desktop/mobile DPR1/cache disabled       | bounds·sizes·raster·semantics·errors         | local   |
| T8-F-NET    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-network.json`                | `8114751fc8fc98bf8e387f2e9fe70d32947a1aadbc6709b5c899d3ba920c6e48` | 1712      | 2026-08-05T16:19:28Z     | `cee8cf7`                                  | `/?scenario=slow`             | CDP Network           | desktop/mobile cache disabled            | displayed URL·format·resource/transfer bytes | local   |
| T8-F-REV    | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-visual-review-receipts.md`   | `29781c787a5600f935c577fa71a478c93e1d22a0404573086158159ef05359f4` | 2081      | 2026-08-05T16:30:40Z     | `cee8cf7`                                  | `/?scenario=slow`             | independent review    | direct Hero pixel review                 | conflict resolution and final PASS           | local   |
| T9-AUD-CEE8 | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo9-discovery-audit.md`                       | `7a28bd96fd55c4d376ca02ed7a9c924bd9bffd4ee7903e161b8b9021937d3625` | 17394     | 2026-08-06T02:18:21Z     | `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c` | `/?scenario=slow`             | independent audit     | current official trace 재평가            | Todo 9 gate closed; no source change         | local   |
| T8-F-IMG1   | `docs/images/week07-performance/hero-responsive-candidate-desktop.png`                                                       | `5e279316349fbb8c6d9e9b5fabf3aa1347d33a04bda3af9962a024e392e9a0b8` | 1237704   | 2026-08-05T16:18:05Z     | `cee8cf7`                                  | `/?scenario=slow`             | selected PNG          | 1365×768 DPR1 full resolved page         | desktop geometry·crop·quality                | tracked |
| T8-F-IMG2   | `docs/images/week07-performance/hero-responsive-candidate-mobile.png`                                                        | `bd946d1be3e3ef10898919fdd46598094df9931d562e412b4294f269559829cf` | 446524    | 2026-08-05T16:18:07Z     | `cee8cf7`                                  | `/?scenario=slow`             | selected PNG          | 375×812 DPR1 full resolved page          | mobile geometry·crop·quality                 | tracked |

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

| 순서 | 실험                            | 사전 가설                                                                | 판정 threshold                                                                                     | 반증 조건                                                                                       | candidate SHA         | 측정 결과                                                                                                        | 결정·이유                         | evidence ID                                                              |
| ---- | ------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| 1    | semantic shell/loading boundary | API 전 shell+reserved frame, LCP 개선 예측 없음                          | semantic contract 전부 통과; timing은 <6711.6814 improved, >7251.28685 regression                  | API 전 shell 실패, duplicate h1, bounds/shift/hydration/a11y/function regression                | `ca2b6a7`             | shell 계약 통과; LCP 6913.341ms                                                                                  | keep; timing inconclusive         | T7-LH1-T7-LH5/T7-TR/T7-IMG1-T7-IMG4                                      |
| 2    | displayed size/candidate audit  | raw 3840×2160 request is oversized; responsive delivery lowers bytes     | right-sized optimizer candidate+material byte reduction; geometry/crop/CLS/a11y/function unchanged | raw/original-size candidate, no byte reduction, or visual/crop/quality/CLS/function regression  | `f4167e9` → `cee8cf7` | f416 mobile quality fail; cee8 candidates/bytes/preservation pass; FCP inconclusive, LCP directional improvement | FIX then **KEEP**                 | T8-R-AUD/T8-F-AUD/T8-F-LH1-T8-F-LH5/T8-F-TR/T8-F-REV/T8-F-IMG1-T8-F-IMG2 |
| 3    | optional discovery/priority     | 이미 attached된 Hero의 request discovery가 늦다면 hint가 delay를 줄인다. | current-SHA trace가 attachment-before-request와 측정 가능한 discovery wait를 먼저 증명해야 한다.   | Hero가 pending 중 absent이거나 exact insertion이 unavailable해 post-render wait를 증명하지 못함 | 없음                  | resource-load-delay는 dominant지만 API-gated non-existence를 포함; already-attached late discovery는 unproven    | **GATE CLOSED**; no source change | T9-AUD-CEE8/T8-F-TR/T8-F-BR/T8-F-NET/T8-F-LH1-T8-F-LH5                   |

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

| 시점         | CSS 표시 크기                                             | DPR                                                  | intrinsic/request candidate         | format | compression                     | resource/transfer bytes                             | quality·crop                                                   | CLS | evidence ID                                       |
| ------------ | --------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- | ------ | ------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- | --- | ------------------------------------------------- |
| Before       | desktop `1104×621`; tablet `720×405`; mobile `327×408.75` | supporting protocol `1`; trace에는 독립 직렬화 안 됨 | raw original `3840×2160`, no srcset | JPEG   | HAR content `0` (B-HHAR/T8-AUD) | `7,545,239` / `7,545,525`                           | numeric quality unavailable; object-cover; mobile `56% center` | `0` | B-HHAR/T7-LH1-T7-LH5/T7-TR/T7-IMG2/T7-IMG4/T8-AUD |
| Todo 8 final | desktop `1104×621`; mobile `327×408.75`                   | desktop/mobile supporting browser `1`                | desktop `w=1200`; mobile `w=750`    | WebP   | Next optimizer `q=75`           | desktop `80536` / `80965`; mobile `31994` / `32423` | native `1200×675` / `750×422`; crop·quality PASS               | `0` | T8-F-AUD/T8-F-TR/T8-F-IMG1-T8-F-IMG2              |

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

### Todo 8 rejected candidate: `f4167e9`

첫 구현 `f4167e9afebb9f2ae93b0d09e158767e2b951a80`은 clean production SHA에서 candidate와
byte gate는 통과했지만 mobile 품질 보존 계약을 실패해 **FIX**로 판정했다. 이 결과는 최종
candidate에 덮어쓰지 않고 `T8-R-AUD`로 보존한다.

| 항목                          | Desktop                        | Mobile                                                         |
| ----------------------------- | ------------------------------ | -------------------------------------------------------------- |
| viewport / DPR / CSS bounds   | `1365×768` / 1 / `1104×621`    | `375×812` / 1 / `327×408.75`                                   |
| displayed candidate           | `w=1200&q=75`, WebP `1200×675` | `w=384&q=75`, WebP `384×216`                                   |
| resource / CDP transfer bytes | `80,536` / `80,965`            | `9,982` / `10,410`                                             |
| candidate·byte gate           | pass                           | pass                                                           |
| quality gate                  | pass                           | **fail**; 16:9 raster를 4:5 cover box에 확대해 detail이 저하됨 |
| independent review            | desktop blocker 없음           | 두 reviewer 모두 `REVISE`                                      |

`f4167e9`의 Lighthouse median은 FCP `223.1552ms`로 Todo 7 median 대비 `3.5153ms` 낮아
**inconclusive**, LCP `1289.8712ms`로 `5623.4698ms` 낮아 **directional improvement**였고,
CLS는 5/5 `0`이었다. timing 개선이 품질 실패를 상쇄하지 않는다는 locked rule에 따라
revert가 아니라 mobile `sizes` correction 후 재측정을 선택했다 (T8-R-AUD).

### Todo 8 final official result: `cee8cf7`

최종 source는 `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c`다. 공식 sidecar
`T8-F-AUD`는 SHA-256
`504e47ce1cd7c118ce34aba1eae4dcf9830fc3069f19b877a03c77f6b4533fc4`, `16,568`
bytes, UTC timestamp `2026-08-05T16:33:23Z`이며, initial과 매 Lighthouse run 전 tracked
porcelain이 비어 있었다. production build/runtime는 동일
`APP_ORIGIN=http://127.0.0.1:3000`을 사용했고 수집 후 PID와 port 3000이 정리됐다.

다섯 export는 Todo 7 및 rejected wave와 같은 Lighthouse `13.3.0`, Chrome `150`, exact
URL, Navigation/Desktop/Performance only 설정을 사용했다. 실행 flags는
`--form-factor=desktop`, `--screenEmulation.disabled=true`, simulated throttling
`rttMs=40`, `throughputKbps=10240`, `cpuSlowdownMultiplier=1`, extension-disabled incognito다.
authoritative `configSettings`는 `onlyCategories=["performance"]`, `formFactor=desktop`,
disabled `screenEmulation={mobile:true,width:412,height:823,deviceScaleFactor:1.75}`와
throttling `{rttMs:40,throughputKbps:10240,requestLatencyMs:562.5,downloadThroughputKbps:1474.56,uploadThroughputKbps:675,cpuSlowdownMultiplier:1}`로
모두 일치했다. disabled screen-emulation 값은 supporting viewport로 해석하지 않는다.

| Run | FCP (ms) | LCP (ms) | CLS | LCP candidate | config parity | evidence ID |
| --- | -------: | -------: | --: | ------------- | ------------- | ----------- |
| 1   | 213.6218 | 887.2436 |   0 | Hero `img`    | match         | T8-F-LH1    |
| 2   | 211.3606 | 882.7212 |   0 | Hero `img`    | match         | T8-F-LH2    |
| 3   | 208.9861 | 857.9722 |   0 | Hero `img`    | match         | T8-F-LH3    |
| 4   | 208.8470 | 857.6940 |   0 | Hero `img`    | match         | T8-F-LH4    |
| 5   | 209.4302 | 858.8604 |   0 | Hero `img`    | match         | T8-F-LH5    |

LCP candidate는 다섯 run 모두
`body > main.mx-auto > section.relative > img.block`의 Hero image였다.

| 지표 | raw 값 (run 순서)                                  |   median |      min |      max |   range |
| ---- | -------------------------------------------------- | -------: | -------: | -------: | ------: |
| FCP  | `213.6218, 211.3606, 208.9861, 208.8470, 209.4302` | 209.4302 | 208.8470 | 213.6218 |  4.7748 |
| LCP  | `887.2436, 882.7212, 857.9722, 857.6940, 858.8604` | 858.8604 | 857.6940 | 887.2436 | 29.5496 |
| CLS  | `0, 0, 0, 0, 0`                                    |        0 |        0 |        0 |       0 |

| 지표 | Todo 7 median / range | Todo 8 median |   Todo 7 - Todo 8 | locked classification                             |
| ---- | --------------------: | ------------: | ----------------: | ------------------------------------------------- |
| FCP  |    226.6705 / 17.5535 |      209.4302 |   17.2403ms lower | **inconclusive**; `17.2403 <= 17.5535`            |
| LCP  |     6913.341 / 55.107 |      858.8604 | 6054.4806ms lower | **directional improvement**; `6054.4806 > 55.107` |
| CLS  |                 0 / 0 |             0 |                 0 | no change                                         |

FCP는 개선 방향 수치지만 Todo 7 range를 넘지 않았으므로 directional improvement로
주장하지 않는다. LCP만 locked threshold에 따른 directional improvement다
(T8-F-LH1-T8-F-LH5).

| 항목                          | Desktop                                                                | Mobile                                                                | 결과·근거                                                      |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| viewport / DPR                | `1365×768` / 1                                                         | `375×812` / 1                                                         | protocol match; T8-F-BR/T8-F-TR                                |
| CSS bounds                    | `1104×621`                                                             | `327×408.75`                                                          | Todo 7 geometry 유지; T8-F-BR                                  |
| parsed source size            | `1104`                                                                 | `726.66655`                                                           | browser `sizes` parsing; T8-F-BR                               |
| optimizer URL                 | `/_next/image?url=%2Fimages%2Fweek-07%2Fhero-original.jpg&w=1200&q=75` | `/_next/image?url=%2Fimages%2Fweek-07%2Fhero-original.jpg&w=750&q=75` | displayed `currentSrc`; T8-F-BR/T8-F-NET                       |
| format / native raster        | WebP `1200×675`                                                        | WebP `750×422`                                                        | cache-disabled explicit WebP decode; T8-F-BR                   |
| resource / CDP transfer bytes | `80,536` / `80,965`                                                    | `31,994` / `32,423`                                                   | original transfer `7,545,525`보다 material reduction; T8-F-NET |
| DPR1 native coverage          | `1200 >= 1104`, `675 >= 621`                                           | `750 >= 726.66655`, `422 >= 408.75`                                   | no upscale; T8-F-BR                                            |
| object crop                   | `cover`, `50% 50%`                                                     | `cover`, `56% 50%`                                                    | focal position 유지; T8-F-BR                                   |

| 보존 계약                    | 관찰                                                                                  | 결과 | evidence ID                  |
| ---------------------------- | ------------------------------------------------------------------------------------- | ---- | ---------------------------- |
| geometry / crop              | Todo 7 desktop/mobile bounds와 focal composition 동일                                 | pass | T8-F-TR/T8-F-IMG1/T8-F-IMG2  |
| quality / copy               | desktop detail 유지; mobile texture·edge·product detail 복원; 문구와 기존 줄바꿈 동일 | pass | T8-F-REV/T8-F-IMG1/T8-F-IMG2 |
| semantics / accessibility    | desktop/mobile 각각 `main=1`, `h1=1`, decorative `alt=""`                             | pass | T8-F-BR/T8-F-TR              |
| CLS                          | Lighthouse 5/5 `0`; desktop/mobile no-recent-input shift 없음                         | pass | T8-F-LH1-T8-F-LH5/T8-F-TR    |
| errors / function            | console·hydration·page error 없음; Hero와 주변 UI 정상 resolve                        | pass | T8-F-BR/T8-F-TR              |
| responsive candidate / bytes | URL·width·q·format·native coverage·material reduction 전부 충족                       | pass | T8-F-BR/T8-F-NET             |

strict `image-diff`는 JPEG와 WebP의 모든 channel 차이를 세며 사전 acceptance threshold가
없다. 최초 contract review `bg_f53fe1f9`의 `REVISE`는 이 ratio를 perceptual blocker로
사용한 **method mismatch**였으며 숨기지 않고 보존한다. 같은 fresh screenshot을 직접 pixel로
검토한 최종 독립 reviewer `bg_db982583`, `bg_b7b1f09f`는 각각 high-confidence `PASS`, blocker
없음을 반환했다. 따라서 conflicting history는 `T8-F-REV`에서 해소됐고 final visual gate는
PASS다.

최종 판정은 **KEEP**이다. responsive candidate와 material byte reduction, no-upscale,
geometry·crop·quality·copy·semantics·CLS·error·function gate를 모두 통과했다. timing은 별도
분류로 FCP inconclusive, LCP directional improvement, CLS no change다. 이 판정은 Todo 8만
완료하며 Todo 9 priority 실험을 시작하거나 결정하지 않는다.

### Todo 9 current-SHA discovery/priority gate

Todo 8 이후 current source `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c`의 공식 supporting
run과 Lighthouse 5회를 `T9-AUD-CEE8`에서 다시 평가했다. audit 시점 HEAD `ee8ed69`의
`src/`와 `public/` tree는 측정 source와 각각 동일했고, report SHA-256은
`7a28bd96fd55c4d376ca02ed7a9c924bd9bffd4ee7903e161b8b9021937d3625`, 크기는
`17,394` bytes, UTC timestamp는 `2026-08-06T02:18:21Z`다. audit executor
`ses_02d1b2176ffeBVPSmy7JaQtS5R`의 corrected arithmetic과 판정은 independent verifier
`ses_02d16199bffeUV7av3tDSqxhNV`가 high confidence로 재확인했다. 새 browser/server/build나
source 실험은 실행하지 않았다.

동일 supporting run의 navigation clock과 Playwright trace clock은 서로 합치지 않고 다음과
같이 보존한다.

| 사건                      |               document-relative navigation clock | trace/UTC clock과 해석                                                                                      | evidence ID              |
| ------------------------- | -----------------------------------------------: | ----------------------------------------------------------------------------------------------------------- | ------------------------ |
| pending shell 관찰        |                                        `526.5ms` | trace action 종료 `1446.404ms`; Hero absent                                                                 | T8-F-BR/T8-F-TR          |
| home API 시작             |                                     `2030.203ms` | trace monotonic `2970.580ms`; `2026-08-05T16:18:00.942Z`                                                    | T8-F-NET/T8-F-TR         |
| home API 종료             |                         **derived** `3553.546ms` | HAR duration `1523.343ms`를 start에 더한 값일 뿐 직접 관찰한 end event가 아님                               | T8-F-TR/T9-AUD-CEE8      |
| Hero insertion            |                       exact time **unavailable** | `526.5ms` absence 이후이며 attachment wait 종료 전이라는 observation bound만 있음                           | T8-F-BR/T8-F-TR          |
| optimizer request 시작    | `3640.676ms` (CDP), `3641.2ms` (Resource Timing) | trace-network monotonic `4563.977ms`; `2026-08-05T16:18:02.552Z`                                            | T8-F-NET/T8-F-BR/T8-F-TR |
| Hero attachment 최초 확인 |                    대략 `3867.5ms`보다 늦지 않음 | trace action 종료 `4787.401ms`; request start보다 `223.424ms` 뒤인 확인 상한이며 insertion timestamp가 아님 | T8-F-TR/T9-AUD-CEE8      |
| supporting-run LCP        |                                      unavailable | LCP observer나 Chrome Performance LCP event가 없어 다른 Lighthouse run의 값을 삽입하지 않음                 | T8-F-TR/T9-AUD-CEE8      |

API start에서 Hero request start까지는 `1610.473ms`이고, 그중 `1523.343ms`는 HAR duration인
slow API가 차지한다. derived API end와 request start 사이 약 `87.130ms`에는 query resolution,
React commit, element creation, candidate selection, browser scheduling이 함께 포함된다. Hero는
pending 관찰에서 존재하지 않았고 displayed optimizer request는 attachment가 처음 확인되기 전에
시작했다. 따라서 이미 attached된 Hero가 browser discovery를 기다렸다는 구간은 관찰되지 않았다.

별도 Lighthouse 다섯 run의 observed LCP raw 값은 `1707, 1719, 1725, 1749, 1758ms`, median은
`1725ms`다. resource-load-delay median은 `1648.630ms`로 observed LCP median의 약 `95.57%`이며
5/5 run에서 가장 긴 phase다. 이 delay는 **dominant**하지만 intentionally slow API 뒤까지 Hero가
존재하지 않는 시간을 포함한다. 그러므로 browser의 post-render discovery delay를 증명하지 않으며,
resource delay를 irrelevant로 취급하지도 않는다. supporting run과 Lighthouse run은 별도 run이고,
observed phase와 simulated LCP도 서로 합산하거나 같은 값으로 해석하지 않는다.

현재 DOM은 `loading="lazy"`, `fetchPriority="auto"`이고 explicit priority와 preload는 없다.
Lighthouse Network priority는 run 1-2에서 `High`, run 3-5에서 `Low`로 섞여 안정적인 현재 계약이
아니다. initial-document discoverability 부재와 Lighthouse checklist도 진단 근거일 뿐 이미 rendered된
Hero의 late discovery 증거가 아니다.

따라서 literal gate는 **CLOSED**다. preload, Next Image priority, `fetchPriority="high"`, eager
loading source 실험을 하지 않았고 Todo 9 candidate/source commit도 없다. Todo 13의 server
prefetch/hydration은 Hero availability와 insertion/discovery/priority를 바꿀 수 있으므로, hydration
변경 후 fresh current-SHA trace에서 attachment, request start, bytes, priority, LCP phases, CLS를 다시
검증해야 한다. 현재 no-hint 결정은 그 fresh evidence를 선점하지 않는다.

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

| 범주                | 확인 시나리오                                       | 결과                                 | evidence ID                           | 상태            |
| ------------------- | --------------------------------------------------- | ------------------------------------ | ------------------------------------- | --------------- |
| Home semantic shell | Header, 하나의 h1, 설명, Hero                       | Todo 8 final에서도 통과              | T7-TR/T8-F-BR/T8-F-IMG1-T8-F-IMG2     | current         |
| Products states     | loading, refresh, empty, error, retry, cancellation | Pending                              | Pending                               | pending         |
| URL restoration     | 검색·카테고리·정렬·페이지, 뒤로·앞으로              | Pending                              | Pending                               | pending         |
| Commerce state      | cart, wishlist, Header count                        | Pending                              | Pending                               | pending         |
| Hydration           | hydration warning과 초기 HTML                       | Todo 8 final warning 없음            | T8-F-BR/T8-F-TR                       | current-partial |
| CLS                 | Hero fallback과 product list 교체                   | Hero 5/5 `0`; products Pending       | T8-F-LH1-T8-F-LH5/T8-F-TR             | current-partial |
| Accessibility       | landmark, heading, link, alt, focus                 | Hero `main=1`, `h1=1`, `alt=""` 유지 | T8-F-BR/T8-F-TR                       | current-partial |
| Responsive          | desktop `1365 × 768`, mobile `375 × 812`            | Todo 8 bounds/candidate 통과         | T8-F-BR/T8-F-IMG1-T8-F-IMG2           | current-partial |
| Image quality       | 시각적 역할, crop, 주요 피사체, 문구                | f416 REVISE 후 cee8 review PASS      | T8-R-AUD/T8-F-REV/T8-F-IMG1-T8-F-IMG2 | current-partial |
| FSD                 | 의존 방향, direct-file import, slice 경계           | Todo 7 direct import 유지            | source/tests                          | current-partial |

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

| 시각                 | source SHA | 관찰한 사실                                                                                                                           | 가설                                                                                       | 반증 방법                                                                                                    | 가장 작은 실험                                        | 사전 threshold                                                    | 결과   | keep/revert/reject와 이유                                              |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| 2026-08-04T15:11:59Z | `e2e608b`  | slow query가 shell/Hero insertion을 막고, late discovery 뒤 7.55MB transfer가 별도 병목이다.                                          | shell boundary 분리로 API 전 semantic shell을 노출할 수 있다.                              | same-run filmstrip/trace에서 API 전 shell, bounds, shifts와 회귀를 확인한다.                                 | semantic shell + fixed-geometry local fallback만 변경 | semantic contract 전부 통과; timing 분류는 6711.6814/7251.28685ms | locked | source change 전 locked                                                |
| 2026-08-05T13:15:43Z | `ca2b6a7`  | API 전 shell, viewport별 동일 bounds, Hero replacement shift 0, LCP median 6913.341ms를 관찰했다.                                     | semantic shell 계약은 충족하고 LCP 변화는 noise 안일 것이다.                               | tests·production browser·5회 JSON·독립 visual review로 회귀와 threshold를 확인했다.                          | 변경 추가 없음; candidate를 그대로 판정               | semantic contract pass; 6913.341ms는 inconclusive band            | pass   | keep; timing inconclusive                                              |
| 2026-08-05T14:30:22Z | `ca2b6a7`  | raw 3840×2160 JPEG가 desktop DPR1 target보다 area 12.098299× 크고 7,545,525 bytes를 전송한다.                                         | accurate sizes의 Next Image가 width/DPR 적합 candidate와 실질적 byte 감소를 만든다.        | actual optimizer URL·width·DPR·bytes와 geometry/crop/quality/CLS/a11y/function을 측정한다.                   | raw Hero `<img>`만 `fill`+accurate `sizes`로 교체     | right-sized candidate+material byte reduction+모든 보존 계약 통과 | locked | source result 아님; 구현·After pending                                 |
| 2026-08-05T15:33:40Z | `f4167e9`  | desktop `w=1200`은 pass지만 mobile `w=384` 16:9 raster가 4:5 box에서 확대돼 detail이 저하됐고 reviewer 2개가 REVISE했다.              | mobile object-cover source size를 반영하면 byte 절감과 보존 계약을 함께 만족할 수 있다.    | mobile native coverage와 직접 visual review를 clean fix SHA에서 반복한다.                                    | mobile `sizes` branch만 교정                          | candidate·bytes pass여도 quality fail이면 FIX                     | fail   | **FIX**; timing이 아니라 mobile 품질 회귀 때문                         |
| 2026-08-05T16:33:23Z | `cee8cf7`  | desktop `w=1200`, mobile `w=750`이 DPR1을 cover하고 material byte reduction, geometry·quality·semantics·CLS·function gate를 통과했다. | corrected sizes가 locked responsive-delivery 계약을 충족한다.                              | 5회 JSON, Network/native raster, trace, tracked screenshots와 conflicting review resolution을 교차 확인했다. | 변경 추가 없음; fixed candidate 판정                  | candidate+bytes+보존 계약 pass; timing은 range rule로 별도 분류   | pass   | **KEEP**; FCP inconclusive, LCP directional improvement, CLS no change |
| 2026-08-06T02:18:21Z | `cee8cf7`  | resource-load-delay median `1648.630ms`는 dominant지만 pending `526.5ms`에 Hero가 없고 request는 attachment 최초 확인 전에 시작했다.  | already-attached Hero의 late discovery가 증명될 때만 priority hint가 delay를 줄일 수 있다. | exact insertion과 request start 사이의 실제 wait를 fresh current-SHA trace로 관찰해야 한다.                  | source 실험 없음; current trace만 재평가              | attachment-before-request와 측정 가능한 discovery wait 증명       | closed | **GATE CLOSED**; priority/preload/eager candidate와 source commit 없음 |

## AI 활용

- AI가 도운 부분: 측정 프로토콜과 RFC 기록 틀, baseline source/test 구현, production
  명령 실행, JSON/HAR/trace parsing, 통계·hash 계산.
- 직접 수행한 부분: Chrome Guest profile과 DevTools 조작, Lighthouse/trace/HAR export,
  필터 변경, 화면 관찰.
- Todo 7에서는 사용자가 브라우저 조작까지 위임해 AI가 production Playwright 관찰,
  headed Chrome Lighthouse export, 통계·hash 계산과 시각 reviewer 실행을 수행했다.
- Todo 8에서는 AI가 clean committed SHA별 production build/lifecycle, Lighthouse 5회 export,
  Network·native raster·geometry·CLS 관찰, artifact hash 계산과 독립 visual reviewer 조정을
  수행했다. 사용자는 별도 verifier session에서 final evidence와 KEEP 판정을 재확인했다.
- `f4167e9`의 두 REVISE와 `cee8cf7` strict-diff REVISE를 성공 근거에서 제거하지 않았고,
  직접 pixel 검토 receipt와 locked threshold로 각각 FIX 및 method-mismatch resolution을 기록했다.
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
- initial candidate `f4167e9`은 desktop candidate와 byte gate는 통과했지만 mobile
  `w=384` raster의 확대·품질 저하와 독립 reviewer 2개의 REVISE 때문에 FIX로 판정했다.
- fixed source `cee8cf7`의 official Lighthouse 5회는 FCP median `209.4302ms`
  (inconclusive), LCP median `858.8604ms` (directional improvement), CLS `0`이다.
- `cee8cf7`은 desktop `w=1200`/`80,965` transfer bytes, mobile
  `w=750`/`32,423` transfer bytes로 no-upscale와 material reduction을 충족했고,
  geometry·crop·quality·copy·semantics·CLS·error·function gate를 통과해 Todo 8을 KEEP했다.
- official full resolved desktop/mobile screenshots를 descriptive tracked path로 선별하고
  sidecar, raw JSON, trace, Network, reviewer receipt와 함께 manifest했다.
- Todo 8 이후 `cee8cf7` official trace를 다시 평가했다. Lighthouse observed
  resource-load-delay median `1648.630ms`는 observed LCP median `1725ms`의 `95.57%`로
  dominant지만, pending 중 Hero가 absent이고 already-attached late discovery는 증명되지 않았다.
- Todo 9 literal gate를 닫아 preload/priority/`fetchPriority`/eager source 실험과 candidate commit을
  만들지 않았으며 `T9-AUD-CEE8`을 manifest했다.

### Pending

- 상품 목록 여섯 시나리오
- metadata 문서·응답 시점·서버 호출 계수
- Todo 13 server prefetch/hydration 후 fresh current-SHA trace로 Hero
  insertion/discovery/priority/bytes/LCP phases/CLS 재검증
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
- [x] Hero의 시각적 역할과 품질을 유지하면서 실제 병목을 줄였는가
- [x] `next/image` 사용 여부가 아니라 실제 요청과 LCP 결과를 확인했는가
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
- [x] 효과가 없거나 악화된 결과도 남겼는가

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
