import { Hex, hexToNumber, slice } from "viem";
import { useAccount, useNetwork, useWalletClient, WalletClient } from "wagmi";

export type PermitSignature = {
	r: Hex;
	s: Hex;
	v: number;
};

type SignPermitProps = {
	walletClient: WalletClient;
	contractAddress: Hex;
	erc20Name: string;
	ownerAddress: Hex;
	spenderAddress: Hex;
	deadline: bigint;
	chainId: number;
	permitVersion?: string;
};

type Eip2612Props = SignPermitProps & {
	value: bigint;
	nonce: bigint;
};

type DaiPermitProps = SignPermitProps & {
	nonce: bigint;
};

/* Signs a permit for EIP-2612-compatible ERC-20 tokens */
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
}: DaiPermitProps): Promise<PermitSignature> => {
	const types = {
		Permit: [
			{ name: "holder", type: "address" },
			{ name: "spender", type: "address" },
			{ name: "nonce", type: "uint256" },
			{ name: "expiry", type: "uint256" },
			{ name: "allowed", type: "bool" },
		],
	};

	const domainData = {
		name: erc20Name,
		version: permitVersion ?? "1",
		chainId: chainId,
		verifyingContract: contractAddress,
	};

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

export function usePermit() {
	const { data: walletClient } = useWalletClient();
	const { chain } = useNetwork();
	const { address } = useAccount();

	return {
		signPermitDai: (
			props: Omit<DaiPermitProps, "chainId" | "ownerAddress" | "walletClient">,
		) =>
			signPermitDai({
				chainId: chain.id,
				walletClient,
				ownerAddress: address,
				...props,
			}),
		signPermit: (
			props: Omit<Eip2612Props, "chainId" | "ownerAddress" | "walletClient">,
		) =>
			signPermit2612({
				chainId: chain.id,
				walletClient,
				ownerAddress: address,
				...props,
			}),
	};
}
