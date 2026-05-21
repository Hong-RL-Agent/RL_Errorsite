import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataset = 'frontend-errorsite'
const docsRoot = join(repoRoot, 'docs')
const datasetRoot = join(docsRoot, dataset)
const defaultSites = ['site001', 'site002', 'site003', 'site004', 'site005']

function getRequestedSites() {
  const args = process.argv.slice(2)
  const sitesArg = args.find(arg => arg.startsWith('--sites='))

  if (sitesArg) {
    return sitesArg
      .replace('--sites=', '')
      .split(',')
      .map(site => site.trim())
      .filter(Boolean)
  }

  return defaultSites
}

function findSiteDirectories() {
  return readdirSync(repoRoot)
    .filter(name => /^site\d{3}/.test(name))
    .map(name => ({ id: name.match(/^site\d{3}/)[0], name, path: join(repoRoot, name) }))
    .filter(site => statSync(site.path).isDirectory())
}

function run(command, args, cwd) {
  const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command
  const result = spawnSync(executable, args, {
    cwd,
    stdio: 'inherit',
    shell: false
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed in ${basename(cwd)}`)
  }
}

function assertInside(parent, child) {
  const parentPath = resolve(parent)
  const childPath = resolve(child)

  if (!childPath.startsWith(parentPath)) {
    throw new Error(`Refusing to write outside ${parentPath}: ${childPath}`)
  }
}

function copyDist(site) {
  const distPath = join(site.path, 'dist')
  const targetPath = join(datasetRoot, site.id)

  if (!existsSync(join(distPath, 'index.html'))) {
    throw new Error(`${site.id} build did not create dist/index.html`)
  }

  assertInside(datasetRoot, targetPath)
  rmSync(targetPath, { recursive: true, force: true })
  mkdirSync(targetPath, { recursive: true })
  cpSync(distPath, targetPath, { recursive: true })
}

function writeIndex(sites) {
  mkdirSync(docsRoot, { recursive: true })
  const links = sites
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
        max-width: 880px;
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
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
      }

      a {
        display: block;
        padding: 14px 16px;
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

function main() {
  const requestedSites = getRequestedSites()
  const siteDirectories = findSiteDirectories()
  const selectedSites = requestedSites.map(id => {
    const site = siteDirectories.find(candidate => candidate.id === id)
    if (!site) throw new Error(`Could not find a source directory for ${id}`)
    return site
  })

  mkdirSync(datasetRoot, { recursive: true })

  for (const site of selectedSites) {
    const installArgs = existsSync(join(site.path, 'package-lock.json')) ? ['ci'] : ['install']

    console.log(`\n==> ${site.id}: ${site.name}`)
    run('npm', installArgs, site.path)
    run('npm', ['run', 'build'], site.path)
    copyDist(site)
  }

  writeIndex(selectedSites)
  console.log(`\nBuilt ${selectedSites.length} site(s) into docs/${dataset}/`)
}

main()
