import { db } from "../db"
import constants from "../helpers/constants"
import Pagination from "../helpers/pagination"
import { IQuery } from "../interfaces/pagination"

export default class ApplicationService {
  constructor() {}

  async findMany() {
    const applications = await db.managementDb
      ?.collection("applications")
      .find({
        status: { $nin: [constants.STATUSES.DELETED_STATUS] },
      })
      .toArray()

    return { applications }
  }
}
