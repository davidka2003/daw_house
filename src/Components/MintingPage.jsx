import { BigNumber, ethers } from "ethers";
import Web3Modal from "web3modal";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import React, { useState, useEffect } from "react";
import dawAbi from "../.env/dawAbi.json";
import DAWfreeContract from "../artifacts/contracts/DAWfree.sol/DAW.json"
// import DAWfreeContractAddress from "../.env/contract-address.json"

import styles from '../scss/mintingPage.css'
import { ToastContainer, toast } from 'react-toastify';
import pic1 from "../assets/1.jpg"
import pic2 from "../assets/2.png"
import pic3 from "../assets/3.png"
import pic4 from "../assets/4.jpg"
import pic5 from "../assets/5.png"
import vid3 from "../assets/3.mp4"
import logo from "../assets/logo.jpg"
import 'react-toastify/dist/ReactToastify.css';
const providerOptions = {
  /* See Provider Options Section */
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "DAW", // Required
      infuraId: "4c0e23f7472b44e584ed2f82215fb895", // Required
      // rpc: "", // Optional if `infuraId` is provided; otherwise it's required
      // chainId: 1, // Optional. It defaults to 1 if not provided
      // darkMode: false // Optional. Use dark theme, defaults to false
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  // cacheProvider: true, // optional
  providerOptions, // required
  theme: "dark",

  // disableInjectedProvider: true
});
const getChain = async (instance) => {
  const provider = new ethers.providers.Web3Provider(instance);
  if ((await provider.listAccounts())?.length == 0) throw " no accs"
  const signer = provider.getSigner();
  const contract = new ethers.Contract("0x296c04ac9b8c69232f005255720bfb6ab8f60e5d", DAWfreeContract.abi, signer)
  return {
    provider,
    signer,
    contract
  }
}
const pictures = {
  1: { asset: pic1, type: "pic", author: "Arief Putra", title: "Coffee Date" },
  2: { asset: pic2, type: "pic", author: "Bored Ape Craftsmanship Club", title: "Mona Lisa Verse" },
  3: { asset: vid3, type: "vid", author: "Team Bandaid", title: "Astronaut" },
  4: { asset: pic4, type: "pic", author: "Nakimushi", title: "Cry Baby Zoe" },
  5: { asset: pic5, type: "pic", author: "Mahboubeh Absalan", title: "Kiki" }
}
const getTokenUri = async (contract, dawBalance) => {
  try {
    const condition = await getCurrentCondition(contract, dawBalance);
    console.log(condition)
    if (condition) {
      // BigNumber.from(1).sub()
      const oddAvail = condition.maxAmount.sub(await contract.balanceOf(await contract.signer.getAddress(), condition.tokenId))
      // console.log(oddAvail.toString())
      console.log(condition.tokenId.toString())
      return { /* uri, */ tokenId: condition.tokenId, condition, maxMint: oddAvail, asset: pictures[condition.tokenId] };
    }
  } catch (error) {
    console.log(error)
  }
}

