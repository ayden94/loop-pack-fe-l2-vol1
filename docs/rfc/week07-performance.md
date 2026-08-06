# Week 07 성능 측정 RFC

## 기준선과 현재 상태

- StartSHA: `4e53e545863f5ad184137f58569cc0942d405a64`
- StartSHA 확인 명령: `git rev-parse HEAD`
- 작업 시작 전 `git status --porcelain`: 출력 없음
- 현재: Todo 8 responsive candidate는 `f4167e9`의 mobile 품질 실패를 FIX 근거로 보존하고,
  `cee8cf7`의 공식 5회 측정과 viewport별 검증을 locked threshold로 판정해 최종 KEEP했다.
  Todo 9은 같은 `cee8cf7` 공식 trace를 재평가해 optional discovery/priority gate를 닫았고
  source를 변경하지 않았다. Todo 10은 source commit `345e13f`와 README correction을 포함한
  clean measured HEAD `e318b924c4776616054b57e47c58da563982271b`에서 browser transport
  cancellation과 latest-result integrity를 확인해 KEEP했다.
- 현재: Todo 11은 final measured source `9a93f21`에서 cache-key metadata만 보존하는 여섯
  상태 구현, 여섯 production recipe, CLS·접근성·시각·quality gate를 봉인된 166-payload
  evidence와 독립 verifier로 확인해 최종 **KEEP**했다. screenshot docs HEAD `4432264`는
  measured source 뒤의 docs-only commit이며 `src/public`은 동일하다.
- 현재: Todo 12는 final source `4a54e50`에서 canonical normalized request/origin,
  browser/server descriptor, native server errors와 per-call QueryClient를 구현했다. 25-payload
  evidence와 independent verifier를 교차 확인해 최종 **KEEP**했다.
- 대기: Todo 13 metadata와 hydration 후 Hero 재검증, Basic After와 최종 회귀 검증이다.

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

| 역할                              | SHA                                        | 작업 트리 | 기록 시점                                               | 상태          |
| --------------------------------- | ------------------------------------------ | --------- | ------------------------------------------------------- | ------------- |
| StartSHA                          | `4e53e545863f5ad184137f58569cc0942d405a64` | clean     | Week 07 작업 시작 전                                    | current       |
| 프로토콜 문서 체크포인트          | `d3da682`                                  | clean     | RFC 프로토콜 커밋 후                                    | current       |
| BeforeSHA                         | `e2e608b3c46e1003b44c1919b10906f78f1dc64b` | clean     | baseline Hero 통합 커밋 후                              | current       |
| Todo 7 final source SHA           | `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd` | clean     | semantic shell candidate 후                             | current       |
| Todo 8 rejected source SHA        | `f4167e9afebb9f2ae93b0d09e158767e2b951a80` | clean     | initial responsive candidate                            | rejected; FIX |
| Todo 8 final source SHA           | `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c` | clean     | mobile candidate fix 후                                 | current; KEEP |
| Todo 10 final source/measured SHA | `e318b924c4776616054b57e47c58da563982271b` | clean     | source `345e13f`와 README correction 후 production 측정 | current; KEEP |
| Todo 11 final measured source SHA | `9a93f21b4b0bd0f322f1accaae0319b702de4aa3` | clean     | 여섯 상태 구현·test 완료 후 production 측정             | current; KEEP |
| Todo 11 screenshot docs HEAD      | `4432264f8877e1ee825b5a377b62a6b8582e0601` | clean     | tracked screenshot 08-13 canonicalization 후            | current       |
| Todo 11 result commit SHA         | `d2f0bea19b21f4d9bb7475ba78235d085d45ba04` | clean     | 최초 Todo 11 결과 docs-only commit                      | corrected     |
| Todo 11 evidence correction SHA   | Pending                                    | Pending   | expanded evidence를 기록하는 이 docs-only commit 후     | pending       |
| Todo 12 final source SHA          | `4a54e5077fcb3fe7d62aecd0e38a118e6667f7f5` | clean     | request/origin/server fetch/QueryClient 구현 후         | current; KEEP |
| Todo 12 result commit SHA         | Pending                                    | clean     | Todo 12 결과를 기록하는 이 docs-only commit 후          | pending       |
| BasicAfterSHA                     | Pending                                    | Pending   | 최종 source 검증·커밋 후                                | pending       |
| Advanced Before/After SHA         | Pending                                    | Pending   | Advanced A 진입 시                                      | pending       |
| 최종 evidence 문서 커밋 SHA       | Pending                                    | Pending   | RFC와 근거 확정 후                                      | pending       |

## 환경

| 항목                    | 확인 명령 또는 위치                               | 값                                                                                              | 상태    |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| Node.js                 | `node --version`                                  | `v24.9.0`                                                                                       | current |
| pnpm                    | `pnpm --version`                                  | `10.15.1`                                                                                       | current |
| OS                      | `sw_vers`                                         | macOS 27.0 (26A5388g)                                                                           | current |
| Chrome 전체 버전        | Chrome executable version                         | `150.0.7871.187`                                                                                | current |
| Lighthouse 버전         | Lighthouse 결과 export                            | `13.3.0`                                                                                        | current |
| 브라우저 프로필         | 측정 전용, 확장 프로그램 없음                     | Chrome Guest profile                                                                            | current |
| 확장 프로그램 상태      | Guest profile                                     | 기존 profile 확장 프로그램과 분리                                                               | current |
| APP_ORIGIN              | build/runtime 공통                                | `http://127.0.0.1:3000`                                                                         | current |
| production PID          | Before 측정 서버                                  | `53177` (Before 수집 후 종료)                                                                   | current |
| Todo 7 production PID   | candidate 측정 서버                               | `30363` (Todo 7 수집 후 종료·포트 해제 확인)                                                    | current |
| Todo 8 production PID   | final candidate 측정 서버                         | wrapper `51823`, listener `51842` (수집 후 종료·포트 해제 확인)                                 | current |
| production 로그 경로    | 서버 시작 후 기록                                 | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-server.log` | current |
| `pnpm test`             | Todo 7 source                                     | 17 files, 160 tests passed                                                                      | current |
| `pnpm check`            | source 변경 전·BasicAfterSHA 확정 전              | exit 0                                                                                          | current |
| Todo 8 production build | final candidate source                            | exit 0; 공식 측정 lifecycle에서 확인                                                            | current |
| Todo 10 production PID  | measured candidate                                | launcher `12127`, shell `12138`, Next `12160` (수집 후 종료·포트 해제 확인)                     | current |
| Todo 10 focused tests   | `ProductRepository`/`ProductService`              | 2 files, 44 tests passed                                                                        | current |
| Todo 10 `pnpm check`    | measured candidate                                | 17 files, 172 tests; lint, typecheck, production build 모두 exit 0                              | current |
| Todo 10 추가 gate       | measured candidate                                | `pnpm format:check`와 changed TS 4개 LSP diagnostics 통과                                       | current |
| Todo 11 capture build   | measured candidate                                | build ID `X2a9DoBEJAKOE0ZikmQjj`; 여섯 production recipe                                        | current |
| Todo 11 final gate      | `APP_ORIGIN=http://127.0.0.1:3000 pnpm check`     | exit 0; 23 files, 187 tests; lint, typecheck, build 통과; build ID `JvclqdzlnqNW10u0TFdtg`      | current |
| Todo 11 LSP             | `src`                                             | 50 files, diagnostics 0                                                                         | current |
| Todo 12 baseline        | source `6bcae813cda313a3360e2616819f5ce089ae9da6` | 7 files, 70 tests passed; temporary worktree removed                                            | current |
| Todo 12 final gate      | `APP_ORIGIN=http://127.0.0.1:3000 pnpm check`     | exit 0; 28 files, 227 tests; lint, typecheck, build 통과; build ID `hAZ_keSgirWHxBHrbNqvK`      | current |
| Todo 12 focused/LSP     | 12 focused files / changed source scopes          | 95 tests passed; LSP diagnostics 0                                                              | current |

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

