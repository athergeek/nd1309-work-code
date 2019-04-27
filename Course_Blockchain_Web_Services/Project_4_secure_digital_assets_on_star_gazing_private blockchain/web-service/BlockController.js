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


            if (this.memPool[walletAddress]) { // Request is already in mempool.
                const requestFound = this.memPool[walletAddress];
                const timeSinceFirstRequestInSeconds = (requestTimeStamp - requestFound.requestTimeStamp);
                requestFound.validationWindow = requestFound.validationWindow - timeSinceFirstRequestInSeconds;
                requestFound.requestTimeStamp = requestTimeStamp;
                requestFound.message = `${walletAddress}:${requestTimeStamp}:Registry`
                response = requestFound;
            } else {
                this.memPool[walletAddress] = response;
            }
            res.send(response);
        });
    }

    validateRequest() {
        this.app.post("/message-signature/validate", (req, res) => {
            // Add your code here
            console.log('validateMessage called....', req.body);
            res.send(req.body);
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
                    res.json({
                        message: "Data received successfully",
                        data: req.body
                    });
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
            console.log('getStarByBlockHeight called....', height);
            res.send(height);
        });
    }

    getStarByName() {
        this.app.get("/stars/name/:name", (req, res) => {
            // Add your code here
            const name = req.params['name'];
            console.log('getStarByName called....', name);
            res.send(name);
        });
    }


    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    // getBlockByIndex() {
    //     let blockNumber = 0;
    //     this.server.route({
    //         method: 'GET',
    //         path: '/api/block/{index}',
    //         handler: (request, h) => {
    //             // Add your code here            
    //             blockNumber = request.params['index'];
    //             return this.blockChain.getBlock(blockNumber).then((block) => {
    //                 return block;
    //             }).catch((err) => {
    //                 throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
    //             });
    //         }
    //     });
    // }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    // postNewBlock() {
    //     this.server.route({
    //         method: 'POST',
    //         path: '/api/block',
    //         handler: (request, h) => {
    //             if (request.payload && request.payload.body) {
    //                 console.log(request.payload);
    //                 let newBlock = new Block.Block(request.payload.body);
    //                 return this.blockChain.addBlock(newBlock).then((result) => {
    //                     console.log(result);
    //                     return {
    //                         message: "Data received successfully",
    //                         data: request.payload
    //                     };
    //                 }).catch((err) => {
    //                     console.log(err);
    //                     throw Boom.badGateway(`Failed to create block.. ERROR :::: ${err}`);
    //                 });
    //             } else {
    //                 throw Boom.badRequest('Failed to create block. No data was provided');
    //             }
    //         }
    //     });
    // }
}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => {
    return new BlockController(server);
}