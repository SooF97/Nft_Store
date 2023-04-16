import React, { useState } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import { useRouter } from "next/router";

import Loading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { create as ipfsHttpClient } from "ipfs-http-client";

import sfnMarket from "./sfnMarket.json";

const projectId = "2MyNroGl6iLE7zAs4P4RNLzSAES";
const projectSecret = "72901dfa73bf4a41fe20077f44f2aa0b";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const createNft = () => {
  // state variables
  const [fileIsUploading, setFileIsUploading] = useState(false);
  const [fileMinted, setFileMinted] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [formInput, updateFormInput] = useState({
    fileType: "",
    fileName: "",
    fileDescription: "",
  });

  const router = useRouter();

  // This function uploads file to IPFS
  async function uploadFileToIpfs(e) {
    setFileIsUploading(true);
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://sfnmarket.infura-ipfs.io/ipfs/${added.path}`;
      console.log(url);
      setFileUrl(url);
      toast("File uploaded to IPFS!", { type: "success" });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
    setFileIsUploading(false);
  }

  // this function uploads file metadata to IPFS
  async function uploadMetadataToIpfs() {
    const { fileType, fileName, fileDescription } = formInput;
    if (!fileType || !fileName || !fileDescription || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      fileType,
      fileName,
      fileDescription,
      image: fileUrl,
    });
    try {
      const added = await client.add(data, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const uri = `https://sfnmarket.infura-ipfs.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      console.log(uri);
      return uri;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function mintToken() {
    setFileMinted(true);
    try {
      const tokenUri = await uploadMetadataToIpfs();
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        sfnMarket.address,
        sfnMarket.abi,
        signer
      );
      let transaction = await contract.createToken(tokenUri);
      let tx = await transaction.wait();

      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toString();
      console.log(transaction);
      console.log(event);
      console.log(value);
      console.log(tokenId);
      toast("NFT minted successfully!", { type: "success" });
      router.push("/myNfts");
    } catch (error) {
      console.log(error);
    }
    setFileMinted(false);
  }

  return (
    <div className="flex justify-center">
      <ToastContainer />
      <div className="w-1/2 flex flex-col flex-wrap pb-12 ">
        <select
          className="mt-8 border rounded p-4"
          id="fileType"
          name="fileType"
          onChange={(e) =>
            updateFormInput({ ...formInput, fileType: e.target.value })
          }
          required
        >
          <option value="Choose your document type">
            Choose your file type
          </option>
          <option value="Art">Art</option>
          <option value="Ticket">Ticket</option>
          <option value="Music">Music</option>
          <option value="Video">Video</option>
          <option value="Document">Document</option>
        </select>{" "}
        <input
          className="mt-8 border rounded p-4"
          id="fileName"
          type="text"
          placeholder="Enter the file name"
          onChange={(e) =>
            updateFormInput({ ...formInput, fileName: e.target.value })
          }
          required
        />
        <textarea
          className="mt-2 border rounded p-4"
          placeholder="Description"
          onChange={(e) =>
            updateFormInput({ ...formInput, fileDescription: e.target.value })
          }
          required
        />
        <input
          className="font-bold m-auto mt-4 bg-gray-900 text-white rounded p-4 shadow-lg w-1/2"
          type="file"
          onChange={uploadFileToIpfs}
        />
        {fileIsUploading && (
          <div className="mt-2 flex justify-center">
            <Loading type="spin" color="black" height={50} width={50} />
          </div>
        )}
        <img className="mt-4 h-auto max-w-full rounded-lg" src={fileUrl} />
        <button
          className="m-auto mt-4 bg-gray-900 text-white rounded p-4 w-48"
          onClick={mintToken}
        >
          Create NFT
        </button>
        {fileMinted && (
          <div className="mt-2 flex justify-center">
            <Loading type="spin" color="black" height={50} width={50} />
          </div>
        )}
      </div>
    </div>
  );
};

export default createNft;
