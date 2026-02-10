import React from 'react'

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
        Settings
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Account Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              defaultValue="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              defaultValue="john.doe@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option>UTC (GMT+0)</option>
              <option>EST (GMT-5)</option>
              <option>PST (GMT-8)</option>
              <option>CET (GMT+1)</option>
            </select>
          </div>
        </div>
        
        <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Save Changes
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Notification Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Weekly Reports</p>
              <p className="text-sm text-gray-500">Get weekly summary reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        
        <div className="flex gap-4">
          <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Delete Account
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings

