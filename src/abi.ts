export const ERC20ABI = [
	{
		inputs: [],
		stateMutability: "view",
		type: "function",
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
		name: "nonces",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
	},
	{
		inputs: [],
		name: "version",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
] as const;
