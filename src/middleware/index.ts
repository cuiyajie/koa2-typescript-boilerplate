import { CustomError } from '../utils/error';
import * as Koa from 'koa';

export function errorMiddleware () {
  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
      await next()
    } catch (err) {
      if (err instanceof CustomError) {
        ctx.status = 500
        ctx.body = err.toJSON()
      } else {
        ctx.status = err.status || 500
        ctx.body = {
          status: err.status || 500,
          message: err.message
        }
      }
      ctx.app.emit('error', err, ctx)
    }
  }
}