import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { createRequire } from 'node:module'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const requireForVm = createRequire(import.meta.url)
const dataset = 'frontend-errorsite'
const docsRoot = join(repoRoot, 'docs')
const datasetRoot = join(docsRoot, dataset)

function parseArgs() {
  const args = process.argv.slice(2)
  const sitesArg = args.find(arg => arg.startsWith('--sites='))
  const fromArg = args.find(arg => arg.startsWith('--from='))
  const toArg = args.find(arg => arg.startsWith('--to='))

  return {
    all: args.includes('--all') || (!sitesArg && !fromArg && !toArg),
    from: fromArg?.replace('--from=', ''),
    to: toArg?.replace('--to=', ''),
    sites: sitesArg
      ? sitesArg
          .replace('--sites=', '')
          .split(',')
          .map(site => site.trim())
          .filter(Boolean)
      : null
  }
}

function findSiteDirectories() {
  return readdirSync(repoRoot)
    .filter(name => /^site\d{3}/.test(name))
    .map(name => ({
      id: name.match(/^site\d{3}/)[0],
      name,
      path: join(repoRoot, name)
    }))
    .filter(site => statSync(site.path).isDirectory())
    .sort((a, b) => a.id.localeCompare(b.id))
}

function selectSites(siteDirectories, options) {
  if (options.sites) {
    return options.sites.map(id => {
      const site = siteDirectories.find(candidate => candidate.id === id)
      if (!site) throw new Error(`Could not find a source directory for ${id}`)
      return site
    })
  }

  return siteDirectories.filter(site => {
    if (options.from && site.id < options.from) return false
    if (options.to && site.id > options.to) return false
    return true
  })
}

