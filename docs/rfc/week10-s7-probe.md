# S7 문서 전용 PR fixture

이 파일은 허용된 RFC 경로만 변경했을 때의 원격 검증을 위한 실험 fixture다.
실행 코드·설정·의존성은 변경하지 않는다.

기본 test·lint·typecheck·build와 required quality는 성공해야 한다.
정상 문서 전용 분류에서는 Chromium 설치와 E2E만 생략되어야 한다.

이 PR은 실제로 merge하지 않으며, 검증 후 미머지 종료한다.
