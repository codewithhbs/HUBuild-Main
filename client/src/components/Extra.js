import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from "react-slick";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Extra = () => {
    const [image, setImage] = useState([])
    const fetchWorkImage = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/v1/get-all-describe-work-image')
            const allData = data.data;
            const filterData = allData.filter((item) => item.active === true)
            setImage(filterData)
        } catch (error) {
            console.log("Internal server error")
            // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
        }
    }

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
                backgroundColor: "#0E294C",
                borderRadius: "50%",
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <FaArrowLeft style={{ color: "white", fontSize: "20px" }} />
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
                // zIndex: 1000,
                cursor: "pointer",
                backgroundColor: "#0E294C",
                borderRadius: "50%",
                // padding: "10px",
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <FaArrowRight style={{ color: "white", fontSize: "20px" }} />
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

    useEffect(() => {
        fetchWorkImage();
    }, [])
    return (
        <div className="extra-mobile">
            <div className='my-4 forCenterAllSection'>
                <div className='row align-items-center'>
                    <div className='col-lg-7 col-md-6' style={{padding:'0px !important'}}>
                        <h2 className='fs-2 main-heading text-capitalize fw-bolder mt-lg-5 mt-sm-1' data-aos="fade-right" data-aos-offset="300" data-aos-easing="ease-in-sine">How We Work Smoothly for Your Experience and Problems</h2>
                        {/* <h2 className='fs-1 fw-bolder'></h2> */}
                        <hr style={{ paddingTop: "2px" }} className='w-25  bg-warning' />

                        <div className=' ml-0'>
                            <Slider {...settings}>
                                {[
                                    {
                                        step: 1,
                                        text: "First, choose the category you'd like to chat about, such as Architect, Interior Designer, or Vastu expert."
                                    },
                                    {
                                        step: 2,
                                        text: "Next, select a profile of Architect, Interior Designer, or Vastu expert that matches your requirements and suits your needs."
                                    },
                                    {
                                        step: 3,
                                        text: "Feel free to start a chat and ask any questions you have. Our experts are here to help you with your doubts and provide the guidance you need."
                                    },
                                    {
                                        step: 4,
                                        text: "Once you've finished chatting, you can ask more questions or discuss further. We're here to support you anytime."
                                    }
                                ].map((item, index) => (
                                    <div className="col-lg-6 mt-4" key={index}>
                                        <div className="position-relative step-bg forSliderCenter" data-aos="fade-up" data-aos-easing="ease-in-back" data-aos-delay="300" data-aos-offset="0">
                                            <div className="position-absolute top-0 start-0 w-100 bg-light-dark bg-opacity-50"></div>
                                            <div style={{padding:'0px 45px'}} className="d-inline-flex align-items-center fordisplaydirection">
                                                <div className="d-inline-flex bg-white rounded-pill">
                                                    <div className=" align-items-center justify-content-center fs-5 fw-bold rounded-pill" style={{ backgroundColor: '#0E294C', padding: '10px 30px', display: 'flex' }}>
                                                        <span className='text-white'>Step-{item.step}</span> {/* Dynamic step number */}
                                                    </div>
                                                </div>
                                                <p className="" style={{ fontSize: '20px', textAlign: 'center', fontWeight: '500' }}>
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                    <div className='col-lg-5 col-md-6'>
                        {
                            image && image.slice(0, 1).map((item, index) => (
                                <img key={index} className='img-fluid object-cover' src={item?.image?.url} alt="" data-aos="flip-left" data-aos-easing="ease-out-cubic" data-aos-duration="3000" />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Extra