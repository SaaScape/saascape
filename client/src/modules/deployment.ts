import { apiAxios, apiAxiosClean } from '../helpers/axios.ts'
import { queryParamBuilder } from '../helpers/utils.ts'

interface DeploymentConfig {
  Constructor: {
    applicationId: string
    config: {
      test: string
    }
  }
  PaginatedFetch: {
    query: {
      page: number
      limit: number
      searchValue?: string
      sortField?: string
      order?: number
    }
  }
  CreateDeployment: {
    payload: {
      name: string
    }
  }
}

export class Deployment {
  applicationId
  config
  constructor(
    applicationId: DeploymentConfig['Constructor']['applicationId'],
    config?: DeploymentConfig['Constructor']['config'],
  ) {
    this.applicationId = applicationId
    this.config = config
  }

  async paginatedFetch(query: DeploymentConfig['PaginatedFetch']['query']) {
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

  async createDeployment(payload: DeploymentConfig['CreateDeployment']['payload']) {
    await apiAxios.post(`applications/${this.applicationId}/deployments`, payload)
  }
}
