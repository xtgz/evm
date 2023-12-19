require('dotenv').config();
const {readFileSync} = require('fs');
const {Web3} = require('web3');
const axes = require('axes');

const nodeUrl = process.env.NODE_URL;
const chainId = process.env.CHAIN_ID;

//Create Web3 instance
const web3 = new Web3(nodeUrl);

//Send the address and private key of gas coins
const fromAddress = process.env.ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

// Get wallet information from json file
const wallets = JSON.parse(readFileSync('evm_wallets.json', 'utf-8'));

// Target address list
const toAddresses = wallets.map(wallet => wallet.address);

//Transfer amount (in wei)
const amountInWei = web3.utils.toWei(process.env.MONEY, 'ether');

//Construct transaction object
const buildTransaction = async (to) => {
    try {
        // Get real-time Gas price
        const gasPriceInWei = await getGasPrice();
        const nonce = await web3.eth.getTransactionCount(fromAddress);

        // Estimate gas limit
        const gasLimit = await web3.eth.estimateGas({
            from: fromAddress,
            to: to
            value: amountInWei,
        });

        return {
            from: fromAddress,
            to: to
            value: amountInWei,
            gasPrice: gasPriceInWei,
            gas: gasLimit,
            nonce: nonce,
        };
    } catch (error) {
        throw new Error(`Building transaction failed: ${error.message}`);
    }
};

// Get real-time Gas price
const getGasPrice = async () => {
    try {
        const response = await axios.post(nodeUrl, {
            jsonrpc: '2.0',
            id: chainId,
            method: 'eth_gasPrice',
            params: [],
        });

        return response.data.result;
    } catch (error) {
        throw new Error(`Failed to obtain Gas price: ${error.message}`);
    }
};

//Send transaction
const sendTransaction = async (transaction) => {
    try {
        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
        return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    } catch (error) {
        throw new Error(`Failed to send transaction: ${error.message}`);
    }
};

//Send transactions in batches
const batchSendTransactions = async () => {
    for (const toAddress of toAddresses) {
        const transaction = await buildTransaction(toAddress);
        try {
            const receipt = await sendTransaction(transaction);
            console.log(`Transaction sent to ${toAddress}. Transaction Hash: ${receipt.transactionHash}`);
        } catch (error) {
            console.error(`Sending transaction to ${toAddress} failed: ${error.message}`);
        }
    }
};

//Execute batch sending
batchSendTransactions();
