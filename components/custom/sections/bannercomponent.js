/* eslint-disable */
import React from "react";
import { Row, Col, Container } from "reactstrap";
import Image from "next/image";
import herobanner from "../../../assets/images/staticslider/slider/hero-banner.jpg";
const BannerComponent = () => {
  return (
    <div>
      <div className="">
        <Container>
          <Row className="justify-content-center">
            <Col md="7" className="text-center">
              <h1 className="title font-bold">Disclaimer</h1>
              <h6 className="subtitle">
              Please make sure you are connected to the right network (Ethereum Mainnet) and the correct address. Please note: Once you make the purchase, you cannot undo this action.
              </h6>
              <h6>We have set the gas limit for the contract to successfully mint your NFT. We recommend that you don't lower the gas limit. The gas that is displayed will not be the final price, it will always be cheaper then displayed.</h6>
            </Col>
          </Row>
        </Container>
      </div>
      {/* <div className="static-slider10">
        <Container>
          <Row className="">
            <Col md="6" className="align-self-center ">
              <span className="label label-rounded label-inverse">
                Creating Brands
              </span>
              <h1 className="title">ONE BILLON People Use Facebook</h1>
              <h6 className="subtitle op-8">
                Pellentesque vehicula eros a dui pretium ornare. Phasellus
                congue vel quam nec luctus.In accumsan at eros in dignissim.
                Cras sodales nisi nonn accumsan.
              </h6>
              <a
                className="btn btn-light btn-rounded btn-md m-t-20"
                data-toggle="collapse"
                href=""
              >
                <span>Do you Need Help?</span>
              </a>
            </Col>
            <Col md="6">
              <Image src={herobanner} alt="herobanner"></Image>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="static-slider3">
        <Container>
          <Row className="justify-content-center">
            <Col md="8" className="align-self-center text-center">
              <h1 className="title">
                I’m Johanthan Doe, an{" "}
                <b className="font-bold">
                  Entreprenuer, Designer & Front-end Developer
                </b>
                , Making{" "}
              </h1>
              <a
                className="btn btn-danger btn-md btn-arrow m-t-20"
                data-toggle="collapse"
                href=""
              >
                <span>
                  Checkout My Work <i className="ti-arrow-right"></i>
                </span>
              </a>
            </Col>
          </Row>
        </Container>
      </div> */}
    </div>
  );
};

export default BannerComponent;
