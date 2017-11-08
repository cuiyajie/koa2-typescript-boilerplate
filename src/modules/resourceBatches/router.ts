import { parseParams } from '../../middleware/parse-params';
import { ensureUser } from '../../middleware/auth';
import * as resourceBatch from './controller';

export const baseUrl = '/resourceBatches'

export default [
  {
    method: 'GET',
    route: '/fileList',
    handlers: [
      resourceBatch.fetchFileList
    ]
  },
  {
    method: 'GET',
    route: '/list',
    handlers: [
      ensureUser,
      resourceBatch.fetchResourceBatch
    ]
  },
  {
    method: 'GET',
    route: '/fetchById',
    handlers: [
      ensureUser,
      resourceBatch.fetchResourceBatchById
    ]
  },
  {
    method: 'POST',
    route: '/create',
    handlers: [
      ensureUser,
      parseParams,
      resourceBatch.createResourceBatch
    ]
  }
]
