import { db } from "../db"
import constants from "../helpers/constants"
import Pagination from "../helpers/pagination"

export class ContactService {
  async findMany(query: any) {
    const pagination = new Pagination(query)

    const findObj: any = {
      status: constants.STATUSES.ACTIVE_STATUS,
    }

    if (query?.searchValue) {
      findObj["$or"] = [
        { first_name: { $regex: query.searchValue, $options: "i" } },
        { last_name: { $regex: query.searchValue, $options: "i" } },
        { email: { $regex: query.searchValue, $options: "i" } },
      ]
    }

    const contacts = await pagination.runPaginatedQuery({
      collection: db.managementDb?.collection("contacts"),
      findObj,
    })

    return {
      contacts,
    }
  }
}
