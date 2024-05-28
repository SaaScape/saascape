/*
 * Copyright SaaScape (c) 2024.
 */

export enum ConfigModules {
  CUSTOM_FIELDS = 'custom_fields',
  SECRETS_CONFIG = 'secrets_config',
  ENVIRONMENT_CONFIG = 'environment_config',
  TAGS = 'tags',
  VERSION_CONFIG = 'version_config',
  INSTANCE_VERSION = 'instance_version',
  NGINX_DIRECTIVE = 'nginx_directive',
}

export enum UpdateType {
  ADD = 'add',
  REMOVE = 'remove',
}

export enum misc {
  NOT_ASSIGNED = 'Not Assigned',
  BACKGROUND = 'background',
  CLIENT = 'client',
}

export type SocketType = misc.BACKGROUND | misc.CLIENT

export enum instanceHealth {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  PARTIALLY_HEALTHY = 'partially_healthy',
  UNKNOWN = 'unknown',
}

export enum updateStatus {
  UPDATING = 'updating',
  FAILED = 'failed',
  READY = 'ready',
}

export enum SSLStatus {
  ACTIVE = 'active',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
  PENDING = 'pending',
  PENDING_INITIALIZATION = 'pending_initialization',
  INITIALIZING = 'initializing',
  FAILED = 'failed',
}

export enum InstanceVariables {
  SAASCAPE_SECRET_NAMES = 'SAASCAPE_SECRET_NAMES',
  SAASCAPE_PORT = 'SAASCAPE_PORT',
  SAASCAPE_DATABASE_NAME = 'SAASCAPE_DATABASE_NAME',
  SAASCAPE_SSL_CERT = 'SAASCAPE_SSL_CERT',
  SAASCAPE_SSL_KEY = 'SAASCAPE_SSL_KEY',
  SAASCAPE_SSL_CA = 'SAASCAPE_SSL_CSR',
}
