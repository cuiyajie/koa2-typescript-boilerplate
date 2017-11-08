import { ensureUser } from '../../middleware/auth';
import * as user from './controller';

export const baseUrl = '/users'

export default [
  {
    method: 'GET',
    route: '/list',
    handlers: [
      ensureUser,
      user.fetchUser
    ]
  },
  {
    method: 'GET',
    route: '/fetchById',
    handlers: [
      ensureUser,
      user.fetchUserById
    ]
  },
  {
    method: 'POST',
    route: '/create',
    handlers: [
      // ensureUser,
      user.createUser
    ]
  },
  {
    method: 'POST',
    route: '/update',
    handlers: [
      ensureUser,
      user.updateUser
    ]
  }
]
