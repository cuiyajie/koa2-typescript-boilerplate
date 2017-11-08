import { TaskClassificationType, TaskType } from '../utils/constants';
import { IUser } from './users';
import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as _ from 'lodash'
import { ClassificationObject } from '../typings/task';

export interface ITask {
  name: string,
  created_at: Date,
  creator: IUser,
  type: number,
  content: any[]
}

export interface ITaskModel extends ITask, mongoose.Document {}

const ClassificationTask = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: Number, default: TaskClassificationType.MULTIPLE },
  options: [ String ]
})

const Task = new mongoose.Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: new Date() },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: Number, default: TaskType.CLASSIFICATION },
  content: { type: mongoose.Schema.Types.Mixed }  
})

Task.pre('save', function preSave(this: ITask & mongoose.MongooseDocument, next: Function) {
  const task = this
  try {
    if (task.type === TaskType.CLASSIFICATION && task.content instanceof Array) {
      task.content = _.map(task.content, (cfo: ClassificationObject) => new ClassificationTaskModel(cfo))
    }
    next(null)
  } catch(err) {
    next(err)
  }
})

Task.plugin(mongoosePaginate)

export const TaskModel: mongoose.PaginateModel<ITaskModel> = mongoose.model<ITaskModel>('Task', Task, 'Task')
export const ClassificationTaskModel: mongoose.Model<mongoose.Document> = mongoose.model('ClassificationTask', ClassificationTask, 'ClassificationTask')
