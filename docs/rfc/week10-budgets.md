# Week 10 번들·환경 예산 결정

## S8 측정 기준과 결정

기존 [7주차 RFC](./week07-performance.md)의 BasicAfterSHA
`d1278d0778492f13d2a70c064432df64e6b238f5`를 별도 worktree에서 재현했다.
기존 `.local/week07-performance-evidence`의 원시 Lighthouse 파일은 현재 없으므로
아래는 당시 기록을 복원했다고 주장하지 않는 **2026-09-10 보충 측정**이다.
원본 소스를 변경하지 않고 frozen lockfile, Node 24.17.0, production build·server로
측정했다. 7주차 build에 필요한 APP_ORIGIN도 지정했다.

측정 단위는 HTML에 실제 포함된 초기 외부 script URL들의 중복 제거 후
`Accept-Encoding: gzip` 응답 본문 byte 합계다. HTTP 헤더·이미지·CSS·동적 후속 import는
제외한다. 전체 네트워크 전송량이나 Lighthouse 점수와 혼동하지 않는다.
현재 측정 source는 S6 `f0dce100`과 실행 코드가 같은 S7 결과 시점이다.

| source     | 경로      | 3회 raw(bytes)         | 중앙값 | 범위          |
| ---------- | --------- | ---------------------- | ------ | ------------- |
| 7주차 재현 | /         | 296375, 296375, 296375 | 296375 | 296375~296375 |
| 7주차 재현 | /products | 297973, 297973, 297973 | 297973 | 297973~297973 |
| 현재       | /         | 299731, 299731, 299731 | 299731 | 299731~299731 |
| 현재       | /products | 301370, 301370, 301370 | 301370 | 301370~301370 |

실제 응답은 모두 gzip이었다. 원본 대비 현재 증가량은 각각 3356·3397 bytes다.
초기 JS 진입점은 현재 14·15개이며 각 URL은 한 번만 합산했다.
이는 HTTP 직접 측정이지 브라우저 hydration 완료 후 모든 lazy chunk 측정이 아니다.

## 결정

두 경로의 초기 gzip JS 예산을 **각 340 KiB(348160 bytes)**로 둔다.
현재 더 큰 products 측정값보다 약 15.5%의 여유다. 7주차 이후 인증 등 기능 증가가
약 1.1%였다는 근거와 현재 동일 build 반복 측정 범위를 고려했다.
큰 무심코 추가한 의존성은 차단하되 작은 chunk 구성 변화는 허용하는 시작 예산이며,
상향은 원인과 재측정 근거를 문서화해야 한다.

게이트는 같은 production 서버의 실제 HTML과 gzip JS 응답을 읽는다. route가 오류이거나
script가 없거나 JS 응답을 읽지 못하면 0 bytes로 통과시키지 않고 실패한다.
PR summary에는 경로·실측·한도·초과량을 실패 시에도 표시한다.

Lighthouse CI는 이번에 채택하지 않는다. 7주차에서 이미 LCP/CLS를 측정했고,
hosted 환경의 변동성이 있으므로 결정적인 JS 예산과 별도로 advisory 영역에 남긴다.
Preview/Production 외부 배포 URL은 확인되지 않았으며 새 유료 배포는 하지 않는다.

## S10 환경 계약

`pnpm build`는 `pnpm env:check`가 성공한 뒤에만 Next build를 시작한다.
실제 Next production `.env*` 로딩을 사용하며 로그에는 변수 이름과 이유만 출력한다.

| 환경 변수             | 계약                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| APP_ENV               | test / development / preview / production 중 명시                                               |
| APP_ORIGIN            | 실제 서버 API 요청에 쓰는 HTTP(S) origin. path·query·hash·credentials 금지                      |
| AUTH_SESSION_SECRET   | 비어 있지 않은 명시 값. 기존 코드의 fallback 값 사용 금지                                       |
| PRODUCTION_APP_ORIGIN | preview에서 필수. preview APP_ORIGIN과 다르게 설정                                              |
| NEXT*PUBLIC*\*        | SECRET·PASSWORD·PRIVATE_KEY·ACCESS_TOKEN·REFRESH_TOKEN·DATABASE_URL 접미사는 서버 전용으로 차단 |

preview/production origin은 HTTPS를 요구한다. 공개 API URL이나 publishable key를
모두 금지하는 규칙은 아니다. CI는 `APP_ENV=test`와 공개 테스트 전용 secret을 쓰며
실제 배포 secret·GitHub secrets를 읽거나 변경하지 않는다.
실제 배포는 별도 환경에서 올바른 origin과 비밀 값을 제공해야 한다.

로컬 검증 예시(실제 배포용 secret이 아님):

```sh
APP_ENV=test APP_ORIGIN=http://127.0.0.1:3000 \
AUTH_SESSION_SECRET=local-test-only-not-for-production pnpm check
```

누락·URL 오류·민감 공개 변수·Preview의 production origin 사용은 결정적으로 실패한다.
환경 파일 파싱 실패도 성공으로 삼지 않는다. 예산·env 실패는 job summary에 표시한다.
