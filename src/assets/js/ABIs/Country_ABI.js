// This file holds contracts ABI, Address and Default Gas for contract execution.

var ABIcountrySC = [
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
        name: 'TCaddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'TCRevoked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'TCaddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'TCreActivated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'nameOfTC',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'addOfTC',
        type: 'address'
      }
    ],
    name: 'TCregistered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'txInitiator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'HID',
        type: 'bytes32'
      }
    ],
    name: 'patientRecordUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'txInitiator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'HID',
        type: 'bytes32'
      }
    ],
    name: 'patientRegistered',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'TC',
    outputs: [
      {
        internalType: 'string',
        name: 'TC_name',
        type: 'string'
      },
      {
        internalType: 'address',
        name: 'TC_addr',
        type: 'address'
      },
      {
        internalType: 'enum countrySC.stateOfTC',
        name: 'tcState',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
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
    name: 'checkTCLogin',
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
    name: 'getTCInfo',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      },
      {
        internalType: 'enum countrySC.stateOfTC',
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
        internalType: 'address',
        name: '_personAddress',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: '_HID',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: '_hIPFShash',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: '_covidTnVStatus',
        type: 'bytes32'
      },
      {
        internalType: 'uint8',
        name: '_vState',
        type: 'uint8'
      },
      {
        internalType: 'string',
        name: '_signature_new',
        type: 'string'
      }
    ],
    name: 'patientRecordUpdate',
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
        name: '_personAddress',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: '_HID',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: '_hIPFShash',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: '_covidTnVStatus',
        type: 'bytes32'
      },
      {
        internalType: 'uint8',
        name: '_vState',
        type: 'uint8'
      },
      {
        internalType: 'string',
        name: '_signature',
        type: 'string'
      }
    ],
    name: 'patientRegistration',
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
        internalType: 'string',
        name: '_TC_name',
        type: 'string'
      },
      {
        internalType: 'address',
        name: '_TC_addr',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'reactivateTCcert',
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
        name: '_TC_name',
        type: 'string'
      },
      {
        internalType: 'address',
        name: '_TC_addr',
        type: 'address'
      }
    ],
    name: 'registerTC',
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
        name: '_TC_name',
        type: 'string'
      },
      {
        internalType: 'address',
        name: '_TC_addr',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string'
      }
    ],
    name: 'revokeTCcert',
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
    name: 'stateOfTheTC',
    outputs: [
      {
        internalType: 'enum countrySC.stateOfTC',
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
        internalType: 'address',
        name: 'personNewAddr',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: 'HID',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 'currenthIPFShash',
        type: 'bytes32'
      },
      {
        internalType: 'string',
        name: 'signatureOnIPFShash',
        type: 'string'
      }
    ],
    name: 'updateBlockchainAddr',
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
        internalType: 'bytes32',
        name: 'hIPFShash',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 'HID',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 'covidTnVStatus',
        type: 'bytes32'
      },
      {
        internalType: 'string',
        name: 'signature',
        type: 'string'
      }
    ],
    name: 'verifyUserStatus',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

var contractAddressCountrySC = '0x03BC982EC8A15918b9d855D48fF24dC36f7Ffa76'

var suppliedGasCountrySC = 3000000

export { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC }
