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
const totalTimes = BigInt(process.env.NUMBER_OF_TIMES);

// Get the gas and nonce until an error occurs, and keep sending the transaction regardless of the transaction result.
async function performTransaction(walletInfo, numberOfTimes) {
    const nonce = await web3.eth.getTransactionCount(walletInfo.address);
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await web3.eth.estimateGas({
        to: walletInfo.address,
        value: amount,
        data: hexStr,
    });
    let numberOfFinish = totalTimes - numberOfTimes;
    for (let i = 0; i < numberOfTimes; i++) {
        numberOfFinish = numberOfFinish + BigInt(1);
        try {
            const transaction = {
                to: walletInfo.address,
                value: amount,
                gasPrice: gasPrice,
                nonce: nonce + numberOfFinish - BigInt(1),
                gas: gasEstimated,
                data: hexStr,
            };

            const signedTransaction = await web3.eth.accounts.signTransaction(transaction, walletInfo.privateKey);
            web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

            console.log(`The ${walletInfo.num}th address ${walletInfo.address} the ${numberOfFinish} operation was successful.`);
        } catch (error) {
            console.error(`The ${walletInfo.num}th address ${walletInfo.address} the ${numberOfFinish}th operation failed: `, error);
            await performTransaction(walletInfo, totalTimes - numberOfFinish);
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

    Promise.all(walletData.map(wallet => performTransaction(wallet, totalTimes)))
        .then(() => {
            console.log("All operations completed");
        })
        .catch(error => {
            console.error("An error occurred during operation: ", error);
        });
}

main();
