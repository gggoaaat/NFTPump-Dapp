import React, { useReducer, useState, useEffect } from 'react';
import Link from "next/link";
import { Container, Row, Col } from "reactstrap";
import Image from "next/image";
import bannerimg from "../../assets/images/landingpage/monster.gif";
import NFTWalletBridge from '../nftWalletBridge'
import WalletConnectProvider from "@walletconnect/web3-provider";

const AdminComponents = () => {
  const bridgeParams = {
    tokenAddress: process.env.contractAddress,
    providerOptions: {
      metamask: {
        id: 'injected',
        name: 'MetaMask',
        type: 'injected',
        check: 'isMetaMask'
      },
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          // rpc: {
          //     1: 'https://mainnet.infura.io/v3/b830c8484bf841d795848610ff791d5b'
          // },
          network: process.env.network,
          chainId: process.env.chainId,
          infuraId: process.env.infuraID, // "b830c8484bf841d795848610ff791d5b", // required
          address: process.env.contractAddress //,
          // qrcodeModalOptions: {
          //     mobileLinks: [
          //         'rainbow',
          //         'metamask',
          //         'argent',
          //         'trust',
          //         'imtoken',
          //         'pillar'
          //     ]
          // }
        }
      }
    }
  };

  let dappParams = { bridgeParams: bridgeParams }
  let walletBridge1 = NFTWalletBridge(dappParams);

  let currentUseState = walletBridge1.getUseStates();

  async function togglePublicMint(props) {

    const returnedhash = await walletBridge1.togglePublicMint()

    //let retu = await loadup(returnedhash)
    if (process.env.debug) {
      console.log(returnedhash)
    }
  }

  async function togglePresaleMint(props) {

    const returnedhash = await walletBridge1.togglePresaleMint()

    //let retu = await loadup(returnedhash)
    if (process.env.debug) {
      console.log(returnedhash)
    }
  }

  async function getRevealed(props) {

    const returnRevealed = await walletBridge1.getRevealed()

  }

  const [formInput, updateFormInput] = useState({
    price: "",
    amount: "1",
  });

  let displayData = true ? walletBridge1.getUseStates().hash : "Loading!" //(<ul>{resultData}</ul>)

  let newValue = process.env.mintType == "Public" ? process.env.ethValue : process.env.ethWLValue;

  let [revealVal, setRevealVal] = useState("false");
  function handleOnChange(e) {
    setRevealVal(e.target.value);
  }

  async function submitRevealValue(props) {
    await walletBridge1.setRevealed({ revealed: revealVal.toString() });
  }

  return (
    <>
      <div className="static-slider-head banner2">
        <Container>
          <Row className="">
            <Col lg="6" md="6" >
            {(currentUseState.isConnected) ?
              <div style={{ backgroundColor: "#fff", marginTop: "150px" }}>
                <div className="form-horizontal" >
                  <fieldset>

                    {/* <!-- Form Name --> */}
                    <legend>Admin Contract Page</legend>

                    {/* <!-- Button --> */}
                    <div className="form-group">
                      <label className="col-md-4 control-label" htmlFor="togglePublicMint">Public Mint :  {currentUseState.isPublicMintIsOpen.toString()}</label>
                      <div className="col-md-4">
                        <button id="togglePublicMint" name="togglePublicMint" className="btn btn-primary" onClick={() => togglePublicMint()}>Toggle</button>
                      </div>
                    </div>

                    {/* <!-- Button --> */}
                    <div className="form-group">
                      <label className="col-md-4 control-label" htmlFor="togglePresaleMint">Presale Mint : {currentUseState.isPrivateMintIsOpen.toString()}</label>
                      <div className="col-md-4">
                        <button id="togglePresaleMint" name="togglePresaleMint" className="btn btn-primary" onClick={() => togglePresaleMint()}>Toggle</button>
                      </div>
                    </div>

                    {/* <!-- Multiple Radios --> */}
                    <div className="form-group">
                      <label className="col-md-4 control-label" htmlFor="radios">Set Revealed</label>
                      <div className="col-md-4">
                        <div className="radio">
                          <label htmlFor="radios-0">
                            {(currentUseState.isRevealed) ?
                              <input type="radio" name="radios" id="radios-0" value="false" key="1" onChange={(e) => handleOnChange(e)} onClick={(e) => handleOnChange(e)}></input>
                              : <input type="radio" name="radios" id="radios-0" value="false" key="1" defaultChecked="checked" onChange={(e) => handleOnChange(e)} onClick={(e) => handleOnChange(e)}></input>}
                            Hidden
                          </label>
                        </div>
                        <div className="radio">
                          <label htmlFor="radios-1">
                            {(currentUseState.isRevealed) ?
                              <input type="radio" name="radios" id="radios-1" value="true" key="2" defaultChecked="checked" onChange={(e) => handleOnChange(e)} onClick={(e) => handleOnChange(e)}></input>
                              : <input type="radio" name="radios" id="radios-1" value="true" key="2" onChange={(e) => handleOnChange(e)} onClick={(e) => handleOnChange(e)}></input>}
                            Revealed
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <button id="submitRevealChange" name="submitRevealChange" className="btn btn-primary" onClick={() => submitRevealValue()}>Set Reveal</button>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              : <div></div>
                            }
            </Col>
            {(!currentUseState.isConnected) ?
              <Col lg="12" md="12" className="align-self-center">
                {(currentUseState.network == "rinkeby") ? <h3 style={{ color: "#fff" }}>DEMO ONLY RINKEBY</h3> : ""}
                <h3 className="title">
                  A blockchain project built by Community.
                </h3>
                <h4 className="subtitle font-light">
                  An original collection consisting of 3,333 unique Monsters living on the Ethereum blockchain
                  <br />
                </h4>
                <a
                  onClick={() => walletBridge1.showWeb3Modal()}
                  className="btn btn-success m-r-20 btn-md m-t-30 " style={{ backgroundColor: "#C2C2C2" }}
                >
                  Connect Wallet
                </a>
                <Link href={process.env.mainWWW}>
                  <a className="btn btn-md m-t-30  btn-outline-light " style={{ backgroundColor: "#760680" }}>
                    Back Home
                  </a>
                </Link>
              </Col> :
              <Col lg="6" md="6" className="align-self-center">
                <br />
                {/* <p>Test{currentUseState.isWaiting.toString()}</p> */}
                <p className="connected">
                  {process.env.mintType} Mint Cost : <strong>{newValue} ETH</strong>
                  <br />
                  Wallet address: <strong>{currentUseState.xmPower.filteredAddress}</strong>
                  <br />
                  Eth Balance : <strong>{currentUseState.xmPower.theBalance}</strong>
                  <br />
                  Contract : <strong>{process.env.contractAddress}</strong>
                  <br />
                </p>
                <a
                  onClick={() => walletBridge1.disconnect()}
                  className="btn btn-md m-t-30 btn-outline-light "
                >
                  Disconnect Wallet
                </a>
                <br />
                <br />
                <h4 className="subtitle font-light">
                  NFT&apos;s minted {currentUseState.numMinted} of {process.env.maxMint}
                </h4>
                <br />
                {currentUseState.hashHtml}
              </Col>
            }
          </Row>

        </Container>
      </div>
    </>
  );
};

export default AdminComponents;
