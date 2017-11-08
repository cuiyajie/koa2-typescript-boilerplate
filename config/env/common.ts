import * as path from 'path'

export default {
  port: process.env.PORT || 8001,
  importRoot: path.resolve(__dirname, '../../resources')
}
