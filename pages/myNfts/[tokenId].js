import { useRouter } from "next/router";

import React, { useState, useEffect } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

import Link from "next/link";

import Loading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import sfnMarket from "../sfnMarket.json";

const tokenIdDetails = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [id, setId] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tokenListed, setTokenListed] = useState(false);

  const router = useRouter();
  const tokenId = router.query.tokenId;

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

      const tokenURI = await contract.tokenURI(tokenId);
      const meta = await axios.get(tokenURI);
      const item = {
        tokenId: tokenId.toString(),
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

  async function listNFT() {
    setTokenListed(true);
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

      const transaction = await contract.listToken(tokenId, price, {
        value: 250000000000000,
      });
      const tx = await transaction.wait();
      console.log(tx);
      toast("NFT listed successfully!", { type: "success" });
      router.push("/");
    } catch (error) {
      console.log(error);
    }

    setTokenListed(false);
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

          <p>
            <input
              type="text"
              placeholder="Enter price"
              className="text-black"
              onChange={handlePrice}
            />
          </p>
          <button
            type="button"
            className="m-auto mt-4 mb-4 bg-red-900 text-white rounded p-auto w-24 h-10"
            onClick={listNFT}
          >
            List token
          </button>
          {tokenListed && (
            <div className="mt-2 flex justify-center">
              <Loading type="spin" color="white" height={50} width={50} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default tokenIdDetails;
