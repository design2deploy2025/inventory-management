import React from 'react'
import StatCards from '../StatCards'
import TimePeriodStats from '../TimePeriodStats'
import TopSellingProducts from '../TopSellingProducts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaDownload } from 'react-icons/fa'

// Sample data for PDF generation (same as TimePeriodStats) - Gift items data
const timePeriodData = {
  day: {
    label: 'Today',
    ordersReceived: 12,
    revenue: 8560.00,
    stock: 217,
    stockValue: 98500.00
  },
  week: {
    label: 'This Week',
    ordersReceived: 85,
    revenue: 62500.50,
    stock: 195,
    stockValue: 89200.00
  },
  month: {
    label: 'This Month',
    ordersReceived: 320,
    revenue: 245680.00,
    stock: 150,
    stockValue: 68500.00
  },
  year: {
    label: 'This Year',
    ordersReceived: 2450,
    revenue: 1850000.00,
    stock: 120,
    stockValue: 54000.00
  }
}

// Sample data for top selling products - Gift items
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

const generatePDF = () => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Business Analytics Report', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Generated: ${dateStr}`, pageWidth / 2, 30, { align: 'center' })
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  let yPos = 50
  
  // Time Period Stats Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Time Period Statistics', 14, yPos)
  yPos += 10
  
  // Create time period stats table
  const timePeriodHeaders = [['Time Period', 'Orders Received', 'Revenue (₹)', 'Stock', 'Stock Value (₹)']]
  const timePeriodData = [
    ['Today', '12', '8,560.00', '217', '98,500.00'],
    ['This Week', '85', '62,500.50', '195', '89,200.00'],
    ['This Month', '320', '245,680.00', '150', '68,500.00'],
    ['This Year', '2,450', '1,850,000.00', '120', '54,000.00']
  ]
  
  autoTable(doc, {
    head: timePeriodHeaders,
    body: timePeriodData,
    startY: yPos,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  })
  
  yPos = doc.lastAutoTable.finalY + 20
  
  // Weekly Best Sellers Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Weekly Best Sellers', 14, yPos)
  yPos += 10
  
  const weeklyHeaders = [['Product ID', 'Product Name', 'Units Sold', 'Revenue (₹)', 'Growth (%)']]
  const weeklyBody = weeklyBestSellers.map(p => [
    p.id,
    p.name,
    p.units.toString(),
    p.revenue.toLocaleString(),
    `+${p.growth}%`
  ])
  
  autoTable(doc, {
    head: weeklyHeaders,
    body: weeklyBody,
    startY: yPos,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  })
  
  yPos = doc.lastAutoTable.finalY + 20
  
  // Monthly Best Sellers Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Monthly Best Sellers', 14, yPos)
  yPos += 10
  
  const monthlyHeaders = [['Product ID', 'Product Name', 'Units Sold', 'Revenue (₹)', 'Growth (%)']]
  const monthlyBody = monthlyBestSellers.map(p => [
    p.id,
    p.name,
    p.units.toLocaleString(),
    p.revenue.toLocaleString(),
    `+${p.growth}%`
  ])
  
  autoTable(doc, {
    head: monthlyHeaders,
    body: monthlyBody,
    startY: yPos,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  })
  
  yPos = doc.lastAutoTable.finalY + 20
  
  // Fast Selling Products Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Fast Selling Products', 14, yPos)
  yPos += 10
  
  const fastHeaders = [['Product ID', 'Product Name', 'Avg. Time', 'Units Sold', 'Velocity']]
  const fastBody = fastSellers.map(p => [
    p.id,
    p.name,
    p.avgTime,
    p.units.toString(),
    p.velocity
  ])
  
  autoTable(doc, {
    head: fastHeaders,
    body: fastBody,
    startY: yPos,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  })
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  doc.save('business-analytics-report.pdf')
}

const Analytics = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Analytics Overview
        </h1>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
        >
          <FaDownload className="text-xs" />
          Download Detailed Report
        </button>
      </div>
      {/* <StatCards/> */}
      <TimePeriodStats/>
      <div className='px-9'>
      <TopSellingProducts/>
      </div>
    </div>
  )
}

export default Analytics

