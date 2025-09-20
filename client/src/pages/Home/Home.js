import React, { useEffect, useState } from 'react'
import Slider from '../../components/Slider'
import About from '../About/About'
import Services from '../Services/Services'
import WhyChooseUs from '../../components/WhyChooseUs'
import Reviews from '../../components/Reviews'
import Blog from '../../components/Blog'
import Cards from '../../components/Cards'
import Ser from '../../components/Ser'
import Banner from '../../components/Banner/Banner'
import Extra from '../../components/Extra'
import axios from 'axios'

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);

  const handleFetchTestimonial = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/get-all-testimonial');
      setTestimonials(data.data)
    } catch (error) {
      console.log("Internal server errro", error)
    }
  }

  useEffect(() => {
    handleFetchTestimonial();
  },[])

  return (
    <div>
        <Slider/>
        <Extra/>
        <Ser/>
        {/* <Banner/> */}
        {/* <About/> */}
        {/* <Cards/> */}
        {/* <Extra/> */}
        {testimonials.length > 0 && <Reviews />}
        {/* <Reviews/> */}
        <WhyChooseUs/>
        {/* <Services/> */}
        <Blog/>
    </div>
  )
}

export default Home
