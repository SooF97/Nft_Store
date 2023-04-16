// import { useState, useEffect } from "react";
// import { useAccount, useContract, useSigner } from "wagmi";
import "../styles/globals.css";
import Link from "next/link";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Web3Modal } from "@web3modal/react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

const App = ({ Component, pageProps }) => {
  // 1. Get projectID at https://cloud.walletconnect.com
  // if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  //   throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  // }
  const projectId = "9f101f0d8cb92d8e24932d8b41c5f7b2";

  // 2. Configure wagmi client
  const chains = [polygonMumbai];

  const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains }),
    provider,
    theme: {
      background: "rgb(39, 49, 56)",
      main: "rgb(199, 199, 199)",
      secondary: "rgb(136, 136, 136)",
      border: "rgba(195, 195, 195, 0.14)",
      hover: "rgb(16, 26, 32)",
    },
  });

  // 3. Configure modal ethereum client
  const ethereumClient = new EthereumClient(wagmiClient, chains);
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <nav className=" flex justify-start content-center flex-wrap items-center gap-0.5 border-b p-6">
          <p className="text-4xl font-bold ">Sfn Market</p>
          <div className="flex mt-4">
            <Link legacyBehavior href="/">
              <a className=" mr-4 text-black-500">Home</a>
            </Link>
            <Link legacyBehavior href="/createNft">
              <a className="mr-6 text-black-500">Create NFT</a>
            </Link>
            <Link legacyBehavior href="/myNfts">
              <a className="mr-6 text-black-500">My NFTs</a>
            </Link>
          </div>
          <div className="flex gap-0.5 m-auto mt-4 text-white rounded p-4">
            <Web3Button icon="show" label="Connect Wallet" balance="hide" />
            <Web3NetworkSwitch />
          </div>
        </nav>
        <Component {...pageProps} />
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          "--w3m-font-family": "Roboto, sans-serif",
          "--w3m-accent-color": "black",
          "--w3m-accent-fill-color": "white",
          "--w3m-background-color": "green",
        }}
      />
    </>
  );
};

export default App;
