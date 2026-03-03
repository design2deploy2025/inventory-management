import React, { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const OrdersLineChart = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('week') // 'week' or 'month'
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    week: { labels: [], data: [] },
    month: { labels: [], data: [] }
  })

  // Fetch order data from Supabase
  const fetchOrderData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, payment_status')
        .eq('user_id', user.id)
      
      if (error) throw error
      
      const now = new Date()
      
      // Process weekly data (last 7 days - current week days)
      const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const weekData = [0, 0, 0, 0, 0, 0, 0] // Initialize for all days
      
      // Get start of current week (Sunday)
      const currentDay = now.getDay()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - currentDay)
      weekStart.setHours(0, 0, 0, 0)
      
      // Filter orders for this week
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at)
        if (orderDate >= weekStart) {
          const dayIndex = orderDate.getDay()
          weekData[dayIndex]++
        }
      })
      
      // Process monthly data (last 6 months)
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const monthData = [0, 0, 0, 0, 0, 0] // Initialize for 6 months
      
      // Get start of 6 months ago
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      
      // Filter orders for last 6 months
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at)
        if (orderDate >= sixMonthsAgo) {
          const monthIndex = orderDate.getMonth()
          // Map months to our 6-month window (current month to 5 months ago)
          const monthsAgo = (now.getMonth() - monthIndex + 12) % 12
          if (monthsAgo <= 5) {
            monthData[5 - monthsAgo]++
          }
        }
      })
      
      setChartData({
        week: { labels: weekLabels, data: weekData },
        month: { labels: monthLabels, data: monthData }
      })
    } catch (error) {
      console.error('Error fetching order data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOrderData()
    }
  }, [user])

  // Chart options
  const getOptions = () => ({
    chart: {
      type: 'area',
      height: 350,
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#3B82F6', '#06B6D4'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: timeRange === 'week' ? chartData.week.labels : chartData.month.labels,
      labels: {
        style: {
          colors: '#9CA3AF',
          fontFamily: 'inherit'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9CA3AF',
          fontFamily: 'inherit'
        },
        formatter: (val) => Math.round(val)
      }
    },
    theme: {
      mode: 'dark'
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true
      },
      y: {
        formatter: (val) => `${val} Orders`
      },
      marker: {
        show: true
      }
    },
    markers: {
      size: 6,
      strokeWidth: 0,
      hover: {
        size: 8
      }
    }
  })

  const series = [
    {
      name: 'Orders',
      data: timeRange === 'week' ? chartData.week.data : chartData.month.data
    }
  ]

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-[350px] bg-gray-800/50 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl p-6 shadow-xl">
      {/* Header with Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Orders Overview
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {timeRange === 'week' 
              ? 'This week\'s order trend' 
              : 'Last 6 months order trend'}
          </p>
        </div>
        
        {/* Toggle Button */}
        <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              timeRange === 'week'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              timeRange === 'month'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <Chart
          options={getOptions()}
          series={series}
          type="area"
          height={350}
        />
        
        {/* Decorative gradient overlays */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-400">Total Orders</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">
            {(timeRange === 'week' 
              ? chartData.week.data.reduce((a, b) => a + b, 0)
              : chartData.month.data.reduce((a, b) => a + b, 0)
            ).toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 ml-2">
            {timeRange === 'week' ? 'this week' : 'this month'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrdersLineChart

