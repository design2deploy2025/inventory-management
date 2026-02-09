import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import TermsAndConditions from './pages/TermsAndConditions';
import AboutUs from './pages/AboutUs';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <div>
      {/* <Navbar/> */}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    {/* <Footer/> */}
    </div>
  )
}

export default App
