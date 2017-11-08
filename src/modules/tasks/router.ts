import { parseParams } from '../../middleware/parse-params';
import { ensureUser } from '../../middleware/auth';
import * as task from './controller';

export const baseUrl = '/tasks'

export default [
  {
    method: 'GET',
    route: '/list',
    handlers: [
      ensureUser,
      task.fetchTask
    ]
  },
  {
    method: 'GET',
    route: '/fetchById',
    handlers: [
      ensureUser,
      task.fetchTaskById
    ]
  },
  {
    method: 'POST',
    route: '/create',
    handlers: [
      ensureUser,
      parseParams,
      task.createTask
    ]
  },
  {
    method: 'POST',
    route: '/update',
    handlers: [
      ensureUser,
      parseParams,
      task.updateTask
    ]
  }
]
