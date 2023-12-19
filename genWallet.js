require('dotenv').config();
const fs = require('fs');
const bip39 = require('bip39')
const HDWallet = require('ethereum-hdwallet');
// Get the mnemonic phrase
const mnemonic = process.env.MNEMONIC;
//Number of addresses to be generated
const genNum = process.env.GEN_NUM;
 
async function getWallets(mnemonic) {
 
	const seed = await bip39.mnemonicToSeed(mnemonic); //Generate seed
 
	const hdwallet = HDWallet.fromSeed(seed);

	const wallets = [];

	for (var i = 0; i < genNum; i++) { // Generate multiple addresses with the same seed
		const key = hdwallet.derive("m/44'/60'/0'/0/" + i); // The last bit of the address path is set to the loop variable

		const address = '0x' + key.getAddress().toString('hex'); //地址
		const privateKey = key.getPrivateKey().toString('hex');
		const publicKey = key.getPublicKey().toString('hex');

		const wallet = {
			whether: i + 1,
			address: address,
			privateKey: privateKey,
			publicKey: publicKey
		};

		wallets.push(wallet);

		console.log('==============Address' + (i + 1) + '============= ====')
		console.log("address = " + address); // address
		console.log("private key = " + privateKey); // private key
		console.log("public key = " + publicKey); // public key
	}
	//Write address information to JSON file
	fs.writeFileSync('evm_wallets.json', JSON.stringify(wallets, null, 2));
}

getWallets(mnemonic); //Execute function
