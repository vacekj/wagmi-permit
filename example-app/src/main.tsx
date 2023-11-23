import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import {getDefaultWallets, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {mainnet, optimism} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([mainnet, optimism], [publicProvider()]);

const { connectors } = getDefaultWallets({
	appName: "Wagmi Permit Demo",
	projectId: "YOUR_PROJECT_ID",
	chains,
});

const wagmiConfig = createConfig({
	autoConnect: true,
	connectors,
	publicClient,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<WagmiConfig config={wagmiConfig}>
			<RainbowKitProvider chains={chains}>
				<ChakraProvider>
					<App />
				</ChakraProvider>
			</RainbowKitProvider>
		</WagmiConfig>
	</React.StrictMode>,
);
