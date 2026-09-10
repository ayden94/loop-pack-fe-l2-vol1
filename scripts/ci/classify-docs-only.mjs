import { appendFile } from 'node:fs/promises'

if (process.argv.includes('--help')) {
  process.stdout.write(
    'Usage: CHANGED_COUNT=<count> DOCS_COUNT=<count> GITHUB_EVENT_NAME=<event> GITHUB_OUTPUT=<path> node scripts/ci/classify-docs-only.mjs\n',
  )
  process.exit(0)
}

const { CHANGED_COUNT, DOCS_COUNT, GITHUB_EVENT_NAME, GITHUB_OUTPUT } =
  process.env
const countPattern = /^(0|[1-9]\d*)$/

if (!GITHUB_EVENT_NAME || !GITHUB_OUTPUT) {
  throw new Error('GITHUB_EVENT_NAME and GITHUB_OUTPUT are required.')
}
if (
  !countPattern.test(CHANGED_COUNT ?? '') ||
  !countPattern.test(DOCS_COUNT ?? '')
) {
  throw new Error('CHANGED_COUNT and DOCS_COUNT must be non-negative integers.')
}

const changedCount = Number(CHANGED_COUNT)
const docsCount = Number(DOCS_COUNT)
if (
  !Number.isSafeInteger(changedCount) ||
  !Number.isSafeInteger(docsCount) ||
  docsCount > changedCount
) {
  throw new Error(
    'Changed-file counts are inconsistent or outside the safe range.',
  )
}

const docsOnly =
  GITHUB_EVENT_NAME === 'pull_request' &&
  changedCount > 0 &&
  // PR 파일 API는 최대 3000개만 반환한다. 목록이 잘렸을 수 있으면 실행한다.
  changedCount < 3000 &&
  docsCount === changedCount
const output = `docs_only=${String(docsOnly)}\n`
await appendFile(GITHUB_OUTPUT, output)
process.stdout.write(output)
