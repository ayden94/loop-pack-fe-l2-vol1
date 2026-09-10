import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import ts from 'typescript'

const layers = ['app', 'views', 'widgets', 'features', 'entities', 'shared']

function layerOf(file) {
  const match = file.replaceAll('\\', '/').match(/(?:^|\/)src\/([^/]+)(?:\/|$)/)
  return match ? layers.indexOf(match[1]) : -1
}

export function findLayerViolations(file, source) {
  const from = layerOf(file)
  if (from < 0) return []
  const violations = []
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const inspect = (node) => {
    let specifier
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = node.moduleSpecifier
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      specifier = node.arguments[0]
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument)
    ) {
      specifier = node.argument.literal
    }
    if (
      specifier &&
      (ts.isStringLiteral(specifier) ||
        ts.isNoSubstitutionTemplateLiteral(specifier))
    ) {
      const text = specifier.text
      const target = text.startsWith('@/')
        ? `src/${text.slice(2)}`
        : text.startsWith('.')
          ? resolve(dirname(file), text)
          : ''
      const to = layerOf(target)
      if (to >= 0 && to < from) {
        violations.push({
          file,
          line:
            ast.getLineAndCharacterOfPosition(specifier.getStart(ast)).line + 1,
          from: layers[from],
          to: layers[to],
          specifier: text,
        })
      }
    }
    ts.forEachChild(node, inspect)
  }
  inspect(ast)
  return violations
}

async function scan(directory) {
  const violations = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) {
      violations.push(...(await scan(file)))
    } else if (/\.[cm]?[jt]sx?$/.test(file) && !/\.test\.[jt]sx?$/.test(file)) {
      violations.push(
        ...findLayerViolations(file, await readFile(file, 'utf8')),
      )
    }
  }
  return violations
}

async function main() {
  if (process.argv.includes('--help')) {
    process.stdout.write(
      'Usage: node scripts/ci/check-layer-boundaries.mjs [source-directory]\nRejects static upward FSD imports/exports/dynamic imports; tests and non-layer infrastructure are excluded.\n',
    )
    return
  }
  const violations = await scan(process.argv[2] ?? 'src')
  process.stdout.write(
    `${JSON.stringify({ passed: violations.length === 0, violations })}\n`,
  )
  if (violations.length) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main()
