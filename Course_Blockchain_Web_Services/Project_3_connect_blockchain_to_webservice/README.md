# Project #3.  Connect Private Blockchain to Front-End Client via APIs

This is Project 3,  Connect Private Blockchain to Front-End Client via APIs, in this project I developed a webservice using node based framework called Hapi. The error handling was done using a package called boom.

A server and the api controllser are in folder ***web-service***

The server is configured on port 8000. The configuration is in file ***web-service/apiServer.js***

## How to run API Server.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node ../web-service/apiServer.js__ in the root directory.

## What API endpoints are provided.

Following two api endpoints are provdied as part of this project.

***getBlockByIndex***

Returns the block data in json format for the specified block index

Method Type: GET

url: http://locatlhost:8000/api/block/{lockindex}


***postNewBlock***

Adds a new block to the blockchain. The specified data goes into the block as part of the data property of the block.

Method Type: POST

url: http://locatlhost:8000/api/block
