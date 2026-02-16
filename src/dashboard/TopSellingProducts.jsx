import React, { useState, useMemo } from 'react'
import Chart from 'react-apexcharts'

// Sample data for best selling products - Gift items & Handicrafts
const weeklyBestSellers = [
  { id: 'PRD-001', name: 'Customized Rakhi Set', units: 156, revenue: 43680, growth: 25.5 },
  { id: 'PRD-003', name: 'Handmade Candle Set', units: 142, revenue: 63900, growth: 18.2 },
  { id: 'PRD-002', name: 'Gift Box - Anniversary', units: 89, revenue: 75650, growth: 15.7 },
  { id: 'PRD-004', name: 'Personalized Mug Set', units: 76, revenue: 26600, growth: 12.3 },
  { id: 'PRD-005', name: 'Terracotta Decor', units: 54, revenue: 28080, growth: 8.1 },
]

const monthlyBestSellers = [
  { id: 'PRD-002', name: 'Gift Box - Anniversary', units: 423, revenue: 359550, growth: 32.4 },
  { id: 'PRD-001', name: 'Customized Rakhi Set', units: 612, revenue: 171360, growth: 28.9 },
  { id: 'PRD-004', name: 'Handmade Candle Set', units: 298, revenue: 134100, growth: 24.2 },
  { id: 'PRD-003', name: 'Festival Gift Hamper', units: 567, revenue: 680400, growth: 19.6 },
  { id: 'PRD-006', name: 'Handloom Table Runner', units: 234, revenue: 152100, growth: 16.8 },
]

const fastSellers = [
  { id: 'PRD-001', name: 'Customized Rakhi Set', avgTime: '2.3 hrs', units: 156, velocity: 'Very High' },
  { id: 'PRD-003', name: 'Handmade Candle Set', avgTime: '3.1 hrs', units: 142, velocity: 'High' },
  { id: 'PRD-007', name: 'Personalized Mug', avgTime: '4.5 hrs', units: 89, velocity: 'High' },
  { id: 'PRD-008', name: 'Gift Box - Small', avgTime: '5.2 hrs', units: 67, velocity: 'Medium' },
  { id: 'PRD-002', name: 'Terracotta Decor', avgTime: '8.7 hrs', units: 54, velocity: 'Medium' },
]

// Sample chart data
const weeklyChartData = [156, 142, 89, 76, 54]
const monthlyChartData = [612, 567, 423, 298, 234]
const fastSellerChartData = [156, 142, 89, 67, 54]

const TopSellingProducts = () => {
  const [activeTab, setActiveTab] = useState('weekly')

  // Filter data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'weekly':
        return weeklyBestSellers
      case 'monthly':
        return monthlyBestSellers
      case 'fast':
        return fastSellers
      default:
        return weeklyBestSellers
    }
  }, [activeTab])

  // Chart series based on active tab
  const chartSeries = useMemo(() => {
    switch (activeTab) {
      case 'weekly':
        return [{ name: 'Units Sold', data: weeklyChartData }]
      case 'monthly':
        return [{ name: 'Units Sold', data: monthlyChartData }]
      case 'fast':
        return [{ name: 'Units Sold', data: fastSellerChartData }]
      default:
        return [{ name: 'Units Sold', data: weeklyChartData }]
    }
  }, [activeTab])

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
      formatter: (val) => `${val} units`,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, ui-sans-serif',
        color: '#fff',
      },
      offsetX: 10,
    },
    legend: { show: false },
    xaxis: {
      categories: activeTab === 'fast' 
        ? fastSellers.map(item => item.name)
        : currentData.map(item => item.name),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif',
          color: '#94a3b8',
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
          color: '#94a3b8',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} units sold`,
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
              style: { fontSize: '10px', color: '#94a3b8' },
            },
          },
          yaxis: {
            labels: {
              style: { fontSize: '10px', color: '#94a3b8' },
            },
          },
        },
      },
    ],
  }), [activeTab, currentData])

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

  return (
    <div className="p-4 md:p-5 min-h-[410px] flex flex-col bg-[#0A0A0A] border border-gray-800 shadow-sm rounded-xl w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Best Selling Products
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Top performing gift items & handicrafts
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
                key={product.id} 
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
                      {product.growth >= 0 ? '+' : ''}{product.growth}%
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

