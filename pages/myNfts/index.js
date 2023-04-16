import React, { useState, useEffect } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

import Link from "next/link";

import QRCode from "react-qr-code";

import Loading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import sfnMarket from "../sfnMarket.json";

const myNfts = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  async function fetchMyNfts() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        sfnMarket.address,
        sfnMarket.abi,
        signer
      );
      console.log("swswsw");
      let balance = await contract.balanceOf(signer.getAddress());
      console.log(balance.toString());
      let data = await contract.fetchUserTokens();
      console.log("data array", data);

      const items = await Promise.all(
        data.map(async (i) => {
          const tokenURI = await contract.tokenURI(i.tokenId);
          const meta = await axios.get(tokenURI);
          let item = {
            tokenId: i.tokenId.toString(),
            tokenURI,
            tokenOwner: i.tokenOwner,
            image: meta.data.image,
            type: meta.data.fileType,
            name: meta.data.fileName,
            description: meta.data.fileDescription,
          };
          return item;
        })
      );
      console.log("items", items);
      setNfts(items);
      setLoadingState("loaded");
      console.log("nfts", nfts);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMyNfts();
  }, []);

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>;

  return (
    <div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border bg-black shadow rounded-xl overflow-hidden"
            >
              <img src={nft.image} className="rounded" />
              <div className="flex justify-center mt-3 rounded">
                <QRCode value={nft.image} size={100} />
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-white">
                  Token Id : {nft.tokenId}
                </p>
                {/* <p className="text-sm font-bold text-white">
                  Type : {nft.type}
                </p>
                <p className="text-sm font-bold text-white">
                  Name : {nft.name}
                </p>
                <p className="text-sm font-bold text-white">
                  Description : {nft.description}
                </p> */}
              </div>
              <div className="flex justify-center">
                <Link legacyBehavior href={`/myNfts/${nft.tokenId}`}>
                  <button className="m-auto mt-4 mb-4 bg-red-900 text-white rounded p-auto w-24 h-10">
                    List Token {nft.tokenId}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default myNfts;
