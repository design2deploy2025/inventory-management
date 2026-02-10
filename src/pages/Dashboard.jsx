import React, { useState } from 'react'
import SideBar from '../dashboard/SideBar'

// Import all page components
import DashboardHome from '../dashboard/pages/DashboardHome'
import Performance from '../dashboard/pages/Performance'
import Guides from '../dashboard/pages/Guides'
import Hotspots from '../dashboard/pages/Hotspots'
import Checklists from '../dashboard/pages/Checklists'
import Themes from '../dashboard/pages/Themes'
import Settings from '../dashboard/pages/Settings'
import MainTable from '../dashboard/MainTable'
import ProductDetails from '../dashboard/ProductDetails'

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Map page IDs to their components
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />
      case 'orders':
        return <MainTable />
      case 'products':
        return <ProductDetails   />
      case 'performance':
        return <Performance />
      case 'guides':
        return <Guides />
      case 'hotspots':
        return <Hotspots />
      case 'checklists':
        return <Checklists />
      case 'themes':
        return <Themes />
      case 'settings':
        return <Settings />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Left Sidebar - Fixed */}
      <SideBar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Right Panel - Scrollable */}
      <main className="flex-1 overflow-auto bg-[#0A0A0A]">
        {renderPage()}
      </main>
    </div>
  )
}

export default Dashboard

