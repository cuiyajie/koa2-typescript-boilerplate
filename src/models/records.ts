import { config } from '../../config';
import { IResourceBatch } from './resourceBatches';
import { ITask } from './tasks';
import { IUser } from './users';
import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as path from 'path';

export interface IRecord {
  task: ITask,
  resourceBatch: IResourceBatch,
  operator: IUser,
  updated_at: Date,
  fileName: string,
  filePath: string,
  fileType: string,
  result: any,
  wrapResourceUrl: (host: string) => string
}

export interface IRecordModel extends IRecord, mongoose.Document { }

const Record = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  resourceBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceBatch' },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_at: { type: Date },
  fileName: String,
  filePath: String,
  fileType: String,
  result: { type: mongoose.Schema.Types.Mixed }
})

Record.methods.wrapResourceUrl = function wrapResourceUrl(this: IRecordModel, host: string): string {
  return `${host}/${path.relative(process.cwd(), config.importRoot)}/${this.filePath}`
}

Record.plugin(mongoosePaginate)

export const RecordModel: mongoose.PaginateModel<IRecordModel> = mongoose.model<IRecordModel>('Record', Record, 'Record')
