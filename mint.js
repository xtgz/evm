require('dotenv').config();
const {Web3} = require('web3');
const fs = require('fs');

const web3 = new Web3(process.env.NODE_URL); // Node URL
const amount = web3.utils.toWei('0', 'ether'); // Expected transaction amount, unit is wei
const mintStr = process.env.MINT_STR;
//Convert string to UTF-8 encoded bytes
const utf8Bytes = Buffer.from(mintStr, 'utf-8');
// Convert bytes to hexadecimal representation of string
const hexStr = '0x' + utf8Bytes.toString('hex');

// Get real-time gas and nonce for each transaction
async function performTransaction(walletInfo, numberOfTimes) {
    let successNum = 0;
    let failNum = 0;
    for (let i = 0; i < numberOfTimes; i++) {
        try {
            const nonce = await web3.eth.getTransactionCount(walletInfo.address);
            const gasPrice = await web3.eth.getGasPrice();
            const gasEstimate = await web3.eth.estimateGas({
                to: walletInfo.address,
                value: amount,
                data: hexStr,
            });

            const transaction = {
                to: walletInfo.address,
                value: amount,
                gasPrice: gasPrice,
                nonce: nonce,
                gas: gasEstimated,
                data: hexStr,
            };

            const signedTransaction = await web3.eth.accounts.signTransaction(transaction, walletInfo.privateKey);
            const result = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            successNum = successNum + 1;
            console.log(`This script runs the ${walletInfo.num}th address ${walletInfo.address} and the ${i + 1}th operation is successful. A total of ${successNum} times of success and a total of ${failNum} times of failure. , transaction hash: ${result.transactionHash}`);
        } catch (error) {
            failNum = failNum + 1;
            console.error(`This script runs the ${walletInfo.num}th address ${walletInfo.address} and the ${i + 1}th operation failed. A total of ${successNum} times of success and a total of ${failNum} times of failure. : `, error);
        }
    }
}

async function main() {
    let walletData = [];
    try {
        walletData = JSON.parse(fs.readFileSync('evm_wallets.json', 'utf-8'));
    } catch (e) {
        console.log('evm_wallets.json file not found');
    }

    Promise.all(walletData.map(wallet => performTransaction(wallet, process.env.NUMBER_OF_TIMES)))
        .then(() => {
            console.log("All operations completed");
        })
        .catch(error => {
            console.error("An error occurred during operation: ", error);
        });
}

main();
