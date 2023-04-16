import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import sfnMarket from "./sfnMarket.json";
import Link from "next/link";

export default function Home() {
  const [listedTokens, setListedTokens] = useState([]);
  async function fetchNFTs() {
    try {
      const alchemyProvider = new ethers.providers.AlchemyProvider(
        "maticmum",
        "mrvXire3FFkkoWo_HFHsBmRpJDRh1snd"
      );

      const contract = new ethers.Contract(
        sfnMarket.address,
        sfnMarket.abi,
        alchemyProvider
      );
      const data = await contract.fetchListedTokens();
      console.log(data);
      const items = await Promise.all(
        data.map(async (i) => {
          const tokenURI = i.tokenUri;
          const weiPrice = i.price;
          const ethPrice = ethers.utils.formatEther(weiPrice);
          const seller = i.tokenOwner.toString();
          const meta = await axios.get(tokenURI);
          let item = {
            tokenId: i.tokenId.toString(),
            seller: seller,
            price: ethPrice,
            image: meta.data.image,
            type: meta.data.fileType,
            name: meta.data.fileName,
            description: meta.data.fileDescription,
          };
          return item;
        })
      );
      setListedTokens(items);
    } catch (error) {
      alert(error);
    }
  }

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div>
      <div className="flex flex-col justify-center justify-items-center content-center items-center mt-2">
        <h1 className="font-serif text-2xl font-semibold">
          Welcome to sfn NFT marketplace for : art,images,evet
          tickets,music,videos and documents
        </h1>
        <p className="font-medium">
          Unleash your potential by creating and tokenizing your assets
        </p>
        <p className="font-medium">Mint your assets to the blockchain</p>
        <p className="font-medium">List your assets for sell </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {listedTokens.map((nft, i) => (
            <div
              key={i}
              className="border bg-black shadow rounded-xl overflow-hidden"
            >
              <img src={nft.image} className="rounded" />
              <div className="p-4">
                <p className="text-sm font-bold text-white">
                  Token Id : {nft.tokenId}
                </p>
                <p className="text-sm font-bold text-white">
                  Price : {nft.price} MATIC
                </p>
                <p className="text-sm font-bold text-white">
                  Seller : {nft.seller}
                </p>
              </div>
              <div className="flex justify-center">
                <Link legacyBehavior href={`/${nft.tokenId}`}>
                  <button className="m-auto mt-4 mb-4 bg-red-900 text-white rounded p-auto w-48 h-10">
                    Token details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
