import React from 'react'

const Hotspots = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Hotspots Management</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Active Hotspots</h2>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Add New Hotspot
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-600">
                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Name</th>
                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Location</th>
                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Connected Devices</th>
                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4 text-gray-800 dark:text-white">Main Office Hotspot</td>
                <td className="py-4"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span></td>
                <td className="py-4 text-gray-600 dark:text-gray-400">Floor 1, Lobby</td>
                <td className="py-4 text-gray-600 dark:text-gray-400">24</td>
                <td className="py-4"><button className="text-blue-500 hover:text-blue-600">Edit</button></td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4 text-gray-800 dark:text-white">Conference Room A</td>
                <td className="py-4"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span></td>
                <td className="py-4 text-gray-600 dark:text-gray-400">Floor 2, Room A</td>
                <td className="py-4 text-gray-600 dark:text-gray-400">12</td>
                <td className="py-4"><button className="text-blue-500 hover:text-blue-600">Edit</button></td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4 text-gray-800 dark:text-white">Cafeteria Zone</td>
                <td className="py-4"><span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Maintenance</span></td>
                <td className="py-4 text-gray-600 dark:text-gray-400">Ground Floor</td>
                <td className="py-4 text-gray-600 dark:text-gray-400">0</td>
                <td className="py-4"><button className="text-blue-500 hover:text-blue-600">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Hotspots

