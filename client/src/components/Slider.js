import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";  
import "./slider.css";
import vastu from "./vastu.png";
import engineer from "./engineer.png";
import interior from "./interior-design.png";
import support from "./support.png";
import axios from "axios";

const Slider = () => {
  const [desktopBanner, setDesktopBanner] = useState([]);
  const [mobileBanner, setMobileBanner] = useState([]);
  const [loading, setLoading] = useState(true);   // ✅ loader state

  const handleFetchBanner = async () => {
    try {
      const { data } = await axios.get(
        "https://api.dessobuild.com/api/v1/get-all-banner"
      );
      const allBanner = data.data;
      const filterData = allBanner.filter((item) => item.active === true);
      const desktopBanner = filterData.filter((item) => item.view === "Desktop");
      const mobileBanner = filterData.filter((item) => item.view === "Mobile");
      setDesktopBanner(desktopBanner);
      setMobileBanner(mobileBanner);
    } catch (error) {
      console.log("Internal server error in getting banners", error);
    } finally {
      setLoading(false);   // ✅ stop loader after fetch
    }
  };

  useEffect(() => {
    handleFetchBanner();
  }, []);

  return (
    <div className="container-fluid new_banner text-center">
      <div
        id="carouselExampleFade"
        className="carousel slide carousel-fade fix_height_banner"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {loading ? (
            // ✅ Skeleton placeholder while loading
            <div className="carousel-item active">
              <Skeleton height={400} width={"100%"} />
            </div>
          ) : desktopBanner.length > 0 ? (
            desktopBanner.map((item, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <img
                  src={item?.bannerImage?.url}
                  className="d-block w-100"
                  alt="hero-banner"
                />
              </div>
            ))
          ) : (
            // ✅ Fallback if no banner exists
            <div className="carousel-item active">
              <p>No banners available</p>
            </div>
          )}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleFade"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleFade"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Cards section remains same */}
      <div style={{ width: "90%" }} className="mx-auto my-4">
        <div className="row">
          <div className="col-md-3 col-6 px-2 mb-3">
            <Link to="/talk-to-architect" className="text-decoration-none">
              <div className="card bg-light border-light hover-effect">
                <div className="card-body forHeight text-center">
                  <img
                    src={engineer}
                    className="img-fluid icon_chat mb-2"
                    alt="Chat Icon"
                  />
                  <h5 className="card-title fs-6 text-dark">
                    Connect With Architect
                  </h5>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-3 col-6 px-2 mb-3">
            <Link to="/talk-to-interior" className="text-decoration-none">
              <div className="card bg-light border-light hover-effect w-100">
                <div className="card-body forHeight text-center">
                  <img
                    src={interior}
                    className="img-fluid icon_chat mb-2"
                    alt="Chat Icon"
                  />
                  <h5 className="card-title fs-6 text-dark">
                    Connect With Interior Designer
                  </h5>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-3 col-6 px-2 mb-3">
            <Link to="/Vastu" className="text-decoration-none">
              <div className="card bg-light border-light hover-effect">
                <div className="card-body forHeight text-center">
                  <img
                    src={vastu}
                    className="img-fluid icon_chat mb-2"
                    alt="Chat Icon"
                  />
                  <h5 className="card-title fs-6 text-dark">
                    Connect With Vastu Expert
                  </h5>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-3 col-6 px-2 mb-3">
            <Link to="/contact" className="text-decoration-none">
              <div className="card bg-light border-light hover-effect">
                <div className="card-body forHeight text-center">
                  <img
                    src={support}
                    className="img-fluid icon_chat mb-2"
                    alt="Chat Icon"
                  />
                  <h5 className="card-title fs-6 text-dark">Support</h5>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
