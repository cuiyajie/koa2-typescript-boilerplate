import { ensureUser } from '../../middleware/auth';
import * as auth from './controller';

export const baseUrl = '/auth'

export default [
  {
    method: 'GET',
    route: '/',
    handlers: [
      ensureUser,
      auth.authUserWithToken
    ]
  },
  {
    method: 'POST',
    route: '/login',
    handlers: [
      auth.login
    ]
  }
]
