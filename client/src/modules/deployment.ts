import { apiAxios, apiAxiosClean } from '../helpers/axios.ts'
import { queryParamBuilder } from '../helpers/utils.ts'
import {
  DeploymentInstanceUpdateSocketData,
  DeploymentStatus,
  DeploymentUpdateSocketData,
  IDeployment,
} from 'types/schemas/Deployments.ts'

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
    const deploymentResponse = await apiAxiosClean.post(`applications/${this.applicationId}/deployments`, payload)
    const { data } = deploymentResponse

    if (data.success) {
      return { success: data.success, deployment: data?.data?.deployment }
    } else {
      return { success: data.success, error: data?.error }
    }
  }

  getTargetStatusDistribution() {
    const statuses: { [key: string]: { value: number; color: string } } = {
      [DeploymentStatus.PENDING]: { value: 0, color: '#FFBB28' },
      [DeploymentStatus.RUNNING]: { value: 0, color: '#0088FE' },
      [DeploymentStatus.FAILED]: { value: 0, color: '#FF8042' },
      [DeploymentStatus.COMPLETED]: { value: 0, color: '#0d9100' },
    }

    for (const instance of this.deployment?.targets || []) {
      if (!Object.keys(statuses?.[instance?.deployment_status] || {}).length) continue
      statuses[instance.deployment_status].value++
    }

    return statuses
  }

  updateTargetDeploymentStatus(data: DeploymentInstanceUpdateSocketData) {
    const { targetId, status, failed_at, completed_at, updated_at } = data
    const target = this.deployment?.targets?.find((target) => target._id?.toString() === targetId)
    if (!target) {
      return
    }
    target.deployment_status = status
    target.updated_at = updated_at
    completed_at && (target.completed_at = completed_at)
    failed_at && (target.failed_at = failed_at)
  }

  updateDeploymentStatus(data: DeploymentUpdateSocketData) {
    const { status, updated_at } = data
    if (!this.deployment) return
    this.deployment.updated_at = updated_at
    this.deployment.deployment_status = status
  }
}
