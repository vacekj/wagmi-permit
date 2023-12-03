# Wagmi Permit

All you need to sign ERC-2612/DAI permits with viem and wagmi.
- A set of functions and wagmi hooks to sign Permits
- Supports both ERC-2612 Permit and Dai non-standard permit
- Automatically manages nonce, version and token name - just pass in the contract address

# Usage

### Hook 

```typescript jsx
function PermitExample() {
  const {data: walletClient} = useWalletClient();
  /* No need to specify name, nonce and permit version, the hook takes care of all that automatically */
  const {signPermit, signature} = usePermit({
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
Some tokens don't expose the version function, in this

```typescript jsx
function PermitExample() {
  const {data: walletClient} = useWalletClient();
  /* No need to specify name, nonce and permit version, the hook takes care of all that automatically */
  const {signPermit, signature} = usePermit({
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

TODO
- [ ] Hook - dai
- [ ] Function - dai
- [ ] Function - usdc

# Example app

## Permit information for common tokens

Information on various tokens, their supported permit type, version and methods can be found in [PERMIT.md](PERMIT.md)

## Credits

Thank you to [Ana](https://twitter.com/AnaArsonist), [dcbuilder](https://twitter.com/dcbuild3r) for feedback

## TODO
- [x] Save and return the permit signature value in the hook return value
- [ ] Allow passing args via hook, but allow overriding in function params
- [ ] TypeDoc -> GH Pages
- [ ] Clean up Typescript types
