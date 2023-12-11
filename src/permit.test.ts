import { describe, it, vitest, expect } from "vitest";
import { createWalletClient, Hex, http, parseEther, zeroAddress } from "viem";
import { mainnet } from "wagmi/chains";
import { signPermit } from "./permit.js";

const spenderAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const ownerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const contractAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const erc20Name = "Test Token";
const deadline = BigInt(Math.floor(Date.now() / 1000) + 100_000);
const nonce = 0n;
const chainId = 1;
const value = parseEther("10");

describe("signPermit", () => {
	it("should pass arguments to walletClient correctly", async function () {
		const walletClient = createWalletClient({
			account: zeroAddress,
			chain: mainnet,
			transport: http(),
		});

		const signTypedData = vitest.spyOn(walletClient, "signTypedData");
		signTypedData.mockImplementation(
			async () =>
				"0x37f4910aeebdf5f1f4afe3587424b1916ab39cb7d788e62bb5652467bdda025b692d56085b542f253389d57b86c78d3eefc7a282ecbcdb97ccfe569c9ef8e6c89bd9" as Hex,
		);

		await signPermit(walletClient, {
			ownerAddress,
			spenderAddress,
			value,
			nonce,
			deadline,
			chainId,
			contractAddress,
			erc20Name,
		});

		expect(signTypedData).toHaveBeenCalledOnce();
		expect(signTypedData).toHaveBeenCalledWith({
			account: ownerAddress,
			domain: {
				chainId,
				name: erc20Name,
				verifyingContract: contractAddress,
				version: "1",
			},
			message: {
				deadline,
				nonce,
				owner: ownerAddress,
				spender: spenderAddress,
				value,
			},
			primaryType: "Permit",
			types: {
				Permit: [
					{
						name: "owner",
						type: "address",
					},
					{
						name: "spender",
						type: "address",
					},
					{
						name: "value",
						type: "uint256",
					},
					{
						name: "nonce",
						type: "uint256",
					},
					{
						name: "deadline",
						type: "uint256",
					},
				],
			},
		});
	});
});
