import React, { useState, useEffect } from 'react'
import StatCards from '../StatCards'
import TimePeriodStats from '../TimePeriodStats'
import TopSellingProducts from '../TopSellingProducts'
import OrdersLineChart from '../OrdersLineChart'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaDownload, FaSpinner } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const Analytics = () => {
  const { user } = useAuth()
  const [reportData, setReportData] = useState({
    timePeriod: { day: {}, week: {}, month: {}, year: {} },
    weeklyBestSellers: [],
    monthlyBestSellers: [],
    fastSellers: []
  })
  const [loading, setLoading] = useState(true)

  // Fetch all data for PDF report
  const fetchReportData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get current date info
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
      
      // Fetch all orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_price, payment_status, created_at, products')
        .eq('user_id', user.id)
      
      const paidOrders = allOrders?.filter(o => o.payment_status === 'Paid') || []
      
      // Calculate time period stats
      const calculateStats = (startDate) => {
        const periodOrders = allOrders?.filter(o => new Date(o.created_at) >= new Date(startDate)) || []
        const periodRevenue = paidOrders.filter(o => new Date(o.created_at) >= new Date(startDate))
          .reduce((sum, o) => sum + (o.total_price || 0), 0)
        
        return {
          ordersReceived: periodOrders.length,
          revenue: periodRevenue
        }
      }
      
      // Fetch products for stock info
      const { data: products } = await supabase
        .from('products')
        .select('quantity, price')
        .eq('user_id', user.id)
      
      const totalStock = products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0
      const totalStockValue = products?.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0) || 0
      
      // Process weekly best sellers
      const weeklyOrders = allOrders?.filter(o => new Date(o.created_at) >= new Date(weekAgo) && o.payment_status === 'Paid') || []
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
      
      const weeklyBestSellers = Object.entries(weeklyProductSales)
        .map(([name, data], index) => ({
          id: `PRD-${String(index + 1).padStart(3, '0')}`,
          name,
          units: data.units,
          revenue: data.revenue,
          growth: 25.0
        }))
        .sort((a, b) => b.units - a.units)
        .slice(0, 5)
      
      // Process monthly best sellers
      const monthlyOrders = allOrders?.filter(o => new Date(o.created_at) >= new Date(monthAgo) && o.payment_status === 'Paid') || []
      const monthlyProductSales = {}
      monthlyOrders.forEach(order => {
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
      
      const monthlyBestSellers = Object.entries(monthlyProductSales)
        .map(([name, data], index) => ({
          id: `PRD-${String(index + 1).padStart(3, '0')}`,
          name,
          units: data.units,
          revenue: data.revenue,
          growth: 30.0
        }))
        .sort((a, b) => b.units - a.units)
        .slice(0, 5)
      
      // Process fast sellers
      const productOrderFrequency = {}
      monthlyOrders.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(product => {
            const key = product.name
            if (!productOrderFrequency[key]) {
              productOrderFrequency[key] = { count: 0 }
            }
            productOrderFrequency[key].count += 1
          })
        }
      })
      
      const fastSellers = Object.entries(productOrderFrequency)
        .map(([name, data], index) => {
          const avgTimeHours = data.count > 0 ? (168 / data.count) : 168
          let velocity = 'Low'
          if (avgTimeHours < 4) velocity = 'Very High'
          else if (avgTimeHours < 12) velocity = 'High'
          else if (avgTimeHours < 24) velocity = 'Medium'
          
          return {
            id: `PRD-${String(index + 1).padStart(3, '0')}`,
            name,
            avgTime: `${avgTimeHours.toFixed(1)} hrs`,
            units: data.count,
            velocity
          }
        })
        .sort((a, b) => a.units - b.units)
        .slice(0, 5)
      
      setReportData({
        timePeriod: {
          day: { ...calculateStats(todayStart), stock: totalStock, stockValue: totalStockValue },
          week: { ...calculateStats(weekStart), stock: totalStock, stockValue: totalStockValue },
          month: { ...calculateStats(monthStart), stock: totalStock, stockValue: totalStockValue },
          year: { ...calculateStats(yearStart), stock: totalStock, stockValue: totalStockValue }
        },
        weeklyBestSellers,
        monthlyBestSellers,
        fastSellers
      })
    } catch (error) {
      console.error('Error fetching report data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user])

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Generate filename with date-time format
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const filename = `Report-${year}-${month}-${day}-${hours}-${minutes}.pdf`
    
    // Color palette
    const primaryColor = [59, 130, 246] // Blue
    const darkColor = [30, 41, 59] // Dark slate
    const lightGray = [248, 250, 252]
    const textColor = [51, 65, 85]
    
    // Header with clean gradient effect (simulated with rectangles)
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 45, 'F')
    
    // Accent line
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 45, pageWidth, 2, 'F')
    
    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('times', 'bold')
    doc.text('Business Analytics Report', pageWidth / 2, 22, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('times', 'normal')
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Generated: ${dateStr}`, pageWidth / 2, 35, { align: 'center' })
    
    // Reset text color
    doc.setTextColor(...textColor)
    
    let yPos = 58
    
    // Time Period Stats Section
    doc.setFontSize(16)
    doc.setFont('times', 'bold')
    doc.text('Time Period Statistics', 14, yPos)
    yPos += 8
    
    // Create time period stats table
    const timePeriodHeaders = [['Time Period', 'Orders', 'Revenue (₹)', 'Stock', 'Stock Value (₹)']]
    const timePeriodTableData = [
      ['Today', reportData.timePeriod.day.ordersReceived?.toString() || '0', 
       (reportData.timePeriod.day.revenue || 0).toLocaleString(), 
       reportData.timePeriod.day.stock?.toString() || '0', 
       (reportData.timePeriod.day.stockValue || 0).toLocaleString()],
      ['This Week', reportData.timePeriod.week.ordersReceived?.toString() || '0', 
       (reportData.timePeriod.week.revenue || 0).toLocaleString(), 
       reportData.timePeriod.week.stock?.toString() || '0', 
       (reportData.timePeriod.week.stockValue || 0).toLocaleString()],
      ['This Month', reportData.timePeriod.month.ordersReceived?.toString() || '0', 
       (reportData.timePeriod.month.revenue || 0).toLocaleString(), 
       reportData.timePeriod.month.stock?.toString() || '0', 
       (reportData.timePeriod.month.stockValue || 0).toLocaleString()],
      ['This Year', reportData.timePeriod.year.ordersReceived?.toString() || '0', 
       (reportData.timePeriod.year.revenue || 0).toLocaleString(), 
       reportData.timePeriod.year.stock?.toString() || '0', 
       (reportData.timePeriod.year.stockValue || 0).toLocaleString()]
    ]
    
    autoTable(doc, {
      head: timePeriodHeaders,
      body: timePeriodTableData,
      startY: yPos,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'center'
      },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' }
      }
    })
    
    yPos = doc.lastAutoTable.finalY + 18
    
    // Weekly Best Sellers Section
    doc.setFontSize(16)
    doc.setFont('times', 'bold')
    doc.text('Weekly Best Sellers', 14, yPos)
    yPos += 8
    
    const weeklyHeaders = [['#', 'Product Name', 'Units Sold', 'Revenue (₹)', 'Growth']]
    const weeklyBody = reportData.weeklyBestSellers.map((p, index) => [
      index + 1,
      p.name,
      p.units.toString(),
      p.revenue.toLocaleString(),
      `+${p.growth.toFixed(1)}%`
    ])
    
    autoTable(doc, {
      head: weeklyHeaders,
      body: weeklyBody.length > 0 ? weeklyBody : [['1', 'No data', '-', '-', '-']],
      startY: yPos,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'center'
      },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' }
      }
    })
    
    yPos = doc.lastAutoTable.finalY + 18
    
    // Monthly Best Sellers Section
    doc.setFontSize(16)
    doc.setFont('times', 'bold')
    doc.text('Monthly Best Sellers', 14, yPos)
    yPos += 8
    
    const monthlyHeaders = [['#', 'Product Name', 'Units Sold', 'Revenue (₹)', 'Growth']]
    const monthlyBody = reportData.monthlyBestSellers.map((p, index) => [
      index + 1,
      p.name,
      p.units.toLocaleString(),
      p.revenue.toLocaleString(),
      `+${p.growth.toFixed(1)}%`
    ])
    
    autoTable(doc, {
      head: monthlyHeaders,
      body: monthlyBody.length > 0 ? monthlyBody : [['1', 'No data', '-', '-', '-']],
      startY: yPos,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'center'
      },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' }
      }
    })
    
    yPos = doc.lastAutoTable.finalY + 18
    
    // Fast Selling Products Section
    doc.setFontSize(16)
    doc.setFont('times', 'bold')
    doc.text('Fast Selling Products (Velocity)', 14, yPos)
    yPos += 8
    
    const fastHeaders = [['#', 'Product Name', 'Avg. Time', 'Units Sold', 'Velocity']]
    const fastBody = reportData.fastSellers.map((p, index) => [
      index + 1,
      p.name,
      p.avgTime,
      p.units.toString(),
      p.velocity
    ])
    
    autoTable(doc, {
      head: fastHeaders,
      body: fastBody.length > 0 ? fastBody : [['1', 'No data', '-', '-', '-']],
      startY: yPos,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'center'
      },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' }
      }
    })
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(...darkColor)
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')
      
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      )
    }
    
    // Save the PDF
    doc.save(filename)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Analytics Overview
        </h1>
        <button
          onClick={generatePDF}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaDownload className="text-xs" />
          )}
          {loading ? 'Generating...' : 'Download Detailed Report'}
        </button>
      </div>
      {/* <StatCards/> */}
      <TimePeriodStats/>
      <div className='px-4 md:px-9'>
        <OrdersLineChart/>
      </div>
      <div className='px-9'>
      <TopSellingProducts/>
      </div>
    </div>
  )
}

export default Analytics

