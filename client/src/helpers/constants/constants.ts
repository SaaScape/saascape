export default {
  STATUSES: {
    ACTIVE_STATUS: "active",
    INACTIVE_STATUS: "inactive",
  },
  SERVER_STATUSES: {
    PENDING_INITIALIZATION: "pending_initialization",
    FAILED_INITIALIZATION: "failed_initialization",
    SUCCESSFUL_INITIALIZATION: "successful_initialization",
  },
  AVAILABILITY: {
    ONLINE: "online",
    OFFLINE: "offline",
  },
  INTEGRATIONS: {
    DOCKER: "docker",
    DOCKER_HUB: "docker_hub",
    STRIPE: "stripe",
  },
  BILLING_INTERVAL: {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    ANNUAL: "annual",
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

  CONFIG_MODULES: {
    CUSTOM_FIELDS: "custom_fields",
    SECRETS: "secrets",
    ENV_VARS: "env_vars",
    VERSION_CONFIG: "version_config",
  },
}
