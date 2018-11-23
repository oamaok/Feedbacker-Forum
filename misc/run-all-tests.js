const childProcess = require('child_process')
const { promisify } = require('util')

const pAllStages = []

const exec = (name, cmd, opts) => {
  const pStage = new Promise((resolve, reject) => {
    console.log(`Started stage: ${name}`)

    childProcess.exec(cmd, opts, (error, stdout, stderr) => {
      const code = error ? error.code : 0
      console.log([
        `Stage ${name} finished with code ${code}`,
        `command: ${cmd}`,
        stdout,
        stderr,
      ].join('\n'))

      if (error) {
        reject({ stage: name, error })
      } else {
        resolve()
      }
    })
  })

  pAllStages.push(pStage)
  return pStage
}

const run = async () => {
  const pCreateBuildDir = exec('create build directory', 'mkdir -p build')

  const pDockerPreload = ['node:10.13-alpine', 'nginx:alpine'].map(image => {
    exec(`docker preload ${image}`, `docker pull ${image}`)
  })

  const pInstallServer = exec('npm install server', 'npm install', { cwd: 'server' })
  const pInstallClient = exec('npm install client', 'npm install', { cwd: 'client' })

  await pInstallServer
  await pInstallClient

  const pLintServer = exec('lint server', 'npm run lint:ci', { cwd: 'server' })
  const pLintClient = exec('lint client', 'npm run lint:ci', { cwd: 'client' })

  const pDockerBuild = async () => {
    await pDockerPreload
    await exec('docker base image',
      'docker build -t feedbacker-build . -f docker/build/Dockerfile')
  }

  const pDocumentation = async () => {
    await pCreateBuildDir
    await exec('move committed api.md', 'mv docs/api.md build/api.md')
    await exec('list endpoints',
      'npm run start -- --listEndpoints ../build/endpoints.json',
      { cwd: 'server' })
    await exec('create documentation',
      'npm run doc -- --endpoints ../build/endpoints.json',
      { cwd: 'server' })

    await exec('compare generated api.md', 'diff build/api.md docs/api.md')
  }

  const pBuilds = async () => {
    await pDockerBuild
    await exec('build client development', 'npm run build:dev', { cwd: 'client' })
    await exec('build client production', 'npm run build', { cwd: 'client' })
  }

  const pTestServer = exec('test local server', 'npm run test:api', { cwd: 'server' })

  const buildDocker = async (env) => {
    await pDockerBuild
    const opts = { cwd: `docker/${env}` }
    await exec(`start ${env} docker`, 'docker-compose build', opts)
  }

  const startDocker = async (env) => {
    const opts = {
      cwd: `docker/${env}`,
      env: {
        ...process.env,
        APP_SERVER_PORT: '8080',
      },
    }

    await exec(`start ${env} docker`, 'docker-compose up -d', opts)
    await exec(`test ${env} docker`, 'bash misc/test-server.sh', opts)
    await exec(`stop ${env} docker`, 'docker-compose down', opts)
  }

  const pBuildDev = buildDocker('development')
  const pBuildProd = buildDocker('production')

  const pTestDockers = async () => {
    await pBuildDev
    await startDocker('development')
    await pBuildProd
    await startDocker('production')
  }

  await Promise.all(pAllStages)
}

run().then(() => {
  console.log('All tests passed succesfully!')
}).catch((error) => {
  if (error.stage) {
    console.error(`Failed at stage: ${error.stage}`)
    console.error(error.error)
  } else {
    console.error('Failed to run tests')
    console.error(error)
  }
  process.exitCode = 1
})

