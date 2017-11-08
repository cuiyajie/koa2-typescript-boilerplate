import { ITask } from './tasks';
import { IRecord, RecordModel } from './records';
import { CustomError } from '../utils/error';
import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import { IUser } from './users';
import { config } from '../../config'
import * as path from 'path';
import * as fs from 'fs';
import * as mimeTypes from 'mime-types';

export interface IResourceBatch {
  name: string,
  task: ITask,
  root: string,
  created_at: Date,
  creator: IUser,
  total: number
}

export interface IResourceBatchModel extends IResourceBatch, mongoose.Document {
  generateRecords: (resources: IResource[]) => void
}

export interface IResource {
  fileName: string,
  filePath: string,
  fileType: string
}

const ResourceBatch = new mongoose.Schema({
  name: { type: String, required: true },
  root: { type: String, required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  created_at: { type: Date, default: new Date() },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  total: { type: Number, default: 0 }
})

function getResources(filePath: string, resources: IResource[]) {
  try {
    fs.readdirSync(filePath).forEach(subFilePath => {
      subFilePath = path.join(filePath, subFilePath)
      const stats = fs.statSync(subFilePath)
      if (stats.isDirectory()) {
        getResources(subFilePath, resources)
      } else {
        const fileType = mimeTypes.lookup(path.extname(subFilePath)) || '';
        if (/^(image\/.*|video\/.*|application\/octet-stream)$/.test(fileType)) {
          resources.push({
            fileName: path.basename(subFilePath),
            filePath: path.relative(config.importRoot, subFilePath),
            fileType
          })
        }
      }
    })
  } catch (err) {
    throw err
  }
}

export function getAllResources(filePath: string) {
  const allResources: IResource[] = []
  getResources(filePath, allResources)
  return allResources
}

ResourceBatch.methods.generateRecords = async function generateRecords(this: IResourceBatchModel, allResources: IResource[]) {
  const resourceBatch = this
  try {
    await RecordModel.create(allResources.map(resource => {
      return {
        ...resource,
        task: resourceBatch.task,
        resourceBatch: resourceBatch._id
      }
    }))
  } catch (err) {
    throw err
  }
}

ResourceBatch.plugin(mongoosePaginate)

export const ResourceBatchModel: mongoose.PaginateModel<IResourceBatchModel> = mongoose.model<IResourceBatchModel>('ResourceBatch', ResourceBatch, 'ResourceBatch')
