# SaaScape

## What is SaaScape?

SaaScape is a powerful SaaS management platform that enables users to create plans, manage subscriptions, and automate the deployment of tenant services & databases. Leveraging Nginx & Docker Swarm, this platform provides seamless control over instances, offering a robust infrastructure for your applications.

## Where are the docs?

You can access our docs [here](https://saascape.gitbook.io/saascape-docs). They are hosted with [GitBook](https://www.gitbook.com/)'s community plan!



## Getting Started

### SaaScape Setup <a href="#saascape-setup" id="saascape-setup"></a>

1. Create a .env file in the root of the server directory by utilising the examples provided by the env.example file located in the same directory.
2. Now you will need to install all npm packages you can do so by running the below commands from the root directory
   1. `npm i`
   2. `cd ./client && npm i`
   3. `cd ./server && npm i`
3. You can then start SaaScape's dev build (using Vite) by running the following from the root of the client directory.
   1. `npm run dev`
4. Now you must start the background and primary servers by running the below commands from the root of the server directory.
   1. `npm run startd`
   2. `npm run startd-bg`

Now SaaScape should be accessible on the default Vite port of 5173 with all api requests proxied to the server by default on port 4000.

### Building SaaScape <a href="#building-saascape" id="building-saascape"></a>

You will need to build SaaScape on both the client and the server directories, it is important that we first build the client.

1. In the root of the client directory run `npm run build`
2. In the root of the server directory run `npm run build`

### Database Setup <a href="#database-setup" id="database-setup"></a>

Now that we have setup SaaScape and ran our first build commands, we can now execute the dbSetup.js script using the instructions below from the root directory.

1. `cd ./server`
2. `node dist/server/scripts/SETUP/dbSetup.js`

Your database should now be setup and you can login to SaaScape via http://localhost:5173 using the below default credentials

email: _saascape@example.com_

password: _admin_

***

## Development Status

🚧 **This project is currently in active development. Use with caution in a production environment and some functionality mentioned above may not be currently available. Contributions and feedback are welcome!**
