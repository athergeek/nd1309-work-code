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
        this.getStarByName();

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
                "validationWindow": 300

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
            }
            res.send(response);
        });
    }

    validateRequest() {
        this.app.post("/message-signature/validate", (req, res) => {
            // Add your code here
            const walletAddress = req.body.address;
            const signature = req.body.signature;
            let message = '';
            let validationWindow = 0;
            const requestTimeStamp = new Date().getTime().toString().slice(0, -3);
            if (this.timeoutRequests[walletAddress] && this.timeoutRequests[walletAddress].validationWindow > 0) {
                message = this.timeoutRequests[walletAddress].message;
                validationWindow = this.timeoutRequests[walletAddress].validationWindow;
                isValid = bitcoinMessage.verify(message, address, signature);
            } else {
                isValid = false;
            }

            if (isValid) {
                const validRequest = {
                    registerStar: true,
                    status = {
                        address: walletAddress,
                        requestTimeStamp: requestTimeStamp,
                        message: message,
                        validationWindow: validationWindow,
                        messageSignature: valid
                    }
                }
                // Add the request to mempool
                this.memPool[walletAddress] = validRequest;
                // remove it from time out queue
                if (this.timeoutRequests[walletAddress]) {
                    delete this.timeoutRequests[walletAddress];
                }
                res.json(validRequest);
            } else {
                res.Boom.badRequest('Request is not valid');
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

            console.log('getStarByHash called....', hash);
            res.send(hash);
        });
    }

    getStarByAddress() {
        this.app.get("/stars/address/:address", (req, res) => {
            // Add your code here
            const address = req.params['address'];
            console.log('getStarByAddress called....', address);
            res.send(address);
        });
    }

    getStarByBlockHeight() {
        this.app.get("/block/:height", (req, res) => {
            // Add your code here
            const height = req.params['height'];
            return this.blockChain.getBlock(height).then((block) => {
                return block;
            }).catch((err) => {
                throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
            });

            console.log('getStarByBlockHeight called....', height);
            res.send(height);
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