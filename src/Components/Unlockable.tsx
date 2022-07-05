import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { DAWHouse } from "../types/typechain/DAWHouse";
import { web3Modal } from "./provider";
import { abi } from "../../artifacts/contracts/DAW_house.sol/DAW_house.json";
import { address as contractAddress } from "../.env/contract-address.json";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:4040";
// axios.defaults.withCredentials = true;
const Unlockable = () => {
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [content, setContent] = useState<string[]>([
    // "http://localhost:8080/mint",
    // "https://www.google.com",
  ]);
  const [error, setError] = useState<string | undefined>(undefined);
  const connect = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      //   const contract = new ethers.Contract(
      //     contractAddress,
      //     abi,
      //     signer
      //   ) as DAWHouse;
      getContent(signer);
      setConnected(true);
    } catch (error) {
      console.error(error);
      setConnected(false);
    }
  };
  const getContent = async (signer?: ethers.Signer) => {
    try {
      setError(undefined);
      //   console.log("init", signer);
      if (signer) {
        // getNonce and return sessionId to cookie
        const {
          data: { nonce },
        } = await axios.get<{
          nonce: string;
        }>("/nonce");
        const signature = await signer.signMessage(nonce);
        const wallet = await signer.getAddress();
        // send to server signature, address
        //
        const {
          data: { content },
        } = await axios.post<{ content: string[] }>("/getcontent", {
          nonce,
          signature,
          wallet,
        });
        setContent(content);
      }
    } catch (error) {
      console.log(error);
      setError("Something went wrong");
    }
  };
  return (
    <>
      <button onClick={connect}>
        {connected ? "Change wallet" : "Connect wallet"}
      </button>
      {connected && (
        <>
          <div>connected</div>
          <div>
            <ul>
              {content.map((c) => {
                return (
                  <a href={c}>
                    <li>{c}</li>
                  </a>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Unlockable;
