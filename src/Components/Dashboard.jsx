import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

const Dashboard = () => {
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
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          console.log("init")
          const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
          if (account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = await provider.getSigner();
            setProvider(provider)
            setSigner(signer)
            setAddress(await signer.getAddress())
            setBalance(ethers.utils.formatEther(await signer.getBalance()))
            setConnected({ connected: true, pending: false, req: false })
          } else {
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

  return <div>
    <button disabled={connected.pending || connected.connected} onClick={() => setConnected({ req: true, pending: true, connected: false })}>
      {connected.connected && !connected.pending ? "wallet connected" : connected.pending ? "connecting wallet..." : "connect wallet"}
    </button>
    {!!connected.connected && <div>
      <p>minting part</p>
      <p>balance: {Number(balance).toFixed(2)} eth</p>
      <p>address: {address}</p>
    </div>}
  </div>;
};

export default Dashboard;
