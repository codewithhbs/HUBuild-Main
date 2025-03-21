import React from 'react'
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

const Home = () => {
  return (
    <div>
        <Slider/>
        <Extra/>
        <Ser/>
        {/* <Banner/> */}
        {/* <About/> */}
        <Cards/>
        {/* <Extra/> */}
        <Reviews/>
        <WhyChooseUs/>
        {/* <Services/> */}
        <Blog/>
    </div>
  )
}

export default Home
