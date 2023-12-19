require('dotenv').config();
const fs = require('fs');
const bip39 = require('bip39')
// Generate English mnemonics
const mnemonicEn = bip39.generateMnemonic()
// Generate Chinese mnemonic words
const mnemonicCn = bip39.generateMnemonic(128, null, bip39.wordlists.chinese_simplified);
console.log('English mnemonic: ' + mnemonicEn);
console.log('Chinese mnemonic: ' + mnemonicCn);
const mnemonicInfo = {
	English mnemonic: mnemonicEn,
	Chinese mnemonic: mnemonicCn
};
//Write mnemonic words into JSON file
fs.writeFileSync('mnemonic.json', JSON.stringify(mnemonicInfo, null, 2));
