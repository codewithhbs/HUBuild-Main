import React, { useEffect, useState } from 'react';
import './ser.css'; // Your CSS
import axios from 'axios';
import Slider from "react-slick";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Ser = () => {
    const [image, setImage] = useState([])
    const fetchImage = async () => {
        try {
            const { data } = await axios.get('https://api.helpubuild.in/api/v1/get-all-plan-journey-image')
            const allData = data.data;
            const filterData = allData.filter((item) => item.active === true)
            setImage(filterData)
        } catch (error) {
            console.log("Internal server error in fetching images");
        }
    }
    useEffect(() => {
        fetchImage();
    }, [])

    const PrevArrow = ({ onClick }) => (
        <div
            className="custom-prev-arrow"
            onClick={onClick}
            style={{
                position: "absolute",
                left: "0px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 9,
                cursor: "pointer",
                backgroundColor: "#F0F8FF",
                border:"2px solid #0e294c",
                borderRadius: "50%",
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <FaArrowLeft style={{ color: "#0e294c", fontSize: "20px" }} />
        </div>
    );

    const NextArrow = ({ onClick }) => (
        <div
            className="custom-next-arrow"
            onClick={onClick}
            style={{
                position: "absolute",
                right: "0px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                backgroundColor: "#F0F8FF",
                border:"2px solid #0e294c",
                borderRadius: "50%",
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <FaArrowRight style={{ color: "#0e294c", fontSize: "20px" }} />
        </div>
    );

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        autoplay: true,
        autoplaySpeed: 8000,
    };
    return (
        <div className='' style={{ width: "90%", margin: "0 auto" }}>
            <div className=" service-35 wrap-service35-box">
                <div className="row no-gutters align-items-center">
                    <div className="col-lg-6 col-md-6 align-self-center" data-aos="fade-right" data-aos-offset="300" data-aos-easing="ease-in-sine">
                        <h3 className="my-2 main-heading">Plan Your Journey Step by Step</h3>
                        <p className="fw-bold text-dark">Follow these steps to achieve your goals with ease and confidence:</p>

                        <Slider {...settings}>
                            {[
                                {
                                    step: 'Chat with an Expert',
                                    text: "Get personalized advice from experienced professionals to kick-start your project with clarity."
                                },
                                {
                                    step: 'Plan Your Idea',
                                    text: "We help you brainstorm and refine your concept to make it actionable and impactful."
                                },
                                {
                                    step: 'Set Your Budget',
                                    text: "Allocate your resources effectively with a well-structured budget to maximize your outcomes."
                                },
                                {
                                    step: 'Execute',
                                    text: "Turn your plan into reality with a step-by-step execution process guided by our expert support."
                                }
                            ].map((item, index) => (
                                <div className="col-lg-6 mt-4" key={index}>
                                    <div className="position-relative step-bg forSliderCenter" data-aos="fade-up" data-aos-easing="ease-in-back" data-aos-delay="300" data-aos-offset="0">
                                        <div className="position-absolute top-0 start-0 w-100 bg-light-dark bg-opacity-50"></div>
                                        <div style={{ padding: '0px 45px' }} className="d-inline-flex info-box align-items-center fordisplaydirection">
                                            <p className='jurniHeading'>{item.step}</p> {/* Dynamic step number */}
                                            <p className="text-white journey-paragraph">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>

                        {/* <div className="row">
                            <div className='col-md-6'>
                                <div className='info-box px-4 py-4 my-3' >
                                    <div className='info-title'><h4 className=' sub-heading'>Chat with an Expert</h4></div>
                                    <p className="para">Get personalized advice from experienced professionals to kick-start your project with clarity.</p>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className='info-box px-4 py-4 my-3'>
                                    <div className='info-title'><h4 className=' sub-heading'>Plan Your Idea</h4></div>
                                    <p className="para"> We help you brainstorm and refine your concept to make it actionable and impactful.</p>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className='info-box px-4 py-4 my-3'>
                                    <div className='info-title'><h4 className=' sub-heading'>Set Your Budget</h4></div>
                                    <p className="para">Allocate your resources effectively with a well-structured budget to maximize your outcomes.</p>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className='info-box px-4 py-4 my-3'>
                                    <div className='info-title'><h4 className=' sub-heading'>Execute</h4></div>
                                    <p className="para">Turn your plan into reality with a step-by-step execution process guided by our expert support.</p>
                                </div>
                            </div>
                        </div> */}

                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div className="mt-5" data-aos="fade-left" data-aos-offset="300" data-aos-easing="ease-in-sine">
                            <a>
                                {
                                    image && image.slice(0, 1).map((item, index) => (
                                        <img key={index} src={item?.image?.url} alt="Chat with Expert" className='object-cover rounded' />
                                    ))
                                }
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ser;
