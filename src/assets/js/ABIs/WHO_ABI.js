// This file holds contracts ABI, Address and Default Gas for contract execution.

var ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'deployMsg',
        type: 'string'
      }
    ],
    name: 'WHOscDeployment',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'countryAddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'countryReActivated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'countryAddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'countryName',
        type: 'string'
      }
    ],
    name: 'countryRegistered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'countryAddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'countryRevoked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'countryAddr',
        type: 'address'
      }
    ],
    name: 'countryTCsUpdated',
    type: 'event'
  },
  {
    inputs: [],
    name: 'checkLoginAddr',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'checkWHOaddr',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'country',
    outputs: [
      {
        internalType: 'string',
        name: 'nameOfCountry',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'bcType',
        type: 'string'
      },
      {
        internalType: 'address',
        name: 'addrOfCountry',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'addrOfSC',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'tcIPFShash',
        type: 'string'
      },
      {
        internalType: 'enum WHOsc.stateOfCountry',
        name: 'cState',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCountryInfo',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '',
        type: 'string'
      },
      {
        internalType: 'enum WHOsc.stateOfCountry',
        name: '',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_nameOfCountry',
        type: 'string'
      },
      {
        internalType: 'address',
        name: '_addrOfCountry',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'reactivateCountry',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_bcType',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_nameOfCountry',
        type: 'string'
      },
      {
        internalType: 'address',
        name: '_addrOfCountry',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_addrOfSC',
        type: 'address'
      },
      {
        internalType: 'string',
        name: '_tcIPFShash',
        type: 'string'
      }
    ],
    name: 'registerCountry',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_nameOfCountry',
        type: 'string'
      },
      {
        internalType: 'address',
        name: '_addrOfCountry',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'revokeCountry',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'stateOfTheCountry',
    outputs: [
      {
        internalType: 'enum WHOsc.stateOfCountry',
        name: '',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalRegisteredCountries',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_newTcIPFShash',
        type: 'string'
      }
    ],
    name: 'updateTChash',
    outputs: [
      {
        internalType: 'bool',
        name: 'result',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addrOfCountry',
        type: 'address'
      }
    ],
    name: 'verificationTime',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

var contractAddress = '0x5103D9422ce1A942C4ac9380622bFB42Fc59adbD'

var suppliedGas = 3000000

export { ABI, contractAddress, suppliedGas }