| ID                     | 상대 경로                                                                                                                    | SHA-256                                                            | byte 크기 | 캡처 시각                | source SHA                                 | URL                                  | 도구·버전                 | 프로토콜                                    | 용도·연결된 주장                                          | 상태    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------- | ------------------------ | ------------------------------------------ | ------------------------------------ | ------------------------- | ------------------------------------------- | --------------------------------------------------------- | ------- |
| B-LH1                  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-1.json`                   | `d69b492eaff22f1b34ec0f38ae4c1e7c9b56bb27e7fc53349901b73e50d269ec` | 466393    | 2026-08-04T13:20:18.971Z | `e2e608b`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | Navigation/Desktop/Performance              | Before raw 1                                              | local   |
| B-LH2                  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-2.json`                   | `69d1b378063d194e045bc75addf7e96b18f9a68b4449c146aeab5aa8b2f37d7e` | 474698    | 2026-08-04T13:30:03.892Z | `e2e608b`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as B-LH1                               | Before raw 2                                              | local   |
| B-LH3                  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-3.json`                   | `cdc26771bc5dfdcfc25f720fe3cda02b49d0c47dcaf6dfc22d9e500bf5abfa75` | 467595    | 2026-08-04T13:32:48.183Z | `e2e608b`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as B-LH1                               | Before raw 3                                              | local   |
| B-LH4                  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-4.json`                   | `e83a967f043f0cfe6c5058f47ca7bf0ae1cb2e05b4b4f36c4662f44b495d2e29` | 428235    | 2026-08-04T13:34:31.388Z | `e2e608b`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as B-LH1                               | Before raw 4                                              | local   |
| B-LH5                  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-lighthouse-run-5.json`                   | `6fef73195fa7be9b677163ea343d499016c533132082a09c289a31129e33b08a` | 444500    | 2026-08-04T13:38:32.633Z | `e2e608b`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as B-LH1                               | Before raw 5                                              | local   |
| B-HTR                  | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-home-performance-trace.json.gz`          | `802d2f63f2fc739440f3ff7d89ab050748a75801575dc8badde98c6d457d20ef` | 705378    | 2026-08-04T14:07:41.430Z | `e2e608b`                                  | `/?scenario=slow`                    | Chrome DevTools 150       | 1365×768/DPR1/Slow 4G/CPU4×                 | Home insertion, discovery, filmstrip, shifts              | local   |
| B-HHAR                 | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-home-network.har`                        | `a14231315363dee427d0356376b41f98f9dbac0dda232450005eb0c21fd39554` | 11536130  | 2026-08-04T14:12:58.185Z | `e2e608b`                                  | `/?scenario=slow`                    | WebInspector HAR 1.2      | Slow 4G/cache disabled                      | Document/API/Hero waterfall                               | local   |
| B-PCTR                 | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-cold-performance-trace.json.gz` | `54c0572c6f972927370580b6befbecf7c90818abec30508424704da317ca3572` | 846954    | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`            | Chrome DevTools 150       | supporting trace                            | Cold pending, product render, CLS                         | local   |
| B-PRTR                 | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-rapid-filter-trace.json.gz`     | `797423daf09f14035f71d8d62aac080a53164924f5d556f70cf5c0a9e6936d99` | 1900314   | 2026-08-04T14:21:20.490Z | `e2e608b`                                  | `/products?...&scenario=slow`        | Chrome DevTools 150       | manual warm interaction                     | No cancellation, repeated shifts                          | local   |
| B-PRHAR                | `.local/week07-performance-evidence/e2e608b3c46e1003b44c1919b10906f78f1dc64b/before-products-rapid-filter.har`               | `ae44e83106d272d38fded4ba6d97e09b7a2a8e80bf81cbdb84536a6960846ea4` | 573887    | 2026-08-04T14:21:26.142Z | `e2e608b`                                  | `/products?...&scenario=slow`        | WebInspector HAR 1.2      | Slow 4G/cache disabled                      | 11 completed product requests                             | local   |
| B-IMG1                 | `docs/images/week07-performance/01-before-lighthouse.png`                                                                    | `0043040f552d82faaeb9fdd6676a3fa82b06dddfd0d42327781e8ba3f9818000` | 140322    | 2026-08-04T13:20:18.971Z | `e2e608b`                                  | `/?scenario=slow`                    | selected PNG              | Lighthouse final screenshot                 | Original Hero Before                                      | tracked |
| B-IMG2                 | `docs/images/week07-performance/02-products-initial-pending.png`                                                             | `368251e3954f8d896094feb6f1c1cb28f70329e658bc5d6501a757ea1d1d2bf6` | 12317     | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`            | selected PNG              | trace filmstrip                             | Initial pending                                           | tracked |
| B-IMG3                 | `docs/images/week07-performance/03-products-loaded.png`                                                                      | `bbb812532a00fd2cdbbc5706719808bfcee9518abc5c5f907335d8988e3ae7a6` | 92864     | 2026-08-04T14:17:46.641Z | `e2e608b`                                  | `/products?scenario=slow`            | selected PNG              | trace filmstrip                             | Loaded list                                               | tracked |
| T7-LH1                 | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-1.json`                    | `c1a7cc7614789460b5d077676a66c2f516a3f47eb0b839e28037d333451ffe69` | 491695    | 2026-08-05T12:56:30.081Z | `ca2b6a7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | headed Chrome/config parity                 | Todo 7 raw 1                                              | local   |
| T7-LH2                 | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-2.json`                    | `c96fe7edaad5ae66cf6fbd51a161e5708b62f9acd201a582486cb3b89d9e2894` | 541685    | 2026-08-05T12:57:20.418Z | `ca2b6a7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T7-LH1                              | Todo 7 raw 2                                              | local   |
| T7-LH3                 | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-3.json`                    | `031f77408e77d14027a7c29f6cac240da1a04f0afca39078211e22095e2dca87` | 543290    | 2026-08-05T12:57:35.141Z | `ca2b6a7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T7-LH1                              | Todo 7 raw 3                                              | local   |
| T7-LH4                 | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-4.json`                    | `37a271a38a33d161e5da8266d3c08fe4008778589444cbe5a98c27fbbae7b03d` | 521849    | 2026-08-05T12:57:49.662Z | `ca2b6a7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T7-LH1                              | Todo 7 raw 4                                              | local   |
| T7-LH5                 | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-lighthouse-run-5.json`                    | `eec339bc1d3cc7adfd012472a35b96bb0e8a2601b0393ed49b42cc600baac095` | 521670    | 2026-08-05T12:58:08.423Z | `ca2b6a7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T7-LH1                              | Todo 7 raw 5                                              | local   |
| T7-TR                  | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo7-home-playwright-trace.zip`                | `c7c5274485547518f370724ae5abc39cd50691b3255b167980b0bb04f1277268` | 260211    | 2026-08-05T13:01:18.000Z | `ca2b6a7`                                  | `/?scenario=slow`                    | Playwright/Chrome 150     | 1365×768/cache off/Slow 4G/CPU4×            | Shell/API/Hero timeline·bounds·shift                      | local   |
| T7-IMG1                | `docs/images/week07-performance/04-home-semantic-shell-desktop.png`                                                          | `c097baa436332b58a96f2100a1052d393f53460a7b25e70f3e0448e76e57fdbd` | 21770     | 2026-08-05T12:38:23.000Z | `ca2b6a7`                                  | `/?scenario=slow`                    | selected PNG              | 1365 desktop pending                        | API 전 semantic shell                                     | tracked |
| T7-IMG2                | `docs/images/week07-performance/05-home-hero-resolved-desktop.png`                                                           | `b709f9f3ffd95247f54ccbada9cbee13691dfd6129b0e678c6ef260ac602ead4` | 1512074   | 2026-08-05T12:38:25.000Z | `ca2b6a7`                                  | `/?scenario=slow`                    | selected PNG              | 1365 desktop resolved                       | Final Hero 동일 geometry                                  | tracked |
| T7-IMG3                | `docs/images/week07-performance/06-home-semantic-shell-mobile.png`                                                           | `6b5582414428c9b7e3fa0a8e74d8015b0fcb20ebf86822678150c4308d5f63f4` | 17962     | 2026-08-05T12:38:25.000Z | `ca2b6a7`                                  | `/?scenario=slow`                    | selected PNG              | 375 mobile pending                          | Mobile semantic shell                                     | tracked |
| T7-IMG4                | `docs/images/week07-performance/07-home-hero-resolved-mobile.png`                                                            | `39bb1d36168e9b56cdbf09774c27300ad808ea0bc7d664ffa490b1d2ff777c5e` | 564643    | 2026-08-05T12:38:27.000Z | `ca2b6a7`                                  | `/?scenario=slow`                    | selected PNG              | 375 mobile resolved                         | Mobile final Hero 동일 geometry                           | tracked |
| T8-AUD                 | `.local/week07-performance-evidence/ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd/todo8-candidate-audit.md`                       | `a8f01739d5bdb335f89aae4c58dffb375524b8a46ca768e3dd61c8b2572df1cc` | 18760     | 2026-08-05T14:30:22Z     | `ca2b6a7a461f7a0edbe28585d6a3640c6e2780fd` | `/?scenario=slow`                    | independent audit         | existing B-HHAR/T7 evidence re-audit        | Todo 8 displayed candidate·oversized gate                 | local   |
| T8-R-AUD               | `.local/week07-performance-evidence/f4167e9afebb9f2ae93b0d09e158767e2b951a80/todo8-official-candidate-audit.md`              | `cee6914433e0e3c7850952e852d51e955fb7ef5a0c3987006a22dec56fafdc68` | 15027     | 2026-08-05T15:35:37Z     | `f4167e9afebb9f2ae93b0d09e158767e2b951a80` | `/?scenario=slow`                    | independent audit         | production/clean SHA/5 Lighthouse runs      | Rejected candidate FIX decision                           | local   |
| T8-F-AUD               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-candidate-audit.md`          | `504e47ce1cd7c118ce34aba1eae4dcf9830fc3069f19b877a03c77f6b4533fc4` | 16568     | 2026-08-05T16:33:23Z     | `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c` | `/?scenario=slow`                    | independent audit         | production/clean SHA/final official wave    | Todo 8 final KEEP decision                                | local   |
| T8-F-LH1               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-1.json`       | `81d825f01b1439c28f9c3424ce87f302fbecbdd926836e280211e0ba658d0838` | 497866    | 2026-08-05T16:14:50Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | Todo 7 config parity                        | Todo 8 final raw 1                                        | local   |
| T8-F-LH2               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-2.json`       | `99b9858fe0a6542eb751b5ce5854325e100c9bd9a4afbdb9d9bca43cc8e13827` | 497772    | 2026-08-05T16:15:04Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T8-F-LH1                            | Todo 8 final raw 2                                        | local   |
| T8-F-LH3               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-3.json`       | `3a52fe6487233ce11d210d7d3a5feb8e19fff2f5f0930f30773e72107a9c34d2` | 497593    | 2026-08-05T16:15:17Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T8-F-LH1                            | Todo 8 final raw 3                                        | local   |
| T8-F-LH4               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-4.json`       | `bfc543ba822ae3e68a0b3d1410a427571c2152d32bd80abe925bcacca8d882e9` | 497580    | 2026-08-05T16:15:31Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T8-F-LH1                            | Todo 8 final raw 4                                        | local   |
| T8-F-LH5               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-lighthouse-run-5.json`       | `e2c8b2c193c230ac1641b0af935565413bd848db1a8778e1202a719b1f0c754b` | 497761    | 2026-08-05T16:15:44Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Lighthouse 13.3.0         | same as T8-F-LH1                            | Todo 8 final raw 5                                        | local   |
| T8-F-TR                | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-home-playwright-trace.zip`   | `61c60e5ff534820ad3f5b3b5746d92b15e5486885916e5f4b4f59eb2a41ca239` | 585407    | 2026-08-05T16:18:05Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Playwright/Chrome 150     | 1365×768/DPR1/cache off/Slow 4G/CPU4×       | candidate network·geometry·shift                          | local   |
| T8-F-BR                | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-browser-observations.json`   | `b87e911e8982074c6dcbc8f6db69bc4a0111e2612e1aa30b52445ba59d55fd0e` | 4351      | 2026-08-05T16:19:28Z     | `cee8cf7`                                  | `/?scenario=slow`                    | Playwright/Chrome 150     | desktop/mobile DPR1/cache disabled          | bounds·sizes·raster·semantics·errors                      | local   |
| T8-F-NET               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-network.json`                | `8114751fc8fc98bf8e387f2e9fe70d32947a1aadbc6709b5c899d3ba920c6e48` | 1712      | 2026-08-05T16:19:28Z     | `cee8cf7`                                  | `/?scenario=slow`                    | CDP Network               | desktop/mobile cache disabled               | displayed URL·format·resource/transfer bytes              | local   |
| T8-F-REV               | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo8-fix-official-visual-review-receipts.md`   | `29781c787a5600f935c577fa71a478c93e1d22a0404573086158159ef05359f4` | 2081      | 2026-08-05T16:30:40Z     | `cee8cf7`                                  | `/?scenario=slow`                    | independent review        | direct Hero pixel review                    | conflict resolution and final PASS                        | local   |
| T9-AUD-CEE8            | `.local/week07-performance-evidence/cee8cf7bf1d283048925f49d97fc8ab056f1aa2c/todo9-discovery-audit.md`                       | `af16e4c619e10f5ee3d90fceadba63f9c56a93333923cd5c8889b2672ec1a2f5` | 17912     | 2026-08-05T17:18:21Z     | `cee8cf7bf1d283048925f49d97fc8ab056f1aa2c` | `/?scenario=slow`                    | independent audit         | current official trace 재평가               | Todo 9 gate closed; no source change                      | local   |
| T10-CDP                | `.local/week07-performance-evidence/e318b924c4776616054b57e47c58da563982271b/todo10-cdp-network-events.json`                 | `2126673c06e5cb1613bead273d30e8e9d8feddae50636d4da771443c381f0463` | 2917      | 2026-08-05T18:00:34Z     | `e318b924c4776616054b57e47c58da563982271b` | `/products?...&scenario=slow`        | Chrome 150 CDP Network    | 1365×768/DPR1/cache disabled/cellular 4G    | four raw requests; 3 aborts; final 200                    | local   |
| T10-BR                 | `.local/week07-performance-evidence/e318b924c4776616054b57e47c58da563982271b/todo10-browser-cancellation-report.json`        | `4fd488fb75d71013dca076819ab0c2b2e593d38173caa519f1ba48ca5b1e4bc8` | 2806      | 2026-08-05T18:00:34Z     | `e318b924c4776616054b57e47c58da563982271b` | `/products?...&scenario=slow`        | Chrome 150 browser report | hydration-bounded rapid sequence/post-wait  | URL/key/GET/response/render/error integrity               | local   |
| T10-LOG                | `.local/week07-performance-evidence/e318b924c4776616054b57e47c58da563982271b/todo10-server.log`                              | `0adc84d2f92bd1305ae57bf780810351e8e3fec1c0d2ddb674a76a1c52948f4e` | 259       | 2026-08-05T18:01:39Z     | `e318b924c4776616054b57e47c58da563982271b` | production origin                    | Next.js 16.2.10           | `next start`; expected SIGTERM 143          | production readiness and shutdown log                     | local   |
| T10-EVID               | `.local/week07-performance-evidence/e318b924c4776616054b57e47c58da563982271b/todo10-evidence.md`                             | `99dc76363c036f96d099df8939a61618ccab5a0c699188b6a40c32ff141a4257` | 3297      | 2026-08-05T18:03:17Z     | `e318b924c4776616054b57e47c58da563982271b` | production origin                    | measurement sidecar       | build ID/origin/PIDs/hash/cleanup receipt   | build provenance, robustness, cleanup                     | local   |
| T8-F-IMG1              | `docs/images/week07-performance/hero-responsive-candidate-desktop.png`                                                       | `5e279316349fbb8c6d9e9b5fabf3aa1347d33a04bda3af9962a024e392e9a0b8` | 1237704   | 2026-08-05T16:18:05Z     | `cee8cf7`                                  | `/?scenario=slow`                    | selected PNG              | 1365×768 DPR1 full resolved page            | desktop geometry·crop·quality                             | tracked |
| T8-F-IMG2              | `docs/images/week07-performance/hero-responsive-candidate-mobile.png`                                                        | `bd946d1be3e3ef10898919fdd46598094df9931d562e412b4294f269559829cf` | 446524    | 2026-08-05T16:18:07Z     | `cee8cf7`                                  | `/?scenario=slow`                    | selected PNG              | 375×812 DPR1 full resolved page             | mobile geometry·crop·quality                              | tracked |
| T11-MAN                | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/artifact-manifest.json`                         | `81ad77e29c0898b86d99f1ff4fb9b5353cc7018e60136cd9236eb339fb21a0a7` | 34718     | 2026-08-05T23:14:37.168Z | `9a93f21`                                  | production origin                    | detached SHA-256          | 166 payloads; self-excluded manifest sealed | Todo 11 expanded evidence set                             | local   |
| T11-GATE               | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/gate-receipt.json`                              | `bdd7d2d36be4395ef838b7b2fbab112f83e818bfc9a346ddcc9af1b0b44b8c2d` | 879       | 2026-08-05T22:27:15.929Z | `9a93f21`                                  | production origin                    | pnpm check receipt        | 23 files/187 tests/lint/typecheck/build     | final quality gate                                        | local   |
| T11-R1                 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r1/r1.json`                                     | `5f9b1dbf5baf9691bfba8b324e5be60d8f387decc14341d5b2965ef738327ea7` | 11953     | 2026-08-05T22:05:18.556Z | `9a93f21`                                  | `/products?scenario=slow`            | Chrome 150 recipe report  | cold skeleton, success, responsive, CLS     | recipe 1                                                  | local   |
| T11-R2                 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r2/r2.json`                                     | `8470264367c2897e0f044c2e91fc176da40fc7b589245b39b5372ee5d86e4859` | 9414      | 2026-08-05T22:05:18.557Z | `9a93f21`                                  | `/products?...&scenario=slow`        | Chrome 150 recipe report  | same-document retained transition           | recipe 2                                                  | local   |
| T11-R3                 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r3/r3.json`                                     | `0ea79644e487e6275699f4253dd4e04f914b5103b878897a29a730ec0f115ef9` | 3146      | 2026-08-05T22:05:18.558Z | `9a93f21`                                  | `/products?q=__week07_no_match__`    | Chrome 150 recipe report  | successful empty                            | recipe 3                                                  | local   |
| T11-R4                 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r4/r4.json`                                     | `8c07d34b03e31ce55f8b892326153c7c95322389b99251f29ee9de91ef8f09ea` | 7931      | 2026-08-05T22:05:18.559Z | `9a93f21`                                  | `/products?scenario=error`           | Chrome 150 recipe report  | initial error, retry focus                  | recipe 4                                                  | local   |
| T11-R5                 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r5/r5.json`                                     | `417a5f6a208753646685470963ac5d7c8dee88ee1896b864199063133f50d1eb` | 13760     | 2026-08-05T22:05:18.561Z | `9a93f21`                                  | `/products?q=stanley`                | Chrome 150 recipe report  | retained error, current retry, recovery     | recipe 5                                                  | local   |
| T11-R6                 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r6/r6.json`                                     | `32ca0839e6b24884564906ee29073e837ea5424fd01a389ee1bda492db3bc8db` | 7374      | 2026-08-05T22:05:18.562Z | `9a93f21`                                  | `/products?q=stanley&scenario=slow`  | Chrome 150 recipe report  | cancellation/latest-result integrity        | recipe 6                                                  | local   |
| T11-A11Y               | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/accessibility-summary.json`                     | `46be84c8b5e9a21efa873e1c741ba13f67be18a96f29c2aa4b6ed3bccaeb95ee` | 41747     | 2026-08-05T21:58:18.068Z | `9a93f21`                                  | product recipes                      | Chrome CDP AX/keyboard    | AX trees; 3-viewport keyboard               | automated accessibility evidence                          | local   |
| T11-PROBE              | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/adversarial-probe-receipt.json`                 | `eb25615a81a8e13ce1d64f5db9093af1c3b8a09934e0c74ed28eaedb6f83dd44` | 40736     | 2026-08-05T22:14:59.733Z | `9a93f21`                                  | evidence validator                   | adversarial probes        | fail-closed validator cases                 | validator robustness                                      | local   |
| T11-CORR               | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/todo11-correction-memo.json`                    | `788e1453c757623f0a49cd3f4e01463ab49b112b66c2aa629588a5516f07fe44` | 4847      | 2026-08-05T23:13:43.847Z | `9a93f21`                                  | Todo 11 evidence                     | correction memo           | R1/R5/responsive provenance corrections     | final RFC correction                                      | local   |
| T11-R2-TABLET-768X1024 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r2/tablet/evidence.json`             | `45092b20d39750156064089d00a301d366a68cd1094e8610060c46445bd23673` | 6302      | 2026-08-05T23:00:09.068Z | `9a93f21`                                  | R2 contract                          | Chrome 150 responsive     | 768×1024/DPR1/3 columns                     | R2 retained transition; no-recent 0/CLS 0                 | local   |
| T11-R2-MOBILE-375X812  | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r2/mobile/evidence.json`             | `b5c90543c061690de2f0914382fa7ef69481f889374b08da430ad8f8f5bd71ef` | 6301      | 2026-08-05T23:01:15.167Z | `9a93f21`                                  | R2 contract                          | Chrome 150 responsive     | 375×812/DPR1/2 columns                      | R2 retained transition; no-recent 0/CLS 0                 | local   |
| T11-R3-TABLET-768X1024 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r3/tablet/evidence.json`             | `4d824cd08c1a7582211e5413a379c494f6bb9169aca31eb28f040facaad9d459` | 2445      | 2026-08-05T23:02:39.768Z | `9a93f21`                                  | R3 contract                          | Chrome 150 responsive     | 768×1024/DPR1/3 columns                     | R3 successful empty; no-recent 0/CLS 0                    | local   |
| T11-R3-MOBILE-375X812  | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r3/mobile/evidence.json`             | `c4a5b8ba4c636d5196c85dff18b923414ef95fe561320fd290a15591c0ce950f` | 2444      | 2026-08-05T23:03:31.017Z | `9a93f21`                                  | R3 contract                          | Chrome 150 responsive     | 375×812/DPR1/2 columns                      | R3 successful empty; no-recent 0/CLS 0                    | local   |
| T11-R4-TABLET-768X1024 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r4/tablet/evidence.json`             | `6f64850e503f55940f96884aff6cf59596d62db267e7d8daad43967bb67e47e8` | 3874      | 2026-08-05T23:04:32.368Z | `9a93f21`                                  | R4 contract                          | Chrome 150 responsive     | 768×1024/DPR1/3 columns                     | R4 retry/focus; no-recent 0/CLS 0                         | local   |
| T11-R4-MOBILE-375X812  | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r4/mobile/evidence.json`             | `f2380ff26e310e2017ff2d7b3a855732b9d4810565dc484269f880eff206f275` | 3860      | 2026-08-05T23:06:28.221Z | `9a93f21`                                  | R4 contract                          | Chrome 150 responsive     | 375×812/DPR1/2 columns                      | R4 retry/focus; no-recent 0/CLS 0                         | local   |
| T11-R5-TABLET-768X1024 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r5/tablet/evidence.json`             | `b8118f86e19543a832a9d479d2d544f7aebf68268df72d79d0af620b60059500` | 6522      | 2026-08-05T23:07:29.969Z | `9a93f21`                                  | R5 contract                          | Chrome 150 responsive     | 768×1024/DPR1/3 columns                     | R5 retained error/recovery; no-recent 0/CLS 0             | local   |
| T11-R5-MOBILE-375X812  | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r5/mobile/evidence.json`             | `377f061449932a1ef84a8987e07642ddf5b76261ac53253b65d2de59c1844142` | 6534      | 2026-08-05T23:08:29.417Z | `9a93f21`                                  | R5 contract                          | Chrome 150 responsive     | 375×812/DPR1/2 columns                      | R5 retained error/recovery; no-recent 0/CLS 0             | local   |
| T11-R6-TABLET-768X1024 | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r6/tablet/evidence.json`             | `6828f8e8ed6868c92ca1f1cba1946ec8fc094b528e355fd0be7e8b9c0cc43985` | 3873      | 2026-08-05T23:09:21.481Z | `9a93f21`                                  | R6 contract                          | Chrome 150 responsive     | 768×1024/DPR1/3 columns                     | R6 cancellation/latest; no-recent 0/CLS 0                 | local   |
| T11-R6-MOBILE-375X812  | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/responsive/r6/mobile/evidence.json`             | `7f95c280d27cb6614a17341b7e2d8488aa3ceef545b0475819418b7df5399041` | 3872      | 2026-08-05T23:10:26.285Z | `9a93f21`                                  | R6 contract                          | Chrome 150 responsive     | 375×812/DPR1/2 columns                      | R6 cancellation/latest; no-recent 0/CLS 0                 | local   |
| T11-R5-RECOVERY-LOCAL  | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/r5/r5-recovered.png`                            | `6b4449a713a4a794406764fc2dc3703e51fd96199167251c8d0fa5f41572101c` | 163868    | 2026-08-05T21:42:44.655Z | `9a93f21`                                  | `/products?q=stanley`                | local canonical PNG       | 1365×1446 recovery                          | R5 successful recovery `p19,p20,p17`; no tracked image ID | local   |
| T11-REV-F              | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/reviews/functional.json`                        | `40312ec9adc136d5e1e4208ecde70d8be41ecb4acaff173e1c2edc24cb72e752` | 566       | 2026-08-05T22:11:15.214Z | `9a93f21`                                  | screenshots 08-13                    | independent review        | all 13 local PNGs and canonical images      | functional visual PASS                                    | local   |
| T11-REV-C              | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/reviews/cjk.json`                               | `04797830e4ff396ea53542e8a40c3dcb8b87b775239d52837895d81c7631f37d` | 533       | 2026-08-05T22:11:15.220Z | `9a93f21`                                  | screenshots 08-13                    | independent review        | CJK, geometry, focus, compositing           | CJK visual PASS                                           | local   |
| T11-REV-A              | `.local/week07-performance-evidence/9a93f21b4b0bd0f322f1accaae0319b702de4aa3/reviews/accessibility.json`                     | `191bcc05232892282a2ff44ff92ec6d5cc06cd673a2a14594c62d95b631596ae` | 992       | 2026-08-05T22:00:47.951Z | `9a93f21`                                  | product recipes                      | independent a11y audit    | AX/keyboard evidence review                 | accessibility PASS                                        | local   |
| T11-IMG08              | `docs/images/week07-performance/08-initial-pending.png`                                                                      | `85c06cd16310c8138902133c47a1998b33b35a4f868773f7f8d270d9aca116f9` | 30658     | 2026-08-05T21:45:03.963Z | `9a93f21`                                  | `/products?scenario=slow`            | selected PNG              | 1365×768 cold pending                       | 12-card skeleton                                          | tracked |
| T11-IMG09              | `docs/images/week07-performance/09-refresh-placeholder.png`                                                                  | `714384bdc1f619bca37db6e3796ebd11f585b40eb53322f540915faf3bc4d3ba` | 550739    | 2026-08-05T21:38:21.579Z | `9a93f21`                                  | `/products?...&scenario=slow`        | selected PNG              | retained page-2 transition                  | placeholder grid                                          | tracked |
| T11-IMG10              | `docs/images/week07-performance/10-empty.png`                                                                                | `7b4c5e7b695de04f66f500022465f1c5224ea32e29608d0223aaea10b73705ea` | 28512     | 2026-08-05T21:39:08.644Z | `9a93f21`                                  | `/products?q=__week07_no_match__`    | selected PNG              | real-success empty                          | empty state                                               | tracked |
| T11-IMG11              | `docs/images/week07-performance/11-initial-error.png`                                                                        | `eb591b6c134f9d5f823b390f891137f6b6ca3e181565abbc7d64ad9a7134169a` | 29789     | 2026-08-05T21:41:34.127Z | `9a93f21`                                  | `/products?scenario=error`           | selected PNG              | inline initial error                        | retry state                                               | tracked |
| T11-IMG12              | `docs/images/week07-performance/12-refresh-error.png`                                                                        | `660db7e12a36788a35d0b5a66fc07c24e9463ab079c4a086d4fa5f28f3ddfaab` | 505892    | 2026-08-05T21:42:42.076Z | `9a93f21`                                  | `/products?q=stanley&scenario=error` | selected PNG              | retained refresh error                      | retained grid and retry                                   | tracked |
| T11-IMG13              | `docs/images/week07-performance/13-cancellation.png`                                                                         | `6b4449a713a4a794406764fc2dc3703e51fd96199167251c8d0fa5f41572101c` | 163868    | 2026-08-05T22:02:36.347Z | `9a93f21`                                  | `/products?q=stanley&scenario=slow`  | selected PNG              | latest successful result                    | cancellation final                                        | tracked |

