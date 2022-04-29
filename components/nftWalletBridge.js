import Web3 from "web3";
import Web3Modal from "web3modal";
import React, { useReducer, useState, useEffect } from 'react';
import ContractABI from "./logoABI"
import Whitelist from "./Whitelist";
import { ethers } from "ethers";

let provider = null;
let web3 = null;
let accounts = null;
let networkId = null;
//const balance2 = null;
let connectedWalletAddress = null;
let contract = null;
let ethersContract = null;
const ethersProvider = null;
const etherABI = null;
let signer = null;
let hashArray = [];

export default function NFTWalletBridge(e) {

    const tokenAddress = e.bridgeParams.tokenAddress;
    const providerOptions = e.bridgeParams.providerOptions;

    const [isConnected, setConnected] = useState(false);
    const [tokenBalance, setTokenBalance] = useState({ trueBalance: 'N/A', theBalance: 'N/A', connectedWalletAddress: 'N/A', filteredAddress: 'N/A', isWhiteListed: false });
    const [isWaiting, setIsWaiting] = useState(false);
    const [numMinted, setnumMinted] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [whiteListPass, setWhiteListPass] = useState({});
    const [isPrivateMintIsOpen, setIsPrivateMintIsOpen] = useState(false);
    const [isPublicMintIsOpen, setIsPublicMintIsOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [txs, setTxs] = useState(hashArray);
    const [loaded, setLoaded] = useState(true);
    const [hashTx, sethashTx] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isWhiteListed, setIsWhiteListed] = useState(false);

    const contractABI = ContractABI();

    async function showWeb3Modal() {
        provider = null;
        try {

            const web3Modal = new Web3Modal({
                cacheProvider: false, // optional
                providerOptions
                //disableInjectedProvider: false // required
            });

            web3Modal.clearCachedProvider()

            await launchWeb3ModalConnection(web3Modal);

            setConnected(true)

            if (!accounts) {
                accounts = await web3.eth.getAccounts();

                networkId = await web3.eth.net.getId();

                connectedWalletAddress = ethers.utils.getAddress(accounts[0])

                contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: process.env.defaultGas });


                await getBlockChainData(e);
            }
        }
        catch (e) { }
    }

    async function getBlockChainData(props) {
        let totalShares = await contract.methods.totalSupply.call();
        let resultTS = await totalShares.call();
        //console.log(`totalShares: ${resultTS}`)
        setnumMinted(resultTS);

        let balance2 = await GetBalance();

        await getRevealed();
        await getPublicMintStatus();
        await getPrivateMintStatus();
        await getBalanceOf({ wallet: connectedWalletAddress });

        balance2 = web3.utils.fromWei(balance2, "ether");
        const filtered = connectedWalletAddress.substr(0, 6) + "..." + connectedWalletAddress.substr(connectedWalletAddress.length - 6);

        let isThisAddressOnWhitelist = await CheckIfOnWhitelist(props.mintType, connectedWalletAddress);

        setTokenBalance({
            trueBalance: balance2, theBalance: balance2, connectedWalletAddress: connectedWalletAddress, filteredAddress: filtered,
            isWhiteListed: isThisAddressOnWhitelist
        });
    }

    async function GetBalance() {
        return await web3.eth.getBalance(accounts[0]);
    }

    async function CheckIfOnWhitelist(saleType, thisAddress) {
        let displayMint = false;

        const whitelist = Whitelist();

        //console.log(lowerCaseWhitelist)

        if (saleType == "Public") {
            displayMint = true;
        }
        else {
            if (whitelist[thisAddress] != null && whitelist[thisAddress] != undefined) {
                displayMint = true;
            }
        }

        setWhiteListPass(whitelist[thisAddress]);
        setIsWhiteListed(displayMint);

        return displayMint;
    }

    async function disconnect() {
        // await provider.close();
        provider = null;

        const web3Modal = new Web3Modal({
            cacheProvider: true, // optional
            providerOptions
            //disableInjectedProvider: false // required
        });
        web3Modal.clearCachedProvider()
        setConnected(false)
        window.localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }

    async function launchWeb3ModalConnection(web3Modal) {

        provider = await web3Modal.connect();

        if (process.env.debug) {
            console.log(provider);
            // console.log(signer);
        }

        web3 = new Web3(provider)

        // Subscribe to accounts change
        provider.on("accountsChanged", (accounts) => {
            if (process.env.debug) {
                console.log(accounts);
            }
        });

        // Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
            if (process.env.debug) {
                console.log(chainId);
                console.log("connect" + " - " + error);
            }
        });

        // Subscribe to provider connection
        provider.on("connect", (info) => {
            if (process.env.debug) {
                console.log(info);
                console.log("connect" + " - " + error);
            }
        });

        // Subscribe to provider disconnection
        provider.on("disconnect", (error) => {

            console.log("disconnect" + " - " + error);
            provider = null;
            setConnected(false);
            setTokenBalance({ theBalance: 'N/A', connectedWalletAddress: 'N/A', isWhiteListed: false })
            disconnect()
        });

        provider.on("disconnect", (error) => {

            console.log("disconnect" + " - " + error);
            provider = null;
            setConnected(false);
            setTokenBalance({ theBalance: 'N/A', connectedWalletAddress: 'N/A', isWhiteListed: false })
            disconnect()
        });
        return ethersProvider;//new Web3(provider);
    }

    function print(str) {
        const p = document.createElement("p");
        p.innerText = str;

        document.getElementById("userWalletAddress").appendChild(p);
    }

    function checkIfLoggedIN(props) {
        return props == undefined ? false : true && props.isConnected == undefined ? false : props.isConnected;
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    async function sendMint(props) {

        if (process.env.debug) {
            console.log(props);
        }

        let ethValue = 0;

        if (props.mintType == "Public") {
            ethValue = +process.env.ethValue;
        }
        else {
            ethValue = +process.env.ethWLValue;
        }
        const TotalTokens = Math.round((ethValue * props.mint) * 10000) / 10000

        let currentGasPrice = await web3.eth.getGasPrice()

        if (process.env.debug) {
            console.log(`currentGasPrice: ${currentGasPrice}`)
        }

        let gas_price = process.env.defaultGas;//Web3.fromWei(currentGasPrice, 'gwei') 

        if (process.env.debug) {
            console.log(`gas_price: ${gas_price}`)
        }

        var tokens = web3.utils.toWei(TotalTokens.toString(), 'ether')
        var bntokens = web3.utils.toBN(tokens)
        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: process.env.defaultGas * props.mint });
        setIsWaiting(true)
        setErrorMessage("");

        if (props.mintType == "Public") {
            let txTransfer = await contract.methods
                .openMonsterMint(props.mint)
                .send({ from: connectedWalletAddress, value: bntokens })
                .on('transactionHash', function (hash) {
                    //hashArray = [];

                    hashArray.push({ id: 1, txHash: hash, filteredTxHash: hash.substr(0, 10) + "..." + hash.substr(hash.length - 10) });
                    setTxs(hashArray);
                    sethashTx(GetHashes(txs));
                    //console.log(hash);
                })
                .then(function (result) {
                    setIsWaiting(false);
                    //alert('Transaction success');
                    getBlockChainData(props);
                }).catch(function (e) {
                    setIsWaiting(false);
                    setErrorMessage(e.message);
                    console.log(e);
                    getBlockChainData(props);
                });
        }

        let isThisAddressOnWhitelist = await CheckIfOnWhitelist(props.mintType, connectedWalletAddress)
        if (props.mintType == "Pre-Sale" && isThisAddressOnWhitelist) {

            let thisWL = Whitelist();

            let txTransfer1 = await contract.methods
                .afterHoursMonsterMint(props.mint, thisWL[connectedWalletAddress].q, thisWL[connectedWalletAddress].monsterPass)
                .send({ from: connectedWalletAddress, value: bntokens })
                .on('transactionHash', function (hash) {
                    //hashArray = [];

                    hashArray.push({ id: 1, txHash: hash, filteredTxHash: hash.substr(0, 10) + "..." + hash.substr(hash.length - 10) });
                    setTxs(hashArray);
                    sethashTx(GetHashes(txs));
                    //console.log(hash);
                })
                .then(function (result) {
                    setIsWaiting(false);
                    getBlockChainData(props);
                    //alert('Transaction success');
                }).catch(function (e) {
                    setIsWaiting(false);
                    setErrorMessage(e.message);
                    console.log(e);
                    getBlockChainData(props);
                });
        }


        // let txTransfer = await contract.methods.mint1(Amount).estimateGas()
        // .then(function (estimate) {
        //   console.log("Estimated gas to execute mint: ", estimate);
        // });

        //let txTransfer = await contract.methods.mint1(Amount).call();
        //let txTransfer2 = txTransfer.estimateGas({from: connectedWalletAddress});
        //console.log(txTransfer);
        return {};
    }

    async function togglePublicMint() {

        if (process.env.debug) {
            console.log(Amount);
        }

        //const TotalTokens = 0.075 * Amount;

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });
        setIsWaiting(true)
        setErrorMessage("");

        let txTransfer = await contract.methods
            .togglePublicMint()
            .send({ from: connectedWalletAddress })
            .on('transactionHash', function (hash) {
                //hashArray = [];

                hashArray.push({ id: 1, txHash: hash, filteredTxHash: hash.substr(0, 10) + "..." + hash.substr(hash.length - 10) });
                setTxs(hashArray);
                sethashTx(GetHashes(txs));
                //console.log(hash);
            })
            .then(function (result) {
                setIsWaiting(false);
                //alert('Transaction success');
            }).catch(function (e) {
                setIsWaiting(false)
                setErrorMessage(e.message)
                console.log(e)
            });

        return {};
    }

    async function togglePresaleMint() {

        if (process.env.debug) {
            console.log(Amount);
        }

        //const TotalTokens = 0.075 * Amount;

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });
        setIsWaiting(true)
        setErrorMessage("");

        // const estimation = await erc20.contract.methods.togglePresaleMint();

        // console.log(estimation);
        try {
            let txTransfer = await contract.methods
                .togglePresaleMint()
                .send({ from: connectedWalletAddress })
                .on('transactionHash', function (hash) {
                    //hashArray = [];

                    hashArray.push({ id: 1, txHash: hash, filteredTxHash: hash.substr(0, 10) + "..." + hash.substr(hash.length - 10) });
                    setTxs(hashArray);
                    sethashTx(GetHashes(txs));
                    //console.log(hash);
                })
                .then(function (result) {
                    setIsWaiting(false);
                    alert('Transaction success');
                }).catch(function (e) {
                    alert('Transaction Failed');
                    setIsWaiting(false)
                    setErrorMessage(e.message)
                    console.log(e)
                });
        } catch (error) {

        }


        return {};
    }

    async function setRevealed(props) {

        if (process.env.debug) {
            console.log(Amount);
        }

        //const TotalTokens = 0.075 * Amount;

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });
        setIsWaiting(true)
        setErrorMessage("");

        // const estimation = await erc20.contract.methods.togglePresaleMint();

        // console.log(estimation);
        try {
            let txTransfer = await contract.methods
                .setRevealed(props.revealed)
                .send({ from: connectedWalletAddress })
                .on('transactionHash', function (hash) {
                    //hashArray = [];

                    hashArray.push({ id: 1, txHash: hash, filteredTxHash: hash.substr(0, 10) + "..." + hash.substr(hash.length - 10) });
                    setTxs(hashArray);
                    sethashTx(GetHashes(txs));
                    //console.log(hash);
                })
                .then(function (result) {
                    setIsWaiting(false);
                    alert('Transaction success');
                }).catch(function (e) {
                    alert('Transaction Failed');
                    setIsWaiting(false)
                    setErrorMessage(e.message)
                    // console.log(e)
                });
        } catch (error) {

        }

        return {};
    }

    async function getRevealed() {

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });

        let thisResult = await contract.methods.revealed().call();
        setIsRevealed(thisResult);

        return thisResult;
    }

    async function getPublicMintStatus() {

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });

        let thisResult = await contract.methods.publicMintIsOpen().call();
        setIsPublicMintIsOpen(thisResult);

        return thisResult;
    }

    async function getPrivateMintStatus() {

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });

        let thisResult = await contract.methods.privateMintIsOpen().call();
        setIsPrivateMintIsOpen(thisResult);

        return thisResult;
    }

    async function getBalanceOf(props) {

        contract = new web3.eth.Contract(contractABI, tokenAddress, { from: connectedWalletAddress, gas: 50000 });

        let thisResult = await contract.methods.balanceOf(props.wallet).call();
        setWalletBalance(thisResult);

        return thisResult;
    }

    function GetHashes(props) {

        // setTxs(props);

        const resultData = txs.map(element => {
            return (
                <tr key={element.id}>
                    <td><a href={process.env.blockExplorerURL + "tx/" + element.txHash} target="_blockexplorer">{element.filteredTxHash}</a></td>
                </tr>
            )
        });

        return (
            <>
                <div style={{ backgroundColor: "RGB(255,255,255,0.7)", padding: "5px" }}>
                    <table><thead><tr><th>Mint Transaction Link</th></tr></thead><tbody>{loaded ? resultData : <tr><td colSpan="3">Loading</td></tr>}</tbody></table>
                </div>
            </>
        )
    }

    return {
        web3: function () {
            return web3;
        },
        // transfer: function (walletAddress, tokenAmount) {
        //     return transfer(walletAddress, tokenAmount);
        // },
        showWeb3Modal: function () {
            return showWeb3Modal();
        },
        disconnect: function (amount) {
            disconnect()
            return true;
        },
        ShowWalletConnect: function (props) {
            return ShowWalletConnect(props);
        },
        ShowSignature: function (props) {
            return ShowSignature(props);
        },
        getUseStates: function () {
            return {
                isConnected,
                setConnected,
                isWaiting,
                setIsWaiting,
                hash: txs,
                hashHtml: hashTx,
                xmPower: tokenBalance,
                setxmPower: setTokenBalance,
                numMinted: numMinted,
                isRevealed,
                setIsRevealed,
                isPublicMintIsOpen,
                setIsPublicMintIsOpen,
                isPrivateMintIsOpen,
                setIsPrivateMintIsOpen,
                walletBalance,
                setWalletBalance,
                whiteListPass,
                setWhiteListPass,
                errorMessage
            }
        },
        sendMint: function (props) {
            const thisP = props;
            sendMint(props)
            return false;
        },
        togglePublicMint: function (props) {
            togglePublicMint(props)

            return false;
        },
        togglePresaleMint: function (props) {
            togglePresaleMint(props)

            return false;
        },
        getRevealed: function (props) {
            return getRevealed();
        },
        setRevealed: function (props) {
            return setRevealed(props);
        }
    };
};
