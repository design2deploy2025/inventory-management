import React from 'react'

const Checklists = () => {
  const checklists = [
    { title: 'Daily Security Check', completed: 3, total: 5 },
    { title: 'Weekly System Maintenance', completed: 2, total: 7 },
    { title: 'Monthly Performance Review', completed: 1, total: 4 },
    { title: 'User Access Audit', completed: 0, total: 6 },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Checklists</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {checklists.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{item.title}</h2>
              <span className="text-sm text-gray-500">{item.completed}/{item.total}</span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(item.completed / item.total) * 100}%` }}
              ></div>
            </div>
            
            <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Create New Checklist</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Checklist title..." 
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checklists