### Todo 11 decisive payload identities

아래 SHA-256은 T11-MAN의 166 payload entry와 일치한다. `process`는 start/stop,
`AX`는 상태별 tree, 마지막 값은 keyboard/layout 순서다.

| ID     | CDP ledger SHA-256                                                 | process start / stop SHA-256                                                                                                            | AX SHA-256                                                                                                                                           | keyboard / layout SHA-256                                                                                                               |
| ------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| T11-R1 | `1d372a8b014bae178adb4d49a8974442b55b8c36773b0bfc22d8e94502327f12` | `d5cb12fa796f203c116135549dbbce7cb87c969df0014360212c5377d46126b3` / `946202b034a3203d8806ca9c02c124191456d41920878358485f21e13357c4fd` | pending `340defb4c18dc8cad41ab149acd69dd0df02d6d6742f4a6b2c38b04c965f2f6b`; final `c2403ece0695e755819d13096abd24ab2d20e358a109ef3d22f6aa3d9cc7a4f1` | `e8344f0c8f822f96887f8c3af55e6e3fe558aad165ff3f4cfad5c6910631cea2` / `ae86dde99b35b76651d20847cef33e2f12edf2b72cdc95b39379a68a5b8f8e75` |
| T11-R2 | `8143926b6036a95eab55625ece654e47d5b200838f9d6d9f18762600ecda744d` | `4d553e38747795523591631f3984d3fbb4141b6028d95291f373085bf5bd48d6` / `80c85792977e7925e04e7ec6e34207b8d6564f7a490d1f8b4e232a75ade234f9` | `5972b8480af5716e3d12476450e82b7922856f35980f8858bd8f9d51bb71abc6`                                                                                   | `873d55a6e0eb424045e3f76b4a2d6d6e2ba09aee1c2c1cf4cc7d789a88d37d72` / `84cdb462d4823329dae5eb14fc6aa349cab385879ba742c9e72c2df878bd9325` |
| T11-R3 | `88c960a03ec622610bf88280a25fc16a4a241c43d01d229d93326e166be954b2` | `c8586a80eee7b388bbbe414042b99f0c5338827d6dd04231fd346193ad11d6d3` / `8a42a369897a09e8ed886c435517980a5799ef5f15777a4ec6aa84cc78c619d8` | `7ca76804e7cffa5b9645a620282bd31ca25c75dda8400b452c36dbfa4b321e5a`                                                                                   | `25d22471b787e87934a44ec650e63b2c4e0966611f4e9e6debd844f2b14ac478` / `84cdb462d4823329dae5eb14fc6aa349cab385879ba742c9e72c2df878bd9325` |
| T11-R4 | `26e10785a731727fa55e211c3993aa7ea658ce6bcd5b94105212147ce9dd8f3a` | `e68c01002207c89dc2de84c153c092c0a30d3a99cee5183758e47344bed3d811` / `5ac5c25c8386e0fad3c2323efeda8fc27f4591a70993ef72c37dffdb136fab38` | before `a5a9d10cf550cdcedfabcc0217a53c0e654a5142f9b589376d139dabfd049879`; after `78130856e10fc4e2d9e4d6b254036325d75230380da1e694307fa70e6a9f7cd6`  | `b803e09c77ad27f2e4025a76b70c8dca09a034f4fc8a849193ba452172e4663c` / `84cdb462d4823329dae5eb14fc6aa349cab385879ba742c9e72c2df878bd9325` |
| T11-R5 | `3abe6d08401ead1ab528044fb072762a321a0e44aa0f1a275bd3d73891e5c44c` | `86e151102b14a37de67d9469430d9a8b78e7505b565e712a0eca99422df462bd` / `8ff820c5d312613bcb55506fed6230ee9adfca9607553080a1b8343c9cd276b3` | error `5cc64d022a0f8712a6e5aa37eb347729df305a82aef9803235b4a6b8497e1269`; final `90ec76c5fae6516f7b0b10fa9d9e2a3c3ac5510e74785d107e13aa2200fe6218`   | `ff095a307e22983ecd77839fbac07fb2f8c333e2b44515e80e921ada1e6a6953` / `84cdb462d4823329dae5eb14fc6aa349cab385879ba742c9e72c2df878bd9325` |
| T11-R6 | `3b9f9426df76c21d2a616e850e74e03db5f598ca078222b080d56fdd43687550` | `06f3251f5443137a5877244a0ed6effaa8717cee39d019c93f2f331e50bad740` / `4080ab0e268a7a611e353bf4aa493a19d408c467847182ee633c49859458abe3` | pending `54752a81c599a2885b86a34eb04c295df3242f0d6bf1d9290171506f78e47f98`; final `a72069a0528f4d582028bd8a734b5cfb4ea7f9618c724180f8d8652561d585b5` | `88caabcb6f21f5c68a27df1bf79f10163131cd49ad0640596b80d6a7de3ebd55` / `84cdb462d4823329dae5eb14fc6aa349cab385879ba742c9e72c2df878bd9325` |

### Todo 12 artifact manifest

evidence root는
`.local/week07-performance-evidence/4a54e5077fcb3fe7d62aecd0e38a118e6667f7f5/todo12/`다.
`evidence-manifest.json`은 retained file set에서 유일하게 self-excluded되며, validator는 실제
directory set이 manifest의 25개 `files`와 이 manifest 하나로 정확히 같아야 통과한다. manifest
SHA-256은 `a988af38aeb0d5367945bd69b325d021be01bbc16c1a8759211a320678cbef80`,
크기는 `5432` bytes, 생성 시각은 `2026-08-06T00:48:11.513Z`다. 아래 UTC는 manifest가
봉인한 각 payload의 exact `mtimeUtc`다.

| ID         | 파일                               | SHA-256                                                            | bytes | UTC                      |
| ---------- | ---------------------------------- | ------------------------------------------------------------------ | ----: | ------------------------ |
| T12-BMETA  | `baseline-focused.metadata.json`   | `1bc7ac57574107308c87063302328a68f8904103f353246a1ffba4cf25fc3656` |   792 | 2026-08-06T00:37:15.056Z |
| T12-BRAW   | `baseline-focused.raw.log`         | `1245cf9a775db41201158108c977e3b07ce843ae156de582877c2420c7813718` | 10946 | 2026-08-06T00:36:30.146Z |
| T12-CDP    | `browser-cdp.raw.json`             | `b48708b24cb67c7a1f8227300600776c2732f5cf7f186db7153b8d5ece0ccc55` |  5840 | 2026-08-06T00:42:57.889Z |
| T12-GMETA  | `current-gates.metadata.json`      | `a1c395b3f5eeb3b26054076a2b4d8ea0534b5cf91a9442c241a153efd214999b` |   798 | 2026-08-06T00:38:23.126Z |
| T12-DMETA  | `driver-execution.metadata.json`   | `6a9da5d821800707d47d98a59e3e86027d2bac314f26bb6d1c068bb20a7a42df` |  1015 | 2026-08-06T00:41:02.854Z |
| T12-DVER   | `driver-version.raw.log`           | `21901d7c29086360588539c1ad5ae38a4d3a0dac72f43b3116605e2a5922e2ee` |    25 | 2026-08-06T00:40:31.784Z |
| T12-DERR   | `driver.stderr.log`                | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |     0 | 2026-08-06T00:40:31.798Z |
| T12-DOUT   | `driver.stdout.json`               | `8b9608bbd17d919ce42a74a15d34d8681fb166920c6844b1becb4660d9dabc11` |  1214 | 2026-08-06T00:40:33.643Z |
| T12-VMETA  | `evidence-validator.metadata.json` | `f1853c46cbed601b82a03b73c4da020fdf9a57460cf93172abedad5f429556b1` |   924 | 2026-08-06T00:46:10.384Z |
| T12-VSRC   | `evidence-validator.source.txt`    | `133fea5d973307479cfdb27326610a10c33a77fc30f95f4f47ba91904e50a553` |  9523 | 2026-08-06T00:47:31.080Z |
| T12-CHECK  | `final-check.log`                  | `a48c8ece644e6d48f5adfb247788d84a815d1edba52528a3ea14b2dfc425dcbe` |  1446 | 2026-08-06T00:39:07.964Z |
| T12-CMETA  | `final-check.metadata.json`        | `b4f257d17112fe5dc79a191f4717446c37e5041e5b7a8f050f5dcfd00bd37fa8` |   470 | 2026-08-06T00:39:45.364Z |
| T12-FRAW   | `focused-current.raw.log`          | `004a25d562429969d2a86e2b7c9d780f607923d0b4d290d7d8c97ac3179954f7` | 13479 | 2026-08-06T00:37:37.179Z |
| T12-FORMAT | `format-current.raw.log`           | `df57c9695502db4b578a7441b85523dec449ad7b36fd1a0699f4d25f79c29d97` |   168 | 2026-08-06T00:37:39.319Z |
| T12-FULL   | `full-test-current.raw.log`        | `c41f78ff5781b6b3b4efc793466a543036afa3aa4619014aad9cf411523dd438` |   325 | 2026-08-06T00:37:38.419Z |
| T12-HEALTH | `health.json`                      | `487a7d6fc457576206403dc81f9aee5fad5c3b42a9df21e22bbcd204141ac126` |  3792 | 2026-08-06T00:40:02.142Z |
| T12-LINT   | `lint-current.raw.log`             | `7c6e2947da1e12c8cc47a9b60ed5f997752648d1e1f1b37f3c532d67e40958c2` |    82 | 2026-08-06T00:37:35.018Z |
| T12-LSP    | `lsp-current.raw.log`              | `40618d6673d540bc8c63b53b45d4291e7cc06042bf388ddbcbf9c52781c36682` |   663 | 2026-08-06T00:38:23.125Z |
| T12-PMETA  | `production-run.metadata.json`     | `b9da93a3b6b3adcc474b7e866858749ac1a123609951600cf27103f8261a78d5` |   685 | 2026-08-06T00:44:07.481Z |
| T12-PLOG   | `production-server.log`            | `ab9f52460b75cbb4f8b1abfe5069fad03180b3092829492b0519f6c4c3edb624` |   117 | 2026-08-06T00:39:53.058Z |
| T12-RMETA  | `red-collection.metadata.json`     | `0769806acbae7cc93696c95b39fdc6a76b629a77cf2488acdcdc9192937147bf` |   659 | 2026-08-06T00:36:09.669Z |
| T12-RRAW   | `red-collection.raw.log`           | `02daed03ed1ff7cf8f987126c1eab21e1560321a06b730f44d2629d7aeff6796` |  4315 | 2026-08-06T00:36:09.662Z |
| T12-DSRC   | `todo12-driver.source.txt`         | `b7355cfb3fb3370b40fdd18890d8a54ea204e0a3a12d6e4c50ef699237a7269b` |  5353 | 2026-08-06T00:36:09.636Z |
| T12-TYPE   | `typecheck-current.raw.log`        | `90641c1a0378233b5d6548b8d1586c2715bb878bc83c69fe6f0a1a89819a411d` |    93 | 2026-08-06T00:37:35.003Z |
| T12-VPROBE | `validator-probes.raw.log`         | `d34776bea2d03fde0f58df99419a73eac1829c40aefd10e0f85ed3257072ae73` |   913 | 2026-08-06T00:47:41.222Z |

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
`af16e4c619e10f5ee3d90fceadba63f9c56a93333923cd5c8889b2672ec1a2f5`, 크기는
`17,912` bytes, UTC timestamp는 `2026-08-05T17:18:21Z`다 (local
`2026-08-06T02:18:21+09:00`). audit executor
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

## Todo 10 browser cancellation

### Pre-source baseline과 가설

- current source `83f189f`의 warm rapid-filter Before에서는 `/api/products` 요청 11개가 모두
  약 1.50-1.60초 뒤 HTTP 200으로 완료됐고 transport cancellation은 없었다
  (B-PRTR/B-PRHAR). 이는 Todo 10 결과가 아니라 source 변경 전 baseline fact다.
- `ProductService.getProductList()`의 browser query function은 현재 TanStack
  `QueryFunctionContext.signal`을 받거나 전달하지 않아 signal을 버리고,
  `ProductRepository.getProductList()`의 Ky GET에도 signal이 없다. 따라서 superseded query의
  상태 격리와 실제 browser transport 중단을 같은 것으로 주장할 수 없다.
- `scenario`는 진단용 `DiagnosticScenario`로 product query key와 실제 GET search params에는
  남아 있지만, 사용자 `ProductListQuery`와 `useProductFilters()` 상태에는 포함되지 않는다. 이
  경계와 key/GET 대응은 실험 전후에 유지한다.
- 가설: products `useQuery`가 사용하는 browser product query에서만 context signal을 Ky의 native
  signal로 소비하면 superseded slow browser transport가 abort된다. 별도 server/metadata product
  query path는 context signal을 무시해 같은 key, URL, GET options를 유지하고 options 객체에 자체
  `signal` property를 만들지 않으므로 이후 동일 server fetch memoization 입력 검증 자격을 보존한다.
- 공식 TanStack Query v5 계약상 query function이 signal을 소비하면 abort 시 query state가 이전
  상태로 되돌아가고, 소비하지 않으면 요청은 완료되어 cache에 남을 수 있다. Suspense query
  cancellation은 지원 대상이 아니므로 `SuspenseQuery`를 쓰는 Home은 이 실험에서 제외하고,
  products `useQuery`만 Todo 10 대상으로 삼는다.

### 가장 작은 실험과 고정 계약

- `ProductService`에 동일한 `queryKeyFactory.product.list()`를 쓰는 browser/server product
  `queryOptions` path를 분리한다. browser `queryFn`만 `{ signal }`을 repository에 전달하고,
  server/metadata `queryFn`은 context signal을 전달하지 않는다.
- `ProductRepository.getProductList()`에는 optional transport signal overlay만 허용한다. signal이
  있을 때만 기존 Ky GET options에 추가하고, 없을 때는 `signal: undefined`조차 생성하지 않는다.
- browser/server path의 query key, products endpoint, method `GET`, q/category/sort/page/pageSize와
  진단 `scenario` search params 및 signal overlay 전 base GET options는 동일해야 한다.
  server/metadata path끼리는 final URL/options도 byte-for-byte 동일하고 own `signal` property가 없어야
  한다. Todo 10은 key나 URL을 cancellation 여부로 분기하지 않는다.
- focused `ProductService`/`ProductRepository` tests로 browser signal identity 전달, server signal
  부재, 양쪽 key와 URL/search params 및 GET options 동일성을 고정한다.
- source candidate 범위는 위 ProductService browser/server queryOptions path,
  ProductRepository optional signal overlay, focused tests, README의 진단 wording 정정뿐이다. 이
  문서 체크포인트에서는 그 source, tests, README를 아직 변경하지 않는다.

### Keep, fix/revert, falsification

- **KEEP**: focused tests가 browser signal propagation, server call의 own `signal` property 부재,
  동일 key와 URL/search params/GET options를 증명해야 한다. clean committed production candidate의
  rapid sequence에서는 superseded browser requests가 Network에서 `(canceled)`/aborted로 관찰되고,
  latest request만 완료되어야 한다. canceled query가 error UI나 unhandled error로 나타나지 않고,
  늦은 stale response가 화면을 덮지 않으며, 최종 URL, active key, GET, visible IDs가 모두
  `q=stanley&category=home&sort=price-asc&page=1&pageSize=12&scenario=slow`과
  `p17,p20,p19`에 맞아야 한다.
- **FIX 후 재측정**: signal이 server/metadata path로 새거나, key/GET/`scenario`가 drift하거나,
  latest request가 취소되거나, canceled request가 error로 노출되거나, stale overwrite 또는
  build/function regression이 생기면 candidate를 유지하지 않고 최소 범위에서 고친다.
- **REVERT**: focused contracts 또는 production rapid sequence를 수정 후에도 만족하지 못하면
  Todo 10 source candidate를 별도 revert하고 baseline path로 돌아간다.
- **가설 반증**: browser signal identity가 transport까지 전달됐는데도 superseded request가 모두
  정상 완료되거나, cancel이 latest result/error/state 계약을 깨면 현재 구현 가설은 반증된다.
  browser cancellation은 Route Handler 실행 중단이나 server execution/call-count 감소의 증거로
  해석하지 않는다.

### Production Network evidence recipe

