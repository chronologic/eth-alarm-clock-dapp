import DAYTokenABI from '../abi/DAYTokenABI';

import testnetDAYFaucetABI from '../abi/testnetDAYFaucetABI';
import { isRunningInDAppNode } from '../lib/dappnode-util';

export const MAIN_NETWORK_ID = 1;
export const ROPSTEN_NETWORK_ID = 3;
export const KOVAN_NETWORK_ID = 42;
export const DOCKER_NETWORK_ID = 1001;

export const DEFAULT_NETWORK_WHEN_NO_METAMASK = MAIN_NETWORK_ID;

export const requestFactoryStartBlocks = {
  [MAIN_NETWORK_ID]: 6204104,
  [ROPSTEN_NETWORK_ID]: 2594245,
  [KOVAN_NETWORK_ID]: 5555500
};

const CRYPTO_KITTIES_API_KEY = process.env.CRYPTO_KITTIES_API_KEY;

export const PROVIDER_URLS = {
  MAINNET: {
    QUIKNODE: {
      ws:
        'wss://smoothly-included-cattle.quiknode.io/4541de38-7057-4f36-9b63-08dac0e0098e/3fjrTlXVDWwLRmrbP0KbAQ==/',
      http:
        'https://smoothly-included-cattle.quiknode.io/4541de38-7057-4f36-9b63-08dac0e0098e/3fjrTlXVDWwLRmrbP0KbAQ==/'
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
    endpoint: 'https://ropsten.infura.io/v3/da724dd8cb184a54bc90632053137b80',
    showInChooser: true,
    dayTokenAddress: '0x7941bc77E1d6BD4628467b6cD3650F20F745dB06',
    dayTokenAbi: DAYTokenABI,
    dayFaucetAddress: '0xfc5c1dc438411dce1cee4971fa333ecd3c3fa7d3',
    dayFaucetAbi: testnetDAYFaucetABI,
    supported: false,
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
    endpoint: 'https://kovan.infura.io/v3/da724dd8cb184a54bc90632053137b80',
    showInChooser: true,
    dayTokenAddress: '0x5a6b5c6387196bd4ea264f627792af9d09096876',
    dayTokenAbi: DAYTokenABI,
    dayFaucetAddress: '0x3baebd8b6839f8ae0c88fc15b9d8d7b641d06731',
    dayFaucetAbi: testnetDAYFaucetABI,
    supported: true,
    explorer: 'https://kovan.etherscan.io/'
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
  EGG: {
    [MAIN_NETWORK_ID]: {
      address: '0xfcad2859f3e602d4cfb9aca35465a618f9009f7b',
      type: 'erc721',
      imagePath: 'https://api.dragonereum.io/images/eggs/small/{TOKEN_ID}.png',
      imageHeight: '140px',
      supportedMethods: {
        getApproved: true,
        safeTransferFrom: true
      }
    }
  },
  CK: {
    [MAIN_NETWORK_ID]: {
      address: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      type: 'erc721',
      imagePath:
        'https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/{TOKEN_ID}.png',
      imageHeight: '140px',
      async customGetTokensForOwner(address) {
        const URL = `https://public.api.cryptokitties.co/v1/kitties?owner_wallet_address=${address}&limit=400`;

        const response = await fetch(URL, {
          headers: {
            'x-api-token': CRYPTO_KITTIES_API_KEY
          }
        });

        const json = await response.json();

        if (!json.kitties || !json.kitties.length) {
          return [];
        }

        return json.kitties.map(kittie => kittie.id.toString());
      },
      supportedMethods: {
        getApproved: false,
        safeTransferFrom: false
      }
    },
    [KOVAN_NETWORK_ID]: {
      address: '0x9382c0b652f505a88a4c5bad05084df26a4a2f54',
      type: 'erc721',
      imagePath:
        'https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/{TOKEN_ID}.png',
      imageHeight: '140px',
      supportedMethods: {
        getApproved: false,
        safeTransferFrom: false
      }
    }
  },
  DAI: {
    [MAIN_NETWORK_ID]: {
      address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
    },
    [KOVAN_NETWORK_ID]: {
      address: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'
    }
  },
  DAY: {
    [MAIN_NETWORK_ID]: {
      address: '0xE814aeE960a85208C3dB542C53E7D4a6C8D5f60F'
    },
    [KOVAN_NETWORK_ID]: {
      address: '0x5a6b5c6387196bd4ea264f627792af9d09096876'
    }
  },
  DRAGON: {
    [MAIN_NETWORK_ID]: {
      address: '0x960f401aed58668ef476ef02b2a2d43b83c261d8',
      type: 'erc721',
      imagePath: 'https://api.dragonereum.io/images/dragons/small/{TOKEN_ID}.png',
      imageHeight: '140px',
      supportedMethods: {
        getApproved: true,
        safeTransferFrom: true
      }
    },
    [KOVAN_NETWORK_ID]: {
      address: '0x6823cac086c70858b9bec21770520a672481a96b',
      type: 'erc721',
      imagePath: 'https://api.dragonereum.io/images/dragons/small/{TOKEN_ID}.png',
      imageHeight: '140px',
      supportedMethods: {
        getApproved: true,
        safeTransferFrom: true
      }
    }
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
    TOKEN_ADDRESSES[token][network].symbol = token;
    PREDEFINED_TOKENS_FOR_NETWORK[network].push(
      Object.assign(TOKEN_ADDRESSES[token][network], {
        symbol: token
      })
    );
  }
}

export { Networks, CUSTOM_PROVIDER_NET_ID, PREDEFINED_TOKENS_FOR_NETWORK, TOKEN_ADDRESSES };
