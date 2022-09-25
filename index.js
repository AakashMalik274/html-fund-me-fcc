import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected"
        } catch (e) {
            console.error(e)
        }
    } else {
        connectButton.innerHTML = "Please Install MetaMask!"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("DONE!")
        } catch (error) {
            console.log(error)
        }
    }
}

async function getBalance() {
    let balance = document.getElementById("balance")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balanceAmount = await provider.getBalance(contractAddress)
        balance.innerHTML = ethers.utils.formatEther(balanceAmount) + " ETH"
    } else {
        balance.innerHTML = "Please Install MetaMask"
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Successfully Withdrawn")
        } catch (e) {
            console.error(e)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)

    // return new Promise()
    //Create a listener for the blockchain

    //provider.on is used to add a listener, every time an event is triggered
    //provider.once is used to add a listener for the event to trigger for once, then it's removed
    //Syntax: provider.once(eventName,listener)

    //we are creating a promise because front-end doesn't wait for the listener to be finished but adds it in
    //the event loop queue and checks if it's finished after the whole function is done executing
    //Syntax: return new Promise( (resolve,reject) => {} )
    //resolve function is called if the promise works correctly
    //reject function is called if the promise doesn't work correctly

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            //Only once this transaction gets mined, we'll resolve this promise
            resolve()
        })
    })
}
