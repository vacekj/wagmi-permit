# Viem Permit

All you need to sign EIP2612/DAI permits with viem and wagmi.

## Permit information for common tokens

Information on various tokens, their supported permit type, version and methods.

## DAI

- DAI has its own permit that is incompatible with [EIP2612](https://eips.ethereum.org/EIPS/eip-2612).
- It doesn't specify allowance, only `allowed: bool` (`true` for infinite approval, `false` for zero).
- Its version is always 1.
- It's currently used on Ethereum and Polygon PoS.
- DAI supports EIP2612 permit on other chains.
- Some have version 1, some have version 2.
- Contracts that don't have a version method (as it's not part of the [EIP2612](https://eips.ethereum.org/EIPS/eip-2612)
  spec) are assumed to have version 1.

| Chain         | Address                                    | DAI Permit | EIP2612 Permit | Version | transferWithPermit |
|---------------|--------------------------------------------|------------|----------------|---------|--------------------|
| Fantom        | 0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e | ⛔️         | ✅              | 1       | ✅                  |
| Ethereum      | 0x6b175474e89094c44da98b954eedeac495271d0f | ✅          | ⛔️             | 1       | ⛔️                 |
| Polygon PoS   | 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063 | ✅          | ⛔️             | 1       | ⛔️                 |
| Optimism      | 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1 | ⛔️         | ✅              | 2       | ⛔️                 |
| Arbitrum      | 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1 | ⛔️         | ✅              | 2       | ⛔️                 |
| Polygon zkEVM | 0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4 | ⛔️         | ✅              | 1       | ⛔️                 |
| Avax          | 0xd586E7F844cEa2F87f50152665BCbc2C279D8d70 | ⛔️         | ⛔              | ⛔       | ⛔️                 |
| zkSync Era    | No DAI yet                                 | -          | -              | -       | -                  |

# USDC

| Chain       | Address                                    | DAI Permit | EIP2612 Permit | Version | transferWithPermit |
|-------------|--------------------------------------------|------------|----------------|---------|--------------------|
| Ethereum    | 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 | ⛔️         | ✅              | 2       | ⛔️                 |
| Avax        | 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E | ⛔️         | ✅              | 2       | ⛔️                 |
| Polygon PoS | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 | ⛔️         | ✅              | 1       | ⛔️                 |

## Credits

Big thank you to [Ana](https://twitter.com/AnaArsonist) for advice and wise words.    
