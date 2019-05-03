/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {
    constructor() {
        this.db = level(chainDB);
    }
    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key, function (err, value) {
                if (err) {
                    console.log('Not found!', err);
                    reject(`${key} Not Found !!!`);
                }
                resolve(value);
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject() 
            self.db.put(key, JSON.stringify(value), function (success, err) {
                if (err) {
                    console.log('Put Failed!', err);
                    reject(`(${key},${value}) put failed!!!`);
                }
                resolve(`${JSON.stringify(key)}, ${JSON.stringify(value)} put successfull...`);
            });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        const dataArray = [];
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', function (data) {
                    dataArray.push(data);
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    resolve(dataArray.length);
                });
        });
    }

    // Get block by hash
    getBlockByHash(hash) {
        let self = this;
        let block = null;
        return new Promise(function (resolve, reject) {
            self.db.createReadStream()
                .on('data', function (data) {
                    const value = JSON.parse(data.value);
                    if (value.hash === hash) {
                        block = data;
                    }
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    resolve(block);
                });
        });
    }

    // Method that return blocks for specified address
    getBlocksByAddress(address) {
        let self = this;
        const blocks = [];
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', function (data) {
                    const value = JSON.parse(data.value);
                    if (value.body.address === address) {
                        blocks.push(data);
                    }
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    resolve(blocks);
                });
        });
    }

    dbToArray() {
        let self = this;
        const dataArray = [];
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', function (data) {
                    dataArray.push(data);
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    resolve(dataArray);
                });
        });
    }

    addDataToLevelDB(data) {
        let self = this;
        let i = 0;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', function (data) {
                    i++;
                })
                .on('error', function (err) {
                    console.log('Unable to read data stream!', err)
                    reject(`addDataToLevelDB Failed !! for height ${data}`);
                })
                .on('close', function () {
                    console.log('');
                    console.log(`Adding Block # ${i}`, data);
                    self.addLevelDBData(i, data).then((writtenBlock) => {
                        console.log('');
                        resolve(writtenBlock);
                    }, (reject) => {
                        console.log('Failed to add block #' + i);
                    });
                });
        });
    }

    getBlock(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            console.log(`getLevelDBData(key) ${key} `);
            self.getLevelDBData(key).then((result) => {
                resolve(result);
            });
        });
    }
}

module.exports.LevelSandbox = LevelSandbox;