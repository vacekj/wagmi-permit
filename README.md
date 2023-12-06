# Wagmi Permit

All you need to sign ERC-2612/DAI permits with viem and wagmi.

- [Wagmi-Permit](#wagmi-permit)
    * [Features](#features)
    * [Installation](#installation)
    * [Usage](#usage)
        + [Hook](#hook)
        + [Hook with overrides](#hook-with-overrides)
        + [Dai hook](#dai-hook)
        + [Actions](#actions)
- [Example app](#example-app)
- [Permit information for common tokens](#permit-information-for-common-tokens)
- [Credits](#credits)


## Features
- A set of functions and wagmi hooks to sign Permits
- Supports both ERC-2612 Permit and Dai non-standard permit
- Automatically manages nonce, version and token name - just pass in the contract address
- Handles USDC on Polygon PoS edge-case

## Installation

```bash
npm i wagmi-permit
```
```bash
pnpm add wagmi-permit
```
```bash
bun i wagmi-permit
```
```bash
yarn add wagmi-permit
```

## Usage

The auto-generated API docs [can be found here](https://vacekj.github.io/wagmi-permit)

### Hook

```typescript jsx
import { usePermit } from "wagmi-permit";

function PermitExample() {
  const { data: walletClient } = useWalletClient();
  /* No need to specify name, nonce and permit version, the hook takes care of all that automatically */
  const { signPermit, signature } = usePermit({
    walletClient,
    ownerAddress: walletClient?.account.address,
    chainId: 1,
    spenderAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
    contractAddress: "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf", // usdc on mainnet
    value: parseEther("10"),
    deadline: BigInt(Date.now() + 100_000),
  });

  return (
    <>
      <pre>{JSON.stringify(signature, null, 2)}</pre>
      <button
        onClick={async () => {
          /* Permit signature is returned both from the action and from the hook */
          const permitSignature = await signPermit?.();
          console.log(permitSignature);
        }}
      >
        Sign Permit
      </button>
    </>
  );
}
```

### Hook with overrides

You can override the data passed to the permit signature in the hook...

```typescript jsx
const { signPermit, signature } = usePermit({
  walletClient,
  ownerAddress: walletClient?.account.address,
  chainId: 1,
  spenderAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
  contractAddress: "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf", // usdc on mainnet
  value: parseEther("10"),
  deadline: BigInt(Date.now() + 100_000),
  /** Overrides */
  nonce: 2n,
  erc20Name: "Overriden Token Name",
  version: "2",
});
```

or directly in the function

```typescript jsx
<button
  onClick={async () => {
    /* Permit signature is returned both from the action and from the hook */
    const permitSignature = await signPermit?.({
      nonce: 2n,
      erc20Name: "Overriden Token Name",
      version: "2",
    });
    console.log(permitSignature);
  }}
>
  Sign Permit
</button>
```

### Dai hook

Sign Dai permits with the signPermitDai function returned from the hook

```typescript jsx
import { usePermit } from "wagmi-permit";

function DaiPermitExample() {
  const { data: walletClient } = useWalletClient();
  const { signPermitDai, signature } = usePermit({
    walletClient,
    ownerAddress: walletClient?.account.address,
    chainId: 1,
    spenderAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
    contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f", // dai on mainnet
    value: parseEther("10"),
    deadline: BigInt(Date.now() + 100_000),
  });

  return (
    <>
      <pre>{JSON.stringify(signature, null, 2)}</pre>
      <button
        onClick={async () => {
          /* Permit signature is returned both from the action and from the hook */
          const permitSignature = await signPermitDai?.();
          console.log(permitSignature);
        }}
      >
        Sign Permit
      </button>
    </>
  );
}
```

### Actions

You can also use just the permit signing functions, for both standard tokens and Dai

```typescript
import {signPermit} from "wagmi-permit";
import {WalletClient} from "wagmi";

async function signPermitForUSDC(walletClient: WalletClient) {
  const sig = await signPermit(walletClient, {
    spenderAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ownerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    erc20Name: "USD Coin",
    version: "2",
    deadline: BigInt(Date.now() + 100_000),
    nonce: 0n,
    chainId: 1,
    value: 1_000_000_000n,
  });

  console.log(sig);
}
```

# Example app

Play with an example of signing a USDC permit on Optimism Mainnet in the example app under `example-app`.

```bash
git clone https://github.com/vacekj/wagmi-permit
cd wagmi-permit
cd example-app
npm i
npm run dev
```

# Permit information for common tokens

Information on various tokens, their supported permit type, version and methods can be found in [PERMIT.md](PERMIT.md)

# Credits

Thank you to [Ana](https://twitter.com/AnaArsonist) and [sofia](https://twitter.com/al3thi0meter) for feedback.
