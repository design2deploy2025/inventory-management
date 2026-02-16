import React from 'react'
import StatCards from '../StatCards'
import StockSummary from '../StockSummary'
import GraphBlock from '../GraphBlock'
import VisitorsAreaCard from '../VisitorsAreaCard'
import MainTable from '../MainTable'
import PendingOrdersTable from '../PendingOrdersTable'

const DashboardHome = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
        Dashboard Overview
      </h1>
      <StatCards />
      <StockSummary />
      {/* <div className='flex w-full gap-5'>
      <VisitorsAreaCard/>
      <VisitorsAreaCard/>
      </div> */}
      {/* <MainTable/> */}
      <PendingOrdersTable/>
      
     
    </div>
  )
}

export default DashboardHome

