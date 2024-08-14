import { IUser } from '../../../schemas/Users'
import { ObjectId } from 'mongodb'
import { adminGroupObjectId } from './defaultGroups'
import constants from '../../../helpers/constants'
import { hashPassword } from '../../../modules/bcrypt'

const defaultUsers = async (): Promise<IUser[]> => {
  return [
    {
      _id: new ObjectId(),
      username: 'saasscape@example.com',
      first_name: 'SaaScape',
      last_name: 'Admin',
      email: 'saascape@example.com',
      groups: [adminGroupObjectId],
      password: await hashPassword('admin'),
      status: constants.STATUSES.ACTIVE_STATUS,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]
}

export default defaultUsers()
