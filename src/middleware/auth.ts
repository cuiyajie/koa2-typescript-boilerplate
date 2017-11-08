import { CustomError } from '../utils/error';
import { config } from '../../config';
import { UserModel, IUser } from '../models/users'
import * as Koa from 'koa';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';

export async function ensureUser(ctx: Koa.Context, next: Function) {
  try {
    const authToken = ctx.headers['access-token']
    if (authToken) {
      const decoded = jwt.verify(authToken, config.token) as { id: string }
      ctx.state.user = await UserModel.findById(decoded.id, '-password')
      return next()
    } else {
      throw(new CustomError(401, 'no access token'))
    }
  } catch(err) {
    throw err
  }
}