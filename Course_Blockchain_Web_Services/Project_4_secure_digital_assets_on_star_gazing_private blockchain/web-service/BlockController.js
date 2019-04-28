const bitcoinMessage = require('bitcoinjs-message');
const BlockChain = require('../BlockChain.js');
const Block = require('../Block.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {
    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) {
        this.app = server;
        this.blockChain = new BlockChain.Blockchain();
        this.timeoutRequests = {};
        this.memPool = {};
        this.addValidationRequest();
        this.validateRequest();
        this.postNewBlock();
        this.getStarByHash();
        this.getStarByAddress();
        this.getStarByBlockHeight();

    }

    addValidationRequest() {
        this.app.post("/requestValidation", (req, res) => {
            // Add your code here
            console.log('validateRequest called....', req.body);
            const walletAddress = req.body.address;
            const requestTimeStamp = new Date().getTime().toString().slice(0, -3);
            let response = {
                "walletAddress": req.body.address,
                "requestTimeStamp": requestTimeStamp,
                "message": `${walletAddress}:${requestTimeStamp}:Registry`,
                "validationWindow": 300,
            }

            if (this.timeoutRequests[walletAddress]) { // Request is already in mempool.
                const requestFound = this.timeoutRequests[walletAddress];
                const timeSinceFirstRequestInSeconds = (requestTimeStamp - requestFound.requestTimeStamp);
                requestFound.validationWindow = requestFound.validationWindow - timeSinceFirstRequestInSeconds;
                requestFound.requestTimeStamp = requestTimeStamp;
                requestFound.message = `${walletAddress}:${requestTimeStamp}:Registry`
                response = requestFound;
            } else {
                this.timeoutRequests[walletAddress] = response;
                this.timeoutRequests[`${walletAddress} - timer`] = setTimeout(() => {
                    if (this.timeoutRequests[walletAddress]) {
                        // Remove the request once the time expires
                        delete this.timeoutRequests[walletAddress];
                        // Remove the timer itself.
                        delete this.timeoutRequests[`${walletAddress} - timer`];
                    }
                }, 300000); // 5 Minute window ( time in milliseconds)

            }
            res.send(response);
        });
    }

    validateRequest() {
        this.app.post("/message-signature/validate", (req, res) => {
            // Add your code here
            const walletAddress = req.body.address;
            const signature = req.body.signature;
            let isWindowValid;
            let message = '';
            let validationWindow = 0;
            const requestTimeStamp = new Date().getTime().toString().slice(0, -3);
            if (this.timeoutRequests[walletAddress]) {
                isWindowValid = this.timeoutRequests[walletAddress].validationWindow > 0;
                message = this.timeoutRequests[walletAddress].message;
                validationWindow = this.timeoutRequests[walletAddress].validationWindow;
                isValid = bitcoinMessage.verify(message, address, signature);
            } else {
                isValid = false;
            }

            if (isValid && isWindowValid) {
                const validRequest = {
                    "registerStar": true,
                    "status": {
                        "address": walletAddress,
                        "requestTimeStamp": requestTimeStamp,
                        "message": message,
                        "validationWindow": validationWindow,
                        "messageSignature": valid
                    }
                }
                // Add the request to mempool
                this.memPool[walletAddress] = validRequest;
                // remove it from time out queue
                if (this.timeoutRequests[walletAddress]) {
                    delete this.timeoutRequests[walletAddress];
                    delete this.timeoutRequests[`${walletAddress} - timer`];
                }
                res.json(validRequest);
            } else {
                if (!isWindowValid) {
                    res.Boom.badRequest('Request Validation Window Expired !!!');
                } else {
                    res.Boom.badRequest('Request is not valid');
                }
            }
        });
    }

    postNewBlock() {
        this.app.post("/block", (req, res) => {
            // Add your code here ---Verify address request
            if (req.body) {
                console.log('postNewBlock called....', req.body);
                let newBlock = new Block.Block(request.body);
                return this.blockChain.addBlock(newBlock).then((result) => {
                    console.log(result);
                    res.json(newBlock);
                }).catch((err) => {
                    console.log(err);
                    res.Boom.badGateway(`Failed to create block.. ERROR :::: ${err}`);
                });
            } else {
                res.Boom.badRequest('Failed to create block. No data was provided');
            }
            res.send(req.body);
        });
    }

    getStarByHash() {
        this.app.get("/stars/hash/:hash", (req, res) => {
            // Add your code here
            const hash = req.params['hash'];

            this.blockChain.getBlock(hash).then((block) => {
                res.json(block);
            }).catch((err) => {
                throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
            });
            res.send(hash);
        });
    }

    getStarByAddress() {
        this.app.get("/stars/address/:address", (req, res) => {
            // Add your code here
            const address = req.params['address'];
            this.blockChain.getBlock(address).then((block) => {
                res.json(block);
            }).catch((err) => {
                throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
            });

            res.send(address);
        });
    }

    getStarByBlockHeight() {
        this.app.get("/block/:height", (req, res) => {
            // Add your code here
            const height = req.params['height'];
            this.blockChain.getBlock(height).then((block) => {
                res.json(block);
            }).catch((err) => {
                throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
            });
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => {
    return new BlockController(server);
}