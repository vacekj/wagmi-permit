import {useState} from "react";
import {Address, useContractRead, useWalletClient, WalletClient} from "wagmi";
import {zeroAddress} from "viem";
import {ERC20ABI} from "./abi.js";
import {Eip2612Props, PermitSignature, signPermit2612, signPermitDai, SignPermitProps} from "./permit.js";

export function usePermit({
                            tokenAddress,
                            chainId,
                            walletClient,
                            owner,
                            spender,
                            permitVersion,
                          }: UsePermitProps) {
  const [signature, setSignature] = useState<PermitSignature | undefined>();

  const {data: defaultWalletClient} = useWalletClient();
  const walletClientToUse = walletClient ?? defaultWalletClient;
  const ownerToUse = owner ?? walletClientToUse?.account.address ?? zeroAddress;
  const {data: nonce} = useContractRead({
    chainId,
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: "nonces",
    args: [ownerToUse],
  });
  const {data: name} = useContractRead({
    chainId,
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: "name",
  });
  const {data: versionFromContract} = useContractRead({
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
        }).then(signature => setSignature(signature))
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
        }).then(signature => setSignature(signature))
      : undefined,
    signature
  };
}


export type UsePermitProps = {
  walletClient?: WalletClient | null;
  chainId?: number;
  tokenAddress?: Address;
  owner?: Address;
  spender: Address;
  permitVersion?: string;
};


type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
