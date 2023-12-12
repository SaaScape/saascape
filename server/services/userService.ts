import { db } from "../db"
import Pagination from "../helpers/pagination"
import { IQuery } from "../interfaces/pagination"

export default class UserService {
  constructor() {}

  async getUsers(query: IQuery) {
    const pagination = new Pagination(query)
    const users = await pagination.runPaginatedQuery({
      collection: db?.managementDb?.collection("users"),
      aggregationPipeline: [
        { $match: {} },
        { $project: { password: 0, refresh_tokens: 0 } },
      ],
      timeConstraintField: "created_at",
    })

    return { users }
  }
}
