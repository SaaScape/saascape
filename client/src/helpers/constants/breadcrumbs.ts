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
  SERVERS: [
    {
      title: "Servers",
      path: "/servers",
    },
  ],
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
}
