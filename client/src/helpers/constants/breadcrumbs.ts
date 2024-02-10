export default {
  DASHBOARD: [
    {
      title: "Dashboard",
      path: "/",
    },
  ],
  APPLICATIONS: [
    {
      title: "Applications",
      path: "/applications",
    },
  ],
  VIEW_APPLICATION: (text: string, id: string) => {
    return [
      {
        title: "Applications",
        path: "/applications",
      },
      {
        title: text,
        path: `/applications/${id}`,
        type: "application_select",
      },
    ]
  },
  VIEW_APPLICATION_PLANS: (text: string, id: string) => {
    return [
      {
        title: "Applications",
        path: "/applications",
      },
      {
        title: text,
        path: `/applications/${id}`,
        type: "application_select",
      },
      {
        title: "Plans",
        path: `/applications/${id}/plans`,
      },
    ]
  },
  VIEW_APPLICATION_PLAN: (
    text: string,
    appId: string,
    planId: string,
    planName: string
  ) => {
    return [
      {
        title: "Applications",
        path: "/applications",
      },
      {
        title: text,
        path: `/applications/${appId}`,
        type: "application_select",
      },
      {
        title: "Plans",
        path: `/applications/${appId}/plans`,
      },
      {
        title: planName,
        path: `/applications/${appId}/plans/${planId}`,
      },
    ]
  },
  VIEW_APPLICATION_VERSIONS: (text: string, id: string) => {
    return [
      {
        title: "Applications",
        path: "/applications",
      },
      {
        title: text,
        path: `/applications/${id}`,
        type: "application_select",
      },
      {
        title: "Versions",
        path: `/applications/${id}/versions`,
      },
    ]
  },
  VIEW_APPLICATION_INSTANCES: (text: string, id: string) => {
    return [
      {
        title: "Applications",
        path: "/applications",
      },
      {
        title: text,
        path: `/applications/${id}`,
        type: "application_select",
      },
      {
        title: "Instances",
        path: `/applications/${id}/instances`,
      },
    ]
  },
  SERVERS: [
    {
      title: "Servers",
      path: "/servers",
    },
  ],
  VIEW_SERVER: (text: string, id: string) => {
    return [
      {
        title: "Servers",
        path: "/servers",
      },
      {
        title: text,
        path: `/servers/${id}`,
        type: "server_select",
      },
    ]
  },
  DOMAINS: [
    {
      title: "Domains",
      path: "/domains",
    },
  ],
  INSTANCES: [
    {
      title: "Instances",
      path: "/instances",
    },
  ],
  TENANTS: [
    {
      title: "Tenants",
      path: "/tenants",
    },
  ],
  CONTACTS: [
    {
      title: "Contacts",
      path: "/contacts",
    },
  ],
  VIEW_CONTACT: (text: string, id: string) => {
    return [
      {
        title: "Contacts",
        path: "/contacts",
      },
      {
        title: text,
        path: `/contacts/${id}`,
      },
    ]
  },
}
