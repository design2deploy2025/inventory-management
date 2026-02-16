import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const StatCards = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalOrdersReceived: 0,
    totalRevenue: 0,
    totalProductsListed: 0,
    totalStockValue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('quantity, price, total_sold')
        .eq('user_id', user.id)

      if (productsError) throw productsError

      // Fetch orders data - count all orders regardless of status
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price, order_status, payment_status')
        .eq('user_id', user.id)

      if (ordersError) throw ordersError

      // Calculate stats
      // Total Orders Received - count all orders for this user (regardless of status)
      const totalOrdersReceived = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
      const totalProductsListed = products?.length || 0
      const totalStockValue = products?.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0) || 0

      setStats({
        totalOrdersReceived,
        totalRevenue,
        totalProductsListed,
        totalStockValue
      })
    } catch (error) {
      console.error('Error fetching stats:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="grid md:grid-cols-4 bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="block p-4 md:p-5 relative bg-[#0A0A0A] animate-pulse">
              <div className="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
                <div className="shrink-0 size-5 bg-gray-800 rounded"></div>
                <div className="grow">
                  <div className="h-3 bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-800 rounded w-20 mb-2"></div>
                  <div className="h-2 bg-gray-800 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
  <div class="grid md:grid-cols-4 bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
    <a class="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
      <div class="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
        <svg class="shrink-0 size-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>

        <div class="grow">
          <p class="text-xs uppercase font-medium text-slate-400">
            Total Orders Received
          </p>
          <h3 class="mt-1 text-xl sm:text-2xl font-semibold text-white">
            {stats.totalOrdersReceived.toLocaleString()}
          </h3>
          <div class="mt-1 flex justify-between items-center">
            <p class="text-sm text-slate-400">
              WhatsApp, Instagram
            </p>
            <span class="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400">
              <svg class="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
              </svg>
              <span class="inline-block">
                All Time
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>

    <a class="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
      <div class="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
        <svg class="shrink-0 size-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>

        <div class="grow">
          <p class="text-xs uppercase font-medium text-slate-400">
            Total Revenue
          </p>
          <h3 class="mt-1 text-xl sm:text-2xl font-semibold text-white">
            ₹{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div class="mt-1 flex justify-between items-center">
            <p class="text-sm text-slate-400">
              Completed orders
            </p>
            <span class="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-green-500/10 text-green-400">
              <svg class="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
              </svg>
              <span class="inline-block">
                All Time
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>

    <a class="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
      <div class="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
        <svg class="shrink-0 size-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>

        <div class="grow">
          <p class="text-xs uppercase font-medium text-slate-400">
            Products Listed
          </p>
          <h3 class="mt-1 text-xl sm:text-2xl font-semibold text-white">
            {stats.totalProductsListed}
          </h3>
          <div class="mt-1 flex justify-between items-center">
            <p class="text-sm text-slate-400">
              Active listings
            </p>
            <span class="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
              <svg class="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
              </svg>
              <span class="inline-block">
                Active
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>

    <a class="block p-4 md:p-5 relative bg-[#0A0A0A] hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 before:absolute before:top-0 before:start-0 before:w-full before:h-px md:before:h-full before:border-s before:border-gray-800 first:before:bg-transparent transition-colors duration-300" href="#">
      <div class="flex md:flex flex-col lg:flex-row gap-y-3 gap-x-5">
        <svg class="shrink-0 size-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>

        <div class="grow">
          <p class="text-xs uppercase font-medium text-slate-400">
            Stock Value
          </p>
          <h3 class="mt-1 text-xl sm:text-2xl font-semibold text-white">
            ₹{stats.totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div class="mt-1 flex justify-between items-center">
            <p class="text-sm text-slate-400">
              Inventory value
            </p>
            <span class="ms-1 inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400">
              <svg class="inline-block size-3 self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
              </svg>
              <span class="inline-block">
                At Cost
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

export default StatCards

