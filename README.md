# SaaScape

## What is SaaScape?

SaaScape is a powerful SaaS management platform that enables users to create plans, manage subscriptions, and automate the deployment of tenant services & databases. Leveraging Nginx & Docker Swarm, this platform provides seamless control over instances, offering a robust infrastructure for your applications.

## Where are the docs?

You can access our docs [here](https://saascape.gitbook.io/saascape-docs). They are hosted with [GitBook](https://www.gitbook.com/)'s community plan!



## Getting Started

### Database Setup

{% hint style="info" %}
Database setup instructions are coming soon!
{% endhint %}

### SaaScape Setup

{% hint style="warning" %}
You will need to complete the database setup first in order to populate the data for SaaScape to run.
{% endhint %}

1. Create a .env file in the root of the server directory by utilising the examples provided by the env.example file located in the same directory.
2. Now you will need to install all npm packages you can do so by running the below commands from the root directory
   1. `npm i`&#x20;
   2. `cd ./client && npm i`
   3. `cd ./server && npm i`
3. You can then start SaaScape's dev build (using Vite) by running the following from the root of the client directory.
   1. `npm run dev`
4. Now you must start the background and primary servers by running the below commands from the root of the server directory.
   1. `npm run startd`
   2. `npm run startd-bg`

Now SaaScape should be accessible on the default Vite port of 5173 with all api requests proxied to the server by default on port 4000.

***

## Development Status

🚧 **This project is currently in active development. Use with caution in a production environment and some functionality mentioned above may not be currently available. Contributions and feedback are welcome!**
