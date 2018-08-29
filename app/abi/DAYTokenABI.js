/* eslint no-use-before-define: 0 */

export default [
  {
    constant: false,
    inputs: [{ name: 'addr', type: 'address' }, { name: 'state', type: 'bool' }],
    name: 'setTransferAgent',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalNormalContributorIdsAllocated',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'mintingFinished',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_receiver', type: 'address' },
      { name: '_customerId', type: 'uint256' },
      { name: '_id', type: 'uint256' },
      { name: '_tokens', type: 'uint256' },
      { name: '_weiAmount', type: 'uint256' }
    ],
    name: 'allocateNormalTimeMints',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'teamLockPeriodInSec',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'isDayTokenActivated',
    outputs: [{ name: 'isActivated', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'firstTeamContributorId',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalPostIcoContributorIdsAllocated',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'setReleaseAgent',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'fetchSuccessfulSaleProceed',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_adr', type: 'address' },
      { name: '_id', type: 'uint256' },
      { name: '_tokens', type: 'uint256' },
      { name: '_isTest', type: 'bool' }
    ],
    name: 'addTeamTimeMints',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_id', type: 'uint256' }],
    name: 'getMintingPowerById',
    outputs: [{ name: 'mintingPower', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_day', type: 'uint256' }],
    name: 'getPhaseCount',
    outputs: [{ name: 'phase', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'uint256' }],
    name: 'contributors',
    outputs: [
      { name: 'adr', type: 'address' },
      { name: 'initialContributionDay', type: 'uint256' },
      { name: 'lastUpdatedOn', type: 'uint256' },
      { name: 'mintingPower', type: 'uint256' },
      { name: 'expiryBlockNumber', type: 'uint256' },
      { name: 'minPriceInDay', type: 'uint256' },
      { name: 'status', type: 'uint8' }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_minPriceInDay', type: 'uint256' },
      { name: '_expiryBlockNumber', type: 'uint256' }
    ],
    name: 'sellMintingAddress',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'receiver', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'mintAgents',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'addr', type: 'address' }, { name: 'state', type: 'bool' }],
    name: 'setMintAgent',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'value', type: 'uint256' }],
    name: 'upgrade',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_id', type: 'uint256' }],
    name: 'balanceById',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'halvingCycle',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'DayInSecs',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'teamIssuedTimestamp',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'initialBlockTimestamp',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_name', type: 'string' }, { name: '_symbol', type: 'string' }],
    name: 'setTokenInformation',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'mintingDec',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'maxMintingPower',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'soldAddresses',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'minMintingPower',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'upgradeAgent',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_offerId', type: 'uint256' }, { name: '_offerInDay', type: 'uint256' }],
    name: 'buyMintingAddress',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'releaseTokenTransfer',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'upgradeMaster',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_adr', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalTeamContributorIdsAllocated',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'cancelSaleOfMintingAddress',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getUpgradeState',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_address', type: 'address' }],
    name: 'isValidContributorAddress',
    outputs: [{ name: 'isValidContributor', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'transferAgents',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_address', type: 'address' }],
    name: 'isTeamLockInPeriodOverIfTeamAddress',
    outputs: [{ name: 'isLockInPeriodOver', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'sellingPriceInDayOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalPostIcoContributorIds',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'maxAddresses',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'released',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_receiver', type: 'address' },
      { name: '_customerId', type: 'uint256' },
      { name: '_id', type: 'uint256' }
    ],
    name: 'postAllocateAuctionTimeMints',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'canUpgrade',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'isInitialBlockTimestampSet',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_mintingDec', type: 'uint256' }],
    name: 'setMintingDec',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'firstPostIcoContributorId',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }],
    name: 'safeSub',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'maxMintingDays',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_id', type: 'uint256' }],
    name: 'updateTimeMintBalance',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalNormalContributorIds',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'refundFailedAuctionAmount',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_initialBlockTimestamp', type: 'uint256' }],
    name: 'releaseToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_adr', type: 'address' }],
    name: 'getMintingPowerByAddress',
    outputs: [{ name: 'mintingPower', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalTeamContributorIds',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_id', type: 'uint256' }],
    name: 'getSellingStatus',
    outputs: [{ name: 'status', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getTotalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'updateMyTimeMintBalance',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalUpgraded',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'firstContributorId',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }],
    name: 'safeMul',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'releaseAgent',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'minBalanceToSell',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'newOwner',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'setUpgradeAgent',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'idOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }, { name: '_spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_id', type: 'uint256' }],
    name: 'isValidContributorId',
    outputs: [{ name: 'isValidContributor', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getOnSaleIds',
    outputs: [{ name: '', type: 'uint256[]' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }],
    name: 'safeAdd',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getDayCount',
    outputs: [{ name: 'daySinceMintingEpoch', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'master', type: 'address' }],
    name: 'setUpgradeMaster',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_name', type: 'string' },
      { name: '_symbol', type: 'string' },
      { name: '_initialSupply', type: 'uint256' },
      { name: '_decimals', type: 'uint8' },
      { name: '_mintable', type: 'bool' },
      { name: '_maxAddresses', type: 'uint256' },
      { name: '_firstTeamContributorId', type: 'uint256' },
      { name: '_totalTeamContributorIds', type: 'uint256' },
      { name: '_totalPostIcoContributorIds', type: 'uint256' },
      { name: '_minMintingPower', type: 'uint256' },
      { name: '_maxMintingPower', type: 'uint256' },
      { name: '_halvingCycle', type: 'uint256' },
      { name: '_minBalanceToSell', type: 'uint256' },
      { name: '_dayInSecs', type: 'uint256' },
      { name: '_teamLockPeriodInSec', type: 'uint256' }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'newName', type: 'string' },
      { indexed: false, name: 'newSymbol', type: 'string' }
    ],
    name: 'UpdatedTokenInformation',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: false, name: 'from', type: 'address' },
      { indexed: false, name: 'to', type: 'address' }
    ],
    name: 'MintingAdrTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'adr', type: 'address' },
      { indexed: false, name: 'id', type: 'uint256' }
    ],
    name: 'ContributorAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: false, name: 'seller', type: 'address' },
      { indexed: false, name: 'minPriceInDay', type: 'uint256' },
      { indexed: false, name: 'expiryBlockNumber', type: 'uint256' }
    ],
    name: 'TimeMintOnSale',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: false, name: 'buyer', type: 'address' },
      { indexed: false, name: 'offerInDay', type: 'uint256' }
    ],
    name: 'TimeMintSold',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'investor', type: 'address' },
      { indexed: false, name: 'weiAmount', type: 'uint256' },
      { indexed: false, name: 'tokenAmount', type: 'uint256' },
      { indexed: false, name: 'customerId', type: 'uint256' },
      { indexed: false, name: 'contributorId', type: 'uint256' }
    ],
    name: 'PostInvested',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'teamAddress', type: 'address' },
      { indexed: false, name: 'id', type: 'uint256' }
    ],
    name: 'TeamAddressAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'receiver', type: 'address' },
      { indexed: false, name: 'weiAmount', type: 'uint256' },
      { indexed: false, name: 'tokenAmount', type: 'uint256' },
      { indexed: false, name: 'customerId', type: 'uint256' },
      { indexed: false, name: 'contributorId', type: 'uint256' }
    ],
    name: 'Invested',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: '_from', type: 'address' },
      { indexed: true, name: '_to', type: 'address' },
      { indexed: false, name: '_value', type: 'uint256' }
    ],
    name: 'Upgrade',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: 'agent', type: 'address' }],
    name: 'UpgradeAgentSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'addr', type: 'address' },
      { indexed: false, name: 'state', type: 'bool' }
    ],
    name: 'MintingAgentChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: '_from', type: 'address' },
      { indexed: true, name: '_to', type: 'address' }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'receiver', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Minted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: '_owner', type: 'address' },
      { indexed: true, name: '_spender', type: 'address' },
      { indexed: false, name: '_value', type: 'uint256' }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: '_from', type: 'address' },
      { indexed: true, name: '_to', type: 'address' },
      { indexed: false, name: '_value', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  }
];
