// Http library
const http = require('http');
const SHA256 = require('crypto-js/sha256');

//Step 1. Import crypto-js/sha256


// Http port
const port = 8082;

//Mock Data
var blocks = [];
let block_1 = {
    "height": "0",
    "body": "Udacity Blockchain Developer",
    "time": 1538509789
};
let block_2 = {
    "height": "1",
    "body": "Udacity Blockchain Developer Rock!",
    "time": 1538509789
};
blocks.push(block_1);
blocks.push(block_2);

//Step 2. Configure web service
/**
 * Take the block_2 data from the array "blocks" and generate the hash to be written into the response.
 */
//Add your code here
const app = http.createServer(function (request, response) { // your code go here
    let block2Hash = SHA256(JSON.stringify(block_2)).toString();
    // response.writeHead(200, {
    //     "Content-Type": "application/json"
    // });
    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    //    response.write(block2Hash);

    response.write(JSON.stringify({
        "hash": block2Hash
    }));
    response.end();
});



// Notify console
console.log("Web Server started on port 8080\nhttp://localhost:" + port);
// Start server with http port
app.listen(port);