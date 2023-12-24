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
