import * as Koa from 'koa'
import * as _ from 'lodash';

export async function parseParams(ctx: Koa.Context, next: Function) {
  try {
    if (ctx.method.toLowerCase() === 'post') {
      const { body } = ctx.request as any
      _.forIn(body, (val, key) => {
        body[key] = JSON.parse(val)
      })
    }
    return next()
  } catch(err) {
    throw err
  }
}