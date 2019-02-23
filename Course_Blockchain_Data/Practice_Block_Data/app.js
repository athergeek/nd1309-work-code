/**
 * Importing BlockExplorer API to search Block Data
 */
const be = require('blockexplorer');

/**
 *  Explore Block Data function
 * @param {*} index 
 * 
 * Start by requesting the hash then request the block and use console.log()
 * 
 */
function getBlock(index) {
	//add your code here
	// get the genesis block hash
	be.blockIndex(index)
		.then((result) => {
			const data = JSON.parse(result);
			be.block(data.blockHash).then((block) => {
				const blockData = JSON.parse(block);
				console.log('block ::::::::: ', blockData);
				console.log(' ');
			}).catch((error) => {
				throw err;
			});
		})
		.catch((err) => {
			throw err
		})
}

/**
 * Function to execute the `getBlock(index)` function
 * Nothing to implement here.
 */

(function theLoop(i) {
	setTimeout(function () {
		getBlock(i);
		i++;
		if (i < 3) theLoop(i);
	}, 3000);
})(0);