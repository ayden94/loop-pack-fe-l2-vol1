import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

const execute = promisify(execFile)
const scriptPath = fileURLToPath(
  new URL('./classify-docs-only.mjs', import.meta.url),
)
const directories: Array<string> = []

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

async function command(
  changedCount: string,
  docsCount: string,
  eventName = 'pull_request',
) {
  const directory = await mkdtemp(join(tmpdir(), 'ci-docs-only-'))
  directories.push(directory)
  const output = join(directory, 'github-output')
  const run = () =>
    execute(process.execPath, [scriptPath], {
      env: {
        ...process.env,
        GITHUB_OUTPUT: output,
        GITHUB_EVENT_NAME: eventName,
        CHANGED_COUNT: changedCount,
        DOCS_COUNT: docsCount,
      },
      timeout: 10_000,
    })
  return { run, output }
}

describe('classifyDocsOnly', () => {
  it.each([
    ['1', '1', 'pull_request', true],
    ['3', '3', 'pull_request', true],
    ['2', '2', 'pull_request', true],
    ['2', '1', 'pull_request', false],
    ['1', '0', 'pull_request', false],
    ['0', '0', 'pull_request', false],
    ['2999', '2999', 'pull_request', true],
    ['3000', '3000', 'pull_request', false],
    ['3001', '3001', 'pull_request', false],
    ['1', '1', 'push', false],
    ['3', '3', 'merge_group', false],
  ])(
    'classifyDocsOnly: changed=%s docs=%s event=%s -> docsOnly=%s',
    async (changed, docs, event, expected) => {
      const { run, output } = await command(changed, docs, event)

      await run()

      expect(await readFile(output, 'utf8')).toBe(
        `docs_only=${String(expected)}\n`,
      )
    },
  )

  it.each([
    ['', '1'],
    ['1', ''],
    ['-1', '0'],
    ['1', '-1'],
    ['1.5', '1'],
    ['1', '0.5'],
    ['1e2', '1'],
    ['01', '1'],
    ['1', '01'],
    [' 1', '1'],
    ['1', '2'],
    ['NaN', '0'],
    ['9007199254740992', '0'],
  ])(
    'classifyDocsOnly: invalid counts %s/%s -> fails without publishing skip',
    async (changed, docs) => {
      const { run, output } = await command(changed, docs)

      await expect(run()).rejects.toMatchObject({ code: 1 })
      await expect(readFile(output, 'utf8')).rejects.toMatchObject({
        code: 'ENOENT',
      })
    },
  )

  it('classifyDocsOnly: missing event -> fails without publishing skip', async () => {
    const { run, output } = await command('1', '1', '')

    await expect(run()).rejects.toMatchObject({ code: 1 })
    await expect(readFile(output, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })
})
