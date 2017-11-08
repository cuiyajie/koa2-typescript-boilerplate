import { CustomError } from '../../utils/error';
import * as Koa from 'koa';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../../../config'
import { getAllResources, IResourceBatch, ResourceBatchModel } from '../../models/resourceBatches';

function getFolder(filePath: string, index: number, parentIndex: string) {
  const stats = fs.statSync(filePath)
  if (stats.isDirectory()) {
    const children: any[] = []
    fs.readdirSync(filePath).forEach((fileName, i) => {
      const folder = getFolder(path.join(filePath, fileName), i, `${parentIndex}${index}-`);
      if (folder) {
        children.push(folder)
      }
    })
    return Object.assign({
      title: path.basename(filePath),
      key: `${parentIndex}${index}`
    }, children.length > 0 ? { children } : {})
  } else {
    return null
  }
}

export async function fetchFileList(ctx: Koa.Context) {
  try {
    if (fs.existsSync(config.importRoot)) {
      ctx.body = {
        files: getFolder(config.importRoot, 0, '')
      }
    } else {
      throw new CustomError(400, '图片根文件夹不存在，请联系管理员配置')
    }
  } catch (err) {
    throw err
  }
}

export async function fetchResourceBatch(ctx: Koa.Context) {
  const { query } = ctx.request as any;
  ctx['validateQuery']('page_number')['required']()['toInt']()
  ctx['validateQuery']('page_size')['required']()['toInt']()
  try {
    const result = await ResourceBatchModel.paginate({}, { 
      populate: 'creator task',
      select: '-creator.password -creator.token -task.content',
      page: ctx['vals']['page_number'], 
      limit: ctx['vals']['page_size'],
      sort: { created_at: -1 }
    })
    ctx.body = {
      resourceBatches: result.docs.map(doc => doc.toJSON()),
      total: result.total,
      page: result.page
    }
  } catch (err) {
    throw err
  }
}

export async function fetchResourceBatchById(ctx: Koa.Context) {
  const { body } = ctx.request as any
  ctx['validateQuery']('resource_batch_id')['required']()
  try {
    const result = await ResourceBatchModel.findById(ctx['vals'].resource_batch_id, '-creator.password -creator.token')
    ctx.body = {
      resourceBatch: result
    }
  } catch (err) {
    throw err
  }
}

export async function createResourceBatch(ctx: Koa.Context) {
  const { body } = ctx.request as any
  try {
    const filePath = path.join(config.importRoot, body.resourceBatch.root)
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        const allResources = getAllResources(filePath)
        if (allResources.length) {
          body.resourceBatch.total = allResources.length
          body.resourceBatch.task = body.resourceBatch.task_id
          delete body.resourceBatch.task_id
          const resourceBatch = new ResourceBatchModel({ ...body.resourceBatch, creator: ctx.state.user, created_at: new Date() })
          const resourceBatchDoc =  await resourceBatch.save()
          await resourceBatchDoc.generateRecords(allResources)
          ctx.body = {
            resourceBatch: resourceBatchDoc.toJSON()
          }
        } else {
          throw new CustomError(400, '文件夹不包含任何文件')
        }
      } else {
        throw new CustomError(400, '目标不是文件夹')
      }
    } else {
      throw new CustomError(400, '标注文件夹不存在')
    }
  } catch(err) {
    throw err    
  }
}
