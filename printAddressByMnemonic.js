require('dotenv').config();
const bip39 = require('bip39')
const HDWallet = require('ethereum-hdwallet');
// Get the mnemonic phrase
const mnemonic = process.env.MNEMONIC;
//Number of addresses to be generated
const genNum = process.env.GEN_NUM;

async function getAddresses(mnemonic) {
	const seed = await bip39.mnemonicToSeed(mnemonic); //Generate seed
	const hdwallet = HDWallet.fromSeed(seed);
	for (var i = 0; i < genNum; i++) { // Generate multiple addresses with the same seed
		const key = hdwallet.derive("m/44'/60'/0'/0/" + i); // The last bit of the address path is set to the loop variable
		const address = '0x' + key.getAddress().toString('hex'); //address
		console.log(address); // address
	}
}

getAddresses(mnemonic); //Execute function