1. Todo 10 candidate를 commit한 뒤 tracked tree가 clean인지 확인하고 normal production build를
   `APP_ORIGIN=http://127.0.0.1:3000`으로 실행한다. 같은 값을 runtime에도 사용한다.
2. Chrome Guest profile, Responsive `1365 × 768`, DPR `1`, zoom `100%`, Network `Slow 4G`,
   Disable cache on, Preserve log on으로 `/products`를 열어 warm success를 확인한다.
3. Network를 비우고 `/products?q=stanley&scenario=slow` →
   `/products?q=stanley&category=home&scenario=slow` →
   `/products?q=stanley&category=home&sort=price-asc&scenario=slow` 순서로 앞 요청의 완료를
   기다리지 않고 빠르게 적용한다.
4. 각 `/api/products` 행의 시작·종료·status, canceled/aborted 표시, Initiator와 full request URL을
   기록한다. 동시에 각 단계의 browser URL, active query key, 실제 GET, query error 여부와 visible
   product IDs를 기록한다.
5. superseded requests는 canceled/aborted, latest request는 HTTP 200 완료인지 확인하고 최종
   URL/key/GET/IDs가 KEEP 계약과 일치하는지 확인한다. canceled transport가 Route Handler 중단이나
   server call-count 감소를 뜻한다고 기록하지 않는다.

### Scope exclusions와 상태

- Todo 11의 placeholder data, 12-card skeleton, loading/empty/error/refresh-error state redesign을
  시작하지 않는다.
- Todo 12의 canonical `APP_ORIGIN`, canonical request builder, `getQueryClient()`를 추가하지 않는다.
- Todo 13의 prefetch, metadata composition, hydration을 추가하지 않는다.
- Route Handler abort propagation, server execution 중단, server call-count 감소를 구현하거나
  주장하지 않는다. 해당 수치는 Browser Network가 아니라 후속 server-side 계측으로만 판정한다.
- global Stage 0/Basic After는 계속 **Pending**이다. 이 checkpoint는 source mutation 전
  decision lock이며 아래 Todo 10 결과와 구분한다.

### Todo 10 구현과 검증 결과

구현 source commit은 `345e13fd5eaf7813621c7c423b28059f5c7e412a`이고, README의 진단
계약을 바로잡은 뒤 production에서 측정한 clean candidate/HEAD는
`e318b924c4776616054b57e47c58da563982271b`다. 두 commit의 직접 부모 관계와 변경 범위,
required trailer를 확인했다. 구현 commit은 repository/service와 직접 test 2개만, README
commit은 `README.md`만 변경했으며 `src/app`, Home view/Suspense, Route Handler, package/config,
Todo 11-13 범위는 변경하지 않았다.

- browser `getProductList`의 query function은 실제 `QueryFunctionContext.signal`을 받아
  `ProductRepository.getProductList()`에 전달한다. repository는 signal이 정의됐을 때만 기존 Ky
  options 위에 signal을 overlay한다.
- `getServerProductList`는 browser path와 같은 `queryKeyFactory.product.list()`,
  `staleTime: 30_000`, endpoint, GET search params를 사용하지만 repository를 두 인자로 호출한다.
  따라서 signal-free options에는 `signal: undefined`를 포함한 own `signal` property가 없다.
- Home은 기존 `@suspensive/react` local Suspense와 `HomeSearchParams` 경계를 그대로 유지한다.
  README는 `scenario`가 user filter에는 없지만 key/GET에는 포함된다는 점과 browser-only abort의
  추론 한계를 현재 source에 맞게 바로잡았다.
- focused Vitest는 2 files/44 tests, full gate는 17 files/172 tests를 통과했다.
  `pnpm format:check`, lint, typecheck, production build와 changed TS 4개의 LSP diagnostics도
  모두 통과했다. independent verifier `ses_02ce29151fferq5FLLQ8Vo3tal`은 source, tests, raw CDP,
  browser report, hash, cleanup을 재검증하고 high-confidence `confirmed`를 반환했다.

production accepted run은 build ID `dcPg3yoAGxDbu3hDHZb2q`, build timestamp
`2026-08-06T02:54:59+09:00`, `APP_ORIGIN=http://127.0.0.1:3000`, Chrome 150,
`1365 × 768`, DPR 1, cache disabled, cellular 4G CDP profile에서 수행했다. raw chronology는
다음 네 요청만 포함한다.

| 순서 | request ID  | GET 조건                                                                  | terminal event                                       | response | evidence ID    |
| ---- | ----------- | ------------------------------------------------------------------------- | ---------------------------------------------------- | -------- | -------------- |
| 1    | `12991.392` | `sort=latest&page=1&pageSize=12&scenario=slow`                            | `loadingFailed`, `canceled=true`, `net::ERR_ABORTED` | 없음     | T10-CDP        |
| 2    | `12991.397` | `q=stanley&sort=latest&page=1&pageSize=12&scenario=slow`                  | `loadingFailed`, `canceled=true`, `net::ERR_ABORTED` | 없음     | T10-CDP        |
| 3    | `12991.398` | `q=stanley&category=home&sort=latest&page=1&pageSize=12&scenario=slow`    | `loadingFailed`, `canceled=true`, `net::ERR_ABORTED` | 없음     | T10-CDP        |
| 4    | `12991.399` | `q=stanley&category=home&sort=price-asc&page=1&pageSize=12&scenario=slow` | `loadingFinished`                                    | HTTP 200 | T10-CDP/T10-BR |

final request `12991.399`는 exact URL
`http://127.0.0.1:3000/api/products?q=stanley&category=home&sort=price-asc&page=1&pageSize=12&scenario=slow`의
`GET`이다. final browser URL은
`http://127.0.0.1:3000/products?scenario=slow&q=stanley&category=home&sort=price-asc`, active
query key는
`["products","list",{"q":"stanley","category":"home","sort":"price-asc","page":1,"pageSize":12},{"scenario":"slow"}]`다.
response는 `fromDiskCache=false`, `fromServiceWorker=false`이며 response IDs와 rendered IDs가
모두 `p17,p20,p19`로 일치했다. 마지막 response 시각 `17:59:34.487Z`에서 `2.513s` 뒤인
`17:59:37.000Z`까지 기다려 기존 1.5초 response window를 넘긴 post-wait IDs도
`p17,p20,p19`였다. page error, console error, non-empty error alert, stale overwrite는 없었다. 빈
`role=alert` route-announcer node는 raw report에 빈 문자열로 보존했고 query error로 분류하지
않았다 (T10-CDP/T10-BR).

이 관찰은 Ky/native Fetch를 통한 **browser transport abort**만 증명한다. CDP에서 취소된
세 요청에 response가 없다는 사실은 Route Handler 실행 종료나 server execution/call-count 감소를
증명하지 않는다. 해당 server-side 수치는 Todo 12 이후 별도 계측 없이는 계속 주장하지 않는다.
측정 후 launcher/shell/Next PID `12127/12138/12160`은 모두 사라졌고 port 3000 listener도
없었다 (T10-LOG/T10-EVID).

locked KEEP threshold인 browser signal 전달, signal-free server descriptor, key/GET/scenario
보존, 세 superseded transport abort, latest 200과 URL/key/GET/IDs 정합성, no error/stale overwrite,
tests/gates를 모두 충족했다. Todo 10 최종 결정은 **KEEP**이다. 이 결정은 cancellation slice만
완료하며 Todo 11 여섯 상태, Todo 12 canonical server request/per-call QueryClient, Todo 13
metadata/hydration, global Basic After를 완료하지 않는다.

## Todo 11 상품 목록 여섯 상태 pre-source checkpoint

### 기준선과 현재 결함

이 checkpoint의 source baseline은 clean `b123b91`이며 Todo 10 final source/measured tree
`e318b924`의 product 동작을 그대로 포함한다. source를 변경하기 전 다음 사실을 고정한다.

- cold pending은 `상품을 불러오는 중…` 텍스트만 보여 실제 12-card 목록 크기와 image geometry를
  예약하지 않는다. B-PCTR에서 text → list 교체의 CLS `0.017433`을 관찰했다.
- product query에는 `placeholderData`가 없다. key가 바뀌면 `data`가 없어져 grid와
  `totalCount`가 각각 pending text와 `0`으로 바뀔 수 있다.
- current `scenario=error` HTTP 500은 `ApiErrorPolicy.retry`에 따라 한 번 자동 재시도된 뒤,
  global `throwOnError`가 5xx를 throw하므로 `InlineQueryError`가 아니라
  `src/app/products/error.tsx` route boundary로 전달된다. 따라서 current source는 cold/refresh 500을
  inline 상태로 구분하지 못하며, retained grid를 유지한 refresh-error UI도 없다.
- 마지막 non-placeholder success query key를 기억하지 않으므로 current key가 error가 되면 이전
  real-success cache를 명시적으로 찾을 수 없다.
- Todo 10의 browser query cancellation은 동작한다. 세 superseded transport가 abort되고 latest
  request만 200으로 완료됐으며 canceled request는 visible error나 stale overwrite를 만들지 않았다
  (T10-CDP/T10-BR). Todo 11은 이 동작을 보존하며 다시 구현하지 않는다.
- B-PRTR/B-PRHAR의 기존 warm rapid Before는 11 requests가 모두 완료되고 전환마다 grid가 loading
  text로 교체된 기록이다. Todo 10의 isolated cancellation After가 이 Before를 덮어쓰지 않는다.

### Query key와 GET 표기

아래 recipe에서 `K(q, category, sort, page, scenario)`는 정확히 다음 active key를 뜻한다.

```txt
["products", "list", { "q": q, "category": category, "sort": sort, "page": page, "pageSize": 12 }, scenario가 있으면 { "scenario": scenario }, 없으면 {}]
```

`G(...)`는 `/api/products`의 GET이다. GET은 빈 `q`와 `category=all`을 생략하고
`sort`, `page`, `pageSize=12`, 정의된 `scenario`를 포함한다. browser URL, active `K`, 실제
`G`, response IDs, visible IDs는 모든 단계에서 같은 조건을 가리켜야 한다.

### 여섯 상태 정의

| 사용자 상태                                       | TanStack Query v5 판별과 데이터 원본                                                                         | 고정 UI·전이 계약                                                                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 데이터 없는 cold pending                       | `isPending=true`이고 current data와 retained cache data가 모두 없음                                          | 결과 region 안에 fixed 12-card skeleton을 표시한다. 실제 상품명·가격처럼 읽히는 fake content는 만들지 않는다.                                               |
| 2. 이전 데이터가 있는 key 갱신                    | identity `placeholderData`; `status=success`, `isPlaceholderData=true`, `isFetching=true`, `dataUpdatedAt=0` | 이전 real-success grid, `totalCount`, pagination을 유지하고 별도 갱신 중 상태를 표시한다. placeholder는 last-success key를 갱신하지 않는다.                 |
| 3. 성공 + 0건                                     | non-placeholder real success이고 `products.length=0`; `totalCount`는 응답값                                  | error와 구분한 empty 설명을 현재 URL 조건에 연결한다. `totalCount=0`인 no-match와 `totalCount>0`인 빈 page를 구분하고 후자는 count/pagination을 유지한다.   |
| 4. retained cache 없는 initial error              | current key가 error이고 last-success key가 없거나 `queryClient.getQueryData(lastSuccessKey)`가 없음          | grid 대신 현재 error 이유와 native retry button을 표시한다. retry는 error를 낸 current key만 다시 요청한다.                                                 |
| 5. retained cache가 있는 refresh/key-change error | current key가 error이고 last real-success key의 cache lookup이 성공                                          | cached grid, `totalCount`, pagination을 유지하면서 현재 key의 error와 retry를 함께 표시한다. error 문구와 retry 대상은 retained key가 아니라 current key다. |
| 6. superseded request cancellation                | consumed `AbortSignal`로 이전 request가 취소되고 current observer에는 visible query error가 없음             | canceled request를 error/empty로 표시하지 않고 last-success key도 갱신하지 않는다. 늦은 완료나 취소가 current URL/key의 화면을 덮을 수 없다.                |

일반 populated success도 상태 전이 계약의 일부다. 오직 non-placeholder success만 current query key를
last-success key로 갱신한다. successful empty 역시 real success이므로 해당 empty key로 갱신한다.
placeholder, error, cancellation은 갱신하지 않는다. identity placeholder는 v5에서 항상 success이고
`dataUpdatedAt=0`이므로 이전 request의 status나 timestamp를 real success 판별에 재사용하지 않는다.

### 구현 경계

- server response 객체나 products/`totalCount`를 React local state 또는 Zustand에 복사하지 않는다.
  추적을 허용하는 값은 마지막 non-placeholder success의 query-key metadata 하나뿐이다.
- retained data는 render 시 그 key로 `queryClient.getQueryData<ProductListResponse>()`를 호출해
  TanStack cache에서 읽는다. cache miss를 별도 복사본으로 보완하지 않는다.
- product query orchestration과 current/last-success key 선택은 product list view/widget 경계에 둔다.
  여섯 상태 rendering은 `ProductListSection`이 맡고, skeleton은 `ProductGrid` 옆 widget 내부 파일로
  둔다. FSD slice-root barrel을 만들지 않고 현재 direct-file import를 유지한다.
- Todo 11의 browser product-list `useQuery` options에만 `throwOnError: false`를 명시해 cold/refresh
  500을 inline 상태로 돌린다. `ApiErrorPolicy.throwOnError`, provider default, Home/server/metadata query,
  `src/app/products/loading.tsx`와 `error.tsx` route boundary는 변경하지 않는다. 이 override가 없거나
  다른 query로 퍼지면 implementation failure다.
- global retry policy는 유지한다. HTTP 500 한 logical fetch는 initial GET + automatic retry 1회로 최대
  2 GETs다. 사용자가 retry/refetch를 한 번 누르면 current key에 대한 새 logical fetch가 시작되어 다시
  최대 2 GETs를 만든다. 취소된 superseded request에는 automatic retry, manual-retry UI, error count를
  추가하지 않는다.
- `ProductListView`가 client `useSearchParams()`의 read-only `scenario` 값을
  `parseDiagnosticScenario()`로 해석하는 seam을 Todo 11 범위에서 둔다. `scenario`는 계속
  `FilterBar`, `useProductFilters()`와 사용자 filter state에 들어가지 않는다. server prop snapshot에
  의존해 same-document scenario 변경을 놓치는 구현은 허용하지 않는다.
- query key, GET builder, Route Handler의 1.5초 slow delay와 error/empty policy는 변경하지 않는다.
  Todo 10 browser-only signal과 signal-free server path도 그대로 유지한다.

### Skeleton, geometry와 접근성 계약

- skeleton은 항상 12 cards이며 실제 `ProductGrid`와 같은 `grid-cols-2 sm:grid-cols-3
lg:grid-cols-5`, 같은 gap과 card footprint를 쓴다. 각 card의 image placeholder는 실제 card와 같은
  square aspect ratio를 예약한다.
- skeleton subtree는 `aria-hidden="true"`로 숨기고 상품명·가격·button·link 역할이나 fake accessible
  content를 만들지 않는다. 로딩 설명은 결과 region의 실제 status text 하나가 담당한다.
- `aria-label="상품 검색 결과"`인 stable result region은 pending/success/empty/error 사이에 유지한다.
  cold pending, placeholder refresh와 retry fetch 동안 `aria-busy="true"`, settled success/empty/error는
  `false`다. 갱신 실패의 alert와 retry는 retained grid와 같은 region 안에 남는다.
- retry는 focus 가능한 native `button`이며 keyboard Enter/Space, visible focus와 retry 중 중복 실행
  방지를 유지한다. 상태는 색상만으로 구분하지 않는다.
- `1365 × 768` desktop은 5-column, `768 × 1024` tablet은 3-column, `375 × 812` mobile은
  2-column이어야 한다. 세 viewport에서 square image box, content clipping, touch target,
  Tab/Shift+Tab 순서와 screen-reader 불필요 skeleton 제외를 확인한다.
- 12-card skeleton과 result body는 같은 card footprint를 쓴다. sparse success는 부족한 slot을,
  empty와 initial error는 12 slot 전체를 `visibility:hidden`·`aria-hidden="true"`인 non-content geometry
  spacer로 채우고 실제 status/error를 overlay해 12-slot footprint를 유지한다. spacer에는 shimmer,
  text, image, link, button role을 두지 않는다. retained refresh/error는 기존 real cards를 그대로
  유지한다. 따라서 sparse/empty/error settle이 아래 content를 갑자기 끌어올리지 않아야 한다.
- 각 recipe와 세 viewport에서 result replacement에 귀속된 no-recent-input Layout Shift entry가
  **0개**이고 scenario cumulative CLS가 **`<= 0.01`**이어야 PASS다. entry count와 exact cumulative
  CLS 값을 기록한다. 둘 중 하나라도 실패하면 원인 node를 기록하고 geometry를 고친 뒤 affected
  recipe를 다시 실행하며, threshold를 넘은 candidate를 “material하지 않음”으로 해석해 KEEP하지
  않는다.

### Production reset과 공통 기록 규칙

- 각 cold recipe 1, 3, 4, 6 전에 production process를 재시작하고 해당 origin의 cookies,
  local/session storage, Cache Storage와 HTTP cache를 지운 뒤 새 browser context에서 시작한다. 시작
  QueryClient가 새로 생성되는 조건을 만들고 이전 recipe의 탭이나 process를 재사용하지 않는다.
  cache empty는 QueryObserver setup/test receipt가 증명하며 production browser가 private cache를 직접
  관찰했다고 기록하지 않는다.
- warm recipe 2와 5는 같은 recipe 안에서 먼저 `/products` real success를 완료한다. 그 직후 cache를
  지우거나 reload하지 않고, `window.history.pushState`로 아래 exact URL을 적용해 Next client
  `useSearchParams()`와 통합된 same-document transition을 만든다. `page.goto`, document navigation,
  reload 또는 새 browser context로 warm 상태를 흉내 내지 않는다.
