import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
const convert = require('koa-convert')
import * as logger from 'koa-logger'
import mongoose = require('mongoose')
import * as mount from 'koa-mount'
import * as serve from 'koa-static'
import * as cors from '@koa/cors'
const bouncer = require('koa-bouncer')

import { config } from '../config'
import { errorMiddleware } from '../src/middleware'

const app = new Koa()

mongoose.Promise = global.Promise
mongoose.connect(config.database)

app.use(cors({ allowHeaders: [ '*', 'Access-Token' ], allowMethods: '*' }))
app.use(convert(logger()))
app.use(bodyParser())
app.use(errorMiddleware())
app.use(bouncer.middleware())

app.use(convert(mount('/resources', serve(`${process.cwd()}/resources`))))

const modules = require('../src/modules')
modules(app)

app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`)
})

export default app
