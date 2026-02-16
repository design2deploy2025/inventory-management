import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const TimePeriodStats = () => {
  const { user } = useAuth()
  const [timePeriod, setTimePeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    day: { ordersReceived: 0, revenue: 0, stock: 0, stockValue: 0 },
    week: { ordersReceived: 0, revenue: 0, stock: 0, stockValue: 0 },
    month: { ordersReceived: 0, revenue: 0, stock: 0, stockValue: 0 },
    year: { ordersReceived: 0, revenue: 0, stock: 0, stockValue: 0 }
  })

  // Fetch stats from Supabase
  const fetchStats = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get current date info
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
      
      // Fetch all orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price, payment_status, created_at')
        .eq('user_id', user.id)
        .eq('payment_status', 'Paid') // Only count paid orders for revenue
      
      if (ordersError) throw ordersError
      
      // Fetch all products for the user
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('quantity, price')
        .eq('user_id', user.id)
      
      if (productsError) throw productsError
      
      // Calculate total stock and stock value
      const totalStock = products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0
      const totalStockValue = products?.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0) || 0
      
      // Fetch orders for counting (all orders, not just paid)
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('total_price, payment_status, created_at')
        .eq('user_id', user.id)
      
      if (allOrdersError) throw allOrdersError
      
      // Calculate stats for each time period
      const calculateStats = (startDate) => {
        const periodOrders = allOrders?.filter(o => new Date(o.created_at) >= new Date(startDate)) || []
        const periodRevenue = orders?.filter(o => new Date(o.created_at) >= new Date(startDate))
          .reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
        
        return {
          ordersReceived: periodOrders.length,
          revenue: periodRevenue,
          stock: totalStock,
          stockValue: totalStockValue
        }
      }
      
      setStats({
        day: calculateStats(todayStart),
        week: calculateStats(weekStart),
        month: calculateStats(monthStart),
        year: calculateStats(yearStart)
      })
    } catch (error) {
      console.error('Error fetching stats:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats when user changes
  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('analytics-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const currentData = stats[timePeriod]
  const timePeriodLabels = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year'
  }

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <div className="h-9 w-16 bg-gray-800 rounded-s-lg animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-800 animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-800 animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-800 rounded-e-lg animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          <div className="grid md:grid-cols-4 bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="block p-4 md:p-5 relative bg-[#0A0A0A] animate-pulse">
                <div className="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
                  <div className="shrink-0 size-5 bg-gray-800 rounded"></div>
                  <div className="grow">
                    <div className="h-3 bg-gray-800 rounded w-32 mb-2"></div>
                    <div className="h-6 bg-gray-800 rounded w-24 mb-2"></div>
                    <div className="h-2 bg-gray-800 rounded w-40"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Time Period Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimePeriod('day')}
            className={`px-4 py-2 text-sm font-medium rounded-s-lg ${
              timePeriod === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0A0A0A] text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            Day
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod('week')}
            className={`px-4 py-2 text-sm font-medium ${
              timePeriod === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0A0A0A] text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timePeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0A0A0A] text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod('year')}
            className={`px-4 py-2 text-sm font-medium rounded-e-lg ${
              timePeriod === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0A0A0A] text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Time Period Stats Cards */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="grid md:grid-cols-4 bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
          <a className="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
            <div className="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
              <svg className="shrink-0 size-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>

              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Orders Received ({timePeriodLabels[timePeriod]})
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-white">
                  {currentData.ordersReceived.toLocaleString()}
                </h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm text-slate-400">
                    Via WhatsApp & Instagram
                  </p>
                  <span className="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    <svg className="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                    <span className="inline-block">
                      {timePeriodLabels[timePeriod]}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </a>

          <a className="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
            <div className="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
              <svg className="shrink-0 size-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>

              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Revenue ({timePeriodLabels[timePeriod]})
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-white">
                  ₹{currentData.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm text-slate-400">
                    {timePeriodLabels[timePeriod].toLowerCase()} earnings
                  </p>
                  <span className="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-green-500/10 text-green-400">
                    <svg className="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                    <span className="inline-block">
                      {timePeriodLabels[timePeriod]}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </a>

          <a className="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
            <div className="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
              <svg className="shrink-0 size-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>

              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Stock in Inventory ({timePeriodLabels[timePeriod]})
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-white">
                  {currentData.stock.toLocaleString()}
                </h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm text-slate-400">
                    Units available
                  </p>
                  <span className="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
                    <svg className="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                    <span className="inline-block">
                      {timePeriodLabels[timePeriod]}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </a>

          <a className="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
            <div className="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
              <svg className="shrink-0 size-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>

              <div className="grow">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Stock Value ({timePeriodLabels[timePeriod]})
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-white">
                  ₹{currentData.stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm text-slate-400">
                    Current value
                  </p>
                  <span className="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400">
                    <svg className="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                    </svg>
                    <span className="inline-block">
                      {timePeriodLabels[timePeriod]}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default TimePeriodStats

