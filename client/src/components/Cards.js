import React, { useEffect } from "react";
import Arch from "../pages/Services/Svg/Arch";
import Int from "../pages/Services/Svg/Int";
import Vastus from "../pages/Services/Svg/Vastus";
import { Link } from "react-router-dom";
import { MdCall, MdOutlineChatBubble } from "react-icons/md";
import { FaVideo } from "react-icons/fa";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './own.css'
const Cards = () => {
  // Initialize tooltips after component mounts
  // useEffect(() => {
  //   const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  //   const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  //     return new window.bootstrap.Tooltip(tooltipTriggerEl);
  //   });
  // }, []);

  useEffect(() => {
    if (window.bootstrap && window.bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    } else {
      console.error("Bootstrap Tooltip is not defined.");
    }
  }, []);





  const data = [
    {
      id: 1,
      Btntitle: "Consult With Architect",
      image: <Arch />,
      borderColor: "border border-warning",
      href: "talk-to-architect",
      description: "Bring your dream spaces to life with expert architects guiding you at ever step.",
    },
    {
      id: 2,
      Btntitle: "Consult with Interior Designer",
      image: <Int />,
      borderColor: "border border-warning",
      href: "talk-to-interior",
      description: "Transform your home into a haven of beauty and comfort with personalized design."
    },
    {
      id: 3,
      Btntitle: "Consult with Vastu Expert",
      image: <Vastus />,
      borderColor: "border border-warning",
      href: "Vastu",
      description: "Align your space with harmony and positive energy through expert Vastu advice."
    }
  ];

  return (
    <div>
      <section className="Own-card_blog_wrapper py-3">
        <div style={{ width: "90%" }} className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12 text-center">
              <div className="Own-card_blog_content_wrapper">
                <div className="row text-left">
                  {data.map((post) => (
                    <div key={post.id} data-aos="flip-left"
                      data-aos-easing="ease-out-cubic"
                      data-aos-duration="2000" className="col-lg-4 col-md-4 col-sm-12 col-12 mb-4">
                      <div className={`Own-card_card ${post.borderColor} h-100`}>
                        <Link to={`/${post.href}`} className="Own-card_card-body text-center">
                          <div className="Own-card_image-wrapper mb-3">
                            <Link className="Own-card_image-link" to={`/${post.href}`}>
                              {post.image}
                            </Link>
                          </div>
                          <h5 className="Own-card_card-title">
                            <Link to={`/${post.href}`} className="text-decoration-none Own-card_title-link">
                              {post.Btntitle}
                            </Link>
                          </h5>
                          <p className="Own-card_description text-dark text-break">
                            {post.description}
                          </p>

                          <div className="Own-card_icons text-center">
                            <ul className="list-inline d-flex justify-content-center gap-3">
                              <li className="list-inline-item">
                                <Link
                                  className="btn btn-light shadow-sm rounded-circle p-3 Own-card_icon-btn"
                                  href="#"
                                  title="Call Us"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  data-bs-title="Call Us"
                                >
                                  <MdCall className="text-primary" size={24} />
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                <Link
                                  className="btn btn-light shadow-sm rounded-circle p-3 Own-card_icon-btn"
                                  href="#"
                                  title="Chat with Us"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  data-bs-title="Chat with Us"
                                >
                                  <MdOutlineChatBubble className="text-success" size={24} />
                                </Link>
                              </li>
                            
                            </ul>
                          </div>


                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>


  );
};

export default Cards;
