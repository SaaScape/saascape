/*
 * Copyright SaaScape (c) 2024.
 */

import IInstance, { instanceDbStatus, InstanceServiceStatus, IReplicaStates } from 'types/schemas/Instances'
import { instanceHealth } from 'types/enums'
import constants from '../helpers/constants'
import { clients } from '../clients/clients'
import { db } from '../db'
import Service, { IHealthObj } from './service'
import moment from 'moment'
import { socket } from '../background/init/sockets'
import { InstanceSocketEvents } from 'types/sockets'
import { notificationType } from 'types/schemas/Notifications'
import { createNotifications, NotificationMethods } from '../helpers/utils'

export default class Instance {
  instance: IInstance
  health: instanceHealth
  healthLastUpdated: Date
  instanceServiceStatus: InstanceServiceStatus
  serviceActive: boolean
  serviceId?: string
  service?: Service

  constructor(instance: IInstance) {
    this.instance = instance
    this.health = instanceHealth.UNKNOWN
    this.instanceServiceStatus = this.instance.service_status || InstanceServiceStatus.UNKNOWN
    this.serviceActive = false
    this.healthLastUpdated = this.instance.service_health_updated_at
  }

  getServiceData = async () => {
    // This method controls the service data inside the instance and should be called after all changes to the instance to get latest data from the service
    // This method will also be called periodically to keep the data updated
    console.log('Getting service data for', this.instance?._id?.toString(), this.instance?.name)
    this.serviceId = this.instance?.linked_ids?.find((id) => id.name === constants.SERVICE)?.id
    this.serviceActive = !!this.serviceId
    this.service ??= new Service(this)

    if (this.serviceActive) {
      //  Get service data
      //   Run service getData commands, to update the instance health etc.
      try {
        const serviceData = await this.service.getServiceData()
        const health = await this.service.checkServiceHealth()
        await this.updateInstanceHealth(health)
      } catch (error) {
        console.error('Error getting service data', error)
        const replicas: IReplicaStates = Object.fromEntries(
          Array.from({ length: this.instance.replicas }, (_, i) => [
            i + 1,
            { health: instanceHealth.UNKNOWN, state: 'unknown', since: new Date() },
          ]),
        )

        const health = {
          instanceHealthStatus: instanceHealth.UNKNOWN,
          instanceStatus: InstanceServiceStatus.UNKNOWN,
          replicaStates: replicas,
        }
        await this.updateInstanceHealth(health)
      }
    }
  }

  addToClients() {
    console.log('Adding instance to client')
    clients.instance[this.instance?._id?.toString()] = this
  }

  removeFromClients() {
    console.log('Removing instance from client')
    delete clients.instance[this.instance?._id?.toString()]
  }

  async updateInstanceDetails() {
    const instance = (
      await db.managementDb
        ?.collection<IInstance>('instances')
        .aggregate([
          { $match: { _id: this.instance?._id } },
          { $lookup: { from: 'domains', localField: 'domain_id', foreignField: '_id', as: 'domain' } },
          { $set: { domain: { $first: '$domain' } } },
        ])
        .toArray()
    )?.[0] as IInstance

    if (!instance) {
      this.removeFromClients()
      return
    }
    this.instance = instance
    await this.getServiceData()
  }

  async create() {
    console.log('Creating instance service on swarm')
    //   Check if service is already active
    await this.getServiceData()
    if (this.serviceActive) {
      console.log('Service is already active skipping creation')
      return
    }
  }

  async updateInstanceHealth(healthObj: IHealthObj) {
    this.health = healthObj.instanceHealthStatus
    this.instanceServiceStatus = healthObj.instanceStatus
    this.instance.replica_health = healthObj.replicaStates

    const payload: any = {
      service_status: healthObj.instanceStatus,
      replica_health: healthObj.replicaStates,
      service_health: healthObj.instanceHealthStatus,
    }

    if (this.instance.service_health !== healthObj.instanceHealthStatus) {
      const date = new Date()
      payload.service_health_updated_at = date
      this.healthLastUpdated = date
    }

    await db.managementDb?.collection<IInstance>('instances').updateOne(
      { _id: this.instance._id },
      {
        $set: payload,
      },
    )
    //   Send socket to server to let know of update in instance health which will then be sent to client
    socket?.emit(InstanceSocketEvents.UPDATE_HEALTH, {
      instance_id: this.instance._id,
      health: this.health,
      replica_health: this.instance.replica_health,
      instanceServiceStatus: this.instanceServiceStatus,
      healthLastUpdated: this.healthLastUpdated,
    })
  }

  async sendInstanceHealthNotifications() {
    const { service_health_notified_at, service_health_updated_at, service_health } = this.instance

    if (service_health === instanceHealth.HEALTHY || !this.serviceActive) return

    const notifIntervals: {
      other: { sendEveryXMinutes: number }
      [lastXMinutes: number]: { sendEveryXMinutes: number }
    } = {
      10: {
        sendEveryXMinutes: 5,
      },
      20: {
        sendEveryXMinutes: 10,
      },
      30: {
        sendEveryXMinutes: 15,
      },
      60: {
        sendEveryXMinutes: 20,
      },
      other: {
        sendEveryXMinutes: 30,
      },
    }

    const lastNotified = service_health_notified_at && moment(service_health_notified_at)
    const lastUpdated = moment(service_health_updated_at)
    const minutesSinceLastUpdate = moment().diff(lastUpdated, 'minutes')
    const minutesSinceLastNotified = lastNotified ? moment().diff(lastNotified, 'minutes') : 0

    let shouldSendNotification = !lastNotified

    if (!shouldSendNotification) {
      for (const [lastXMinutes, obj] of Object.entries(notifIntervals)) {
        if (lastXMinutes !== 'other' && minutesSinceLastUpdate > +lastXMinutes) continue

        if (!(+minutesSinceLastNotified >= obj.sendEveryXMinutes)) break
        shouldSendNotification = true
        break
      }
    }

    if (!shouldSendNotification) return

    await db.managementDb?.collection<IInstance>('instances').updateOne(
      { _id: this.instance._id },
      {
        $set: {
          service_health_notified_at: new Date(),
        },
      },
    )

    await createNotifications(
      {
        title: `Instance ${this.instance.name} is unhealthy`,
        body: `The instance ${this.instance.name} is unhealthy and needs attention`,
        type: notificationType.WARNING,
        sendMail: true,
        from: 'system',
      },
      NotificationMethods.BACKGROUND,
    )
  }

  async deleteInstance() {
    console.log('Deleting instance')
    await this.service?.deleteService()
    await db.managementDb
      ?.collection<IInstance>('instances')
      .updateOne({ _id: this.instance._id }, { $set: { status: instanceDbStatus.DELETED } })

    await createNotifications(
      {
        title: `Instance ${this.instance.name} has been deleted`,
        body: `The instance ${this.instance.name} has been deleted`,
        sendMail: true,
        type: notificationType.INFO,
        from: 'system',
      },
      NotificationMethods.BACKGROUND,
    )

    this.removeFromClients()
  }
}
