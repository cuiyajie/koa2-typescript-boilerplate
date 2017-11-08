import { CustomError } from '../../utils/error';
import * as mongoose from 'mongoose';
import { IUser, UserModel } from '../../models/users';
import * as Koa from 'koa';

export async function authUserWithToken (ctx: Koa.Context, next: Function) {
  ctx.body = {
    user: ctx.state.user
  }
}

export async function login(ctx: Koa.Context, next: Function) {
  const { username, password } = (ctx.request as any).body;
  try {
    const user = await UserModel.findOne({ username })
    if (user == null) {
      throw new CustomError(402, '用户不存在')
    } else if (user.validatePassword(password)) {
      const token = user.generateToken();
      user.token = token;
      await user.save();
      ctx.body = {
        user: user.toJSON()
      }
    } else {
      throw new CustomError(403, '密码错误')
    }
  } catch(err) {
    throw err
  }
}