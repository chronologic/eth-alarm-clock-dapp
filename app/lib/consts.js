export const NAVIGATION_STEPS = {
    eac_client:{
        DATETIME_SETUP: {
          idx: 1,
          title: 'Date & Time',
          className: 'date_time-setup',
          propertyKeys: ['timeZone','transactionDate','transactioTime','executionWindow'],
          nextUrl: 'eac/step-1',
        },
        INFORMATION: {
          idx: 2,
          title: 'Information',
          className: 'information-setup',
          propertyKeys: ['address','amount','data','gas'],
          nextUrl: 'eac/step-2',
        },
        BOUNTY: {
            idx: 3,
            title: 'Bounty',
            className: 'bounty-setup',
            propertyKeys: ['time_bounty','deposit'],
            nextUrl: 'eac/step-3',
        },
        CONFIRM: {
            idx: 4,
            title: 'Confirm',
            className: 'confirm-setup',
            propertyKeys: ['address','amount','data','blockOrTime','windowSize','gasAmount','gasPrice','timeBounty','donation','deposit']
        }


}
}

export const NETWORK_MESSAGES = {
    '1': 'You are connected to Mainnet',
    '2': 'You are connected to deprecated Mordern Testnet',
    '3': 'You are connected to the Ropsten Testnet',
    '4': 'You are connected to the Rinkeby Testnet',
    default: 'You are connected to an unknown network',
};