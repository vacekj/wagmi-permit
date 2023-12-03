import { Button, Container, Heading } from "@chakra-ui/react";
import { useWalletClient } from "wagmi";
import { usePermit } from "wagmi-permit";
import { parseEther, zeroAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
	const { data: walletClient } = useWalletClient();
	const { signPermit } = usePermit({
		walletClient: walletClient ?? undefined,
		ownerAddress: walletClient?.account.address ?? zeroAddress,
		chainId: walletClient?.chain.id,
		spenderAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
		contractAddress: "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf", // usdc
	});

	return (
		<Container my={3}>
			<Heading as={"h1"} mb={5}>
				Wagmi Permit Demo
			</Heading>
			<ConnectButton
				chainStatus={{ smallScreen: "full", largeScreen: "full" }}
				showBalance={{ smallScreen: true, largeScreen: true }}
				accountStatus={{ smallScreen: "full", largeScreen: "full" }}
			/>
			{walletClient && (
				<Button
					mt={3}
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
