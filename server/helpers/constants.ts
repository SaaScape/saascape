export default {
  NODE_ENV: {
    PRODUCTION: "production",
    DEVELOPMENT: "development",
    STAGING: "staging",
  },
  SCRIPTS: {
    DOCKER: {
      DOCKER_INSTALL: {
        UBUNTU: "installDockerUbuntu.sh",
      },
    },
  },
  STATUSES: {
    ACTIVE_STATUS: "active",
    DELETED_STATUS: "deleted",
    FAILED_STATUS: "failed",
    COMPLETED_STATUS: "completed",
    PENDING_STATUS: "pending",
  },
  SERVER_STATUSES: {
    PENDING_INITIALIZATION: "pending_initialization",
    FAILED_INITIALIZATION: "failed_initialization",
    SUCCESSFUL_INITIALIZATION: "successful_initialization",
    INITIALIZING: "initializing",
  },
  AVAILABILITY: {
    ONLINE: "online",
    OFFLINE: "offline",
  },
  INTEGRATIONS: {
    STRIPE: "stripe",
    DOCKER_HUB: "docker_hub",
    DOCKER: "docker",
    NGINX: "nginx",
  },
  INTEGRATION_TYPES: {
    GLOBAL: "global",
    INDEPENDENT: "independent",
  },
  MODULES: {
    SERVER: "server",
    DOMAIN: "domain",
  },
  SOCKET_ROUTES: {
    SERVER: "server",
    DOMAIN: "domain",
  },
  SOCKET_EVENTS: {
    SERVER_CONNECT: "server_connect",
    SERVER_INITIALIZE: "server_initialize",
    DOMAIN_ADD: "domain_add",
  },
  SOCKET_ROOMS: {
    BACKGROUND_SERVERS: "background_servers",
  },
  SWARM_NODE_TYPES: {
    MANAGER: "manager",
    WORKER: "worker",
  },
  SSL_STATUSES: {
    ACTIVE: "active",
    EXPIRING: "expiring",
    EXPIRED: "expired",
    PENDING: "pending",
    PENDING_INITIALIZATION: "pending_initialization",
    INITIALIZING: "initializing",
    FAILED: "failed",
  },

  SSL_RENEWAL_ERROR: "ssl_renewal_error",

  EVENTS: {
    SSL_RENEWAL: "ssl_renewal",
    SSL_INITIALIZE: "ssl_initialize",
  },

  CONFIG_MODULES: {
    CUSTOM_FIELDS: "custom_fields",
    SECRETS: "secrets_config",
    ENV_VARS: "environment_config",
    VERSION_CONFIG: "version_config",
    TAGS: "tags",
  },
}
