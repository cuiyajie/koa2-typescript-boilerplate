import * as Koa from 'koa'
import { UserModel, IUser } from '../../models/users'

export async function fetchUser(ctx: Koa.Context) {
  const { query } = ctx.request as any;
  ctx['validateQuery']('page_number')['required']()['toInt']()
  ctx['validateQuery']('page_size')['required']()['toInt']()
  try {
    const result = await UserModel.paginate({}, { 
      select: '-password -token',
      page: ctx['vals']['page_number'], 
      limit: ctx['vals']['page_size']  
    })
    ctx.body = {
      users: result.docs.map(doc => doc.toJSON()),
      total: result.total,
      page: result.page
    }
  } catch (err) {
    throw err
  }
}

export async function fetchUserById(ctx: Koa.Context) {
  const { body } = ctx.request as any
  ctx['validateQuery']('user_id')['required']()
  try {
    const result = await UserModel.findById(ctx['vals'].user_id, '-password -token')
    ctx.body = {
      user: result
    }
  } catch (err) {
    throw err
  }
}

export async function createUser(ctx: Koa.Context) {
  const { body } = ctx.request as any
  ctx['validateBody']('username')['required']()
  ctx['validateBody']('password')['required']()
  ctx['validateBody']('name')['optional']()
  ctx['validateBody']('type')['required']()['toInt']()
  const user = new UserModel(body)
  try {
    await user.save()
  } catch (err) {
    throw err
  }
  
  const response = user.toJSON() as IUser
  delete response.password
  ctx.body = {
    user: response
  }
}

export async function updateUser(ctx: Koa.Context) {
  const { body } = ctx.request as any
  ctx['validateBody']('_id')['required']()
  try {
    const result = await UserModel.findByIdAndUpdate(body._id, body, { new: true }).select('-password')
    ctx.body = {
      user: result
    }
  } catch (err) {
    throw err
  }
}