import "./Service.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage1 from "../../assets/images/51xYCxjhGqL._SL1500_ (1)-Photoroom.png";
import heroImage2 from "../../assets/images/21bivbS4ilL (1).png";
import heroImage3 from "../../assets/images/3116W0Ow3iL (1)-Photoroom (1)-Photoroom.png";
import heroImage4 from "../../assets/images/71Kv4RUvrxL._SL1500_ (1)-Photoroom (1)-Photoroom.png";
import heroImage5 from "../../assets/images/41yl8eW3s1L._SL1200_ (1)-Photoroom.png";
import product1 from "../../assets/images/41er8MZR58L._SL1500_ (1)-Photoroom.png";
import product2 from "../../assets/images/41eD-lrc-7L._SL1200_-Photoroom (1).png";
import product3 from "../../assets/images/51vNMv6Ua-L._SL1499_ (1).png";
import product4 from "../../assets/images/31cV+Yv71GL._SL1100_ (1) (1).png";

const products = [
  { id: 1, name: "AC Service", image: product1, link: "/services/ac" },
  { id: 2, name: "Refrigerator Service", image: product2, link: "/services/refrigerator" },
  { id: 3, name: "Water Purifier", image: product3, link: "/services/waterPurifier" },
  { id: 4, name: "Washing Machine", image: product4, link: "/services/washingMachine" },
];

const Service = () => {
  useEffect(() => {
    const carousel = document.querySelector("#heroCarousel");
    if (carousel) {
      new window.bootstrap.Carousel(carousel, {
        interval: 5000,
        ride: "carousel",
        pause: false,
        wrap: true,
      });
    }
  }, []);

  return (
    <div>
      <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
        <div className="carousel-inner">
          {/* Slide 1 */}
          <div className="carousel-item active bg-slide-1" data-bs-interval="1500">
            <div className="container h-100">
              <div className="row align-items-center h-100">
                <div className="col-lg-6 text-white">
                  <h1>Ac Service</h1>
                  <p>Professional AC service and repair for optimal cooling and efficiency</p>
                  <a href="/services/ac" className="btn btn-secondary me-2">Get Now</a>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center">
                  <img src={heroImage1} className="img-fluid hero-img" alt="Couch Service" />
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div className="carousel-item bg-slide-2" data-bs-interval="1500">
            <div className="container h-100">
              <div className="row align-items-center h-100">
                <div className="col-lg-6 text-white">
                  <h1>Refrigerator</h1>
                  <p>"Expert refrigerator repair and maintenance for long-lasting cooling.</p>
                  <a href="/services/refrigerator" className="btn btn-secondary me-2">Get Now</a>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center">
                  <img src={heroImage2} className="img-fluid hero-img" alt="Solar Service 1" />
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3 */}
          <div className="carousel-item bg-slide-3" data-bs-interval="1500">
            <div className="container h-100">
              <div className="row align-items-center h-100">
                <div className="col-lg-6 text-white">
                  <h1>Washing Machine</h1>
                  <p>Reliable washing machine repair and maintenance for smooth operation.</p>
                  <a href="/services/washingMachine" className="btn btn-secondary me-2">Get Now</a>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center">
                  <img src={heroImage3} className="img-fluid hero-img" alt="Solar Service 2" />
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4 */}
          <div className="carousel-item bg-slide-3" data-bs-interval="1500">
            <div className="container h-100">
              <div className="row align-items-center h-100">
                <div className="col-lg-6 text-white">
                  <h1>Water Purifier</h1>
                  <p>Expert water purifier service for clean and safe drinking water.</p>
                  <a href="/services/waterPurifier" className="btn btn-secondary me-2">Get Now</a>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center">
                  <img src={heroImage4} className="img-fluid hero-img" alt="Solar Service 2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Product Section */}
      <div className="product-section pt-0">
        <div className="container">
          <div className="row">
            {products.map((product) => (
              <div key={product.id} className="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
                <div className="product-item text-center">
                  <img src={product.image} className="img-fluid product-thumbnail mb-3" alt={product.name} />
                  <h3 className="product-title">{product.name}</h3>
                  <Link to={product.link} className="btn btn-secondary mt-2">
                    View More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;