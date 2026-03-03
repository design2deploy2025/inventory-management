import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RandomPage = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalUnitsOfStock: 0,
    totalValueOfStock: 0,
    totalRevenue: 0,
    totalProductsListed: 0,
    totalFeedbacks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGlobalStats()
  }, [])

  const fetchGlobalStats = async () => {
    try {
      setLoading(true)

      // Call the database function that bypasses RLS to get global stats
      const { data, error } = await supabase.rpc('get_global_stats')

      if (error) throw error

      if (data && data.length > 0) {
        const globalStats = data[0]
        setStats({
          totalCustomers: globalStats.total_customers || 0,
          totalOrders: globalStats.total_orders || 0,
          totalUnitsOfStock: globalStats.total_units_of_stock || 0,
          totalValueOfStock: globalStats.total_value_of_stock || 0,
          totalRevenue: globalStats.total_revenue || 0,
          totalProductsListed: globalStats.total_products_listed || 0,
          totalFeedbacks: globalStats.total_feedbacks || 0
        })
      }
    } catch (error) {
      console.error('Error fetching global stats:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading global statistics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-10">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Platform Statistics
          </h1>
          <p className="text-slate-400">
            Overview of all data across the platform
          </p>
        </div>

        {/* Stats Grid - 4 columns on large screens, 2 on medium, 1 on small */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Customers */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Customers
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {stats.totalCustomers.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Orders
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {stats.totalOrders.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Units of Stock */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Units of Stock
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {stats.totalUnitsOfStock.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Value of Stock */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Value of Stock
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  ₹{stats.totalValueOfStock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Revenue
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  ₹{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Products Listed */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Products Listed
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {stats.totalProductsListed.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Feedbacks Submitted */}
          <div className="block p-5 relative bg-[#0A0A0A] border border-gray-800 hover:bg-gray-900 transition-colors duration-300 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-x-4">
              <div className="shrink-0">
                <svg className="size-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Feedbacks Submitted
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {stats.totalFeedbacks.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RandomPage