- warm transition 전후 `performance.getEntriesByType('navigation')` count와 document identity가
  바뀌지 않고 root provider가 remount되지 않아 같은 QueryClient/cache가 유지되어야 한다. browser는
  no reload와 retained DOM을 관찰하고, focused integration test는 root QueryClient identity와 warm
  cache retention을 증명한다. native `pushState`와 Next search params 연동이 구현에서 성립하지 않으면
  `page.goto`로 대체하지 않고 FIX한다.
- build/runtime는 `APP_ORIGIN=http://127.0.0.1:3000`, production mode, Chrome Guest, viewport
  `1365 × 768`, DPR 1, zoom 100%, cache disabled를 기본으로 한다. responsive 계약은 별도
  `768 × 1024`와 `375 × 812` pass에서도 확인한다.
- 내부 telemetry는 QueryObserver/focused integration tests만 소유한다. 각 transition의
  `status`/`isPending`/`isFetching`/`isPlaceholderData`/`isError`/`dataUpdatedAt`, current key,
  last-success key와 `queryClient.getQueryData()` cache result를 test report에 기록한다. production
  browser evidence가 이 private state를 직접 관찰했다고 주장하지 않는다.
- production browser는 timestamp, visible browser URL, Network method/full GET/status와 automatic/manual
  retry cardinality, canceled terminal event, DOM product IDs/status/error/focus, count/page label과 button
  enabled state, navigation count/document identity, Layout Shift entry와 cumulative CLS만 기록한다.
  active key와 last-success cache의 정합성은 같은 URL/GET/DOM evidence에 대응하는 QueryObserver test가
  담당한다.
- cold reset receipt, source SHA, build ID, PID, browser version, viewport, cache 상태와 cleanup receipt를
  local sidecar에 남긴다. 실패하거나 중단된 run은 accepted evidence에 섞지 않는다.

### 정확한 여섯 production recipes

fixture의 default first page expected IDs는
`p26,p6,p27,p24,p1,p28,p19,p2,p29,p11,p22,p3`다. `q=stanley`의 default latest
IDs는 `p19,p20,p17`, price ascending IDs는 `p17,p20,p19`이며 `totalCount=3`이다.

| #   | reset·시작 cache    | 정확한 action과 URL 순서                                                                                                                                                                                                                                                                                         | 단계별 기대 visible state·IDs                                                                                                                                                                                          | cancellation·recovery와 최종 기대                                                                                                                                                                                                                                                        | evidence |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | cold empty          | direct `/products?scenario=slow`                                                                                                                                                                                                                                                                                 | `K('',all,latest,1,slow)`/`G(sort=latest&page=1&pageSize=12&scenario=slow)`; 12 skeleton 뒤 default 12 IDs                                                                                                             | cancel 없음; 200 real success, `totalCount=30`, last-success=current key                                                                                                                                                                                                                 | `08`     |
| 2   | warm normal success | `/products` success 후 same-document `pushState`로, 앞 완료를 기다리지 않고 `/products?q=stanley&scenario=slow` → `/products?q=stanley&category=home&scenario=slow` → `/products?q=stanley&category=home&sort=price-asc&scenario=slow` → `/products?q=stanley&category=home&sort=price-asc&page=2&scenario=slow` | warm default IDs → 네 slow pending 모두 직전 real-success default IDs를 placeholder로 유지; 첫 세 단계는 retained `totalCount=30`/current page 1, 마지막 단계는 retained `totalCount=30`/current page 2의 `2 / 3` 표시 | 앞 세 slow GET은 abort되고 retry 없음, page-2 GET만 200. final key/GET은 requested page 2를 유지하고 `products=[]`, IDs 없음, `totalCount=3`, `page=2`, label `2 / 1`, 이전 enabled, 다음 disabled; successful empty이므로 last-success=page-2 key. additional navigation entry/reload 0 | `09`     |
| 3   | cold empty          | direct `/products?q=__week07_no_match__`                                                                                                                                                                                                                                                                         | cold skeleton → `K(__week07_no_match__,all,latest,1,none)`의 real-success empty; GET `q=__week07_no_match__&sort=latest&page=1&pageSize=12`; visible IDs 없음, `totalCount=0`                                          | cancel/error 없음; no-match 설명과 current count/page 유지, last-success=current empty key                                                                                                                                                                                               | `10`     |
| 4   | cold empty          | direct `/products?scenario=error`                                                                                                                                                                                                                                                                                | cold skeleton → `K('',all,latest,1,error)`의 GET `sort=latest&page=1&pageSize=12&scenario=error` initial logical fetch; 2 GETs 뒤 inline error, retained grid/IDs 없음                                                 | manual retry 1회는 같은 current key/GET으로 최대 2 GETs를 추가한다. accepted run은 initial 2 + manual 2 = total 4 error GETs, route boundary takeover 없음, retry button focus 유지                                                                                                      | `11`     |
| 5   | warm normal success | `/products` real success → same-document `pushState('/products?q=stanley&scenario=error')`; inline error 뒤 manual retry 1회 → `pushState`로 `scenario=error`만 제거                                                                                                                                             | GET `q=stanley&sort=latest&page=1&pageSize=12&scenario=error` logical fetch의 2 GETs 동안과 settle 뒤 default 12 IDs, `totalCount=30`, page 1 유지; current error는 `K(stanley,all,latest,1,error)`에 연결             | manual retry는 같은 error GET 최대 2개를 추가한다. initial 2 + manual 2 뒤 retained data 유지; recovery normal GET 1개가 200, IDs `p19,p20,p17`, `totalCount=3`, last-success=recovered key. document/root QueryClient 유지                                                              | `12`     |
| 6   | cold empty          | `/products?scenario=slow` 시작 후 완료 전 `/products?q=sta&scenario=slow` → `/products?q=stanley&scenario=slow`                                                                                                                                                                                                  | real success 전에는 매 단계 12 skeleton이며 canceled request를 error로 표시하지 않음. final `K(stanley,all,latest,1,slow)`만 IDs `p19,p20,p17` 표시                                                                    | GET은 차례로 `sort=latest&page=1&pageSize=12&scenario=slow`, `q=sta&sort=latest&page=1&pageSize=12&scenario=slow`, `q=stanley&sort=latest&page=1&pageSize=12&scenario=slow`; 첫 두 GET abort, final 200와 post-wait no overwrite/error, last-success=final key                           | `13`     |

recipe 2의 네 slow 단계는 다음 exact contract로 기록한다. active key는 QueryObserver/focused
integration test의 assertion이며 production browser의 private-state 관찰값으로 기록하지 않는다.

| 단계 | browser URL                                                             | active key                         | GET                                                                       | pending visible IDs | terminal expectation |
| ---- | ----------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------- | ------------------- | -------------------- |
| 1    | `/products?q=stanley&scenario=slow`                                     | `K(stanley,all,latest,1,slow)`     | `q=stanley&sort=latest&page=1&pageSize=12&scenario=slow`                  | warm default 12     | aborted; retry 0     |
| 2    | `/products?q=stanley&category=home&scenario=slow`                       | `K(stanley,home,latest,1,slow)`    | `q=stanley&category=home&sort=latest&page=1&pageSize=12&scenario=slow`    | warm default 12     | aborted; retry 0     |
| 3    | `/products?q=stanley&category=home&sort=price-asc&scenario=slow`        | `K(stanley,home,price-asc,1,slow)` | `q=stanley&category=home&sort=price-asc&page=1&pageSize=12&scenario=slow` | warm default 12     | aborted; retry 0     |
| 4    | `/products?q=stanley&category=home&sort=price-asc&page=2&scenario=slow` | `K(stanley,home,price-asc,2,slow)` | `q=stanley&category=home&sort=price-asc&page=2&pageSize=12&scenario=slow` | warm default 12     | HTTP 200             |

첫 세 request가 real success 전에 취소되므로 last-success key는 warm normal key에 머물고,
placeholder가 observer chain에서 이전 표시 데이터를 전달하더라도 key metadata를 갱신하지 않는다.
final page-2 success만 key를 갱신한다.

page 2 final은 current fixture의 의도적인 out-of-range diagnostic edge다. requested browser URL,
`K(stanley,home,price-asc,2,slow)`와 page-2 GET을 그대로 유지하며 `totalCount=3`, `products=[]`,
label `2 / 1`, 이전 enabled, 다음 disabled를 expected DOM contract로 기록한다. Todo 11에서 URL을
page 1로 clamp/replace하거나 pagination을 재설계하지 않는다. production evidence가 이 current
`FilterBar` 계산과 다르면 기대값을 꾸며 맞추지 않고 FIX/revisit로 표시한다.

### Evidence filename 예약

| 상태·recipe                  | tracked filename                                            | 현재 상태          |
| ---------------------------- | ----------------------------------------------------------- | ------------------ |
| cold initial pending         | `docs/images/week07-performance/08-initial-pending.png`     | current; T11-IMG08 |
| retained placeholder refresh | `docs/images/week07-performance/09-refresh-placeholder.png` | current; T11-IMG09 |
| successful empty             | `docs/images/week07-performance/10-empty.png`               | current; T11-IMG10 |
| initial error                | `docs/images/week07-performance/11-initial-error.png`       | current; T11-IMG11 |
| retained refresh error       | `docs/images/week07-performance/12-refresh-error.png`       | current; T11-IMG12 |
| cancellation/latest result   | `docs/images/week07-performance/13-cancellation.png`        | current; T11-IMG13 |

이 checkpoint를 작성할 당시에는 filename만 예약했고 image, local trace/video, manifest hash와
production 결과를 미리 만들거나 pass로 채우지 않았다. 현재 결과는 아래 accepted evidence에만
기록한다.

### Acceptance evidence ownership

| 계약                                      | acceptance evidence                                                                                                                                                             | 결과 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| six-state internal transition             | QueryObserver tests의 exact flags, current/last-success key, cache lookup과 cancellation transition report                                                                      | PASS |
| product-list-only inline 500 override     | browser product-list options가 `throwOnError:false`임을 증명하는 focused test + provider `ApiErrorPolicy.throwOnError`와 Home/other query가 그대로임을 증명하는 regression test | PASS |
| 500 retry cardinality                     | policy/focused test의 logical fetch당 2 attempts + production Network의 initial 2/manual 2 exact GET count                                                                      | PASS |
| same-document diagnostic scenario seam    | `useSearchParams` scenario parse test + `pushState` integration test의 no document/root-provider remount, same QueryClient identity와 warm cache retention                      | PASS |
| production-visible state and cancellation | URL, Network, DOM IDs/status/focus, no reload, cancellation/retry count와 post-wait receipt; private Query state claim 없음                                                     | PASS |

CLS result는 accepted run 뒤 `total entries`, `no-recent-input entries`, exact cumulative CLS를
구분해 기록한다. 세 viewport 모두 column 계약과 square image geometry도 같은 receipt에서 확인했다.

| viewport             | recipe 1                                                                   | recipe 2                    | recipe 3                    | recipe 4                    | recipe 5                    | recipe 6                    | column result |
| -------------------- | -------------------------------------------------------------------------- | --------------------------- | --------------------------- | --------------------------- | --------------------------- | --------------------------- | ------------- |
| desktop `1365 × 768` | total=15, 모두 recent-input; no-recent=0; CLS=0                            | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | PASS / 5      |
| tablet `768 × 1024`  | combined R1 responsive run total=15, 모두 recent-input; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | PASS / 3      |
| mobile `375 × 812`   | combined R1 responsive run total=15, 모두 recent-input; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | total=0; no-recent=0; CLS=0 | PASS / 2      |

R1의 15개 entry는 viewport별 isolated `entries=0`이 아니라 desktop/tablet/mobile geometry를 확인한
하나의 responsive run 전체에 속하며 모두 recent input이다. R2-R6의 tablet/mobile 값은 각각
`T11-R2-TABLET-768X1024`부터 `T11-R6-MOBILE-375X812`까지 10개 독립 supplemental group의
`layout.json`에서 확인했다. 각 group은 evidence, CDP ledger, layout, process start/stop, server log를
T11-MAN에 함께 manifest했고 responsive validator는 10/10을 accepted했다.

### Todo 11 구현 결과

final measured source는 `9a93f21b4b0bd0f322f1accaae0319b702de4aa3`이며 commit 시각은
`2026-08-05T21:27:30Z`다. tracked screenshot을 canonicalize한 docs HEAD
`4432264f8877e1ee825b5a377b62a6b8582e0601`의 commit 시각은
`2026-08-05T22:03:02Z`이고, 두 지점의 `src/public` diff는 비어 있다. source commit tree는
`0215ad14de89860af28cf42127e92429a1d6c901`, source/current `src` tree는 모두
`78b61e802a7be3b6eae0d7694bfc9af78a064327`, manifested `src/public` evidence tree hash는
`e7b8bd0933e959d0be2783fd9a7cc0c18778f7448bca0ecb0bfe12c5fe55657a`다.
구현·repair·regression test history는 `c8aae00^..9a93f21`에서 보존되며, 실패 evidence를
지우거나 squash하지 않았다.

- browser product-list query options에만 identity `placeholderData`와 `throwOnError: false`를
  적용했다. server product query, Home query, provider `ApiErrorPolicy`, route loading/error boundary는
  바꾸지 않았다.
- 저장하는 값은 마지막 non-placeholder real-success query key와 scope metadata뿐이다. response,
  products, `totalCount`를 local state나 Zustand에 복사하지 않고 retained data는 render 시
  `queryClient.getQueryData()`로 읽는다. 실제 표시 grid는 `displayedDataKey`로 remount한다.
- fixed skeleton은 12 slots, desktop/tablet/mobile 5/3/2 columns, square image geometry이며
  `aria-hidden` subtree 안에 link, button, fake 상품 text가 없다.
- cold pending, retained refresh, successful empty, cold inline error, retained refresh error/current-key
  retry, cancellation/no-overwrite와 recovery를 각각 분리했다. client `useSearchParams()`를 읽는
  diagnostic scenario seam으로 same-document 변경을 반영한다.
- Route Handler의 slow/error/empty 정책, GET/query-key builder, browser-only cancellation,
  signal-free server descriptor, Home semantic shell과 global error policy는 변경하지 않았다.

### Todo 11 여섯 production recipe 결과

모든 run은 production, `APP_ORIGIN=http://127.0.0.1:3000`, Chrome 150, DPR 1, cache disabled에서
수집했다. cold recipe는 새 process/context와 storage/cache reset을 사용했고 warm recipe는 reload 없이
같은 document UUID와 navigation count `1`을 유지했다. 아래 GET 결과는 browser transport terminal
event이며 server execution/call count를 추론하지 않는다.

| Recipe | reset·action과 최종 URL                                                                                                                  | GET terminal 결과                                                        | visible state·IDs·pagination                                                                                                                       | retry·focus·cancel·recovery                                                                                       | evidence                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| R1     | cold reset; direct `/products?scenario=slow`                                                                                             | exact GET 1개, HTTP 200                                                  | pending 12 skeleton, 5/3/2 columns와 square geometry; final/post-wait `p26,p6,p27,p24,p1,p28,p19,p2,p29,p11,p22,p3`, 총 30개, `1 / 3`              | cancel/error 없음                                                                                                 | T11-R1/T11-IMG08                       |
| R2     | warm `/products` success 뒤 네 exact `pushState`; final `/products?q=stanley&category=home&sort=price-asc&page=2&scenario=slow`          | warm 200; slow 4개 중 앞 3개 `net::ERR_ABORTED`, final page-2 HTTP 200   | 네 pending frame 모두 default 12 IDs와 총 30개 유지; 마지막 pending `2 / 3`; final/post-wait IDs 없음, 총 3개, `2 / 1`, 이전 enabled/다음 disabled | UUID `d7037f84-2054-4a5c-adf2-afbf5ac42b96`, nav 1 유지; canceled retry/error 0                                   | T11-R2/T11-IMG09                       |
| R3     | cold reset; direct `/products?q=__week07_no_match__`                                                                                     | exact GET 1개, HTTP 200                                                  | pending 12 skeleton; final/post-wait IDs 없음, 총 0개, `검색 결과가 없습니다.`, `1 / 1`, 양쪽 disabled                                             | cancel/error 없음                                                                                                 | T11-R3/T11-IMG10                       |
| R4     | cold reset; direct `/products?scenario=error`                                                                                            | initial logical fetch 2 + manual retry 2, 정확히 4개 HTTP 500            | IDs 없음, inline error, `1 / 1`; route boundary takeover 없음                                                                                      | native button Enter 1회; 전/직후/완료 후 visible focus와 2px solid outline 유지                                   | T11-R4/T11-IMG11                       |
| R5     | warm `/products` success → same-document `/products?q=stanley&scenario=error` → Enter retry → scenario 제거; final `/products?q=stanley` | warm 200; initial error 2 + manual retry 2 HTTP 500; recovery 1 HTTP 200 | error pending/settled/retry 동안 default 12 IDs, 총 30개, `1 / 3` 유지; recovery final/post-wait `p19,p20,p17`, 총 3개, `1 / 1`                    | UUID `d54a7aaf-0dfc-4e50-9041-3b3fea764f66`, nav 1; retry focus 유지; current-key retry 후 same-document recovery | T11-R5/T11-IMG12/T11-R5-RECOVERY-LOCAL |
| R6     | cold reset; `/products?scenario=slow` → `/products?q=sta&scenario=slow` → final `/products?q=stanley&scenario=slow`                      | 앞 2개 `net::ERR_ABORTED`; latest 1개 HTTP 200                           | 세 pending frame 12 skeleton/IDs 없음; final/post-wait `p19,p20,p17`, 총 3개, `1 / 1`                                                              | UUID `f22636e0-6a26-431d-951a-9099f0dea5d9`, nav 1; alert, retry, stale overwrite 없음                            | T11-R6/T11-IMG13                       |

