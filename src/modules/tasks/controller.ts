import * as mongoose from 'mongoose';
import * as Koa from 'koa';
import { ClassificationTaskModel, ITask, TaskModel } from '../../models/tasks';
import { ClassificationObject } from '../../typings/task';
import * as _ from 'lodash';

export async function fetchTask(ctx: Koa.Context) {
  const { query } = ctx.request as any;
  ctx['validateQuery']('page_number')['required']()['toInt']()
  ctx['validateQuery']('page_size')['required']()['toInt']()
  try {
    const result = await TaskModel.paginate({}, { 
      populate: 'creator',
      select: '-content -creator.password -creator.token',
      page: ctx['vals']['page_number'], 
      limit: ctx['vals']['page_size'],
      sort: { created_at: -1 }
    })
    ctx.body = {
      tasks: result.docs.map(doc => doc.toJSON()),
      total: result.total,
      page: result.page
    }
  } catch (err) {
    throw err
  }
}

export async function fetchTaskById(ctx: Koa.Context) {
  const { body } = ctx.request as any
  ctx['validateQuery']('task_id')['required']()
  try {
    const result = await TaskModel.findById(ctx['vals'].task_id, '-creator.password -creator.token')
    ctx.body = {
      task: result
    }
  } catch (err) {
    throw err
  }
}

export async function createTask(ctx: Koa.Context) {
  const { body } = ctx.request as any
  const task = new TaskModel({ ...body.task, creator: ctx.state.user, created_at: new Date() })
  try {
    await task.save()
  } catch(err) {
    throw err    
  }
  const jsonTask = task.toJSON() as ITask
  delete jsonTask.creator.password
  delete jsonTask.creator.token
  ctx.body = {
    task: jsonTask
  }
}

export async function updateTask(ctx: Koa.Context) {
  const { body } = ctx.request as any
  try {
    body.task.content = _.map(body.task.content || [], (cfo: ClassificationObject) => {
      return cfo._id ? cfo : Object.assign(cfo, { _id: mongoose.Types.ObjectId()})
    })
    const task = await TaskModel.findByIdAndUpdate(body.task._id, body.task, { new: true }).select('-creator.password -creator.token')
    ctx.body = {
      task
    }
  } catch(err) {
    throw err    
  }
}
