import React from 'react'
import StatCards from '../StatCards'

const DashboardHome = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard Overview</h1>
      <StatCards />
      
      {/* Add more dashboard content here */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-400">Your recent activity will appear here.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create New Project
            </button>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Generate Report
            </button>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

