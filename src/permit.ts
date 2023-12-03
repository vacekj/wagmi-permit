import { Hex, hexToNumber, pad, slice, toHex, TypedDataDomain } from "viem";
import type { WalletClient } from "wagmi";

export type PermitSignature = {
	r: Hex;
	s: Hex;
	v: number;
};

export type SignPermitProps = {
	/** Wallet client to invoke for signing the permit message */
	walletClient: WalletClient;
	/** Address of the token to approve */
	contractAddress: Hex;
	/** Name of the token to approve.
	 * Corresponds to the `name` method on the ERC-20 contract. Please note this must match exactly byte-for-byte */
	erc20Name: string;
	/** Owner of the tokens. Usually the currently connected address. */
	ownerAddress: Hex;
	/** Address to grant allowance to */
	spenderAddress: Hex;
	/** Expiration of this approval, in SECONDS */
	deadline: bigint;
	/** Numerical chainId of the token contract */
	chainId: number;
	/** Defaults to 1. Some tokens need a different version, check the [PERMIT INFORMATION](https://github.com/vacekj/wagmi-permit/blob/main/PERMIT.md) for more information */
	permitVersion?: string;
	/** Permit nonce for the specific address and token contract. You can get the nonce from the `nonces` method on the token contract. */
	nonce: bigint;
};

export type Eip2612Props = SignPermitProps & {
	/** Amount to approve */
	value: bigint;
};

/** Signs a permit for ERC-2612-compatible ERC-20 tokens */
export const signPermit2612 = async ({
	walletClient,
	contractAddress,
	erc20Name,
	ownerAddress,
	spenderAddress,
	value,
	deadline,
	nonce,
	chainId,
	permitVersion,
}: Eip2612Props): Promise<PermitSignature> => {
	const types = {
		Permit: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
			{ name: "value", type: "uint256" },
			{ name: "nonce", type: "uint256" },
			{ name: "deadline", type: "uint256" },
		],
	};

	const domainData = {
		name: erc20Name,
		/** We assume 1 if permit version is not specified */
		version: permitVersion ?? "1",
		chainId: chainId,
		verifyingContract: contractAddress,
	};

	const message = {
		owner: ownerAddress,
		spender: spenderAddress,
		value,
		nonce,
		deadline,
	};

	const signature = await walletClient.signTypedData({
		account: ownerAddress,
		message,
		domain: domainData,
		primaryType: "Permit",
		types,
	});
	const [r, s, v] = [
		slice(signature, 0, 32),
		slice(signature, 32, 64),
		slice(signature, 64, 65),
	];
	return { r, s, v: hexToNumber(v) };
};

export const signPermitDai = async ({
	walletClient,
	contractAddress,
	erc20Name,
	ownerAddress,
	spenderAddress,
	deadline,
	nonce,
	chainId,
	permitVersion,
}: SignPermitProps): Promise<PermitSignature> => {
	const types = {
		Permit: [
			{ name: "holder", type: "address" },
			{ name: "spender", type: "address" },
			{ name: "nonce", type: "uint256" },
			{ name: "expiry", type: "uint256" },
			{ name: "allowed", type: "bool" },
		],
	};

	let domainData: TypedDataDomain = {
		name: erc20Name,
		/** There are no known Dai deployments with Dai permit and version other than or unspecified */
		version: permitVersion ?? "1",
		chainId: chainId,
		verifyingContract: contractAddress,
	};
	/** USDC on Polygon is a special case */
	if (chainId === 137 && erc20Name === "USD Coin (PoS)") {
		domainData = {
			name: erc20Name,
			version: permitVersion ?? "1",
			verifyingContract: contractAddress,
			salt: pad(toHex(137), { size: 32 }),
		};
	}

	const message = {
		holder: ownerAddress,
		spender: spenderAddress,
		nonce,
		expiry: deadline,
		/** true == infinite allowance, false == 0 allowance*/
		allowed: true,
	};

	const signature = await walletClient.signTypedData({
		account: ownerAddress,
		domain: domainData,
		primaryType: "Permit",
		types,
		message,
	});
	const [r, s, v] = [
		slice(signature, 0, 32),
		slice(signature, 32, 64),
		slice(signature, 64, 65),
	];
	return { r, s, v: hexToNumber(v) };
};
