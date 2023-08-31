import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts[0]);

      // Once wallet is set, get a reference to the deployed contract
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      console.log("Fetching balance...");
      try {
        const balanceWei = await atm.getBalance();
        console.log("Balance Wei:", balanceWei.toString());
        const balanceEther = ethers.utils.formatEther(balanceWei);
        console.log("Balance Ether:", balanceEther);
        setBalance(balanceEther);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };
  
    

  const deposit = async () => {
    if (atm) {
      const tx = await atm.deposit({ value: ethers.utils.parseEther("1") });
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      const tx = await atm.withdraw(ethers.utils.parseEther("1"));
      await tx.wait();
      getBalance();
    }
  };

  const transfer = async () => {
    if (atm) {
      const recipientAddress = prompt("Enter recipient address:");
      if (recipientAddress && ethers.utils.isAddress(recipientAddress)) {
        const tx = await atm.transfer(recipientAddress, ethers.utils.parseEther("1"));
        await tx.wait();
        getBalance();
      } else {
        alert("Invalid recipient address");
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect Your MetaMask Wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Token Name: {balance}ETH</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={transfer}>Transfer 1 ETH</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Harshit's ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: left;
        }
      `}</style>
    </main>
  );
}
