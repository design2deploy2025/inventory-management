import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const StockSummary = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [lowOnStockProducts, setLowOnStockProducts] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])

  // Threshold for low stock warning
  const LOW_STOCK_THRESHOLD = 10

  // Fetch data from Supabase
  const fetchData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Fetch low stock products (quantity < threshold)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, quantity')
        .eq('user_id', user.id)
        .lt('quantity', LOW_STOCK_THRESHOLD)
        .order('quantity', { ascending: true })
        .limit(5)

      if (productsError) throw productsError

      // Fetch best selling products based on total_sold
      const { data: bestSellersData, error: bestSellersError } = await supabase
        .from('products')
        .select('id, name, total_sold')
        .eq('user_id', user.id)
        .gt('total_sold', 0)
        .order('total_sold', { ascending: false })
        .limit(5)

      if (bestSellersError) throw bestSellersError

      // Format low stock products
      const formattedLowStock = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        stock: product.quantity,
        threshold: LOW_STOCK_THRESHOLD
      }))

      // Format best selling products
      const formattedBestSellers = (bestSellersData || []).map(product => ({
        id: product.id,
        name: product.name,
        sales: product.total_sold || 0
      }))

      setLowOnStockProducts(formattedLowStock)
      setBestSellingProducts(formattedBestSellers)
    } catch (error) {
      console.error('Error fetching stock summary:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('stock-summary-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Loading skeleton
  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Low on Stock Skeleton */}
          <div className="flex-1 p-4 md:p-5 bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-800 rounded animate-pulse"></div>
              <div className="ml-auto h-6 w-16 bg-gray-800 rounded-md animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Selling Skeleton */}
          <div className="flex-1 p-4 md:p-5 bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-800 rounded animate-pulse"></div>
              <div className="ml-auto h-6 w-14 bg-gray-800 rounded-md animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="h-4 w-36 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-14 bg-gray-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty states
  const hasLowStock = lowOnStockProducts.length > 0
  const hasBestSellers = bestSellingProducts.length > 0

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
            {hasLowStock ? (
              lowOnStockProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-red-500/20 text-red-400">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white font-medium">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Stock:</span>
                    <span className="text-sm font-semibold text-red-400">{product.stock}</span>
                    <span className="text-xs text-slate-500">/ {product.threshold}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">All products are well stocked!</p>
              </div>
            )}
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
              Top {bestSellingProducts.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {hasBestSellers ? (
              bestSellingProducts.map((product, index) => (
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
                    <span className="text-xs text-slate-400">Orders:</span>
                    <span className="text-sm font-semibold text-emerald-400">{product.sales.toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-sm">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockSummary

