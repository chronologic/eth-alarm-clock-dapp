const fs = require('fs');

const artifactsDir = './build/contracts/';
const files = fs.readdirSync(artifactsDir);

const contracts = {};

const networkId = Object.keys(require(artifactsDir + files[0]).networks)[0];
for (let file of files) {
  let obj = require(artifactsDir + file);
  if (obj.networks[networkId]) {
    contracts[file.split('.json')[0]] = obj.networks[networkId].address;
  }
}

fs.writeFileSync('contracts.json', JSON.stringify(contracts));