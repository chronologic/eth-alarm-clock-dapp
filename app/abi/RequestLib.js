export default [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "reason",
        "type": "uint8"
      }
    ],
    "name": "Aborted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "rewardPayment",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "measuredGasConsumption",
        "type": "uint256"
      }
    ],
    "name": "Cancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "Claimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "bounty",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "fee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "measuredGasConsumption",
        "type": "uint256"
      }
    ],
    "name": "Executed",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_addressArgs",
        "type": "address[4]"
      },
      {
        "name": "_uintArgs",
        "type": "uint256[12]"
      },
      {
        "name": "_callData",
        "type": "bytes"
      },
      {
        "name": "_endowment",
        "type": "uint256"
      }
    ],
    "name": "validate",
    "outputs": [
      {
        "name": "isValid",
        "type": "bool[6]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      },
      {
        "name": "_addressArgs",
        "type": "address[4]"
      },
      {
        "name": "_uintArgs",
        "type": "uint256[12]"
      },
      {
        "name": "_callData",
        "type": "bytes"
      }
    ],
    "name": "initialize",
    "outputs": [
      {
        "name": "initialized",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "PRE_EXECUTION_GAS",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      }
    ],
    "name": "requiredExecutionGas",
    "outputs": [
      {
        "name": "requiredGas",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "EXECUTION_GAS_OVERHEAD",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "EXECUTE_EXTRA_GAS",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "CANCEL_EXTRA_GAS",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      }
    ],
    "name": "cancel",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      }
    ],
    "name": "refundClaimDeposit",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      }
    ],
    "name": "sendFee",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      }
    ],
    "name": "sendBounty",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "self",
        "type": "RequestLib.Request storage"
      }
    ],
    "name": "sendOwnerEther",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];