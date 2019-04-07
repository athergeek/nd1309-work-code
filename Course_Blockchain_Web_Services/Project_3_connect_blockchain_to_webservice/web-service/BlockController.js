const BlockChain = require('../BlockChain.js');
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
                return this.blockChain.getBlock(blockNumber).then((block) => {}).catch((err) => {
                    throw Boom.notFound(`Failed to retrieve block number ${blockNumber}.. ERROR :::: ${err}`)
                });
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