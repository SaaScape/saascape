# SaaScape

SaaScape is a powerful SaaS management platform that enables users to create plans, manage subscriptions, and automate the deployment of tenant services & databases. Leveraging Nginx & Docker Swarm, this platform provides seamless control over instances, offering a robust infrastructure for your applications.

## Features

### Servers
You can add multiple servers to your SaaScape deployment to provide load balancing and high availability for your applications. Additionally, when adding a server you can choose between creating a new swarm cluster or joining an existing one. 

### Applications
Manage unlimited applications with their own unique plans, versions and instances. Link your Docker Hub account to allow for a seemless integration between application versions and Docker Hub, automating the updating of your instances.

### Domains
Add domains to SaaScape, allowing for automation of NGINX configuration and SSL certificates by Lets Encrypt. Also apply application specific NGINX directives.

### Instances
Powered by Docker Swarm, you can easily manage deployments of your application by creating multiple instances each with their own environment variables and secrets. Instances can be scaled across multiple servers using replicas and performance restrictions can be applied. You can have an instance for each tenant of your application.

### Contacts

### Tenants

### Databases



## Development Status

🚧 **This project is currently in active development. Use with caution in a production environment and some functionality mentioned above may not be currently available. Contributions and feedback are welcome!**
