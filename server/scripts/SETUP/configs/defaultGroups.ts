import { ObjectId } from 'mongodb'
import { IGroup } from '../../../schemas/Groups'
import { permissionObjectIds } from './defaultPermissions'

export const adminGroupObjectId = new ObjectId('656bac8f2b9220e3b961099a')

const defaultGroups: IGroup[] = [
  {
    _id: adminGroupObjectId,
    name: 'Administrator',
    permissions: [permissionObjectIds.superAccess],
  },
]

export default defaultGroups
