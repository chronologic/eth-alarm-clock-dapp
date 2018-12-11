import DAYTokenABI from '../abi/DAYTokenABI';

import testnetDAYFaucetABI from '../abi/testnetDAYFaucetABI';
import { isRunningInDAppNode } from '../lib/dappnode-util';

export const MAIN_NETWORK_ID = 1;
export const ROPSTEN_NETWORK_ID = 3;
export const KOVAN_NETWORK_ID = 42;
export const DOCKER_NETWORK_ID = 1001;
export const RSK_TESTNET_NETWORK_ID = 31;

export const DEFAULT_NETWORK_WHEN_NO_METAMASK = MAIN_NETWORK_ID;

export const requestFactoryStartBlocks = {
  [MAIN_NETWORK_ID]: 6204104,
  [ROPSTEN_NETWORK_ID]: 2594245,
  [KOVAN_NETWORK_ID]: 5555500
};

export const PROVIDER_URLS = {
  MAINNET: {
    QUIKNODE: {
      ws:
        'wss://neatly-tolerant-coral.quiknode.io/73b04107-89ee-4261-9a8f-3c1e946c17b2/CyYMMeeGTb-EeIBHGwORaw==/',
      http:
        'https://neatly-tolerant-coral.quiknode.io/73b04107-89ee-4261-9a8f-3c1e946c17b2/CyYMMeeGTb-EeIBHGwORaw==/'
    },
    DAPPNODE: {
      ws: 'ws://my.ethchain.dnp.dappnode.eth:8546',
      http: 'http://my.ethchain.dnp.dappnode.eth:8546'
    }
  }
};

const Networks = {
  0: {
    id: 0,
    name: 'Local',
    endpoint: 'http://localhost:8545',
    showInChooser: false,
    explorer: '127.0.0.1:7545'
  },
  [MAIN_NETWORK_ID]: {
    id: MAIN_NETWORK_ID,
    name: 'Mainnet',
    endpoint: isRunningInDAppNode()
      ? PROVIDER_URLS.MAINNET.DAPPNODE.ws
      : PROVIDER_URLS.MAINNET.QUIKNODE.ws,
    httpEndpoint: isRunningInDAppNode()
      ? PROVIDER_URLS.MAINNET.DAPPNODE.http
      : PROVIDER_URLS.MAINNET.QUIKNODE.http,
    showInChooser: true,
    dayTokenAddress: '0xe814aee960a85208c3db542c53e7d4a6c8d5f60f',
    dayTokenAbi: DAYTokenABI,
    supported: true,
    explorer: 'https://etherscan.io/'
  },
  [ROPSTEN_NETWORK_ID]: {
    id: ROPSTEN_NETWORK_ID,
    name: 'Ropsten',
    endpoint:
      'wss://abnormally-just-wombat.quiknode.io/286cd134-837e-44ce-bfd7-d6d7d01632dc/dFQbkQcp3ZCfgUjXghtXLA==/',
    showInChooser: true,
    dayTokenAddress: '0x7941bc77E1d6BD4628467b6cD3650F20F745dB06',
    dayTokenAbi: DAYTokenABI,
    dayFaucetAddress: '0xfc5c1dc438411dce1cee4971fa333ecd3c3fa7d3',
    dayFaucetAbi: testnetDAYFaucetABI,
    supported: true,
    explorer: 'https://ropsten.etherscan.io/'
  },
  4: {
    id: 4,
    name: 'Rinkeby',
    endpoint: 'https://rinkeby.infura.io/6M6ROam68gmdp9OeNmym',
    showInChooser: false,
    supported: false,
    explorer: 'https://rinkeby.etherscan.io/'
  },
  [KOVAN_NETWORK_ID]: {
    id: KOVAN_NETWORK_ID,
    name: 'Kovan',
    endpoint:
      'wss://rarely-suitable-shark.quiknode.io/87817da9-942d-4275-98c0-4176eee51e1a/aB5gwSfQdN4jmkS65F1HyA==/',
    httpEndpoint:
      'https://rarely-suitable-shark.quiknode.io/87817da9-942d-4275-98c0-4176eee51e1a/aB5gwSfQdN4jmkS65F1HyA==/',
    showInChooser: true,
    dayTokenAddress: '0x5a6b5c6387196bd4ea264f627792af9d09096876',
    dayTokenAbi: DAYTokenABI,
    dayFaucetAddress: '0x3baebd8b6839f8ae0c88fc15b9d8d7b641d06731',
    dayFaucetAbi: testnetDAYFaucetABI,
    supported: true,
    explorer: 'https://kovan.etherscan.io/'
  },
  [RSK_TESTNET_NETWORK_ID]: {
    id: RSK_TESTNET_NETWORK_ID,
    name: 'RSK TestNet',
    endpoint: 'http://ec2-54-210-114-200.compute-1.amazonaws.com/',
    httpEndpoint: 'http://ec2-54-210-114-200.compute-1.amazonaws.com/',
    showInChooser: true,
    // dayTokenAddress: '0x5a6b5c6387196bd4ea264f627792af9d09096876',
    dayTokenAbi: DAYTokenABI,
    // dayFaucetAddress: '0x3baebd8b6839f8ae0c88fc15b9d8d7b641d06731',
    dayFaucetAbi: testnetDAYFaucetABI,
    supported: true,
    explorer: 'https://explorer.testnet.rsk.co'
  },
  [DOCKER_NETWORK_ID]: {
    id: DOCKER_NETWORK_ID,
    name: 'Docker',
    endpoint: 'http://localhost:9545',
    showInChooser: false,
    dayTokenAddress: process.env.DAY_TOKEN_ADDRESS_DOCKER,
    dayTokenAbi: process.env.DAY_TOKEN_ABI_DOCKER
      ? JSON.parse(process.env.DAY_TOKEN_ABI_DOCKER)
      : '[]',
    dayFaucetAddress: process.env.DAY_FAUCET_ADDRESS_DOCKER,
    dayFaucetAbi: process.env.DAY_FAUCET_ABI_DOCKER
      ? JSON.parse(process.env.DAY_FAUCET_ABI_DOCKER)
      : '[]',
    supported: false,
    explorer: null
  }
};

const CUSTOM_PROVIDER_NET_ID = 9999;

const TOKEN_ADDRESSES = {
  DAI: {
    [MAIN_NETWORK_ID]: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    [KOVAN_NETWORK_ID]: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'
  },
  DAY: {
    [MAIN_NETWORK_ID]: '0xE814aeE960a85208C3dB542C53E7D4a6C8D5f60F',
    [KOVAN_NETWORK_ID]: '0x5a6b5c6387196bd4ea264f627792af9d09096876'
  }
};

const PREDEFINED_TOKENS_FOR_NETWORK = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  [KOVAN_NETWORK_ID]: []
};

for (let token of Object.keys(TOKEN_ADDRESSES)) {
  for (let network of Object.keys(TOKEN_ADDRESSES[token])) {
    PREDEFINED_TOKENS_FOR_NETWORK[network].push(token);
  }
}

export { Networks, CUSTOM_PROVIDER_NET_ID, PREDEFINED_TOKENS_FOR_NETWORK, TOKEN_ADDRESSES };
