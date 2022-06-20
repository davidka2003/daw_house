import React, { useEffect, useState } from "react";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import ReactDOM from "react-dom";
import { BigNumber, ethers } from "ethers";
import Web3Modal from "web3modal";
// import banner from "../assets/banner.jpg";
import "../scss/mintingPage.scss";
import logo from "../assets/logo.jpg";
import background from "../assets/background.gif";
import { DAWHouse } from "../types/typechain";
import { abi } from "../../contracts/artifacts/DAW_house.json";
import { address as contractAddress } from "../.env/contract-address.json";
const Iframe = () => {
  return (
    <>
      <div style={{ padding: "100% 0 0 0", position: "relative" }}>
        <iframe
          src="https://player.vimeo.com/video/721871155?h=eced0fb92a&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          title="HOD Drop Teaser"
        ></iframe>
      </div>
      <script src="https://player.vimeo.com/api/player.js"></script>
    </>
  );
};
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

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: false, // optional
  providerOptions, // required
  // disableInjectedProvider: true,
});
const App = () => {
  const [provider, setProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >(undefined);
  const [condition, setCondition] = useState<
    Awaited<ReturnType<DAWHouse["mintConditions"]>> | undefined
  >(undefined);
  const [houseBalance, setHouseBalance] = useState(0);
  const [dawBalance, setDawBalance] = useState(0);
  const [mintAmount, setMintAmount] = useState(1);
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [connected, setConnected] = useState({
    connected: false,
    pending: false,
    rejected: false,
  });
  const [contract, setContract] = useState<DAWHouse | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [connection, setConnection] = useState<any | undefined>(undefined);
  console.error("zalupa");
  const update = async (contract: DAWHouse, signer: ethers.Signer) => {
    console.log("updating-started");
    if (contract && signer) {
      console.log("updating");
      const currentMintId = (await contract.mintId()).sub(1);
      const condition = await contract.mintConditions(currentMintId);
      const dawBalance = BigNumber.from(0);
      setDawBalance(dawBalance.toNumber());
      // console.log(currentMintId, await signer.getAddress());
      const account = await contract.accounts(
        currentMintId,
        await signer.getAddress()
      );
      setHouseBalance(account.balance.toNumber());
      setCondition(condition);
    }
  };
  const connect = async () => {
    try {
      setConnected({ connected: false, pending: true, rejected: false });
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer
      ) as DAWHouse;
      setContract(contract);
      setConnection(instance);
      setProvider(provider);
      setSigner(signer);
      setAddress(await signer.getAddress());
      setConnected({ connected: true, pending: false, rejected: false });
      await update(contract, signer);
    } catch (error) {
      console.log(error);
      setConnected({ connected: false, pending: true, rejected: true });
    }
  };
  useEffect(() => {
    connection &&
      connection?.on("accountsChanged", async () => {
        signer && setAddress(await signer.getAddress());
        await update(contract!, signer!);
      });
  }, [connection]);
  const mint = async (amount: number) => {
    try {
      console.log(mintAmount);
      if (contract) {
        await contract.mint(amount);
      }
    } catch (error) {}
  };
  return (
    <div
      className="body"
      style={connected.connected ? { backgroundColor: "black" } : {}}
    >
      <div
        className="header"
        style={connected.connected ? { backgroundColor: "black" } : {}}
      >
        <div className="header__logoContainer">
          <img className="logo" src={logo} alt="" />
        </div>
        <div className="header__buttonContainer">
          {address && (
            <p style={{ marginRight: "10px" }}>
              {[address.slice(0, 5), address.slice(38)].join("...")}
            </p>
          )}
          <button
            className="buttonPrimary"
            disabled={connected.pending}
            onClick={connect}
          >
            {connected.connected && !connected.pending
              ? "change wallet"
              : connected.pending
              ? "connecting wallet..."
              : "connect wallet"}
          </button>
        </div>
      </div>
      {(connected.connected && (
        <div className="mintingBody">
          {
            // !connected.connected && (
            //   <div style={{ paddingTop: "10em" }}>
            //     {/* <h1 >Connect metamask</h1> */}
            //   </div>
            // )
          }
          <>
            <div className="mintingBody__walletInfo">
              {
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    console.log("mint");
                    mint(mintAmount);
                    update(contract!, signer!);
                  }}
                >
                  {(condition &&
                    condition.maxPerWallet.sub(houseBalance).gt(0) && (
                      <>
                        <div className="mintControls">
                          {condition.maxPerWallet.gt(1) && (
                            <input
                              className="inputPrimary"
                              disabled={false}
                              type={"number"}
                              onChange={(event) => {
                                // event.preventDefault()
                                setMintAmount(~~event.target.value);
                                // console.log(event.target)
                                // event.target.value = event.target.value
                              }}
                              value={mintAmount}
                              min={1}
                              max={condition.maxPerWallet
                                .sub(houseBalance)
                                .toNumber()}
                            ></input>
                          )}
                          <input
                            className="buttonPrimary"
                            disabled={/* error || */ false}
                            type={"submit"}
                            value={false ? "MINTING..." : "MINT"}
                          ></input>
                          {/* {minting.fullified && <p style={{ color: "green" }}>Congratulations you have successfully minted</p>} */}
                        </div>
                        <div>
                          {/* {error?.length > 0 && <p style={{ color: "red" }}>{error}</p>} */}
                          {(condition.price.gt(
                            0 || ethers.utils.parseEther("0.01")
                          ) && (
                            <p>
                              Token cost:{" "}
                              {ethers.utils.formatEther(condition.price)} eth +
                              gas fees
                            </p>
                          )) || <p>Free mint + gas fees</p>}
                        </div>
                      </>
                    )) || <p>Mint not available</p>}
                </form>
              }
            </div>
            <div
              className="mintingBody__NFTImg"
              style={connected.connected ? { backgroundColor: "black" } : {}}
            >
              <Iframe></Iframe>
            </div>
          </>
        </div>
      )) || (
        <div>
          <img className="logo" src={background} alt="" />
        </div>
      )}
    </div>
  );
};
export default App;
