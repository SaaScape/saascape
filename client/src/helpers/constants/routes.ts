export default {
  USERS: {
    ALL_USERS: '/users',
    VIEW_USER: '/users/:id',
  },
  DOMAINS: {
    ALL_DOMAINS: '/domains',
    VIEW_DOMAIN: '/domains/:id',
  },
  APPLICATIONS: {
    ALL_APPLICATIONS: '/applications',
    VIEW_APPLICATION: '/applications/:id',
    PLANS: '/applications/:id/plans',
    VERSIONS: '/applications/:id/versions',
    INSTANCES: '/applications/:id/instances',
    CONFIGURATIONS: '/applications/:id/configurations',
  },
  TENANTS: {
    ALL_TENANTS: '/tenants',
    VIEW_TENANT: '/tenants/:id',
  },
  CONTACTS: {
    ALL_CONTACTS: '/contacts',
    VIEW_CONTACT: '/contacts/:id',
  },
  SERVERS: {
    ALL_SERVERS: '/servers',
    VIEW_SERVER: '/servers/:id',
  },
  SETTINGS: {
    VIEW_SETTINGS: '/settings/*',
    GENERAL: '/general',
    DOCKER: '/docker',
    OVH: '/ovh',
    APPLICATION_SETTINGS: '/application-settings',
  },
}
