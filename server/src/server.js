import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { checkInt, checkBool } from './check'
import { config } from './globals'
import apiVersion from './routes/version'
import apiRoute from './routes/routes'
import { notFound, devErr } from './handlers'

export function startServer() {
  const app = express()

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(express.static('../client/build'))
  }

  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
  app.use(morgan('dev'))
  app.use(apiVersion)

  app.use('/api', apiRoute)

  app.use(notFound)
  app.use(devErr)
  // app.use(prodErr)

  const port = checkInt('port', config.port)
  app.listen(port, () => {
    console.log(`Running on port ${port}`)
  })
}
