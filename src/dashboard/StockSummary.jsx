import React from 'react'

const StockSummary = () => {
  // Mock data for low on stock products
  const lowOnStockProducts = [
    { id: 1, name: 'Wireless Headphones', stock: 3, threshold: 10 },
    { id: 2, name: 'USB-C Cable 2m', stock: 5, threshold: 15 },
    { id: 3, name: 'Laptop Stand', stock: 2, threshold: 8 },
    { id: 4, name: 'Bluetooth Mouse', stock: 4, threshold: 12 },
    { id: 5, name: 'Screen Protector', stock: 1, threshold: 20 },
  ]

  // Mock data for best selling products
  const bestSellingProducts = [
    { id: 1, name: 'Smartphone Case Pro', sales: 1245 },
    { id: 2, name: 'Wireless Charger 15W', sales: 982 },
    { id: 3, name: 'Mechanical Keyboard', sales: 756 },
    { id: 4, name: 'Noise Canceling Earbuds', sales: 634 },
    { id: 5, name: 'HD Webcam 1080p', sales: 521 },
  ]

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Low on Stock Products Box */}
        <div className="flex-1 p-4 md:p-5 bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <svg 
              className="shrink-0 size-5 text-red-500" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h2 className="text-lg font-semibold text-white">Low on Stock</h2>
            <span className="ml-auto py-1 px-2 text-xs font-medium rounded-md bg-red-500/10 text-red-400">
              {lowOnStockProducts.length} items
            </span>
          </div>
          
          <div className="space-y-3">
            {lowOnStockProducts.map((product) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm text-white font-medium">{product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Stock:</span>
                  <span className="text-sm font-semibold text-red-400">{product.stock}</span>
                  <span className="text-xs text-slate-500">/ {product.threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Products Box */}
        <div className="flex-1 p-4 md:p-5 bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <svg 
              className="shrink-0 size-5 text-emerald-500" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <h2 className="text-lg font-semibold text-white">Best Selling</h2>
            <span className="ml-auto py-1 px-2 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-400">
              Top 5
            </span>
          </div>
          
          <div className="space-y-3">
            {bestSellingProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400">
                    {index + 1}
                  </span>
                  <span className="text-sm text-white font-medium">{product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sales:</span>
                  <span className="text-sm font-semibold text-emerald-400">{product.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockSummary

