import React from 'react'

const Performance = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Performance Analytics</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Performance Metrics</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Track your application's performance metrics, including response times, 
          error rates, and resource utilization.
        </p>
        
        {/* Performance chart placeholder */}
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Performance Chart Area</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Response Time</h3>
          <p className="text-3xl font-bold text-blue-500">124ms</p>
          <p className="text-sm text-green-500 mt-2">↑ 5% faster than last week</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Error Rate</h3>
          <p className="text-3xl font-bold text-red-500">0.12%</p>
          <p className="text-sm text-green-500 mt-2">↓ 0.05% improvement</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Uptime</h3>
          <p className="text-3xl font-bold text-green-500">99.98%</p>
          <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
        </div>
      </div>
    </div>
  )
}

export default Performance

