import { parseParams } from '../../middleware/parse-params';
import { ensureUser } from '../../middleware/auth';
import * as record from './controller';

export const baseUrl = '/records'

export default [{
    method: 'GET',
    route: '/list',
    handlers: [
      ensureUser,
      record.fetchRecord
    ]
  },
  {
    method: 'GET',
    route: '/fetchById',
    handlers: [
      ensureUser,
      record.fetchRecordById
    ]
  },
  {
    method: 'GET',
    route: '/fetchNext',
    handlers: [
      ensureUser,
      record.fetchNextRecord
    ]
  },
  {
    method: 'POST',
    route: '/update',
    handlers: [
      ensureUser,
      parseParams,
      record.updateRecord
    ]
  }
]
