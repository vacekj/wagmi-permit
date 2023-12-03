import { useState } from "react";
import { useContractRead, useWalletClient } from "wagmi";
import { zeroAddress } from "viem";
import { ERC20ABI } from "./abi.js";
import {
	Eip2612Props,
	PermitSignature,
	signPermit,
	signPermitDai,
	SignPermitProps,
} from "./permit.js";

export function usePermit({
	contractAddress,
	chainId,
	walletClient,
	ownerAddress,
	spenderAddress,
	permitVersion,
}: UsePermitProps) {
	const [signature, setSignature] = useState<PermitSignature | undefined>();

	const { data: defaultWalletClient } = useWalletClient();
	const walletClientToUse = walletClient ?? defaultWalletClient;
	const ownerToUse = ownerAddress ?? walletClientToUse?.account.address ?? zeroAddress;
	const { data: nonce } = useContractRead({
		chainId,
		address: contractAddress,
		abi: ERC20ABI,
		functionName: "nonces",
		args: [ownerToUse],
	});
	const { data: name } = useContractRead({
		chainId,
		address: contractAddress,
		abi: ERC20ABI,
		functionName: "name",
	});
	const { data: versionFromContract } = useContractRead({
		chainId,
		address: contractAddress,
		abi: ERC20ABI,
		functionName: "version",
	});
	const version = permitVersion ?? versionFromContract ?? "1";
	const ready =
		walletClientToUse !== null &&
		walletClientToUse !== undefined &&
		spenderAddress !== undefined &&
		chainId !== undefined &&
		contractAddress !== undefined &&
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
						ownerAddress: ownerAddress ?? walletClientToUse.account.address,
						contractAddress: contractAddress,
						spenderAddress: spenderAddress ?? zeroAddress,
						erc20Name: name,
						permitVersion: version,
						nonce,
						...props,
					}).then((signature) => setSignature(signature))
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
					signPermit({
						chainId,
						walletClient: walletClientToUse,
						ownerAddress: ownerAddress ?? walletClientToUse.account.address,
						contractAddress: contractAddress,
						spenderAddress: spenderAddress ?? zeroAddress,
						erc20Name: name,
						nonce,
						permitVersion: version,
						...props,
					}).then((signature) => setSignature(signature))
			: undefined,
		signature,
	};
}

export type UsePermitProps = Partial<SignPermitProps>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
