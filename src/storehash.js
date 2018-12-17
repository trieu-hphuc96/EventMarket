import web3 from './web3';
//Your contract address
const address = '0x278860D06Db5b986675D11Da5Aa5e553E7B2d2c9';
//Your contract ABI
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "ticketId_",
				"type": "string"
			},
			{
				"name": "owner_",
				"type": "string"
			},
			{
				"name": "eventName_",
				"type": "string"
			},
			{
				"name": "price_",
				"type": "uint256"
			}
		],
		"name": "buyTicket",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "eventHash_",
				"type": "string"
			}
		],
		"name": "setEventHash",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "eventHash",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getTickets",
		"outputs": [
			{
				"components": [
					{
						"name": "ticketId",
						"type": "string"
					},
					{
						"name": "owner",
						"type": "string"
					},
					{
						"name": "eventName",
						"type": "string"
					},
					{
						"name": "price",
						"type": "uint256"
					}
				],
				"name": "tickets_",
				"type": "tuple[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "messageType",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "resultMessage",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tickets",
		"outputs": [
			{
				"name": "ticketId",
				"type": "string"
			},
			{
				"name": "owner",
				"type": "string"
			},
			{
				"name": "eventName",
				"type": "string"
			},
			{
				"name": "price",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
export default new web3.eth.Contract(abi, address);