import React from 'react'
import banner from './home-inner-banner.webp'
import './banner.css'
const Banner = () => {
  return (
    <div className="container-fluid p-0 ">
    <div className="d-flex justify-content-center banner align-items-center">
      <img data-aos="zoom-in" src={banner} alt=''></img>
      {/* Add content here if needed */}
    </div>
  </div>

  )
}

export default Banner