`T11-R5-RECOVERY-LOCAL`은 `r5/r5-recovered.png`, capture
`2026-08-05T21:42:44.655Z`, SHA-256
`6b4449a713a4a794406764fc2dc3703e51fd96199167251c8d0fa5f41572101c`인 별도 R5 provenance다.
T11-IMG13과 bytes는 같지만 capture provenance와 recipe가 다르므로 tracked image ID는 없다.
T11-IMG13은 R6 cancellation 전용이다.

### Todo 11 접근성·시각·봉인 검증

- Chrome CDP `Accessibility.getFullAXTree`와 자동 keyboard evidence에서 pending skeleton은 product
  image/control을 노출하지 않았고 loading/refresh는 polite atomic status, error는 assertive atomic
  alert와 이름 있는 retry button을 노출했다. `1365`, `768`, `375` width마다 forward 31개와 reverse
  31개 control 모두 visible focus였고 검색 textbox 이름은 `검색`이었다. R4/R5 retry는 Enter 전후와
  완료 후 focus가 유지됐다 (T11-A11Y/T11-REV-A).
- 이는 자동 Chrome AX tree와 keyboard 검사이며 **사람이 수행한 VoiceOver 세션이 아니다**. 실제 AT
  announcement timing과 더 넓은 WCAG 범위는 이번 locked automated scope 밖의 manual gap이다.
- functional, CJK, accessibility independent review는 모두 PASS다. 13개 local PNG와 tracked 08-13의
  canonical identity, image completeness, CJK glyph/line clamp, geometry, overlay, focus, compositing을
  확인했다 (T11-REV-F/T11-REV-C/T11-REV-A).
- 초기 evidence wave는 screenshot mismatch, cancelled functional review, lint-breaking evidence script,
  integration/remount test 부족으로 차단됐다. 이를 숨기지 않고 canonical screenshot, PASS review,
  non-vacuous same-document/remount regression test와 fail-closed validator로 고친 뒤 final source에서
  전체 recipe를 다시 봉인했다.
- 최초 result commit `d2f0bea`는 R1 AX hash 오기, responsive CLS provenance 부족, R1 layout entry
  표현과 R5 recovery provenance 때문에 verifier가 차단했다. source나 sealed build를 변경하지 않고
  R2-R6 tablet/mobile 10개 production group, correction memo, R5 local provenance를 추가해 보완했다.
- validator adversarial probes는 stale SHA, dirty receipt, missing field, malformed JSON, screenshot
  mismatch, cancelled review, extra payload, PID cleanup, CLS, gate receipt, hung subprocess를 모두
  nonzero로 거부했다. clean sealed state는 `2026-08-05T22:29:21.479Z`에 `accepted: true`,
  `failures: []`였다 (T11-PROBE/T11-MAN).
- final gate는 `2026-08-05T22:26:58.586Z`부터 `2026-08-05T22:27:15.904Z`까지 실행되어
  23 files/187 tests, lint, typecheck, production build를 exit 0으로 통과했다. build ID는
  `JvclqdzlnqNW10u0TFdtg`, gate log SHA-256은
  `bdf6fd9b5070f6f7b27465343d0a99d3f0346d689f42326a51404d46c6a2566e`, LSP는 50 files/
  diagnostics 0이다. build mtime은 validator보다 앞서며 captured process는 종료되고 port 3000은
  해제됐다 (T11-GATE/T11-MAN).
- expanded detached manifest SHA-256은
  `81ad77e29c0898b86d99f1ff4fb9b5353cc7018e60136cd9236eb339fb21a0a7`이며 166 declared/actual
  payload의 path, byte size, UTC mtime, SHA-256이 일치한다. correction memo SHA-256은
  `788e1453c757623f0a49cd3f4e01463ab49b112b66c2aa629588a5516f07fe44`다. main validator는
  `2026-08-05T23:18:16.773Z`에 `accepted: true`, `failures: []`였고 independent final verifier
  `ses_02c50bd75ffecERMMo2z4eJ98n`은 supplemental blockers 수정 뒤 최종 `CONFIRMED`를 반환했다.

사전 KEEP threshold를 모두 충족했고 blocker는 없다. Todo 11 결정은 **KEEP**이다. 이 결정은
상품 목록 여섯 상태만 완료하며 Todo 12/13, global BasicAfterSHA와 최종 After 측정은 완료하지 않는다.

### KEEP, FIX/REVERT와 stop rule

- **KEEP**: QueryObserver tests가 cold pending → real success, success → identity placeholder →
  success, successful empty, initial error/retry, retained refresh error/current-key retry,
  cancellation/no-overwrite 전이와 private flags/key/cache를 모두 증명해야 한다. product-list-only
  `throwOnError:false`와 unchanged global policy test, same-document scenario seam/QueryClient retention
  test도 통과해야 한다.
- **KEEP**: placeholder와 refresh error에서 previous grid, `totalCount`, pagination이 유지되고 retry는
  current key를 요청해야 한다. 500은 logical fetch마다 최대 2 GETs, manual retry 1회는 새 logical fetch
  최대 2 GETs이고 cancellation retry는 0이어야 한다. old response/error/cancel은 current UI를 덮지
  않아야 한다.
- **KEEP**: 여섯 production recipes를 same-document seam과 locked cold reset으로 실행해
  URL/GET/visible IDs/status/focus/no reload가 일치해야 한다. 세 viewport 모두 expected 2/3/5 columns,
  result-replacement no-recent-input shift entry 0개, scenario cumulative CLS `<=0.01`과 exact raw 값이
  있어야 한다. page-2 edge는 requested URL/GET, empty IDs, `totalCount=3`, `2 / 1`, 이전 enabled/다음
  disabled를 유지한다. keyboard, screen-reader semantics, focused/full tests, lint, typecheck와 production
  build도 통과해야 한다.
- **FIX 후 affected recipes 재실행**: response data를 local/Zustand에 복사함, placeholder/error/cancel에서
  last-success key 갱신, wrong-key retry, refresh 중 grid/count 제거, empty와 error의 generic 혼동,
  product 500의 route boundary takeover, global error-policy 변경, 500/cancel retry count drift,
  `page.goto`/reload/QueryClient 교체로 만든 warm recipe, private browser-state claim, page-2 silent
  normalization, stale overwrite, CLS threshold/geometry, 접근성·기능·build regression 중 하나라도 있으면
  KEEP하지 않는다.
- **REVERT**: 최소 correction 뒤에도 QueryObserver transition, exact production recipe, retained
  count/pagination, current-key retry, no stale/error overwrite, geometry/CLS/accessibility 또는 build/function
  gate를 만족하지 못하면 Todo 11 source candidate를 별도 revert하고 `b123b91` product behavior로
  돌아간다. 실패 evidence와 이유는 보존한다.
- **stop rule**: Todo 11 candidate를 clean commit한 뒤 affected recipe까지 다시 실행하고, RFC의 여섯
  result row·artifact hash·KEEP/FIX/REVERT를 채우기 전에는 Todo 12를 시작하지 않는다. 이 pre-source
  checkpoint를 만들 당시 구현·production result는 **Pending**이었고, 현재는 위 final result와
  artifact identity를 채워 **KEEP**으로 닫았다.

### Scope exclusions

- Todo 12의 canonical server request builder, canonical `APP_ORIGIN`, metadata/body descriptor parity,
  per-call `getQueryClient()`와 server call-count 계측을 시작하지 않는다.
- Todo 13의 metadata, prefetch, dehydration/hydration, initial HTML과 Hero 재측정을 시작하지 않는다.
- Route Handler delay/error/empty policy, abort propagation 또는 server execution/call-count를 바꾸거나
  browser cancellation에서 추론하지 않는다.
- global/provider `ApiErrorPolicy`와 route loading/error boundary를 바꾸지 않고, out-of-range page를
  clamp하는 pagination redesign도 하지 않는다.
- memoization, global loading/error boundary redesign, unrelated component refactor와 final Basic After를
  추가하지 않는다. `BasicAfterSHA`와 global After는 계속 Pending이다.

## Todo 12 server request와 QueryClient

이 절의 계약은 source를 바꾸기 전에 request identity, origin trust boundary, browser/server
transport와 QueryClient lifetime을 고정한 pre-source checkpoint였다. checkpoint docs chain은
`394d2ad` → `6bcae81`, 구현 source chain은 그 clean parent에서 `6a37a71` → `50418f0` →
`acef7e5` → `17043a0` → `822cc74` → `2b7470c` → `e9d330b` → `3c42ed1` →
`ac2d02d` → final `4a54e50` 순서다. 아래 계약은 final source, tests, production/driver evidence와
independent verifier `ses_02b74359bffekX8SkkcdWGSNV9`의 `CONFIRMED`를 교차 확인해 **KEEP**으로
닫았다.

Full chain은
`394d2adc28bb66a9c52915be2b8280930cd8b83c` →
`6bcae813cda313a3360e2616819f5ce089ae9da6` →
`6a37a718823a7824645e4cca53a246b0bbf7cc8e` →
`50418f0462c4d461d0dba9935f20ceb1ac367637` →
`acef7e5e97a363fd73eaa34829e3f703e5de68f8` →
`17043a0cbc12b2f93745fe101931e62c5a0c777f` →
`822cc74c4d100b056d37b399abdbd43d49b583c5` →
`2b7470c43f7dbe7b2410bce7f55fa5dd53dc38c4` →
`e9d330ba21e8093a11a5e24bc592499bb2d05f06` →
`3c42ed1366ebf006508bb7ecbebb0dbe4f2b3609` →
`ac2d02d58eecf711f2ebd521a6dc1b4c06b0a2e1` →
`4a54e5077fcb3fe7d62aecd0e38a118e6667f7f5`다.

### Result chronology

| UTC                      | SHA       | 결과                                                                |
| ------------------------ | --------- | ------------------------------------------------------------------- |
| 2026-08-06T00:12:58Z     | `6a37a71` | strict pure `AppOrigin` parser와 server-only env getter 추가        |
| 2026-08-06T00:13:09Z     | `50418f0` | canonical normalized `ProductListRequest`와 descriptor factory 추가 |
| 2026-08-06T00:13:21Z     | `acef7e5` | typed API client error를 transport-neutral module로 분리            |
| 2026-08-06T00:13:34Z     | `17043a0` | browser repository가 canonical relative descriptor와 signal을 소비  |
| 2026-08-06T00:13:45Z     | `822cc74` | browser query key를 canonical request identity로 통합               |
| 2026-08-06T00:13:56Z     | `2b7470c` | view boundary에서 외부 input을 한 번만 normalize                    |
| 2026-08-06T00:14:06Z     | `e9d330b` | signal-free native server repository와 exact error semantics 추가   |
| 2026-08-06T00:14:33Z     | `3c42ed1` | browser와 key/staleTime이 같은 pure server query service 추가       |
| 2026-08-06T00:14:43Z     | `ac2d02d` | module singleton 없는 per-call `getQueryClient()` 추가              |
| 2026-08-06T00:19:56Z     | `4a54e50` | provider는 mounted lifetime 동안 한 QueryClient를 유지              |
| 2026-08-06T00:36:09.669Z | `4a54e50` | collection-level red를 zero assertions로 봉인                       |
| 2026-08-06T00:39:45.364Z | `4a54e50` | final check 28 files/227 tests와 build ID를 봉인                    |
| 2026-08-06T00:42:57.889Z | `4a54e50` | browser CDP cancellation/final response ledger를 봉인               |
| 2026-08-06T00:47:41.222Z | `4a54e50` | fail-closed validator probes PASS                                   |
| 2026-08-06T00:48:11.513Z | `4a54e50` | 25 retained files와 self-excluded manifest를 최종 봉인              |

### FSD 배치와 공개 타입

- `src/entities/product/model/ProductListRequest.ts`는 상품 목록 요청의 유일한 정규화·identity
  모델이다. `ProductListRequest`는 class instance가 아닌 Zod output plain object type이며 모든
  필드는 `readonly`다. entity/slice root barrel은 만들지 않고 실제 파일 경로로 import한다.
- `productListRequestSchema`는 기존 `querySchema`, `categorySchema`, `sortSchema`, `pageSchema`,
  `DEFAULT_PAGE_SIZE`, `mockApiScenarioSchema`를 조합한다. 별도 enum이나 기본값을 복제하지 않는다.
  최종 `z.object(...).readonly()` output은 정확히 `q: string`, `category: CategoryId | 'all'`,
  `sort: ProductSort`, `page: number`, `pageSize: number`, `scenario?: MockApiScenario`다.
  `ProductListRequest = z.infer<typeof productListRequestSchema>` 외에 수동 request type을 중복 선언하지
  않는다.
- `ProductListRequestModel.normalize(input)`은 `unknown`을 parse해 새 plain object를 반환한다.
  non-record와 array input은 `{}`로 취급한다. Next search-param과 같은 scalar input만 받으며 `q`,
  `category`, `sort`, `scenario`는 single string일 때만 각 기존 schema로 보낸다. array, number, object,
  null은 invalid다. `q` scalar string은 trim하지 않고 기존 `querySchema` 동작을 보존하며 invalid는 `''`,
  category invalid는 `all`, sort invalid는 `latest`, scenario invalid/missing은 property 자체를 생략한다.
- `page`와 `pageSize`는 positive safe integer number 또는 `/^[1-9]\d*$/`에 맞고 safe integer로 변환되는
  canonical decimal string만 받는다. `0`, sign, leading zero, decimal/exponent, whitespace, unsafe integer,
  array와 다른 type은 각각 `1`/`12`로 default한다. `pageSize > 24`도 `12`로 default한다. 최종 기본값은
  `q: ''`, `category: 'all'`, `sort: 'latest'`, `page: 1`, `pageSize: 12`이며 반환 object에는
  `scenario: undefined`를 만들지 않는다.
- `ProductListRequestModel.queryKey(request)`는 정확히
  `['products', 'list', request] as const`를 반환한다. key에는 정규화된 기본값과 유효 scenario가
  모두 들어가며, 같은 logical input은 deep-equal key, 필드 하나가 다른 input은 다른 key가 된다.
- `ProductListRequestModel.searchParams(request)`는 `q`, `category`, `sort`, `page`, `pageSize`,
  `scenario` 순서의 새 `URLSearchParams`를 반환한다. 현 wire 계약을 보존해 `q === ''`와
  `category === 'all'`은 생략하고, `sort`, `page`, `pageSize`는 기본값이어도 전송한다. scenario는
  유효할 때만 마지막에 전송한다. 이 함수 하나의 encoded result가 browser/server descriptor를
  모두 구동한다.

### Browser와 server descriptor

- 공개 descriptor type은 정확히 `BrowserProductListDescriptor = Readonly<{ input: 'api/products';
options: Options }>`와 `ServerProductListDescriptor = Readonly<{ input: URL; init:
Readonly<{ method: 'GET' }> }>`다. `Options`는 Ky의 type-only import이고 server descriptor에는 Ky type이나
  Next 전용 type이 들어가지 않는다.
- `ProductListRequestModel.browserDescriptor(request, signal?)`은
  `{ input: 'api/products', options }`를 반환한다. `input`은 leading slash와 origin이 없는 정확한
  relative Ky input이고 `options`는 현재 `apiClient.get`에 넘길 base Ky options와
  `searchParams`만 가진다. signal을 받은 호출에서만 own `signal` property를 추가하며, 받지 않은
  호출에는 `signal: undefined`도 만들지 않는다.
- `ProductListRequestModel.serverDescriptor(request, origin)`은 parse가 끝난 `AppOrigin`만 받고
  `{ input: URL, init: { method: 'GET' } }`를 반환한다. `input`은 `new URL('api/products',
`${origin}/`)`에 같은 encoded search params를 붙인 absolute HTTP(S) URL이다. `init`에는 정확히
  `method: 'GET'`만 있고 own `signal` property가 없어야 한다.
- browser/server descriptor는 같은 normalized request instance에서 만들어야 한다. browser
  relative input을 validated origin에 resolve한 URL의 `pathname + search`는 server absolute URL의
  `pathname + search`와 byte-for-byte 같아야 한다. Unicode, space와 reserved character는
  `URLSearchParams`의 native encoding을 그대로 사용하고 수동 encode/decode를 추가하지 않는다.
- Todo 12에는 metadata나 body prefetch consumer를 만들지 않는다. 대신 같은 request/origin으로
  server descriptor를 두 번 생성해 metadata/body 후보의 `input.href`와 `init`이 deep-equal이고,
  두 `init` 모두 `Object.hasOwn(init, 'signal') === false`임을 contract test와 typed driver에서
  증명한다. Todo 13은 이 builder를 그대로 소비해야 하며 별도 URL/options builder를 만들 수 없다.

### `APP_ORIGIN` trust boundary

- pure `src/shared/config/AppOrigin.ts`에는 `appOriginSchema`, 그 schema에서 추론한 branded string
  `AppOrigin`, `AppOriginError`와 `parseAppOrigin(input: unknown)`만 둔다. `server-only` import와
  `process.env` 접근이 없어서 Node Vitest가 이 파일만 안전하게 import한다.
- 별도 `src/shared/config/getAppOrigin.ts`의 **module 전체**가 최상단에서 `import 'server-only'`를 하고,
  `getAppOrigin()`만 export한다. 이 getter만 `process.env.APP_ORIGIN`을 읽고 pure `parseAppOrigin`에
  위임한다. getter module은 Node Vitest에서 import하지 않으며 Todo 13의 실제 Next server usage와
  production build가 보호 경계를 검증한다. function-level `server-only` 보호를 주장하지 않는다.
- client-marked module과 entity model은 `process.env` 또는 `getAppOrigin.ts`를 import하지 않는다. pure
  descriptor에는 parse된 `AppOrigin`을 인자로 전달한다.
