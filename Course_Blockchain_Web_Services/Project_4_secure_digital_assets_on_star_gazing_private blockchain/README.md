# Project #4. Secure Digital Assets on a Private Blockchain.

This is Project 4,  Secure Digital Assets on a Private Blockchain, in this project I developed a webservice using node based framework called Express. The error handling was done using a package called boom.

A server and the api controllser are in folder ***web-service***

The server is configured on port 8000. The configuration is in file ***web-service/apiServer.js***

## How to run API Server.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node ../web-service/apiServer.js__ in the root directory.

## What API endpoints are provided.

Following api endpoints are provdied as part of this project.

***addValidationRequest***

Adds validation request to the validation queue.

Method Type: POST

url: http://locatlhost:8000/requestValidation


***validateRequest***

Validates a request and once validated, request is removed from the validation queue and placed in a different queue.

Method Type: POST

url: http://locatlhost:8000/message-signature/validate

***postNewBlock***

Post a new block to the database.

Method Type: POST

url: http://locatlhost:8000/block

***getStarByHash***

Returns star for given hash

Method Type: GET

url: http://locatlhost:8000/stars/hash/{hash}


***getStarByAddress***

Returns star for given address

Method Type: GET

url: http://locatlhost:8000//stars/address/{address}

***getStarByBlockHeight***

Returns star for given block height

Method Type: GET

url: http://locatlhost:8000//block/{height}
