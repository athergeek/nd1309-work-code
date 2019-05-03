/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock() {
        // Add your code here
        this.getBlockHeight().then((blockHeight) => {
            if (blockHeight === 0) {
                this.addBlock(new Block.Block("First block in the chain - Genesis block"));
            }
        });
    }

    // Get block height, it is a helper method that return the height of the current block ( most rescent block ).
    getBlockHeight() {
        // Add your code here
        return new Promise((resolve, reject) => {
            this.db.getBlocksCount().then((chainLength) => {
                if (chainLength - 1 <= 0) {
                    resolve(0);
                } else {
                    resolve(chainLength - 1);
                }
            });
        });

    }

    // Add new block
    addBlock(block) {
        return new Promise((resolve, reject) => {

            // Add your code here
            this.db.getBlocksCount().then((chainLength) => {
                // console.log(`Current Chain length :::: `, chainLength);
                // Block height
                block.height = chainLength;
                // UTC timestamp
                block.time = new Date().getTime().toString().slice(0, -3);
                // previous block hash
                if (chainLength > 0) {
                    this.getBlock(chainLength - 1).then((blockData) => {
                        const previousBlock = JSON.parse(blockData);
                        block.previousBlockHash = previousBlock.hash;
                        // Block hash with SHA256 using newBlock and converting to a string
                        block.hash = SHA256(JSON.stringify(block)).toString();
                        // Adding block object to chain
                        this.db.addDataToLevelDB(block);
                        resolve(block);
                    }, (error) => {
                        console.log('get block failed !!!!!', error);
                    });
                } else {
                    // Block hash with SHA256 using newBlock and converting to a string
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    // Adding block object to chain
                    this.db.addDataToLevelDB(block);
                }
            }, (error) => {
                console.log('Add Block Failed !!!!', error);
            });
        });

    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        const self = this;
        return new Promise(function (resolve, reject) {
            self.getBlockHeight().then((blockHeight) => {
                if (height >= 0 && height <= blockHeight) {
                    resolve(self.db.getBlock(height));
                } else {
                    reject('Invalid block height !!!');
                }
            });
        });
    }

    // Get Block(s) By specified height
    getBlockByAddress(blockAddress) {
        // Add your code here
        const self = this;
        console.log('blockAddress ::: ', blockAddress);
        return new Promise(function (resolve, reject) {
            if (blockAddress) {
                self.db.getBlocksByAddress(blockAddress).then((blocks) => {
                    resolve(blocks);
                });
            } else {
                reject('Invalid block address !!!');
            }
        });
    }

    // Get Block(s) By specified hash
    getBlockByHash(blockHash) {
        // Add your code here
        const self = this;
        return new Promise(function (resolve, reject) {
            if (blockHash) {
                self.db.getBlockByHash(blockHash).then((block) => {
                    resolve(block);
                });
            } else {
                reject('Invalid block hash !!!');
            }
        });
    }

    // Get Block By Height
    getBlockOnHeight(height) {
        // Add your code here
        this.db.getBlock(height).then((blockData) => {
                return JSON.parse(blockData);
            },
            (error) => {
                console.log('No block found on height ', height);
                return undefined;
            });
    }


    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
        let self = this;
        return new Promise((resolve, reject) => {
            this.getBlock(height).then((blockData) => {
                let block = JSON.parse(blockData);
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                if (block.hash) {
                    block.hash = '';
                }
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                if (validBlockHash === blockHash) {
                    resolve(true);
                } else {
                    // Reject the promise if a block is invalid or hash does not match. Reject the whole chain.
                    reject(true);
                }
            });
        });
    }

    // Validate Blockchain
    validateChain() {
        // Add your code here
        const self = this;
        const chainPromises = [];
        const chainLinkValidations = [];
        this.db.getBlocksCount().then((chainLength) => {
            for (var i = 0; i < chainLength - 1; i++) {
                // validate block
                chainPromises.push(self.validateBlock(i));
                const currentBlockData = self.getBlockOnHeight(i);
                const nextBlockData = self.getBlockOnHeight(i + 1);

                if (currentBlockData && nextBlockData) {
                    const currentBlock = currentBlockData;
                    const nextBlock = nextBlockData;

                    if (currentBlock.hash !== nextBlock.previousBlockHash) {
                        chainLinkValidations.push(i);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
        return new Promise(function (resolve, reject) {
            Promise.all(chainPromises).then(() => {
                resolve(chainLinkValidations);
            }, (err) => {
                console.log('Chain block hash validation failed.....' + err);
            });
        });
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block)).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => {
                console.log(err);
                reject(err)
            });
        });
    }

}

module.exports.Blockchain = Blockchain;