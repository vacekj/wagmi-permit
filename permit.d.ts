import { Hex } from "viem";
import { WalletClient } from "wagmi";
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
export declare const signPermit2612: ({ walletClient, contractAddress, erc20Name, ownerAddress, spenderAddress, value, deadline, nonce, chainId, permitVersion, }: Eip2612Props) => Promise<PermitSignature>;
export declare const signPermitDai: ({ walletClient, contractAddress, erc20Name, ownerAddress, spenderAddress, deadline, nonce, chainId, permitVersion, }: DaiPermitProps) => Promise<PermitSignature>;
export declare function usePermit(): {
    signPermitDai: (props: Omit<DaiPermitProps, "chainId" | "ownerAddress" | "walletClient">) => Promise<PermitSignature>;
    signPermit: (props: Omit<Eip2612Props, "chainId" | "ownerAddress" | "walletClient">) => Promise<PermitSignature>;
};
export {};