const getCurrentCondition = async (contract, dawBalance) => {
  try {
    const conditions = await contract.getCurrentCondition();
    console.log(conditions)
    for (const condition of conditions) {
      if (dawBalance.gte(condition.from) &&
        dawBalance.lte(condition.to)
      ) {
        return condition
      }
    }
  } catch (error) {
    console.log(error)
  }
}
const MintingPage = () => {
  const [connected, setConnected] = useState({
    connected: false,
    pending: false,
    req: false
  });
  const [provider, setProvider] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [address, setAddress] = useState(undefined);
  const [token, setToken] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [mintAmount, setMintAmount] = useState(1)
  const [minting, setMinting] = useState({ pending: false, rejected: true, fullified: false })
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          console.log("init")
          const instance = await web3Modal.connect();
          const { provider, signer, contract } = await getChain(instance)
          // const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
          try {
            const CHAIN_ID = await signer.getChainId();
            // console.log(await signer.getChainId())
            if (CHAIN_ID != 1) {
              setError("Switch chain to ethereum mainnet")
            }
            setProvider(provider)
            setSigner(signer)
            setAddress(await signer.getAddress())
            setBalance(ethers.utils.formatEther(await signer.getBalance()))
            setContract(contract);
            // if (CHAIN_ID === 1) {
            const dawContract = new ethers.Contract("0xf1268733c6fb05ef6be9cf23d24436dcd6e0b35e", dawAbi, signer)
            const dawbalance = /* BigNumber.from(25) || */ await dawContract.balanceOf(await signer.getAddress())
            console.log("daw balance", dawbalance.toString())
            setToken(await getTokenUri(contract, dawbalance))
            // }
            setConnected({ connected: true, pending: false, req: false })
            /** 
             * @dev on account change
              */
            console.log("ch")
            window.ethereum.on("accountsChanged", async () => {
              // console.log("accs changed")
              const { provider, signer, contract } = await getChain(instance)
              setProvider(provider)
              setSigner(signer)
              setAddress(await signer.getAddress())
              setBalance(ethers.utils.formatEther(await signer.getBalance()))
              setContract(contract);
              setSigner(signer)
              // if (CHAIN_ID === 1) {
              const dawContract = new ethers.Contract("0xf1268733c6fb05ef6be9cf23d24436dcd6e0b35e", dawAbi, signer)
              const dawbalance = /* BigNumber.from(7) ||  */await dawContract.balanceOf(await signer.getAddress())
              console.log("daw balance", dawbalance.toString())
              setToken(await getTokenUri(contract, dawbalance))
              // }
            });
            window.ethereum.on("chainChanged", () => window.location.reload());
            provider.on("network", (newNetwork, oldNetwork) => {
              // console.log("network changed");
              oldNetwork && window.location.reload();
            });

          } catch {
            setConnected({ connected: false, pending: false, req: false })
          }
        }
        else {
          setConnected({ connected: false, pending: false, req: false })
        }

      } catch (error) {
        console.log(error)
        setConnected({ connected: false, pending: false, req: false })
      }
    }
    console.log(connected.req)
    connected.req && init()
  }, [connected.req])
  const mint = async (amount = 1) => {
    try {
      setError(undefined)
      setMinting({ pending: true, fullified: false, rejected: false })
      const tx = await contract.mint(BigNumber.from(amount), { value: token.condition.cost })
      await tx.wait()
      setToken({ ...token, maxMint: token.maxMint.sub(BigNumber.from(amount)) })
      setMintAmount(1)
      setMinting({ pending: false, fullified: true, rejected: false })
    } catch (error) {
      console.log(error)
      setMinting({ pending: false, fullified: false, rejected: true })
      setError("Mint error")
    }

  }

  // const notify = () => error && toast(error);

  return <div className="body" style={connected.connected ? { backgroundImage: "none", backgroundColor: "black" } : {}}>
    {/* 255	255	255	 */}
    <div className="header" style={connected.connected ? { backgroundColor: "black" } : {}}>
      <div className="header__logoContainer">
        <img className="logo" src={logo} alt="" />
      </div>
      <div className="header__buttonContainer">
        {address && <p style={{ marginRight: "10px" }}>
          {[address.slice(0, 5), address.slice(38)].join("...")}
        </p>}
        <button className="buttonPrimary" disabled={connected.pending || connected.connected} onClick={() => setConnected({ req: true, pending: true, connected: false })}>
          {connected.connected && !connected.pending ? "wallet connected" : connected.pending ? "connecting wallet..." : "connect wallet"}
        </button>
      </div>

    </div>

    <div className="mintingBody" >
      {!connected.connected && <div style={{ "paddingTop": "10em" }}>
        {/* <h1 >Connect metamask</h1> */}
      </div>}
      {connected.connected && token &&
        <>
          <div className="mintingBody__walletInfo">
            {/* <h2 >Minting part</h2> */}
            {token && <h2 className="addressInfo">{token.asset.author}</h2>}
            {token && <h2 className="addressInfo">{token.asset.title}</h2>}
            {/* <p style={{ color: "green" }}>Congratulations you have successfully minted</p> */}
            {!!token &&
              <form onSubmit={(event) => {
                event.preventDefault()
                mint(mintAmount)
                console.log(event.target, event.currentTarget)
              }}>
                {token.maxMint.gt(0) &&
                  <>
                    <div className="mintControls">
                      {token.maxMint > 1 && <input className="inputPrimary" disabled={minting.pending} type={"number"} onChange={(event) => {
                        // event.preventDefault()
                        setMintAmount(event.target.value)
                        // console.log(event.target)
                        // event.target.value = event.target.value
                      }} value={mintAmount} min={1} max={token.maxMint}></input>}
                      <input className="buttonPrimary" disabled={/* error || */ minting.pending} type={"submit"} value={minting.pending ? "MINTING..." : "MINT"}></input>
                      {minting.fullified && <p style={{ color: "green" }}>Congratulations you have successfully minted</p>}

                    </div>
                    <div>
                      {error?.length > 0 && <p style={{ color: "red" }}>{error}</p>}
                      {token.condition.cost.gt(0 || ethers.utils.parseEther("0.01")) && <p>Token cost: {ethers.utils.formatEther(token.condition.cost)} eth + gas fees</p> || <p>Free mint + gas fees</p>}
                    </div>

                  </>
                }
              </form>
            }
          </div>
          <div className="mintingBody__NFTImg" style={connected.connected ? { backgroundColor: "black" } : {}}>
            {!!token &&
              <>
                {token.asset.type == "pic" ? <img src={token.asset.asset}></img> : <video loop autoPlay src={token.asset.asset}></video>}
              </>
              || <h2>Mint not available</h2>}
          </div>



        </> || connected.connected && !token && <div style={{ "paddingTop": "10em" }}>
          <h1 >Mint not available</h1>
        </div>

      }


    </div>


  </div>;

};

export default MintingPage;
