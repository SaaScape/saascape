/*
 * Copyright SaaScape (c) 2024.
 */

export enum InstanceSocketEvents {
  INSTANCE_DEPLOYED = 'instance_deployed',
  INSTANCE_DEPLOYMENT_FAILED = 'instance_deployment_failed',
  DEPLOY_INSTANCE = 'deploy_instance',
  UPDATE_HEALTH = 'update_health',
}

export enum DomainSocketEvents {
  SYNC_APPLICATION_DIRECTIVES = 'sync_application_directives',
  DELETE_DOMAIN = 'delete_domain',
}

export enum NotificationEvents {
  NEW_NOTIFICATION = 'new_notification',
  NEW_NOTIFICATIONS = 'new_notifications',
  READ_NOTIFICATION = 'read_notification',
  DELETED_NOTIFICATION = 'deleted_notification',
}

export enum VersionEvents {
  VERSION_WEBHOOK = 'version_webhook',
}

export enum DeploymentEvents {
  DEPLOYMENT_CREATED = 'deployment_created',
  DEPLOYMENT_INSTANCE_UPDATED = 'deployment_instance_updated',
  JOIN_DEPLOYMENT_ROOM = 'join_deployment_room',
  LEAVE_DEPLOYMENT_ROOM = 'leave_deployment',
  DEPLOYMENT_COMPLETED = 'deployment_completed',
  DEPLOYMENT_UPDATED = 'deployment_updated',
}
