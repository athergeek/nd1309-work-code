const bitcoinMessage = require('bitcoinjs-message');
const BlockChain = require('../BlockChain.js');
const Block = require('../Block.js');
const boom = require('express-boom');

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
                // Re-created this message since the timestamp is changed.
                requestFound.message = `${walletAddress}:${requestTimeStamp}:Registry`
                response = requestFound;
            } else {
                this.timeoutRequests[walletAddress] = response;
                this.timeoutRequests[`${walletAddress} - pre-validation-timer`] = setTimeout(() => {
                    if (this.timeoutRequests[walletAddress]) {
                        // Remove the request once the time expires
                        delete this.timeoutRequests[walletAddress];
                        // Remove the timer itself.
                        delete this.timeoutRequests[`${walletAddress} - pre-validation-timer`];
                        console.log('this.timeoutRequests ::::: ', this.timeoutRequests);
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
            let isValidRequest = false;
            let message = '';
            const requestTimeStamp = new Date().getTime().toString().slice(0, -3);

            if (this.memPool[walletAddress]) {
                const validRequest = {
                    ...this.memPool[walletAddress]
                };
                const timeSinceFirstValidationInSeconds = (requestTimeStamp - validRequest.status.requestTimeStamp);
                validRequest.status.validationWindow = validRequest.status.validationWindow - timeSinceFirstValidationInSeconds;
                validRequest.status.requestTimeStamp = requestTimeStamp;
                validRequest.status.message = `${signature}:${requestTimeStamp}:starRegistry`;
                res.json(validRequest);
            } else {

                isValidRequest = this.isRequestValidForAddress(walletAddress, signature);

                if (isValidRequest) {
                    message = `${signature}:${requestTimeStamp}:starRegistry`;
                    const validRequest = {
                        "registerStar": true,
                        "status": {
                            "address": walletAddress,
                            "requestTimeStamp": requestTimeStamp,
                            "message": message,
                            "validationWindow": this.timeoutRequests[walletAddress].validationWindow,
                            "messageSignature": isValidRequest
                        }
                    }

                    // Add the request to mempool
                    this.memPool[walletAddress] = {
                        ...validRequest
                    };
                    // Expire valid request after 30 minutes
                    this.memPool[`${walletAddress} -validated-request-timer`] = setTimeout(() => {
                        if (this.memPool[walletAddress]) {
                            // Remove the valid request once the time expires
                            delete this.memPool[walletAddress];
                            // Remove the valid request timer itself.
                            delete this.memPool[`${walletAddress} -validated-request-timer`];
                        }
                    }, 1800000); // 30 Minutes window ( time in milliseconds)

                    // post-validation clean-up
                    this.postValidationCleanup(walletAddress);
                    res.json(validRequest);
                } else {
                    res.boom.badRequest('Request Validation Window Expired !!!');
                }
            }

        });
    }

    postNewBlock() {
        this.app.post("/block", (req, res) => {
            // Add your code here ---Verify address request
            if (req.body) {
                console.log('postNewBlock called....', req.body);
                const data = {
                    ...req.body
                };

                if (Array.isArray(data.star)) {
                    res.boom.badRequest(`Only one star data allowed. ERROR :::: Found Star Array...`);
                } else {
                    data.star.story = new Buffer(data.star.story).toString('base64');
                    let newBlock = new Block.Block(data);
                    this.blockChain.addBlock(newBlock).then((result) => {
                        console.log('Block Added :::: ', result);
                        res.json(result);
                    }).catch((err) => {
                        console.log(err);
                        res.boom.badGateway(`Failed to create block.. ERROR :::: ${err}`);
                    });
                }

            } else {
                res.boom.badRequest('Failed to create block. No data was provided');
            }
        });
    }

    getStarByHash() {
        this.app.get("/stars/hash/:hash", (req, res) => {
            // Add your code here
            const hash = req.params['hash'];

            this.blockChain.getBlockByHash(hash).then((block) => {
                const data = JSON.parse(block.value);
                // console.log('Returned Block By Hash :::: ', data);
                data.body.star.storyDecoded = new Buffer(data.body.star.story, 'base64').toString();
                res.send(data);
            }).catch((err) => {
                throw res.boom.notFound(`Failed to retrieve block for hash ${hash}.. ERROR :::: ${err}`)
            });
        });
    }

    getStarByAddress() {
        this.app.get("/stars/address/:address", (req, res) => {
            // Add your code here
            const address = req.params['address'];
            this.blockChain.getBlockByAddress(address).then((data) => {
                let blocks = [];
                for (let i = 0; i < data.length; i++) {
                    const block = JSON.parse(data[i].value);
                    block.body.star.storyDecoded = new Buffer(block.body.star.story, 'base64').toString();
                    blocks.push(block);
                }
                res.send(blocks);
            }).catch((err) => {
                throw res.boom.notFound(`Failed to retrieve block(s) for address ${address}.. ERROR :::: ${err}`)
            });

        });
    }

    getStarByBlockHeight() {
        this.app.get("/block/:height", (req, res) => {
            // Add your code here
            const height = req.params['height'];
            if (height > 1) {
                this.blockChain.getBlock(height).then((block) => {
                    const data = JSON.parse(block);
                    data.body.star.storyDecoded = new Buffer(data.body.star.story, 'base64').toString();
                    res.send(data);
                }).catch((err) => {
                    throw res.boom.notFound(`Failed to retrieve block for heght ${height}.. ERROR :::: ${err}`)
                });

            } else {
                throw res.boom.notFound(`No star data exists at the Genesis block.`);
            }
        });
    }

    postValidationCleanup(walletAddress) {
        if (this.timeoutRequests[walletAddress]) {
            // remove it from request time out queue
            delete this.timeoutRequests[walletAddress];
            delete this.timeoutRequests[`${walletAddress} - pre-validation-timer`];
        }
    }

    isRequestValidForAddress(walletAddress, signature) {
        let isValidRequest = false;
        if (this.timeoutRequests[walletAddress] && this.timeoutRequests[walletAddress].validationWindow > 0) {
            const message = this.timeoutRequests[walletAddress].message;
            isValidRequest = bitcoinMessage.verify(message, walletAddress, signature);
        } else {
            isValidRequest = false;
        }
        return isValidRequest;
    }
}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => {
    return new BlockController(server);
}