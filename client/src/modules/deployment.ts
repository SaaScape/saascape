import { apiAxios, apiAxiosClean } from '../helpers/axios.ts'
import { queryParamBuilder } from '../helpers/utils.ts'
import { DeploymentStatus, IDeployment } from 'types/schemas/Deployments.ts'

interface DeploymentConfig {
  Constructor: {
    applicationId: string
    config: {
      deploymentId: string
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

export interface TargetDeploymentStatuses {
  [DeploymentStatus.FAILED]: { value: number; color: string }
  [DeploymentStatus.PENDING]: { value: number; color: string }
  [DeploymentStatus.RUNNING]: { value: number; color: string }
  [DeploymentStatus.COMPLETED]: { value: number; color: string }
}

export class Deployment {
  applicationId
  config
  deployment?: IDeployment

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

  async getDeployment() {
    const { deploymentId } = this.config || {}

    if (!deploymentId) {
      return
    }

    const { data } = await apiAxios.get(`applications/${this.applicationId}/deployments/${deploymentId}`)

    if (data?.success) {
      this.deployment = data?.data?.deployment

      return {
        deployment: this.deployment,
      }
    }
  }

  async createDeployment(payload: DeploymentConfig['CreateDeployment']['payload']) {
    await apiAxios.post(`applications/${this.applicationId}/deployments`, payload)
  }

  getTargetStatusDistribution() {
    const statuses: TargetDeploymentStatuses = {
      [DeploymentStatus.PENDING]: { value: 0, color: '#FFBB28' },
      [DeploymentStatus.RUNNING]: { value: 0, color: '#0088FE' },
      [DeploymentStatus.FAILED]: { value: 0, color: '#FF8042' },
      [DeploymentStatus.COMPLETED]: { value: 0, color: '#0d9100' },
    }

    for (const instance of this.deployment?.targets || []) {
      statuses[instance.deployment_status].value++
    }

    return statuses
  }
}
