import * as Router from 'koa-router'

export interface KoaRoute {
    method: string,
    route: string,
    handlers: Router.IMiddleware[]
}