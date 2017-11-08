import { UserRole } from '../utils/constants';
import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate'
import * as bcrypt from 'bcrypt';
import { config } from '../../config'
import * as jwt from 'jsonwebtoken'

export interface IUser {
  type: number,
  name: string,
  username: string,
  password: string,
  token: string
}

export interface IUserModel extends IUser, mongoose.Document {
  validatePassword: (password: string) => boolean,
  generateToken: () => string
}

const User = new mongoose.Schema({
  type: { type: Number, default: UserRole.ANNOTATOR },
  name: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String }
})

User.plugin(mongoosePaginate)

User.pre('save', function preSave(this: IUser & mongoose.MongooseDocument, next: Function) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }

  new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) { return reject(err) }
      resolve(salt)
    })
  }).then((salt: string) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { throw err }
      user.password = hash
      next(null)
    })
  })
})

User.methods.validatePassword = function validatePassword(this: IUserModel, password: string) {
  return bcrypt.compareSync(password, this.password)
}

User.methods.generateToken = function generateToken(this: IUserModel) {
  return jwt.sign({ id: this._id }, config.token, { expiresIn: '3 days' })
}

export const UserModel: mongoose.PaginateModel<IUserModel> = mongoose.model<IUserModel>('User', User, 'User')
