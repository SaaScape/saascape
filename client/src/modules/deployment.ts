import { apiAxiosClean } from '../helpers/axios.ts'
import { queryParamBuilder } from '../helpers/utils.ts'

export class Deployment {
  applicationId: string

  constructor(applicationId: string) {
    this.applicationId = applicationId
  }

  async paginatedFetch(query: {
    page: number
    limit: number
    searchValue?: string
    sortField?: string
    order?: number
  }) {
    const { page, limit, searchValue, sortField, order } = query
    const { data } = await apiAxiosClean.get(
      `applications/${this.applicationId}/deployments${queryParamBuilder({
        page,
        limit,
        searchValue,
        sortField,
        order,
      })}`,
    )

    return { data: data.data, success: data?.success }
  }
}
