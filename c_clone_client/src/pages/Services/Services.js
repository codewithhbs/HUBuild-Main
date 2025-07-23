import React from "react";
import Arch from "./Svg/Arch";
import Int from "./Svg/Int";
import Vastus from "./Svg/Vastus";
import image from './image.png'
import { Swiper, SwiperSlide } from 'swiper/react';
import './Services.css'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';



// import required modules
import { Pagination ,Autoplay} from 'swiper/modules';
const Services = () => {



  const ServiceData = [
    {
      serviceTitle: "Architecture Consultation",
      serviceImage: <Arch />,
      serviceDescription: "Our architecture consultants specialize in a diverse range of styles, including Brutalism, Gothic, and Art Deco. They work closely with you to develop a distinctive design that enhances  "
    },
    {
      serviceTitle: "Interior Consultation",
      serviceImage: <Int />,
      serviceDescription: "Our expert interior designers guide you in choosing complementary elements that create a harmonious look. They help you understand current trends while ensuring your choices align with your vision and enhance the overall aesthetic."
    },
    {
      serviceTitle: "Vastu Consultation",
      serviceImage: <Vastus />,
      serviceDescription: "Our vastu consultants offer specialized advice on materials, colors, and layouts that conform to Vastu principles. This ensures your design not only looks appealing but also promotes harmony and functionality within the space."
    }
  ];
  


  return (
    <div>
      <section class="as_service_wrapper as_padderTop80 as_padderBottom80">
        <div class="container">
          <div class="row">
            <div class="col-lg-12 text-center">
              <h1 class="as_heading as_heading_center">

                services at <span className="about_color">Help U Build</span>
              </h1>
        
              <p class="as_font14 as_padderTop20 as_padderBottom20">
                At Help U Build, we turn your visions into reality with expert
                architecture, interior design, and vastu services. We blend
                innovation with tradition to create spaces that reflect your
                aspirations.
              </p>
            </div>
          </div>

          <div class="row as_verticle_center">
            <div class="col-lg-4 col-md-12 col-sm-12">
              <div class="as_service_img">
              
                <img
                  src={image}
                  alt=""
                  class="as_service_img img-responsive"
                />
              </div>
            </div>
            <div className="col-lg-8 col-md-12 col-sm-12">
  <div className="row flex-wrap">
    <Swiper
      slidesPerView={2}
      spaceBetween={30}
      pagination={{
        clickable: true,
      }}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      modules={[Pagination, Autoplay]}
      className="mySwiper"
    >
      {ServiceData.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="custom-card text-center">
            <span className="as_icon">
              {item.serviceImage}
            </span>
            <h4 className="fs-2 fw-bold as_subheading">{item.serviceTitle}</h4>
            <p className="as_paddingBottom10">{item.serviceDescription}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