- parser는 absolute `http:` 또는 `https:` URL만 허용하고 반환값은 `URL.origin`으로 canonicalize해
  trailing slash를 제거한다. non-default explicit port만 유지되며 `http://host:80`과
  `https://host:443`은 각각 port 없는 origin으로 정규화한다. localhost나 `127.0.0.1`은 명시적으로
  주어진 production smoke 값으로는 허용하지만 fallback을 생성하지 않는다.
- `undefined`, empty string과 whitespace-only string은 exact `AppOriginError` message
  `APP_ORIGIN is required.`로 실패한다. 나머지 invalid 값은 exact message
  `APP_ORIGIN must be an absolute HTTP(S) origin without credentials, path, query, or hash.`로 실패한다.
  상대 URL, non-http(s), credentials, pathname이 정확히 `/`가 아닌 값, query/hash를 거부한다. parse
  전에 raw string의 `?`/`#` 존재를 확인해 URL API가 빈 search/hash로 normalize하는 bare `?`/`#`도
  거부한다. 앞뒤 whitespace가 있는 non-empty string과 non-string도 invalid message로 실패한다. 두 경우
  모두 error `name`은 `AppOriginError`이며 secret 전체나 credentials를 message에 interpolate하지 않는다.
- build와 runtime은 계속 같은 명시적 `APP_ORIGIN=http://127.0.0.1:3000`을 사용한다. env가 없을
  때 localhost, request headers 또는 browser origin으로 추정하는 fallback은 금지한다.

### Repository, Service와 native fetch semantics

- 기존 `ProductRepository.ts`와 `ProductService.ts`는 browser graph 전용으로 남긴다. browser service에서
  server method를 제거하고 normalized `ProductListRequest`, browser descriptor,
  `placeholderData: previousData => previousData`, `throwOnError: false`, QueryFunctionContext signal과
  `staleTime: 30_000`만 유지한다.
- 별도 pure `src/entities/product/api/ProductServerRepository.ts`는 constructor로
  `fetch: typeof globalThis.fetch`를 주입받고 validated `AppOrigin`과 normalized request로 만든 server
  descriptor를 native fetch에 정확히 한 번 전달한다. 공개 method signature는
  `getProductList(request: ProductListRequest, origin: AppOrigin): Promise<ProductListResponse>`다. 별도 pure
  `src/entities/product/api/ProductServerService.ts`는 injected server repository를 사용해 같은 exact key와
  `staleTime: 30_000`의 signal-free query options만 만든다. 공개 method는
  `getProductList(request: ProductListRequest, origin: AppOrigin)`이며 queryFn closure가 두 값을 repository에
  그대로 전달한다.
- `ProductService`, `ProductRepository`, `ProductListView`와 그 client import chain은 server repository,
  server service 또는 `getAppOrigin`을 import하지 않는다. Todo 13 server caller만
  `ProductServerService.ts`와 `getAppOrigin.ts`를 직접 import해 validated origin을 넘긴다. 두 server entity
  module 자체는 pure/injectable이며 `process.env`나 `server-only`를 import하지 않는다.
- server repository는 non-ok response body를 `response.text()`로 정확히 한 번 읽고, non-empty text에
  `JSON.parse`를 시도한 뒤 결과를 기존 `ApiErrorResponseSchema.safeParse`에 전달한다. empty text,
  malformed JSON 또는 schema-invalid JSON은 모두 기존 `요청 중 오류가 발생했습니다.`를 사용하고,
  valid error body만 해당 message를 사용해 `new ApiClientError(message, response.status)`를 throw한다.
- ok response는 `response.json()`을 정확히 한 번 호출한 뒤 `productListResponseSchema.parse`한다.
  malformed success JSON의 native `SyntaxError`, parsed-but-invalid success body의 `ZodError`, native fetch
  rejection의 `TypeError`는 감싸거나 변환하지 않고 그대로 전파한다.
- browser Ky cancellation/latest-result 동작은 Todo 10/11대로 유지한다. parity 범위는 normalized
  URL/search/options, non-ok `ApiClientError` status/message fallback과 success schema contract뿐이다. native
  `TypeError`를 Ky `NetworkError`와 같다고 주장하거나 client retry parity를 테스트하지 않는다. server
  query retry와 failure handling은 별도 정책이며 실제 Todo 13 server consumer를 설계할 때 결정한다.
- request normalization은 URL/view, repository와 service에서 중복 실행하지 않는다. 외부 input을
  model boundary에서 한 번 normalize한 뒤 같은 object가 key, browser descriptor와 server descriptor로
  흐른다. 아직 metadata/prefetch 호출부는 추가하지 않는다.

### Per-call QueryClient 계약

- client-marked `src/app/providers.tsx`의 `createQueryClient`를 제거하고 같은 defaults를 가진
  `getQueryClient()`를 server-safe `src/shared/lib/getQueryClient.ts`로 이동한다. defaults는
  `staleTime: 30_000`, `refetchOnWindowFocus: false`, `retry: ApiErrorPolicy.retry`,
  `throwOnError: ApiErrorPolicy.throwOnError`로 현재와 동일하다.
- `getQueryClient()`는 module cache나 singleton을 사용하지 않고 **호출마다** 새 `QueryClient`를
  반환한다. `getQueryClient() !== getQueryClient()`와 각 instance의 default query options deep
  equality를 테스트한다. 한 client의 cache write가 다른 client에 보이지 않아야 한다.
- `Providers`는 `const [queryClient] = useState(getQueryClient)`로 **mounted provider당 한 retained client**를
  유지한다. pure initializer는 development Strict Mode에서 한 번보다 많이 호출될 수 있으므로
  initializer invocation count를 browser identity 계약으로 삼지 않는다. server에서는
  `getQueryClient()`의 모든 호출이 서로 다른 instance를 반환하며 module-level instance를 만들지 않는다.
  Todo 12에서는 server consumer가 없으므로 per-request reuse helper나 React `cache()`를 추가하지 않는다.

### Baseline, red-first TDD와 evidence

1. source 변경 직전 clean candidate SHA, `git status --porcelain`, Node/pnpm, production origin과
   baseline focused tests를 ignored evidence에 기록한다. baseline failure가 있으면 구현을 시작하지 않는다.
2. production code 전에 failing tests를 먼저 작성하고 실제 failure reason을 저장한다.
   `ProductListRequest.test.ts`는 non-record/array input, scalar string-only fields, arrays, canonical/
   noncanonical numeric strings, safe integer/pageSize max, readonly output, defaults, missing scenario/property
   absence, every-field identity, q/all omission과 deterministic encoding을 잠근다.
3. 같은 test에서 browser relative input, server absolute URL, pathname/search equality, signal supplied/
   omitted own-property와 metadata/body descriptor deep equality를 잠근다. `AppOrigin.test.ts`는 valid
   HTTP(S), non-default/default port와 trailing slash canonicalization, undefined/whitespace-only/relative/
   protocol/credentials/path/query/hash/bare `?`/bare `#`의 exact error name/message를 table-driven으로
   검증한다. `getAppOrigin.ts`는 Node Vitest에서 import하지 않는다.
4. `ProductServerRepository.test.ts`는 injectable fetch fake가 exact URL/init을 한 번 받는지, server init에
   own signal이 없는지, valid non-ok message/status, empty/malformed/schema-invalid error fallback,
   valid success, malformed success `SyntaxError`, invalid success `ZodError`와 native fetch `TypeError`
   passthrough를 검증한다. browser repository test는 AbortSignal identity가 Ky에 유지되고 omitted 호출에는
   own signal이 없음을 계속 검증한다.
5. `ProductService.test.ts`는 browser-only placeholder/`throwOnError:false`/signal을 잠근다.
   `ProductServerService.test.ts`는 browser/server key와 staleTime equality, signal-free server queryFn과
   client graph에서 분리된 dependency를 검증하되 retry parity를 주장하지 않는다.
   `getQueryClient.test.ts`는 두 호출의 identity 분리, exact defaults와 cache isolation을 검증한다.
6. focused red receipt 뒤 최소 production code로 green을 만들고 focused tests, full `pnpm test`, `pnpm lint`,
   `pnpm typecheck`, `APP_ORIGIN=http://127.0.0.1:3000 pnpm build`, `pnpm format:check`를 실행한다.
7. clean committed candidate를 같은 origin으로 production 실행한다. browser에서 기존 R6 rapid sequence의
   relative GET parity, superseded abort, final 200와 latest visible IDs/no console error를 smoke한다. 이 smoke는
   server execution 중단이나 call count를 주장하지 않는다.
8. ignored evidence 아래 temporary typed driver는 alias resolution을 위해 항상 `npx --yes tsx`로 실행하며
   Node strip-types는 사용하지 않는다. project dependency, lockfile와 config는 바꾸지 않는다. driver는
   pure origin parser, descriptor equality/own-signal false, 두 QueryClient identity/defaults, production
   origin에 대한 actual signal-free server repository fetch의 status/schema/IDs를 assertion한다. driver
   내부 10초 watchdog가 nonzero exit로 종료하고 shell cleanup trap이 temporary driver/log와 production
   process를 제거한다. actual server descriptor/fetch에는 signal을 추가하지 않으며 최대 1회만 요청한다.
9. baseline/red/focused/full gate, browser CDP summary, driver stdout/stderr, source SHA/build ID/PID/port cleanup과
   hash manifest를 `.local/week07-performance-evidence/<candidate-sha>/todo12/`에 저장한다. evidence는 ignored
   상태를 유지하고 temporary driver/process를 제거하며 tracked source에는 production implementation/test만
   남긴다.

### KEEP, FIX/REVERT와 Todo 13 stop rule

- **KEEP**: normalized request 하나가 exact key와 browser/server GET을 만들고 q/all wire omission,
  deterministic encoding, metadata/body descriptor deep equality, server own-signal false, browser abort,
  native HTTP/schema errors, explicit origin failure와 distinct QueryClients/defaults/cache isolation을 모두
  만족해야 한다. focused/full tests, lint, typecheck, production build, format, browser smoke와 typed driver가
  모두 통과하고 clean candidate/evidence cleanup이 확인돼야 한다.
- **FIX 후 affected evidence 재실행**: URL/key/default/encoding drift, invalid scenario leak, descriptor duplication,
  server `signal` own-property, browser cancellation 손실, 위에서 정의한 native HTTP status/message fallback
  또는 success schema semantics 불일치, response schema bypass, server module의 client graph 유입,
  function-level `server-only` 주장, env의 client graph 유입, QueryClient defaults drift 또는 shared instance가
  하나라도 있으면 KEEP하지 않는다.
- **REVERT**: 최소 correction 뒤에도 exact URL/key/GET parity, server own-signal false, browser abort retained,
  distinct per-call clients, explicit no-fallback origin failure, gates 또는 기존 상품 목록 기능을 만족하지
  못하면 Todo 12 source candidate 전체를 revert하고 Todo 11 measured source 계약으로 돌아간다. failure
  evidence와 이유는 보존한다.
- **stop rule**: Todo 12 candidate를 clean commit하고 위 evidence/hash/result와 KEEP/FIX/REVERT를 RFC에
  기록하기 전에는 Todo 13을 시작하지 않는다. Todo 13의 metadata, prefetch, dehydrate,
  `HydrationBoundary`, loading shell, Open Graph, metadata failure policy와 server call-count 계측은 이
  checkpoint에서 명시적으로 제외한다. global `BasicAfterSHA`와 After 측정도 계속 Pending이다.

| 계약                                                                    | 자동 검증                         | driver·브라우저·서버 관찰                                   | 결과    | 상태    |
| ----------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- | ------- | ------- |
| normalized factory가 exact key와 deterministic GET을 만든다             | focused 95 tests                  | driver normalized output/search와 actual absolute GET 일치  | 일치    | current |
| browser request는 same-origin relative descriptor이며 signal을 소비한다 | focused 95 tests                  | CDP first 2 canceled, final 200 + `loadingFinished`         | 일치    | current |
| server descriptor는 validated origin의 absolute GET이며 signal이 없다   | focused 95 tests                  | driver actual GET; `serverOwnSignal:false`                  | 일치    | current |
| scenario가 key와 실제 GET에 함께 반영된다                               | full 227 tests 중 contract tests  | CDP final request query에 `scenario=slow`                   | 일치    | current |
| `getQueryClient()`는 호출마다 새 인스턴스다                             | identity/default/cache isolation  | driver `distinctClients:true`; 두 client identity 분리      | 일치    | current |
| metadata/body descriptor 후보는 같은 absolute URL/options다             | repeated descriptor deep equality | driver `repeatedDescriptorEqual:true`; 실제 consumer는 없음 | 제한적  | current |
| metadata/body가 factory 응답을 실제 소비한다                            | Todo 13                           | Todo 13 document/body observation                           | Pending | pending |
| 같은 render/request native fetch memoization                            | Todo 13                           | Todo 13 server call-count와 직접 관찰                       | Pending | pending |

### Final implementation과 evidence

- 변경 범위는 28개 tracked TS/TSX 파일이며 implementation은
  `src/entities/product/model/ProductListRequest.ts`, browser 전용
  `ProductRepository.ts`/`ProductService.ts`, pure injectable server 전용
  `ProductServerRepository.ts`/`ProductServerService.ts`, pure
  `src/shared/config/AppOrigin.ts`, module-level `server-only` getter
  `src/shared/config/getAppOrigin.ts`, per-call `src/shared/lib/getQueryClient.ts`, provider와 직접
  test files에 한정된다. entity/slice root barrel 없이 direct-file import를 유지했고, client graph는
  server repository/service/getter를 import하지 않는다. route/page, metadata, prefetch, hydration,
  package/config와 Todo 13 source는 변경하지 않았다.
- normalization은 non-record/array와 invalid scalar를 defaults로 바꾸고 canonical positive safe integer,
  readonly Zod output, `q/category/sort/page/pageSize/scenario` search order와 q-empty/all omission을
  고정한다. browser descriptor는 relative `api/products`이고 signal을 받은 경우에만 own property를
  가진다. server descriptor는 validated `AppOrigin`의 absolute URL과 정확히 `{ method: 'GET' }`만
  가지며 own signal은 없다.
- origin parser는 missing/empty/whitespace-only에 `AppOriginError: APP_ORIGIN is required.`, 그 외
  relative/non-HTTP(S)/credentials/path/query/hash/bare marker/surrounding whitespace/non-string에
  `AppOriginError: APP_ORIGIN must be an absolute HTTP(S) origin without credentials, path, query, or hash.`를
  사용한다. localhost fallback, request-header fallback과 client env read는 없다.
- native server repository는 non-ok body를 text로 한 번 읽고 valid API error message/status 또는
  `요청 중 오류가 발생했습니다.` fallback의 `ApiClientError`를 throw한다. success JSON은 한 번 parse해
  Zod schema를 적용하며 native `SyntaxError`, `ZodError`, fetch `TypeError` identity를 보존한다. browser
  Ky abort는 유지하지만 native/Ky retry parity는 정의하거나 주장하지 않는다.
- retained driver source와 실행 temporary source SHA-256은 모두
  `b7355cfb3fb3370b40fdd18890d8a54ea204e0a3a12d6e4c50ef699237a7269b`로 실행 전 동일했다.
  `npx --yes tsx --tsconfig <repo>/tsconfig.json <temp>/todo12-driver.ts`, `tsx v4.23.8`, Node
  `v24.9.0`, exit 0, stderr 0 bytes로 실행했다. actual signal-free GET은
  `http://127.0.0.1:3000/api/products?q=stanley&category=home&sort=price-asc&page=1&pageSize=12`,
  IDs `p17,p20,p19`, `totalCount:3`, `page:1`, `pageSize:12`였고 repeated descriptors는 equal,
  두 QueryClient는 distinct였다. driver는 credentials URL
  `https://user:secret@example.test`를 exact invalid-origin message로, `undefined`를
  `AppOriginError`로 거부했다. injected fallback error/fetch rejection probes도 통과했으며 actual
  production fetch는 1회뿐이다. 이는 server execution count나 memoization 관찰이 아니다.
- browser CDP의 relative GET request IDs `64032.47`, `64032.50`, `64032.51`은 각각 terminal event가
  정확히 하나다. 앞 2개는 `net::ERR_ABORTED`/`canceled:true`, final은 uncached
  (`fromDiskCache:false`, `fromServiceWorker:false`, `fromPrefetchCache:false`) HTTP 200과
  `Network.loadingFinished`다. response/render/post-wait 1700ms IDs는 모두 `p19,p20,p17`, error text와
  console error는 없다.
- baseline은 parent `6bcae813`의 7 files/70 tests다. 최초 red는 production module이 없던 시점의
  6-file collection failure, exit 1, **0 assertions**이며 assertion-level red라고 주장하지 않는다.
  current focused는 12 files/95 tests, full은 28 files/227 tests다. `pnpm format:check`, `pnpm lint`,
  `pnpm typecheck`, final `APP_ORIGIN=http://127.0.0.1:3000 pnpm check`와 production build가 exit 0,
  LSP는 지정 source scope diagnostics 0이다. sealed build ID는 `hAZ_keSgirWHxBHrbNqvK`다.
- production launcher/listener PIDs `62994`/`63003`은 종료됐고 port 3000은 해제됐다. temporary
  driver/validator/baseline worktree는 제거됐다. validator는 clean을 accept하고 stale, missing,
  malformed, extra, failed terminal, gate, dirty, hung PID와 hung port를 모두 reject했다.
- independent verifier `ses_02b74359bffekX8SkkcdWGSNV9`은 source/import/error/test/evidence를
  adversarially 재검증해 `CONFIRMED`를 반환했다. 따라서 Todo 12는 **KEEP**한다. 이 판정은
  canonical request/origin/browser-server boundary/native errors/per-call QueryClient만 포함하며,
  metadata/body consumption, server call-count, native fetch memoization, prefetch/hydration은 Todo 13
  Pending이다. `BasicAfterSHA`와 global After도 Pending이다.

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