function readPackage(site) {
  const packagePath = join(site.path, 'package.json')
  if (!existsSync(packagePath)) return null
  return JSON.parse(readFileSync(packagePath, 'utf8'))
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  if (result.error) {
    throw new Error(`${command} ${args.join(' ')} failed in ${basename(cwd)}: ${result.error.message}`)
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed in ${basename(cwd)} with exit code ${result.status}`)
  }
}

function assertInside(parent, child) {
  const parentPath = `${resolve(parent)}${process.platform === 'win32' ? '\\' : '/'}`
  const childPath = resolve(child)

  if (!childPath.startsWith(parentPath)) {
    throw new Error(`Refusing to write outside ${resolve(parent)}: ${childPath}`)
  }
}

function isViteSite(pkg) {
  const buildScript = pkg?.scripts?.build || ''
  return buildScript.includes('vite build') || Boolean(pkg?.dependencies?.vite || pkg?.devDependencies?.vite)
}

function ensureViteBase(site, pkg) {
  if (!isViteSite(pkg)) return null

  const configPath = join(site.path, 'vite.config.js')
  const hasReactPlugin = Boolean(pkg?.dependencies?.['@vitejs/plugin-react'] || pkg?.devDependencies?.['@vitejs/plugin-react'])

  if (!existsSync(configPath)) {
    const config = hasReactPlugin
      ? `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  base: './',\n  plugins: [react()]\n})\n`
      : `import { defineConfig } from 'vite'\n\nexport default defineConfig({\n  base: './'\n})\n`
    writeFileSync(configPath, config)
    return 'created vite.config.js with base ./'
  }

  const config = readFileSync(configPath, 'utf8')
  if (/base\s*:/.test(config)) return null

  const updated = config.replace(/defineConfig\(\s*\{/, "defineConfig({\n  base: './',")
  if (updated === config) {
    throw new Error(`${site.id} vite.config.js does not use defineConfig({ ... })`)
  }

  writeFileSync(configPath, updated)
  return 'added base ./ to vite.config.js'
}

function copyDirectory(sourcePath, targetPath) {
  assertInside(datasetRoot, targetPath)
  rmSync(targetPath, { recursive: true, force: true })
  mkdirSync(targetPath, { recursive: true })
  cpSync(sourcePath, targetPath, { recursive: true })
}

function rewriteStaticAssetPaths(targetPath) {
  const textExtensions = new Set(['.html', '.css', '.js', '.mjs'])

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      const ext = entry.name.includes('.') ? entry.name.slice(entry.name.lastIndexOf('.')) : ''
      if (!textExtensions.has(ext)) continue

      let content = readFileSync(fullPath, 'utf8')
      const original = content
      content = content
        .replaceAll('href="/', 'href="./')
        .replaceAll("href='/", "href='./")
        .replaceAll('src="/', 'src="./')
        .replaceAll("src='/", "src='./")
        .replaceAll('url("/', 'url("./')
        .replaceAll("url('/", "url('./")
        .replaceAll('url(/', 'url(./')

      if (content !== original) {
        writeFileSync(fullPath, content)
      }
    }
  }

  walk(targetPath)
}

function createFakeExpress(routes) {
  const app = {
    use() {},
    get(path, ...handlers) {
      routes.push({ method: 'GET', path, handler: handlers.at(-1) })
    },
    post(path, ...handlers) {
      routes.push({ method: 'POST', path, handler: handlers.at(-1) })
    },
    put(path, ...handlers) {
      routes.push({ method: 'PUT', path, handler: handlers.at(-1) })
    },
    delete(path, ...handlers) {
      routes.push({ method: 'DELETE', path, handler: handlers.at(-1) })
    },
    listen() {}
  }

  function express() {
    return app
  }

  express.json = () => (_req, _res, next) => next?.()
  express.urlencoded = () => (_req, _res, next) => next?.()
  express.static = () => (_req, _res, next) => next?.()
  express.Router = () => app

  return express
}

async function captureRoute(route) {
  return new Promise(resolve => {
    let done = false
    const finish = body => {
      if (done) return
      done = true
      resolve(body)
    }
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code
        return this
      },
      json(body) {
        finish(body)
      },
      send(body) {
        finish(body)
      },
      sendFile() {},
      set() {
        return this
      },
      type() {
        return this
      }
    }
    const req = {
      query: {},
      params: {},
      body: {},
      headers: {},
      method: route.method,
      path: route.path,
      url: route.path
    }

    try {
      const maybePromise = route.handler(req, res)
      if (maybePromise?.then) {
        maybePromise.then(() => setTimeout(() => finish(undefined), 0)).catch(() => finish(undefined))
      }
    } catch {
      finish(undefined)
    }

    setTimeout(() => finish(undefined), 1500)
  })
}

async function extractApiMocks(site, targetPath) {
  const serverPath = join(site.path, 'server.js')
  if (!existsSync(serverPath)) return []

  const routes = []
  const fakeExpress = createFakeExpress(routes)
  const sandboxRequire = id => {
    if (id === 'express') return fakeExpress
    if (id === 'cors') return () => (_req, _res, next) => next?.()
    return requireForVm(id)
  }

  const code = readFileSync(serverPath, 'utf8')
  const sandbox = {
    require: sandboxRequire,
    __dirname: site.path,
    __filename: serverPath,
    console: {
      log() {},
      error() {},
      warn() {}
    },
    process: {
      argv: [],
      env: process.env,
      exit() {}
    },
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  }

  try {
    vm.runInNewContext(code, sandbox, { filename: serverPath, timeout: 2000 })
  } catch {
    return []
  }

  const apiRoutes = routes.filter(route => route.method === 'GET' && route.path.startsWith('/api/') && !route.path.includes(':'))
  const written = []

  for (const route of apiRoutes) {
    const body = await captureRoute(route)
    if (body === undefined) continue

    const apiPath = join(targetPath, route.path.replace(/^\/api\//, 'api/'))
    assertInside(targetPath, apiPath)
    mkdirSync(dirname(apiPath), { recursive: true })

    const json = JSON.stringify(body, null, 2)
      .replaceAll('"/assets/', '"./assets/')
      .replaceAll("'\/assets/", "'./assets/")
    writeFileSync(apiPath, json)
    written.push(route.path)
  }

  if (written.length > 0) {
    const mockScriptPath = join(targetPath, 'pages-mock.js')
    writeFileSync(mockScriptPath, `(function () {
  var originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var rawUrl = typeof input === 'string' ? input : input && input.url;
    if (rawUrl && rawUrl.indexOf('/api/') === 0) {
      var source = new URL(rawUrl, window.location.origin);
      var target = new URL('./api/' + source.pathname.replace(/^\\/api\\//, ''), window.location.href);
      target.search = source.search;
      return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
          originalFetch(target.href, init).then(resolve, reject);
        }, 250);
      });
    }
    return originalFetch(input, init);
  };
}());
`)
    injectMockScript(join(targetPath, 'index.html'))
  }

  return written
}

function injectMockScript(indexPath) {
  if (!existsSync(indexPath)) return

  const html = readFileSync(indexPath, 'utf8')
  if (html.includes('pages-mock.js')) return

  const script = '    <script src="./pages-mock.js"></script>\n'
  const updated = html.includes('</head>')
    ? html.replace('</head>', `${script}  </head>`)
    : `${script}${html}`
  writeFileSync(indexPath, updated)
}

function writeIndex(successes) {
  mkdirSync(docsRoot, { recursive: true })
  const links = successes
    .map(site => `        <li><a href="./${dataset}/${site.id}/">${site.id}</a></li>`)
    .join('\n')

  writeFileSync(join(docsRoot, 'index.html'), `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>RL Error Sites</title>
    <style>
      :root {
        color: #172033;
        background: #f7f8fb;
        font-family: Arial, "Noto Sans KR", sans-serif;
      }

      body {
        margin: 0;
      }

      main {
        max-width: 1040px;
        margin: 0 auto;
        padding: 48px 20px;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 32px;
      }

      h2 {
        margin: 32px 0 12px;
        font-size: 20px;
      }

      p {
        margin: 0;
        color: #526070;
        line-height: 1.6;
      }

      ul {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
      }

      a {
        display: block;
        padding: 12px 14px;
        border: 1px solid #d9dee8;
        border-radius: 8px;
        background: #fff;
        color: #1d4ed8;
        text-decoration: none;
        font-weight: 700;
      }

      a:hover {
        border-color: #1d4ed8;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>RL Error Sites</h1>
      <p>이 배포본은 frontend-errorsite 기준 에러사이트를 GitHub Pages에서 확인하기 위한 정적 산출물입니다.</p>

      <section>
        <h2>frontend-errorsite</h2>
        <ul>
${links}
        </ul>
      </section>
    </main>
  </body>
</html>
`)
}

function writeReport(successes, failures, skipped, mockSummary, configChanges) {
  const successRows = successes.map(site => `- ${site.id}: ${site.name}`).join('\n') || '- 없음'
  const failureRows = failures.map(item => `- ${item.site.id}: ${item.site.name} - ${item.reason}`).join('\n') || '- 없음'
  const skippedRows = skipped.map(item => `- ${item.site.id}: ${item.site.name} - ${item.reason}`).join('\n') || '- 없음'
  const mockRows = mockSummary.map(item => `- ${item.site.id}: ${item.routes.join(', ')}`).join('\n') || '- 없음'
  const configRows = configChanges.map(item => `- ${item.site.id}: ${item.change}`).join('\n') || '- 없음'

  writeFileSync(join(docsRoot, 'BUILD_REPORT.md'), `# frontend-errorsite Pages Build Report

## Summary

- Dataset: \`${dataset}\`
- Output: \`docs/${dataset}/siteXXX/\`
- Success: ${successes.length}
- Failed: ${failures.length}
- Skipped: ${skipped.length}

## Successful Sites

${successRows}

## Failed Sites

${failureRows}

## Skipped Sites

${skippedRows}

## API Mock Routes

${mockRows}

## Vite Config Changes

${configRows}
`)
}

