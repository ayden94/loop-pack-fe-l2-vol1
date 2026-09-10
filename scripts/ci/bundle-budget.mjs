import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { appendFile, readFile } from 'node:fs/promises'
import { get } from 'node:http'
import { pathToFileURL } from 'node:url'

export function isWithinBudget(bytes, limit) {
  return (
    Number.isSafeInteger(bytes) &&
    Number.isSafeInteger(limit) &&
    bytes >= 0 &&
    limit > 0 &&
    bytes <= limit
  )
}

async function encodedBytes(url) {
  return new Promise((resolve, reject) => {
    const request = get(
      url,
      { headers: { 'Accept-Encoding': 'gzip' } },
      async (response) => {
        try {
          if (response.statusCode !== 200) {
            response.resume()
            throw new Error(
              `JavaScript response status: ${response.statusCode}`,
            )
          }
          let bytes = 0
          for await (const chunk of response) bytes += chunk.length
          resolve(bytes)
        } catch (error) {
          reject(error)
        }
      },
    )
    request.setTimeout(30_000, () =>
      request.destroy(new Error('JavaScript response timeout')),
    )
    request.on('error', reject)
  })
}

export async function measureRoutes(baseURL, routes) {
  if (!Array.isArray(routes) || routes.length === 0)
    throw new Error('No budget routes configured.')
  const base = new URL(baseURL)
  if (
    base.protocol !== 'http:' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)
  ) {
    throw new Error(
      'Bundle measurement requires a local HTTP production server.',
    )
  }
  const results = []
  for (const route of routes) {
    if (
      typeof route.path !== 'string' ||
      !route.path.startsWith('/') ||
      route.path.startsWith('//') ||
      !Number.isSafeInteger(route.limitBytes) ||
      route.limitBytes <= 0
    )
      throw new Error('Invalid route budget configuration.')
    const page = new URL(route.path, base)
    if (page.origin !== base.origin)
      throw new Error('Route must use the measurement origin.')
    const response = await fetch(page, {
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok)
      throw new Error(`Route ${route.path} returned ${response.status}.`)
    const html = await response.text()
    const scripts = [
      ...new Set(
        [
          ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js(?:\?[^"]*)?)"/g),
        ].map((match) => match[1]),
      ),
    ]
    if (scripts.length === 0)
      throw new Error(`Route ${route.path} has no initial JavaScript.`)
    let bytes = 0
    for (const script of scripts) {
      const url = new URL(script.replaceAll('&amp;', '&'), base)
      if (url.origin !== base.origin)
        throw new Error('External JavaScript needs an explicit budget policy.')
      bytes += await encodedBytes(url)
    }
    results.push({
      path: route.path,
      bytes,
      limitBytes: route.limitBytes,
      overageBytes: Math.max(0, bytes - route.limitBytes),
      scripts: scripts.length,
      passed: isWithinBudget(bytes, route.limitBytes),
    })
  }
  return results
}

async function main() {
  if (process.argv.includes('--help')) {
    process.stdout.write(
      'Usage: node scripts/ci/bundle-budget.mjs\nBUNDLE_CONFIG: optional JSON path. BUNDLE_BASE_URL: optional existing local production server.\n',
    )
    return
  }
  let server
  try {
    const config = JSON.parse(
      await readFile(process.env.BUNDLE_CONFIG ?? 'bundle-budget.json', 'utf8'),
    )
    const baseURL = process.env.BUNDLE_BASE_URL ?? 'http://127.0.0.1:3199'
    if (!process.env.BUNDLE_BASE_URL) {
      server = spawn(
        process.execPath,
        ['node_modules/next/dist/bin/next', 'start', '-p', '3199'],
        {
          env: { ...process.env, APP_ORIGIN: baseURL },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )
      await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Production server startup timeout.')),
          30_000,
        )
        let output = ''
        const finish = (error) => {
          clearTimeout(timer)
          if (error) reject(error)
          else resolve()
        }
        server.once('error', finish)
        server.once('exit', () =>
          finish(new Error('Production server exited before measurement.')),
        )
        server.stderr.on('data', (data) => process.stderr.write(data))
        server.stdout.on('data', (data) => {
          output += data.toString()
          if (output.includes('Ready in')) finish()
        })
      })
    }
    const results = await measureRoutes(baseURL, config.routes)
    process.stdout.write(`${JSON.stringify({ results })}\n`)
    const summary = [
      '## Initial JavaScript budget',
      '',
      '| Route | Encoded bytes | Limit bytes | Overage bytes | Result |',
      '| --- | --- | --- | --- | --- |',
      ...results.map(
        (r) =>
          `| ${r.path} | ${r.bytes} | ${r.limitBytes} | ${r.overageBytes} | ${r.passed ? 'PASS' : 'FAIL'} |`,
      ),
      '',
    ].join('\n')
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
    if (results.some((r) => !r.passed)) process.exitCode = 1
  } catch (error) {
    process.stderr.write(`Bundle gate failed: ${error.message}\n`)
    if (process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `## Bundle gate failed\n\nMeasurement failed; inspect the budget step. No zero-byte pass was recorded.\n`,
      )
    }
    process.exitCode = 1
  } finally {
    if (server && server.exitCode === null) {
      const stopped = once(server, 'exit')
      server.kill()
      await stopped
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main()
