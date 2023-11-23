import {
	Hex,
	hexToNumber,
	pad,
	slice,
	toHex,
	TypedDataDomain,
	zeroAddress,
} from "viem";
import type { Address, WalletClient } from "wagmi";
import { useContractRead, useWalletClient } from "wagmi";
import { ERC20ABI } from "./abi.js";

export type PermitSignature = {
	r: Hex;
	s: Hex;
	v: number;
};

type SignPermitProps = {
	walletClient: WalletClient;
	/** Address of the token to approve */
	contractAddress: Hex;
	/** Name of the token to approve.
	 * Corresponds to the `name` method on the ERC-20 contract. Please note this must match exactly, and is case-and-spacing sensitive */
	erc20Name: string;
	/** Owner of the tokens. Usually the currently connected address. */
	ownerAddress: Hex;
	/** Address to grant allowance to */
	spenderAddress: Hex;
	/** Expiration of this approval, in SECONDS */
	deadline: bigint;
	/** Numerical chainId of the token contract */
	chainId: number;
	/** Defaults to 1. Some tokens need a different version, check the [README](https://github.com/vacekj/permit#permit-information-for-common-tokens) for more information */
	permitVersion?: string;
	/** Permit nonce for the specific user and token contract. You can get the nonce from the `nonces` method on the token contract. */
	nonce: bigint;
};

type Eip2612Props = SignPermitProps & {
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

type UsePermitProps = {
	walletClient?: WalletClient | null;
	chainId?: number;
	tokenAddress?: Address;
	owner?: Address;
	spender: Address;
	permitVersion?: string;
};

export function usePermit({
	tokenAddress,
	chainId,
	walletClient,
	owner,
	spender,
	permitVersion,
}: UsePermitProps) {
	const { data: defaultWalletClient } = useWalletClient();
	const walletClientToUse = walletClient ?? defaultWalletClient;
	const ownerToUse = owner ?? walletClientToUse?.account.address ?? zeroAddress;
	const { data: nonce } = useContractRead({
		chainId,
		address: tokenAddress,
		abi: ERC20ABI,
		functionName: "nonces",
		args: [ownerToUse],
	});
	const { data: name } = useContractRead({
		chainId,
		address: tokenAddress,
		abi: ERC20ABI,
		functionName: "name",
	});
	const { data: versionFromContract } = useContractRead({
		chainId,
		address: tokenAddress,
		abi: ERC20ABI,
		functionName: "version",
	});
	const version = permitVersion ?? versionFromContract ?? "1";
	const ready =
		walletClientToUse !== null &&
		walletClientToUse !== undefined &&
		chainId !== undefined &&
		tokenAddress !== undefined &&
		name !== undefined &&
		nonce !== undefined;

	return {
		signPermitDai: ready
			? (
					props: PartialBy<
						SignPermitProps,
						| "chainId"
						| "ownerAddress"
						| "walletClient"
						| "contractAddress"
						| "spenderAddress"
						| "nonce"
						| "erc20Name"
						| "permitVersion"
					>,
			  ) =>
					signPermitDai({
						chainId,
						walletClient: walletClientToUse,
						ownerAddress: owner ?? walletClientToUse.account.address,
						contractAddress: tokenAddress,
						spenderAddress: spender,
						erc20Name: name,
						permitVersion: version,
						nonce,
						...props,
					})
			: undefined,
		signPermit: ready
			? (
					props: PartialBy<
						Eip2612Props,
						| "chainId"
						| "ownerAddress"
						| "walletClient"
						| "contractAddress"
						| "spenderAddress"
						| "nonce"
						| "erc20Name"
						| "permitVersion"
					>,
			  ) =>
					signPermit2612({
						chainId,
						walletClient: walletClientToUse,
						ownerAddress: owner ?? walletClientToUse.account.address,
						contractAddress: tokenAddress,
						spenderAddress: spender,
						erc20Name: name,
						nonce,
						permitVersion: version,
						...props,
					})
			: undefined,
	};
}
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;