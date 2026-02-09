import React from 'react'
import Hero from '../components/hero/Hero'
import Team from '../components/team/Team'
import Footer from '../components/footer/Footer'
import Testimonials from '../components/testimonials/Testimonials'
import { How } from '../components/how it works/How'
import Features from '../components/features/Features'
import Contact from '../components/contact/Contact'
import Pricing from '../components/pricing/Pricing'

const Home = () => {
  return (
    <div>
      <Hero/>
      <Features/>
      <How/>
      <Testimonials/>
      <Pricing/>
      <Team/>
      <Contact/>
      {/* <Footer/> */}
    </div>
  )
}

export default Home
