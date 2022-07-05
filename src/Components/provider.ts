import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Web3Modal from "web3modal";

const providerOptions = {
  /* See Provider Options Section */
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "DAW", // Required
      infuraId: "4c0e23f7472b44e584ed2f82215fb895", // Required
      chainId: 1,
    },
  },
};

export const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: false, // optional
  providerOptions, // required
  // disableInjectedProvider: true,
});
