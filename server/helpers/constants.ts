export default {
  STATUSES: {
    ACTIVE_STATUS: "active",
    DELETED_STATUS: "deleted",
    FAILED_STATUS: "failed",
    COMPLETED_STATUS: "completed",
  },
  SERVER_STATUSES: {
    PENDING_INITIALIZATION: "pending_initialization",
    FAILED_INITIALIZATION: "failed_initialization",
    SUCCESSFUL_INITIALIZATION: "successful_initialization",
    INITIALIZING: "initializing",
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
  },
  SOCKET_ROUTES: {
    SERVER: "server",
  },
  SOCKET_EVENTS: {
    SERVER_CONNECT: "server_connect",
    SERVER_INITIALIZE: "server_initialize",
  },
  SOCKET_ROOMS: {
    BACKGROUND_SERVERS: "background_servers",
  },
}
