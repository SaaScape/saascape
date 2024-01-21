import { db } from "../db"
import constants from "../helpers/constants"
import Pagination from "../helpers/pagination"

export default class DomainService {
  async findMany(query: any) {
    const pagination = new Pagination(query)
    const findObj: any = {
      status: constants.STATUSES.ACTIVE_STATUS,
    }

    if (query?.searchValue) {
      findObj["$or"] = [
        { domain_name: { $regex: query.searchValue, $options: "i" } },
      ]
    }

    const domains = await pagination.runPaginatedQuery({
      collection: db.managementDb?.collection("domains"),
      findObj,
    })

    return { data: domains }
  }
}
