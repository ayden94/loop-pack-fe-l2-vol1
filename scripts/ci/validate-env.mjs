import { appendFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

export function validateEnvironment(env) {
  const errors = []
  if (!['test', 'development', 'preview', 'production'].includes(env.APP_ENV)) {
    errors.push({
      variable: 'APP_ENV',
      reason: 'Choose test, development, preview or production.',
    })
  }
  if (
    !env.AUTH_SESSION_SECRET?.trim() ||
    env.AUTH_SESSION_SECRET === 'loopers-week09-secret' ||
    (['preview', 'production'].includes(env.APP_ENV) &&
      [
        'week10-ci-only-not-a-production-secret',
        'local-test-only-not-for-production',
      ].includes(env.AUTH_SESSION_SECRET))
  ) {
    errors.push({
      variable: 'AUTH_SESSION_SECRET',
      reason: 'An explicit non-default server secret is required.',
    })
  }
  const origins = {}
  const names = ['APP_ORIGIN']
  if (env.APP_ENV === 'preview') names.push('PRODUCTION_APP_ORIGIN')
  for (const name of names) {
    const value = env[name]
    try {
      const url = new URL(value)
      if (
        !value ||
        value.trim() !== value ||
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        value.includes('?') ||
        value.includes('#') ||
        (['preview', 'production'].includes(env.APP_ENV) &&
          url.protocol !== 'https:')
      )
        throw new Error('invalid origin')
      origins[name] = url.origin
    } catch {
      errors.push({
        variable: name,
        reason:
          'A valid HTTP(S) origin without credentials/path/query/hash is required; deployed environments require HTTPS.',
      })
    }
  }
  if (
    env.APP_ENV === 'preview' &&
    origins.APP_ORIGIN &&
    origins.APP_ORIGIN === origins.PRODUCTION_APP_ORIGIN
  ) {
    errors.push({
      variable: 'APP_ORIGIN',
      reason: 'Preview must not target the production API origin.',
    })
  }
  for (const name of Object.keys(env)) {
    if (
      /^NEXT_PUBLIC_(?:.*_)?(?:SECRET|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN|REFRESH_TOKEN|DATABASE_URL)$/.test(
        name,
      )
    ) {
      errors.push({
        variable: name,
        reason: 'Server credentials must not be exposed to the browser.',
      })
    }
  }
  return errors
}

async function main() {
  if (process.argv.includes('--help')) {
    process.stdout.write(
      'Required: APP_ENV, APP_ORIGIN, AUTH_SESSION_SECRET. Preview additionally requires PRODUCTION_APP_ORIGIN. Next production .env files are loaded. Values are never printed.\n',
    )
    return
  }
  const requireFromNext = createRequire(
    import.meta.resolve('next/package.json'),
  )
  const { loadEnvConfig } = requireFromNext('@next/env')
  let loadFailed = false
  loadEnvConfig(process.cwd(), false, {
    info() {},
    error() {
      loadFailed = true
    },
  })
  const errors = validateEnvironment(process.env)
  if (loadFailed)
    errors.push({
      variable: '.env',
      reason: 'Environment file loading failed.',
    })
  process.stdout.write(
    `${JSON.stringify({ passed: errors.length === 0, errors })}\n`,
  )
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = errors.length
      ? `## Environment gate failed\n\n| Variable | Reason |\n| --- | --- |\n${errors.map((e) => `| ${e.variable} | ${e.reason} |`).join('\n')}\n`
      : '## Environment gate\n\nPASS — required environment contract validated; no values exposed.\n'
    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
  }
  if (errors.length) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main()
