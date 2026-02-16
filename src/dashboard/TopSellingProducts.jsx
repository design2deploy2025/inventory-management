import React, { useState, useMemo, useEffect } from 'react'
import Chart from 'react-apexcharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const TopSellingProducts = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('weekly')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [orderData, setOrderData] = useState({ weekly: [], monthly: [], fast: [] })

  // Fetch products and orders from Supabase
  const fetchData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get current date info
      const now = new Date()
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
      
      // Fetch products ordered by total_sold
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, total_sold, price, quantity')
        .eq('user_id', user.id)
        .order('total_sold', { ascending: false })
        .limit(10)
      
      if (productsError) throw productsError
      
      // Fetch orders for the last 30 days
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, products, total_price, payment_status')
        .eq('user_id', user.id)
        .gte('created_at', monthAgo)
        .eq('payment_status', 'Paid')
        .order('created_at', { ascending: false })
      
      if (ordersError) throw ordersError
      
      // Process weekly best sellers (last 7 days)
      const weeklyOrders = ordersData?.filter(o => new Date(o.created_at) >= new Date(weekAgo)) || []
      const weeklyProductSales = {}
      weeklyOrders.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(product => {
            const key = product.name
            if (!weeklyProductSales[key]) {
              weeklyProductSales[key] = { units: 0, revenue: 0 }
            }
            weeklyProductSales[key].units += product.quantity || 0
            weeklyProductSales[key].revenue += (product.price || 0) * (product.quantity || 0)
          })
        }
      })
      
      // Process monthly best sellers
      const monthlyProductSales = {}
      ordersData?.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(product => {
            const key = product.name
            if (!monthlyProductSales[key]) {
              monthlyProductSales[key] = { units: 0, revenue: 0 }
            }
            monthlyProductSales[key].units += product.quantity || 0
            monthlyProductSales[key].revenue += (product.price || 0) * (product.quantity || 0)
          })
        }
      })
      
      // Process fast sellers (based on recent order frequency)
      const productOrderFrequency = {}
      ordersData?.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(product => {
            const key = product.name
            if (!productOrderFrequency[key]) {
              productOrderFrequency[key] = { count: 0, lastOrderDate: new Date(0) }
            }
            productOrderFrequency[key].count += 1
            const orderDate = new Date(order.created_at)
            if (orderDate > productOrderFrequency[key].lastOrderDate) {
              productOrderFrequency[key].lastOrderDate = orderDate
            }
          })
        }
      })
      
      // Calculate growth (mock calculation - comparing week vs previous week)
      const calculateGrowth = (currentUnits, previousMultiplier = 0.8) => {
        const previousUnits = currentUnits * previousMultiplier
        if (previousUnits === 0) return 25.0
        return ((currentUnits - previousUnits) / previousUnits) * 100
      }
      
      // Transform products for weekly tab
      const weeklyBestSellers = Object.entries(weeklyProductSales)
        .map(([name, data]) => {
          const product = productsData?.find(p => p.name === name)
          return {
            id: product?.sku || 'PRD-UNK',
            name,
            units: data.units,
            revenue: data.revenue,
            growth: calculateGrowth(data.units)
          }
        })
        .sort((a, b) => b.units - a.units)
        .slice(0, 5)
      
      // Transform products for monthly tab
      const monthlyBestSellers = Object.entries(monthlyProductSales)
        .map(([name, data]) => {
          const product = productsData?.find(p => p.name === name)
          return {
            id: product?.sku || 'PRD-UNK',
            name,
            units: data.units,
            revenue: data.revenue,
            growth: calculateGrowth(data.units, 0.7)
          }
        })
        .sort((a, b) => b.units - a.units)
        .slice(0, 5)
      
      // Transform products for fast sellers tab
      const fastSellers = Object.entries(productOrderFrequency)
        .map(([name, data]) => {
          const product = productsData?.find(p => p.name === name)
          const avgTimeHours = data.count > 0 ? (168 / data.count) : 168 // 168 hours in a week
          let velocity = 'Low'
          if (avgTimeHours < 4) velocity = 'Very High'
          else if (avgTimeHours < 12) velocity = 'High'
          else if (avgTimeHours < 24) velocity = 'Medium'
          
          return {
            id: product?.sku || 'PRD-UNK',
            name,
            avgTime: `${avgTimeHours.toFixed(1)} hrs`,
            units: data.count,
            velocity
          }
        })
        .sort((a, b) => a.units - b.units)
        .slice(0, 5)
      
      setProducts(productsData || [])
      setOrderData({
        weekly: weeklyBestSellers,
        monthly: monthlyBestSellers,
        fast: fastSellers
      })
    } catch (error) {
      console.error('Error fetching top selling products:', error.message)
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
      .channel('top-products-changes')
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Filter data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'weekly':
        return orderData.weekly.length > 0 ? orderData.weekly : [
          { id: '-', name: 'No data yet', units: 0, revenue: 0, growth: 0 }
        ]
      case 'monthly':
        return orderData.monthly.length > 0 ? orderData.monthly : [
          { id: '-', name: 'No data yet', units: 0, revenue: 0, growth: 0 }
        ]
      case 'fast':
        return orderData.fast.length > 0 ? orderData.fast : [
          { id: '-', name: 'No data yet', units: 0, avgTime: '-', velocity: 'N/A' }
        ]
      default:
        return orderData.weekly.length > 0 ? orderData.weekly : [
          { id: '-', name: 'No data yet', units: 0, revenue: 0, growth: 0 }
        ]
    }
  }, [activeTab, orderData])

  // Chart series based on active tab
  const chartSeries = useMemo(() => {
    const data = currentData.map(item => item.units)
    return [{ name: 'Units Sold', data }]
  }, [currentData])

  // Chart options
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        borderRadius: 4,
        distributed: true,
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ['transparent'],
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, ui-sans-serif',
        color: '#fff',
      },
      offsetX: 10,
    },
    legend: { show: false },
    xaxis: {
      categories: currentData.map(item => item.name),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif',
          colors: '#94a3b8',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif',
          colors: '#94a3b8',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} units`,
      },
      theme: 'dark',
    },
    colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4,
    },
    responsive: [
      {
        breakpoint: 568,
        options: {
          plotOptions: {
            bar: {
              barHeight: '50%',
            },
          },
          dataLabels: {
            style: {
              fontSize: '10px',
            },
          },
          xaxis: {
            labels: {
              style: { fontSize: '10px', colors: '#94a3b8' },
            },
          },
          yaxis: {
            labels: {
              style: { fontSize: '10px', colors: '#94a3b8' },
            },
          },
        },
      },
    ],
  }), [currentData])

  // Growth badge helper
  const getGrowthBadge = (growth) => {
    const isPositive = growth >= 0
    return isPositive 
      ? 'bg-emerald-500/10 text-emerald-400'
      : 'bg-red-500/10 text-red-400'
  }

  // Velocity badge helper
  const getVelocityBadge = (velocity) => {
    switch (velocity) {
      case 'Very High':
        return 'bg-purple-500/10 text-purple-400'
      case 'High':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'Low':
        return 'bg-red-500/10 text-red-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 md:p-5 min-h-[410px] flex flex-col bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="h-6 w-48 bg-gray-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-gray-700">
            <div className="h-8 w-20 bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-800 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="mb-6 h-[280px] bg-gray-800/50 rounded animate-pulse"></div>
        <div className="flex-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-800">
              <div className="h-4 w-16 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-5 min-h-[410px] flex flex-col bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Best Selling Products
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Top performing products from your orders
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'weekly'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'monthly'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab('fast')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'fast'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Fast Selling
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={280}
        />
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                {activeTab === 'fast' ? 'Avg. Time' : 'Units Sold'}
              </th>
              {activeTab !== 'fast' && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Revenue
                </th>
              )}
              {activeTab === 'fast' && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Velocity
                </th>
              )}
              {activeTab !== 'fast' && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Growth
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {currentData.map((product, index) => (
              <tr 
                key={product.id + index} 
                className="hover:bg-gray-900/50 transition-colors duration-200"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">
                  {product.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                  {product.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                  {activeTab === 'fast' 
                    ? product.avgTime 
                    : `${product.units} units`
                  }
                </td>
                {activeTab !== 'fast' && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-white">
                    {formatCurrency(product.revenue)}
                  </td>
                )}
                {activeTab === 'fast' && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getVelocityBadge(product.velocity)}`}>
                      {product.velocity}
                    </span>
                  </td>
                )}
                {activeTab !== 'fast' && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getGrowthBadge(product.growth)}`}>
                      {product.growth >= 0 ? '+' : ''}{product.growth.toFixed(1)}%
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopSellingProducts

