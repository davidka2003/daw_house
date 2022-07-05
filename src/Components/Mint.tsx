import React, { useEffect, useState } from "react";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import ReactDOM from "react-dom";
import { BigNumber, ethers } from "ethers";
// import banner from "../assets/banner.jpg";
import "../scss/mintingPage.scss";
import logo from "../assets/logo.jpg";
import logo_black from "../assets/logo_black.jpg";
import background from "../assets/background.gif";
import { DAWHouse } from "../types/typechain";
import { abi } from "../../artifacts/contracts/DAW_house.sol/DAW_house.json";
import { address as contractAddress } from "../.env/contract-address.json";
import { web3Modal } from "./provider";
const Iframe = () => {
  return (
    <>
      {/* <script>document.querySelector("video").play()</script> */}
      <div style={{ width: "80%" }}>
        <iframe
          src="https://player.vimeo.com/video/721871155?h=eced0fb92a&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479;autoplay=1;loop=1;muted=1"
          frameBorder="0"
          allow="autoplay; fullscreen"
          style={{
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
const App = () => {
  const [provider, setProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >(undefined);
  const [condition, setCondition] = useState<
    Awaited<ReturnType<DAWHouse["mintConditions"]>> | undefined
  >(undefined);
  const [error, setError] = useState<
    | "Mint error"
    | "Something went wrong"
    | "Switch network to ethereum mainnet"
    | undefined
  >(undefined);
  const [message, setMessage] = useState<"Successfully minted!" | undefined>(
    undefined
  );
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
  // console.error("zalupa");
  const update = async (contract: DAWHouse, signer: ethers.Signer) => {
    console.log("updating-started");
    setMessage(undefined);
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
      account.balance.toNumber() == condition.maxPerWallet.toNumber() &&
        setMessage("Successfully minted!");
      setHouseBalance(account.balance.toNumber());
      setCondition(condition);
    }
  };
  const connect = async () => {
    try {
      setError(undefined);
      setConnected({ connected: false, pending: true, rejected: false });
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer
      ) as DAWHouse;
      console.log(contract.address);
      console.log(signer);
      setContract(contract);
      setConnection(instance);
      setProvider(provider);
      setSigner(signer);
      await update(contract, signer);
      setAddress(await signer.getAddress());
      setConnected({ connected: true, pending: false, rejected: false });
    } catch (err) {
      console.log(err);
      setError("Switch network to ethereum mainnet");
      setConnected({ connected: false, pending: false, rejected: true });
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
      setMessage(undefined);
      setError(undefined);
      console.log(mintAmount);
      if (contract) {
        const tx = await contract.mint(amount);
        await tx.wait();
        update(contract, signer!);
      }
      setMessage("Successfully minted!");
    } catch (error) {
      setError("Something went wrong");
    }
  };
  console.log(error, "err");
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
          <img
            className="logo"
            src={!connected.connected ? logo : logo_black}
            alt=""
          />
        </div>
        <div className="header__errorContainer"> {error && <p>{error}</p>}</div>
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
                  {message && <p color="green">{message}</p>}
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
        <div className="gif-container">
          <img className="logo-gif" src={background} alt="" />
        </div>
      )}
    </div>
  );
};
export default App;
