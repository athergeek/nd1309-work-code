const BlockChain = require('../BlockChain.js');
const Block = require('../Block.js');
const Boom = require('boom');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.blockChain = new BlockChain.Blockchain();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        let blockNumber = 0;
        this.server.route({
            method: 'GET',
            path: '/api/block/{index}',
            handler: (request, h) => {
                // Add your code here            
                blockNumber = request.params['index'];
                return this.blockChain.getBlock(blockNumber).then((block) => {
                    return block;
                }).catch((err) => {
                    throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
                });
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/api/block',
            handler: (request, h) => {
                if (request.payload && request.payload.body) {
                    console.log(request.payload);
                    let newBlock = new Block.Block(request.payload.body);
                    return this.blockChain.addBlock(newBlock).then((result) => {
                        console.log(result);
                        return {
                            message: "Data received successfully",
                            data: request.payload
                        };
                    }).catch((err) => {
                        console.log(err);
                        throw Boom.badGateway(`Failed to create block.. ERROR :::: ${err}`);
                    });
                } else {
                    throw Boom.badRequest('Failed to create block. No data was provided');
                }
            }
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