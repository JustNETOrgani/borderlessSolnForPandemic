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
        indexed: true,
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
        indexed: true,
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
        name: 'addrOfSC',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'IPFShash',
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
        internalType: 'string',
        name: '_IPFShash',
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
        name: '_newIPFShash',
        type: 'string'
      }
    ],
    name: 'updateCountryTCs',
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

var contractAddress = '0x0D351CD36e4E28340B1aCc2f8cA07968A9835D16'

var suppliedGas = 3000000

export { ABI, contractAddress, suppliedGas }
