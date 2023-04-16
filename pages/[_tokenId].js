import { useRouter } from "next/router";

import React, { useState, useEffect } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

import Link from "next/link";
import Image from "next/image";

import Loading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import sfnMarket from "./sfnMarket.json";

const _tokenId = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [id, setId] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [tokenSeller, setTokenSeller] = useState("");

  const [priceUpdated, setPriceUpdated] = useState(false);
  const [listingCanceled, setListingCanceled] = useState(false);
  const [tokenBought, setTokenBought] = useState(false);

  const router = useRouter();
  const tokenId = router.query._tokenId;

  function handlePrice(e) {
    console.log(e.target.value);
    const _price = ethers.utils.parseUnits(e.target.value, "ether");
    setPrice(_price);
  }

  async function fetchNFT() {
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
      const data = await contract.fetchListedTokens();
      console.log("data", data);
      console.log("tokenid", tokenId);

      const array = data.map((token) => {
        if (token.tokenId.toString() === tokenId) {
          const weiPrice = token.price;
          const ethPrice = ethers.utils.formatEther(weiPrice);
          console.log(ethPrice);
          setTokenPrice(ethPrice);
          setTokenSeller(token.tokenOwner);
        }
      });

      console.log(tokenPrice);
      const tokenURI = await contract.tokenURI(tokenId);
      const meta = await axios.get(tokenURI);
      const item = {
        tokenId: tokenId,
        image: meta.data.image,
        type: meta.data.fileType,
        name: meta.data.fileName,
        description: meta.data.fileDescription,
      };
      console.log(item);
      setImageUrl(item.image);
      setId(item.tokenId);
      setType(item.type);
      setName(item.name);
      setDescription(item.description);

      return item;
    } catch (error) {
      console.log(error);
    }
  }

  async function updatePrice() {
    setPriceUpdated(true);
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

      const tx = await contract.updateTokenPrice(tokenId, price);
      await tx.wait();
      console.log(tx);
      toast("Price updated successfully!", { type: "success" });
    } catch (error) {
      console.log(error);
    }
    setPriceUpdated(false);
    setTimeout(() => {
      router.push("/");
    }, 5000);
  }

  async function cancelListing() {
    setListingCanceled(true);
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

      const tx = await contract.cancelTokenlisting(tokenId);
      await tx.wait();
      console.log(tx);
      toast("Listing has been canceled!", { type: "success" });
    } catch (error) {
      console.log(error);
    }
    setListingCanceled(false);
    setTimeout(() => {
      router.push("/myNfts");
    }, 5000);
  }

  async function buyNFT() {
    setTokenBought(true);
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

      const transaction = await contract.buyToken(tokenId, {
        value: ethers.utils.parseUnits(tokenPrice, "ether"),
      });
      await transaction.wait();
      console.log(transaction);
      toast(`Congrats! you have bought token ${tokenId}`, { type: "success" });
    } catch (error) {
      console.log(error);
    }
    setTokenBought(false);
    setTimeout(() => {
      router.push("/myNfts");
    }, 5000);
  }

  useEffect(() => {
    fetchNFT();
  }, [tokenId]);

  return (
    <div>
      <ToastContainer />
      <p>tokenId {tokenId} detail page</p>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 lg:ml-20 gap-6 pt-4 h-150 mt-4">
        <div className="border bg-black shadow rounded-xl overflow-hidden">
          <img src={imageUrl} />
        </div>
        <div className="bg-black text-white p-5 text-xl  mr-2 h-full  ">
          <p className="tokenId">Token Id : {id}</p>
          <p className="type">Token type : {type}</p>
          <p className="name">Token name : {name}</p>
          <p className="description">Token description : {description}</p>
          <p className="seller">Token seller : {tokenSeller}</p>
          <p className="price">Token price : {tokenPrice} MATIC</p>

          <p>
            <input
              type="text"
              placeholder="Update selling price..."
              className="text-black"
              onChange={handlePrice}
            />
          </p>
          <button
            type="button"
            className="mr-4 mt-4 mb-4 bg-red-900 text-white rounded p-auto w-48 h-10"
            onClick={updatePrice}
          >
            Update price
          </button>
          {priceUpdated && (
            <div className="m-auto flex justify-center">
              <Loading type="spin" color="white" height={20} width={20} />
            </div>
          )}
          <button
            type="button"
            className="ml-4 mt-4 mb-4 bg-red-900 text-white rounded p-auto w-48 h-10"
            onClick={cancelListing}
          >
            Cancel listing
          </button>
          {listingCanceled && (
            <div className="m-auto flex justify-center">
              <Loading type="spin" color="white" height={20} width={20} />
            </div>
          )}
          <div className="flex justify-center">
            <button
              className="m-auto mt-4 mb-4 bg-red-900 text-white rounded p-auto w-48 h-10"
              onClick={buyNFT}
            >
              Buy token
            </button>
            {tokenBought && (
              <div className="m-auto flex justify-center">
                <Loading type="spin" color="white" height={20} width={20} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default _tokenId;
