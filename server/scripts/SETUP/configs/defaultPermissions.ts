import { ObjectId } from 'mongodb'
import { IPermissions } from '../../../schemas/Permissions'

export const permissionObjectIds = {
  superAccess: new ObjectId('6587681b3c23f64df56c5c3b'),
}

const defaultPermissions: IPermissions[] = [
  {
    _id: permissionObjectIds.superAccess,
    permission_name: 'super_access',
    description: 'Super access',
  },
]

export default defaultPermissions
