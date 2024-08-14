/*
 * Copyright SaaScape (c) 2024.
 */
import 'dotenv/config'
import '../../modules/getModuleAlias'
import { db } from '../../db'
import defaultUsers from './configs/defaultUsers'
import defaultPermissions from './configs/defaultPermissions'
import defaultGroups from './configs/defaultGroups'
;(async () => {
  // Connect to Database
  await db.init()
  await db.connect()

  // STEP 1: Create Permissions
  await db.managementDb?.collection('permissions').insertMany(defaultPermissions)
  // STEP 2: Create Groups
  await db.managementDb?.collection('groups').insertMany(defaultGroups)
  // STEP 3: Create default user
  await db.managementDb?.collection('users').insertMany(await defaultUsers)

  console.log('DB Setup has been completed')
  process.exit(0)
})()
