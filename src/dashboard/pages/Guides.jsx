import React from 'react'
import UserDetails from '../UserDetails'

const Guides = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Guides & Documentation</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Available Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-800 dark:text-white">Getting Started Guide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Learn the basics of using our platform</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-800 dark:text-white">API Documentation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete API reference guide</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-800 dark:text-white">Best Practices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tips for optimal performance</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-800 dark:text-white">Troubleshooting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Common issues and solutions</p>
          </div>
        </div>
      </div>

      <UserDetails />
    </div>
  )
}

export default Guides

