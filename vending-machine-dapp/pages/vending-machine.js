import React, { useEffect, useState } from "react";
import Head from "next/head";
import vendingMachineContract from "../contract/vending";
import styles from "../styles/styles.module.css";
import Web3 from "web3";
import { isGetAccessor } from "typescript";

export default function VendingMachine() {
  const [error, setError] = useState("");
  const [inventory, setInventory] = useState("");
  const [donutCount, setDonutCount] = useState("");
  const [value, setValue] = useState("");
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [vmContract, setVmContract] = useState(null);

  useEffect(() => {
    if (vmContract) getInventoryHandler()
    if (vmContract && address) getMyDonutCountHandler()
  }, [vmContract, address])

  useEffect(() => {
      const web3 = new Web3(window.ethereum)
      web3.eth.getAccounts().then((res)=>(
          setAddress(res[0])
      ))
      const vm = vendingMachineContract(web3)
      setVmContract(vm)
  }, [])
  

  console.log("address log>>",address);
  console.log("vmcontract log >>>",vmContract);

  const getInventoryHandler = async () => {
    const inventory = await vmContract.methods.getVendingMachineBalance().call()
    setInventory(inventory)
  }

  const getMyDonutCountHandler = async () => {
    const count = await vmContract.methods.donutBalances(address).call()
    setDonutCount(count)
  }

  const updateDonutQty = event => {
      setValue(event.target.value)
  }
  console.log(donutCount);

  const buyDonutHandler = async () => {
      console.log("called");
    try {
      await vmContract.methods.purchase(parseInt(donutCount)).send({
        from: address,
        value: web3.utils.toWei('2') * donutCount,
        gas: 3000000,
        gasPrice: null
      })

      if (vmContract) getInventoryHandler()
      if (vmContract && address) getMyDonutCountHandler()
    } catch(err) {
      setError(err.message)
    }
  }

  const connectWalletHandler = async () => {
    /* check if MetaMask is installed */
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {
          /* request wallet connect */
          await window.ethereum.request({ method: "eth_requestAccounts" })
          /* create web3 instance and set to state var */
          const web3 = new Web3(window.ethereum)
          /* set web3 instance */
          setWeb3(web3)
          /* get list of accounts */
          const accounts = await web3.eth.getAccounts()
          /* set Account 1 to React state var */
          setAddress(accounts[0])
          

          /* create local contract copy */
          const vm = vendingMachineContract(web3)
          setVmContract(vm)
        } catch(err) {
          setError(err.message)
        }
    } else {
        // meta mask is not installed
        console.log("Please install MetaMask")
    }
  }



  return (
    <div>
      <Head>
        <title>Vending Machine Dapp</title>
      </Head>
      <nav>
        <div className={styles.nav}>
          <div>
            <h1>Vending Machine</h1>
          </div>
          <div>
            <button className={styles.button} onClick={connectWalletHandler}>
              Connect Wallet{" "}
            </button>
          </div>
        </div>
      </nav>
      <section>
        <div>
          <h2> Vending Machine Inventory: {inventory}</h2>
        </div>
        <div>
          <h2> My Donut Count: {donutCount}</h2>
        </div>
        <div>
          <label>Buy Donut</label>
          <input
            type={"text"}
            placeholder="Enter the quantity"
            value={value}
            onChange={updateDonutQty}
          />
        </div>
        <button className={styles.button} onClick={buyDonutHandler}>
          {" "}
          Buy
        </button>
      </section>
    </div>
  );
}
