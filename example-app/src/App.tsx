import { Button, Container, Heading } from "@chakra-ui/react";
import { useWalletClient } from "wagmi";
import { usePermit } from "wagmi-permit";
import { parseEther, zeroAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
	const { data: walletClient } = useWalletClient();
	const { signPermit } = usePermit({
		walletClient,
		owner: walletClient?.account.address ?? zeroAddress,
		chainId: walletClient?.chain.id,
		spender: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
		tokenAddress: "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf", // usdc
	});
	return (
		<Container>
			<Heading as={"h1"}>Wagmi Permit Demo</Heading>
			<ConnectButton />
			{walletClient && (
				<Button
					onClick={async () => {
						const permitSignature = await signPermit?.({
							value: parseEther("10"),
							deadline: BigInt(Date.now() + 100_000),
						});

						console.log(permitSignature);
					}}
				>
					Sign permit
				</Button>
			)}
		</Container>
	);
}

export default App;
