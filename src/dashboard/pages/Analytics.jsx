import React from 'react'
import StatCards from '../StatCards'
import TopSellingProducts from '../TopSellingProducts'

const Analytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
        Analytics Overview
      </h1>
      <StatCards/>
      <div className='px-9'>
      <TopSellingProducts/>
      </div>
    </div>
  )
}

export default Analytics
