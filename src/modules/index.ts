import Application from 'koa'
import * as glob from 'glob'
import * as Router from 'koa-router'
import { KoaRoute } from '../typings/koa';

exports = module.exports = function initModules (app: Application) {
  glob(`${__dirname}/*`, { ignore: '**/index.ts' }, (err, matches) => {
    if (err) { throw err }

    matches.forEach((mod) => {
      const router = require(`${mod}/router`)

      const routes: KoaRoute[] = router.default
      const baseUrl = router.baseUrl
      const instance = new Router({ prefix: baseUrl })

      routes.forEach((config) => {
        const {
          method = '',
          route = '',
          handlers = [] as Array<Router.IMiddleware>
        } = config

        const lastHandler = handlers.pop()

        if (lastHandler) {
          instance[method.toLocaleLowerCase()](route, ...handlers, async function(ctx: Application.Context, next: () => Promise<any>) {
            return await lastHandler(ctx, next)
          })
        }

        app
          .use(instance.routes())
          .use(instance.allowedMethods())
      })
    })
  })
}
