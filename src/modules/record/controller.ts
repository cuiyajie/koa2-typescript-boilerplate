import { CacheKeys } from '../../utils/constants';
import { CustomError } from '../../utils/error';
import * as Koa from 'koa';
import * as mongoose from 'mongoose';
import { config } from '../../../config'
import { IRecordModel, RecordModel } from '../../models/records';
import { cache } from '../../utils/cache'

export async function fetchRecord(ctx: Koa.Context) {  
  const { query } = ctx.request as any;
  ctx['validateQuery']('page_number')['required']()['toInt']()
  ctx['validateQuery']('page_size')['required']()['toInt']()
  // ctx['validateQuery']('task_id')['optional']()
  // ctx['validateQuery']('record_batch_id')('optional')()
  try {
    const result = await RecordModel.paginate({}, { 
      populate: 'operator task resourceBatch',
      select: '-operator.password -operator.token -task.content',
      page: ctx['vals']['page_number'], 
      limit: ctx['vals']['page_size']
    })
    ctx.body = {
      records: result.docs.map(doc => doc.toJSON()),
      total: result.total,
      page: result.page
    }
  } catch (err) {
    throw err
  }
}

export async function fetchRecordById(ctx: Koa.Context) {
  const { query } = ctx.request as any
  ctx['validateQuery']('record_id')['required']()
  try {
    const result = await RecordModel.findById(query.record_id)
      .select('-operator.password -operator.token')
      .populate('task resourceBatch')
    if (result) {
      ctx.body = {
        record: { ...result.toJSON(), fileUrl: result.wrapResourceUrl(ctx.origin) }
      }
    } else {
      throw new CustomError(400, '标注记录不存在')
    }
  } catch (err) {
    throw err
  }
}

export async function fetchNextRecord(ctx: Koa.Context) {
  const { query } = ctx.request as any
  ctx['validateQuery']('resource_batch_id')['required']()
  try {
    const cahceKey = `${CacheKeys.RECORDS}_${query.resource_batch_id}`
    let records = cache.get<Array<IRecordModel>>(cahceKey)

    records =  await (records && records.length ? new Promise<IRecordModel[]>((resolve, reject) => {
      resolve(records)
    }) : RecordModel.find({ 
      result: null, 
      resourceBatch: query.resource_batch_id 
    }, null, { 
      limit: 100, 
      select: '-operator.password -operator.token', 
      populate: 'task resourceBatch'
    }))

    const result = (records || []).pop()
    if (result) {
      cache.set(cahceKey, records)
      ctx.body = {
        record: { ...result.toJSON(), fileUrl: result.wrapResourceUrl(ctx.origin) }
      }
    } else {
      throw new CustomError(400, '该批次没有需要标注的记录')
    }
  } catch (err) {
    throw err
  }
}

export async function updateRecord(ctx: Koa.Context) {
  const { body } = ctx.request as any
  ctx['validateBody']('record.record_id')['required']()
  ctx['validateBody']('record.result')['required']('请填写标注结果')
  try {
    const result = await RecordModel.findByIdAndUpdate(body.record.record_id, { 
      operator: ctx.state.user,
      result: body.record.result,
      updated_at: new Date() 
    }, { new: true })
    .select('-operator.password -operator.token -task.content')
    .populate('task resourceBatch') as IRecordModel
    ctx.body = {
      record: { ...result.toJSON(), fileUrl: result.wrapResourceUrl(ctx.origin) }
    }
  } catch (err) {
    throw err
  }
}
