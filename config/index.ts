import common from './env/common'
import { AsConfig } from '../src/typings/config';

const env = process.env.NODE_ENV || 'development'
const envConfig = require(`./env/${env}`).default

export const config: AsConfig = Object.assign({}, common, envConfig)