| 범주                 | 확인 시나리오                                                 | 결과                                                                    | evidence ID                           | 상태            |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------- | --------------- |
| Home semantic shell  | Header, 하나의 h1, 설명, Hero                                 | Todo 8 final에서도 통과                                                 | T7-TR/T8-F-BR/T8-F-IMG1-T8-F-IMG2     | current         |
| Products states      | loading, refresh, empty, error, retry, cancellation           | 여섯 recipe와 QueryObserver 계약 통과                                   | T11-R1-T11-R6/T11-IMG08-T11-IMG13     | current         |
| Todo 10 cancellation | superseded abort, latest result, no error/stale overwrite     | 3 abort; final 200와 p17,p20,p19 유지                                   | T10-CDP/T10-BR                        | current-partial |
| URL restoration      | 검색·카테고리·정렬·페이지, 뒤로·앞으로                        | same-document query continuity 통과; 전체 뒤로·앞으로는 Pending         | T11-R2/T11-R5                         | current-partial |
| Commerce state       | cart, wishlist, Header count                                  | Pending                                                                 | Pending                               | pending         |
| Hydration            | hydration warning과 초기 HTML                                 | Todo 8 final warning 없음                                               | T8-F-BR/T8-F-TR                       | current-partial |
| CLS                  | Hero fallback과 product list 교체                             | Hero 5/5 `0`; products R1-R6 no-recent 0/CLS 0                          | T8-F-LH1-T8-F-LH5/T11-R1-T11-R6       | current-partial |
| Accessibility        | landmark, heading, link, alt, focus                           | Hero 계약과 product AX/31-control keyboard 통과; human VoiceOver 미실행 | T8-F-BR/T11-A11Y/T11-REV-A            | current-partial |
| Responsive           | desktop `1365 × 768`, tablet `768 × 1024`, mobile `375 × 812` | Hero와 product 5/3/2 geometry 통과                                      | T8-F-BR/T11-R1/T11-REV-C              | current-partial |
| Image quality        | 시각적 역할, crop, 주요 피사체, 문구                          | f416 REVISE 후 cee8 review PASS                                         | T8-R-AUD/T8-F-REV/T8-F-IMG1-T8-F-IMG2 | current-partial |
| Server request       | normalized key/GET, origin, signal ownership, native errors   | driver/CDP/tests에서 canonical browser/server boundary 통과             | T12-DOUT/T12-CDP/T12-FRAW             | current         |
| QueryClient          | per-call server clients, retained mounted provider            | distinct/default/cache isolation과 provider identity test 통과          | T12-DOUT/T12-FRAW                     | current         |
| FSD                  | 의존 방향, direct-file import, client/server slice 경계       | server-only getter 격리와 entity direct-file import 유지                | source/tests/T12-LSP                  | current         |

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

| 시각                     | source SHA | 관찰한 사실                                                                                                                                                | 가설                                                                                                                                    | 반증 방법                                                                                                                 | 가장 작은 실험                                        | 사전 threshold                                                         | 결과      | keep/revert/reject와 이유                                              |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| 2026-08-04T15:11:59Z     | `e2e608b`  | slow query가 shell/Hero insertion을 막고, late discovery 뒤 7.55MB transfer가 별도 병목이다.                                                               | shell boundary 분리로 API 전 semantic shell을 노출할 수 있다.                                                                           | same-run filmstrip/trace에서 API 전 shell, bounds, shifts와 회귀를 확인한다.                                              | semantic shell + fixed-geometry local fallback만 변경 | semantic contract 전부 통과; timing 분류는 6711.6814/7251.28685ms      | locked    | source change 전 locked                                                |
| 2026-08-05T13:15:43Z     | `ca2b6a7`  | API 전 shell, viewport별 동일 bounds, Hero replacement shift 0, LCP median 6913.341ms를 관찰했다.                                                          | semantic shell 계약은 충족하고 LCP 변화는 noise 안일 것이다.                                                                            | tests·production browser·5회 JSON·독립 visual review로 회귀와 threshold를 확인했다.                                       | 변경 추가 없음; candidate를 그대로 판정               | semantic contract pass; 6913.341ms는 inconclusive band                 | pass      | keep; timing inconclusive                                              |
| 2026-08-05T14:30:22Z     | `ca2b6a7`  | raw 3840×2160 JPEG가 desktop DPR1 target보다 area 12.098299× 크고 7,545,525 bytes를 전송한다.                                                              | accurate sizes의 Next Image가 width/DPR 적합 candidate와 실질적 byte 감소를 만든다.                                                     | actual optimizer URL·width·DPR·bytes와 geometry/crop/quality/CLS/a11y/function을 측정한다.                                | raw Hero `<img>`만 `fill`+accurate `sizes`로 교체     | right-sized candidate+material byte reduction+모든 보존 계약 통과      | locked    | source result 아님; 구현·After pending                                 |
| 2026-08-05T15:33:40Z     | `f4167e9`  | desktop `w=1200`은 pass지만 mobile `w=384` 16:9 raster가 4:5 box에서 확대돼 detail이 저하됐고 reviewer 2개가 REVISE했다.                                   | mobile object-cover source size를 반영하면 byte 절감과 보존 계약을 함께 만족할 수 있다.                                                 | mobile native coverage와 직접 visual review를 clean fix SHA에서 반복한다.                                                 | mobile `sizes` branch만 교정                          | candidate·bytes pass여도 quality fail이면 FIX                          | fail      | **FIX**; timing이 아니라 mobile 품질 회귀 때문                         |
| 2026-08-05T16:33:23Z     | `cee8cf7`  | desktop `w=1200`, mobile `w=750`이 DPR1을 cover하고 material byte reduction, geometry·quality·semantics·CLS·function gate를 통과했다.                      | corrected sizes가 locked responsive-delivery 계약을 충족한다.                                                                           | 5회 JSON, Network/native raster, trace, tracked screenshots와 conflicting review resolution을 교차 확인했다.              | 변경 추가 없음; fixed candidate 판정                  | candidate+bytes+보존 계약 pass; timing은 range rule로 별도 분류        | pass      | **KEEP**; FCP inconclusive, LCP directional improvement, CLS no change |
| 2026-08-05T17:18:21Z     | `cee8cf7`  | resource-load-delay median `1648.630ms`는 dominant지만 pending `526.5ms`에 Hero가 없고 request는 attachment 최초 확인 전에 시작했다.                       | already-attached Hero의 late discovery가 증명될 때만 priority hint가 delay를 줄일 수 있다.                                              | exact insertion과 request start 사이의 실제 wait를 fresh current-SHA trace로 관찰해야 한다.                               | source 실험 없음; current trace만 재평가              | attachment-before-request와 측정 가능한 discovery wait 증명            | closed    | **GATE CLOSED**; priority/preload/eager candidate와 source commit 없음 |
| 2026-08-05T18:16:23Z     | `e318b92`  | 세 superseded request는 CDP abort, final `12991.399`만 200이며 URL/key/GET/IDs와 post-wait `p17,p20,p19`가 일치했다.                                       | browser queryFn의 consumed signal이 superseded transport를 중단하고 latest-result integrity를 유지한다.                                 | raw CDP, browser report, tests/gates와 독립 verifier로 abort/no-error/no-stale 및 scope를 교차 확인했다.                  | source `345e13f`의 browser-only signal overlay        | 3 abort+final 200+정합성+no error/stale; server count 추론 금지        | pass      | **KEEP**; browser transport only, Todo 11-13/Basic After는 Pending     |
| 2026-08-05T18:38:08Z     | `b123b91`  | cold pending은 text-only이고 key transition/error에서 grid·count를 잃으며 last real-success key가 없다. Todo 10 cancellation은 동작한다.                   | identity placeholder와 cache-key-only retention으로 여섯 상태를 구분하면서 current-key retry를 유지할 수 있다.                          | QueryObserver transitions와 reset된 여섯 exact production recipes에서 URL/key/GET/IDs/cancel/recovery를 확인한다.         | source 실험 전 decision checkpoint만 기록             | retained grid/count/page+current retry+no stale/CLS/a11y/build 회귀    | Pending   | pre-source lock 완료; Todo 11 구현·production 결과는 **Pending**       |
| 2026-08-05T18:58:30Z     | `c0fd99f`  | verifier는 global 5xx throw, retry count, server scenario snapshot, private browser telemetry, tablet/CLS와 page-2 semantics 미결정을 확인했다.            | list-only error override와 same-client seam, evidence ownership, exact geometry/cardinality를 잠그면 구현 추측을 제거할 수 있다.        | focused policy/seam/QueryObserver tests와 same-document production recipes의 observable evidence를 분리해 검증한다.       | RFC protocol correction only                          | 500=2 GET/logical fetch; no reload; shift entries=0; CLS<=0.01         | Pending   | blockers를 protocol에 반영; source·test·production result는 Pending    |
| 2026-08-05T22:29:21.479Z | `9a93f21`  | 여섯 desktop recipe가 exact URL/GET/IDs/retry/cancel/recovery, CLS 0, AX/keyboard/visual 계약을 충족했고 initial validator가 accepted/no failures였다.     | identity placeholder와 cache-key-only retention이 여섯 상태를 local response copy 없이 보존한다.                                        | QueryObserver/integration tests, raw recipe/CDP/process/AX payload, final gate와 independent verifier를 교차 확인했다.    | Todo 11 source chain과 canonical evidence만 판정      | 23 files/187 tests; reviews PASS; follow-up evidence correction 필요   | corrected | KEEP 유지; Todo 12/13/BasicAfter는 Pending                             |
| 2026-08-05T23:18:16.773Z | `9a93f21`  | R1 wording/hash를 교정하고 R2-R6 tablet/mobile 10개 group과 R5 local provenance를 더해 166 payload validator가 accepted/no failures였다.                   | same source/build의 supplemental capture가 viewport별 CLS와 recipe 계약을 직접 보강한다.                                                | responsive index, CDP/layout/process groups, correction memo와 independent verifier를 교차 확인했다.                      | source 변경 없음; evidence correction only            | no-recent 0/CLS 0; 10/10 responsive accepted                           | pass      | **KEEP confirmed**; Todo 12/13/BasicAfter는 Pending                    |
| 2026-08-05T23:42:42Z     | `1c2a0f1`  | request normalization과 wire encoding이 repository에 흩어져 있고 APP_ORIGIN boundary가 없으며 QueryClient factory가 client module 안에 있다.               | canonical request/origin/descriptor와 per-call client 계약을 먼저 잠그면 Todo 13이 URL, signal 또는 cache lifetime을 재정의하지 않는다. | red-first focused tests, production browser smoke와 bounded typed driver로 exact parity와 isolation을 반증한다.           | RFC decision checkpoint only                          | exact URL/key/GET; no server own signal; abort/client/origin/gates     | Pending   | source 결과 아님; Todo 12 구현 전 lock, Todo 13은 blocked              |
| 2026-08-05T23:53:36Z     | `394d2ad`  | Oracle은 function-level server-only, browser/server import graph, native error semantics, normalization과 driver 경계를 implementation blocker로 판정했다. | parser/getter와 browser/server service를 module로 분리하고 native/input contracts를 exact하게 좁히면 checkpoint가 구현 가능해진다.      | corrected RFC를 같은 blocker 목록과 대조하고 source 없이 format/docs scope를 검증한다.                                    | RFC blocker correction only                           | Oracle `ses_02baf8f8cffe3N4QDKPfEzOeSI` blocker 전부 반영              | Pending   | source 결과 아님; corrected checkpoint 재검증 전 Todo 12/13 blocked    |
| 2026-08-06T00:58:47.030Z | `4a54e50`  | canonical request/origin/browser-server descriptor/native errors/per-call clients가 25-payload evidence와 current source에서 일치했다.                     | 분리된 trust/transport/cache lifetime 경계가 Todo 11 browser 동작을 보존하면서 Todo 13의 단일 server request seam을 제공한다.           | focused/full gates, actual typed driver, raw CDP terminals, fail-closed validator와 independent verifier를 교차 확인했다. | Todo 12 source chain과 sealed evidence만 판정         | 95 focused/227 full; build `hAZ_keSgirWHxBHrbNqvK`; verifier CONFIRMED | pass      | **KEEP**; metadata consumption/memoization/Todo 13/BasicAfter Pending  |

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
- Todo 10에서는 AI가 focused/full gate, production CDP Network capture, report/hash/cleanup
  sidecar 작성을 수행했고, independent verifier `ses_02ce29151fferq5FLLQ8Vo3tal`이 raw event와
  source/test/scope를 별도로 재검증했다. KEEP은 이 확인 뒤에만 기록했다.
- Todo 11에서는 AI가 QueryObserver/integration test, production recipe 자동화, CDP/AX/keyboard/CLS
  payload, hash/manifest/validator와 visual reviewer를 수행했다. 초기 차단 결과도 보존했고,
  independent verifier `ses_02c50bd75ffecERMMo2z4eJ98n`의 corrected sealed-state `CONFIRMED` 뒤에만
  KEEP을 기록했다. 접근성 근거는 자동 Chrome AX/keyboard이며 human VoiceOver로 표현하지 않는다.
- Todo 12에서는 AI가 implementation/test chain, production native driver, browser CDP ledger,
  hash manifest와 fail-closed validator를 수행했다. collection red가 assertion-level이 아닌 0-assertion
  collection failure임을 그대로 기록했고, independent verifier `ses_02b74359bffekX8SkkcdWGSNV9`의
  `CONFIRMED` 뒤에만 KEEP을 기록했다.
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
- Todo 10의 browser-only signal과 signal-free server factory를 source `345e13f`로 구현하고 README
  correction 뒤 clean `e318b92`를 측정했다. 세 superseded Chrome transport abort, final 200,
  URL/key/GET/`p17,p20,p19`, 2.513초 post-wait no error/stale overwrite와 44 focused/172 full
  tests 및 모든 gate를 확인해 KEEP했다. Route Handler 종료/server count 감소는 주장하지 않는다.
- Todo 11 source 변경 전 clean `b123b91`에서 current defects, TanStack v5 상태 판별,
  last-success query-key-only retention, fixed 12-card skeleton, exact six production recipes,
  accessibility/geometry/evidence와 KEEP/FIX/REVERT/stop rule을 decision-complete 상태로 고정했다.
- independent verifier의 `NOT_CONFIRMED` blockers를 반영해 list-only 5xx override, exact retry
  cardinality, same-document `useSearchParams` seam, internal/browser evidence 분리, tablet과 numeric CLS,
  out-of-range page-2 DOM 계약을 source 변경 전에 추가로 고정했다.
- Todo 11 final measured source `9a93f21`은 browser product-list에만 identity placeholder와 inline
  5xx override를 적용하고 last real-success key metadata/cache lookup, displayed key remount, fixed
  12-card geometry와 cold/refresh/empty/error/retry/cancel/recovery를 구현했다. server/Home/global
  정책은 그대로다.
- 여섯 production recipe는 exact URL/GET/visible IDs, 2+2 error retry, same-document retention,
  cancellation/latest result, post-wait recovery를 통과했고 모든 viewport에서 no-recent-input shift
  entry와 CLS는 0이다. R1 총 15개 entry는 모두 recent input이다. tracked screenshot 08-13, 세
  independent review, 자동 AX/keyboard evidence, 166-payload manifest와 fail-closed validator를
  봉인했다.
- final gate는 23 files/187 tests, lint, typecheck, production build, LSP를 통과했고 independent final
  verifier가 no-blocker `CONFIRMED`를 반환해 Todo 11을 **KEEP**했다.
- Todo 12 source 변경 전에 canonical `ProductListRequest`, browser/server descriptor, strict
  `APP_ORIGIN`, native-fetch error/schema path, per-call `getQueryClient`, red-first tests, production/driver
  evidence와 KEEP/FIX/REVERT 및 Todo 13 stop rule을 decision-complete 상태로 고정했다.
- Oracle `ses_02baf8f8cffe3N4QDKPfEzOeSI`의 FIX 판정에 따라 pure parser/server-only getter,
  browser/server import graph, native response/error semantics, exact Next-like normalization, default port,
  `npx --yes tsx` driver와 StrictMode client wording을 source 구현 전에 교정했다.
- Todo 12 final source `4a54e50`은 normalized readonly request에서 exact key와 browser relative/server
  absolute signal-free GET을 만들고 strict origin, native error/schema path와 per-call QueryClient를
  구현했다. provider는 mounted lifetime client를 유지하며 server singleton은 없다.
- focused 95/full 227 tests, format/lint/typecheck/build/check/LSP, actual typed driver, browser CDP와
  25-payload manifest/fail-closed validator를 봉인했다. independent verifier가 `CONFIRMED`해 Todo 12를
  **KEEP**했다. metadata/body consumption과 memoization/server count는 관찰하지 않았다.

### Pending

- Todo 13 metadata 문서·응답 시점, prefetch/hydration
- Todo 13 metadata/body의 canonical factory 실제 소비, 같은 render/request native fetch memoization과
  server-side call-count 직접 관찰
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

- [x] 데이터 없는 최초 진입, 이전 데이터가 있는 갱신, 성공 + 0건, 최초 실패, 갱신
      실패, 취소 화면을 구분했는가
- [x] 현재 URL의 active query와 화면 결과가 일치하고, 이전 요청의 늦은 완료가 화면을
      덮지 않는가
- [x] 취소된 요청을 별도로 관찰했고 오류로 보이지 않게 했는가
- [x] 서버 응답을 Zustand나 로컬 상태에 복사하지 않았는가
- [x] fallback과 실제 콘텐츠 교체에서 CLS가 생기지 않는가

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
