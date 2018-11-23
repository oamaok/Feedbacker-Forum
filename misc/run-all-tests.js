const childProcess = require('child_process')
const { promisify } = require('util')

const verbose = process.argv.includes('--verbose')
const ci = process.argv.includes('--ci')

const pAllStages = []

const exec = (name, cmd, opts) => {
  const pStage = new Promise((resolve, reject) => {
    console.log(`-> ${name}`)

    const allOpts = {
      ...(opts || {}),
    }

    let [file, ...args] = cmd.split(' ')

    if (file == 'npm' && /^win/.test(process.platform)) {
      file = 'npm.cmd'
    }

    const begin = new Date().getTime()

    childProcess.execFile(file, args, allOpts, (error, stdout, stderr) => {
      const end = new Date().getTime()

      const duration = (end - begin) / 1000.0
      const prefix = error ? `!! ${name}` : `## ${name}`
      const suffix = error ? `Failed with code ${error.code}` : `${duration.toFixed(2)}s`
      const info = [`${prefix}: ${suffix}`]

      if (error)
        info.unshift('')

      if (verbose && stdout)
        info.push(stdout)

      if (error) {
        if (stderr) info.push('', stderr)
        if (stdout) info.push('', stdout)
        info.push('')
      }
      else if (verbose && stderr)
        info.push(stderr)

      console.log(info.join('\n'))

      if (error) {
        reject({ stage: name, error, stderr })
      } else {
        resolve()
      }
    })
  })

  pAllStages.push(pStage)
  return pStage
}

const defer = (func) => {
  const pStage = new Promise((resolve, reject) => {
    return func().then(resolve).catch(reject)
  })

  pAllStages.push(pStage)
  return pStage
}

const run = async () => {
  const pCreateBuildDir = exec('create build directory', 'mkdir -p build')

  const pDockerPreload = ['node:10.13-alpine', 'nginx:alpine', 'postgres:alpine'].map(image => {
    exec(`docker preload ${image}`, `docker pull ${image}`)
  })

  const pInstallServer = exec('npm install server', 'npm install', { cwd: 'server' })
  const pInstallClient = exec('npm install client', 'npm install', { cwd: 'client' })

  const lintCmd = ci ? 'lint:ci' : 'lint'
  const pLintServer = defer(async () => {
    await pInstallServer
    await exec('lint server', `npm run ${lintCmd}`, { cwd: 'server' })
  })

  const pLintClient = defer(async () => {
    await pInstallClient
    await exec('lint client', `npm run ${lintCmd}`, { cwd: 'client' })
  })

  await pInstallServer
  await pInstallClient

  const pDockerBuild = defer(async () => {
    await pDockerPreload
    await exec('docker base image',
      'docker build -t feedbacker-build . -f docker/builder/Dockerfile')
  })

  const pDocumentation = defer(async () => {
    await pCreateBuildDir
    await exec('copy committed api.md', 'cp docs/api.md build/api.md')
    await exec('list endpoints',
      'npm run start -- --listEndpoints ../build/endpoints.json',
      { cwd: 'server' })
    await exec('create documentation',
      'npm run doc -- --endpoints ../build/endpoints.json',
      { cwd: 'server' })

    await exec('compare generated api.md', 'diff build/api.md docs/api.md')
  })

  const pBuilds = defer(async () => {
    await pDockerBuild
    await exec('build client development', 'npm run build:dev', { cwd: 'client' })
    await exec('build client production', 'npm run build', { cwd: 'client' })
  })

  const pTestServer = exec('test local server', 'npm run test:api', { cwd: 'server' })

  const buildDocker = (env) => defer(async () => {
    await pDockerBuild
    const opts = { cwd: `docker/${env}` }
    await exec(`build ${env} docker`, 'docker-compose build', opts)
  })

  const startDocker = (env) => defer(async() => {
    const opts = {
      cwd: `docker/${env}`,
      env: {
        ...process.env,
        APP_SERVER_PORT: '8080',
      },
    }

    await exec(`start ${env} docker`, 'docker-compose up -d', opts)
    await exec(`test ${env} docker`, 'npm run test:remoteapi', { cwd: 'server' })
    await exec(`stop ${env} docker`, 'docker-compose down', opts)
  })

  const pBuildDev = buildDocker('development')
  const pBuildProd = buildDocker('production')

  const pTestDockers = defer(async () => {
    await pBuildDev
    await startDocker('development')
    await pBuildProd
    await startDocker('production')
  })

  await Promise.all(pAllStages)
}

const main = async () => {
  try {
    await run()
    console.log('All tests passed succesfully!')
  } catch (error) {
    if (!error.stage) {
      console.error('Failed to run tests')
      console.error(error)
    }
    process.exitCode = 1
  }
}

main()

