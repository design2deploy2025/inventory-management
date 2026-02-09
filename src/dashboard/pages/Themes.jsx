import React from 'react'

const Themes = () => {
  const themes = [
    { name: 'Default Light', color: '#ffffff', textColor: 'text-gray-800' },
    { name: 'Default Dark', color: '#1f2937', textColor: 'text-white' },
    { name: 'Ocean Blue', color: '#1e40af', textColor: 'text-white' },
    { name: 'Forest Green', color: '#166534', textColor: 'text-white' },
    { name: 'Sunset Orange', color: '#ea580c', textColor: 'text-white' },
    { name: 'Purple Dream', color: '#7c3aed', textColor: 'text-white' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Theme Customization</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Available Themes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {themes.map((theme, index) => (
            <div 
              key={index} 
              className="cursor-pointer transform hover:scale-105 transition-transform"
            >
              <div 
                className={`h-20 rounded-lg mb-2 flex items-center justify-center border-2 ${index === 1 ? 'border-blue-500' : 'border-transparent'}`}
                style={{ backgroundColor: theme.color }}
              >
                {index === 1 && (
                  <svg className={`w-8 h-8 ${theme.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className={`text-sm text-center ${theme.textColor}`}>{theme.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Custom Theme Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
            <div className="flex gap-4 items-center">
              <input type="color" className="h-10 w-10 rounded cursor-pointer" defaultValue="#3b82f6" />
              <span className="text-gray-600 dark:text-gray-400">#3b82f6</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent Color</label>
            <div className="flex gap-4 items-center">
              <input type="color" className="h-10 w-10 rounded cursor-pointer" defaultValue="#8b5cf6" />
              <span className="text-gray-600 dark:text-gray-400">#8b5cf6</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
            <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option>Inter (Default)</option>
              <option>Roboto</option>
              <option>Open Sans</option>
              <option>Montserrat</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Border Radius</label>
            <input 
              type="range" 
              min="0" 
              max="20" 
              defaultValue="8" 
              className="w-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">8px</span>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Apply Theme
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  )
}

export default Themes

