const Networks = {
  0: {
    name: 'Private',
    endpoint: 'http://localhost:8545'
  },
  1: {
    name: 'Mainnet',
    endpoint: 'https://mainnet.infura.io'
  },
  3: {
    name: 'Ropsten',
    endpoint: 'https://ropsten.infura.io'
  },
  4: {
    name: 'Rinkeby',
    endpoint: 'https://rinkeby.infura.io'
  },
  42: {
    name: 'Kovan',
    endpoint: 'https://kovan.infura.io/6M6ROam68gmdp9OeNmym'
  }
};

const Explorers = {
  0: '127.0.0.1:7545',//Ganache
  1: 'https://etherscan.io/',
  3: 'https://ropsten.etherscan.io/',
  4: 'https://rinkeby.etherscan.io/',
  42: 'https://kovan.etherscan.io/'
};

export { Networks, Explorers };
