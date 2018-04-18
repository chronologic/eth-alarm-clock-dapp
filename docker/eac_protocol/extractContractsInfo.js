const fs = require('fs');
const path = require('path');

const artifactsDir = './build/contracts/';
const dest = './abi/';

try {
  fs.mkdirSync(dest);
} catch (err) {
  /*eslint-disable */
  console.log(err);
  /*eslint-enable */
}

const contracts = {};

let networkId = null;

fs.readdir(artifactsDir, (err, files) => {
  files.forEach(file => {
    const filePath = path.join(artifactsDir, file);
    const content = fs.readFileSync(filePath);
    const parsedContent = JSON.parse(content);
    const abi = parsedContent.abi;
    const contractName = uncapitalize(file.split('.json')[0]);
    const outputFilePath = path.join(dest, file);

    if (!networkId) {
      networkId = Object.keys(parsedContent.networks)[0];
    }

    if (parsedContent.networks[networkId] && contractName !== 'migrations') {
      const address = parsedContent.networks[networkId].address;
      contracts[contractName] = address;
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(abi));
  });

  fs.writeFileSync('contracts.json', JSON.stringify(contracts));
});

function uncapitalize(text) {
  return text.charAt(0).toLowerCase() + text.substr(1);
}