async function buildSite(site, pkg, summaries) {
  const targetPath = join(datasetRoot, site.id)
  const configChange = ensureViteBase(site, pkg)
  if (configChange) summaries.configChanges.push({ site, change: configChange })

  const installArgs = existsSync(join(site.path, 'package-lock.json')) ? ['ci'] : ['install']
  run('npm', installArgs, site.path)
  run('npm', ['run', 'build'], site.path)

  const distPath = join(site.path, 'dist')
  const publicPath = join(site.path, 'public')

  if (existsSync(join(distPath, 'index.html'))) {
    copyDirectory(distPath, targetPath)
  } else if (existsSync(join(publicPath, 'index.html'))) {
    copyDirectory(publicPath, targetPath)
  } else if (existsSync(join(site.path, 'index.html'))) {
    copyDirectory(site.path, targetPath)
  } else {
    throw new Error('build did not create dist/index.html and no public/index.html fallback exists')
  }

  rewriteStaticAssetPaths(targetPath)
  const routes = await extractApiMocks(site, targetPath)
  if (routes.length > 0) summaries.mockSummary.push({ site, routes })
}

async function main() {
  const options = parseArgs()
  const siteDirectories = findSiteDirectories()
  const selectedSites = selectSites(siteDirectories, options)
  const successes = []
  const failures = []
  const skipped = []
  const summaries = {
    mockSummary: [],
    configChanges: []
  }

  mkdirSync(datasetRoot, { recursive: true })

  for (const site of selectedSites) {
    console.log(`\n==> ${site.id}: ${site.name}`)
    const pkg = readPackage(site)
    if (!pkg) {
      const reason = 'package.json missing'
      console.log(`Skipping ${site.id}: ${reason}`)
      skipped.push({ site, reason })
      continue
    }

    try {
      await buildSite(site, pkg, summaries)
      successes.push(site)
    } catch (error) {
      failures.push({ site, reason: error.message })
      console.error(`Failed ${site.id}: ${error.message}`)
    }
  }

  writeIndex(successes)
  writeReport(successes, failures, skipped, summaries.mockSummary, summaries.configChanges)

  console.log(`\nBuilt ${successes.length} site(s) into docs/${dataset}/`)
  if (failures.length > 0) {
    console.log(`Failed ${failures.length} site(s):`)
    for (const item of failures) {
      console.log(`- ${item.site.id}: ${item.reason}`)
    }
  }
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} site(s):`)
    for (const item of skipped) {
      console.log(`- ${item.site.id}: ${item.reason}`)
    }
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
