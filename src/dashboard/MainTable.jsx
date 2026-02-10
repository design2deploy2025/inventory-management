import React, { useState, useMemo } from 'react'

const MainTable = () => {
  // Sample orders data with new columns
  const orders = [
    { id: '#ORD-001', productId: 'PRD-001', productName: 'Premium Plan', price: 299.00, date: 'Jan 15, 2025', orderStatus: 'Completed', paymentStatus: 'Paid' },
    { id: '#ORD-002', productId: 'PRD-002', productName: 'Enterprise License', price: 1499.00, date: 'Jan 14, 2025', orderStatus: 'Pending', paymentStatus: 'Unpaid' },
    { id: '#ORD-003', productId: 'PRD-003', productName: 'Basic Plan', price: 99.00, date: 'Jan 13, 2025', orderStatus: 'Completed', paymentStatus: 'Paid' },
    { id: '#ORD-004', productId: 'PRD-001', productName: 'Premium Plan', price: 299.00, date: 'Jan 12, 2025', orderStatus: 'Cancelled', paymentStatus: 'Failed' },
    { id: '#ORD-005', productId: 'PRD-002', productName: 'Enterprise License', price: 1499.00, date: 'Jan 11, 2025', orderStatus: 'Completed', paymentStatus: 'Paid' },
    { id: '#ORD-006', productId: 'PRD-004', productName: 'Professional Plan', price: 599.00, date: 'Jan 10, 2025', orderStatus: 'Pending', paymentStatus: 'Unpaid' },
    { id: '#ORD-007', productId: 'PRD-003', productName: 'Basic Plan', price: 99.00, date: 'Jan 9, 2025', orderStatus: 'Completed', paymentStatus: 'Paid' },
    { id: '#ORD-008', productId: 'PRD-004', productName: 'Professional Plan', price: 599.00, date: 'Jan 8, 2025', orderStatus: 'Processing', paymentStatus: 'Paid' },
  ]

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')

  // Order Status badge color helper
  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400'
      case 'Processing':
        return 'bg-blue-500/10 text-blue-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  // Payment Status badge color helper
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'Unpaid':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'Failed':
        return 'bg-red-500/10 text-red-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter (Order ID or Product Name)
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Order Status filter
      const matchesOrderStatus = orderStatusFilter === 'All' || order.orderStatus === orderStatusFilter
      
      // Payment Status filter
      const matchesPaymentStatus = paymentStatusFilter === 'All' || order.paymentStatus === paymentStatusFilter
      
      return matchesSearch && matchesOrderStatus && matchesPaymentStatus
    })
  }, [orders, searchTerm, orderStatusFilter, paymentStatusFilter])

  // Format price to currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setOrderStatusFilter('All')
    setPaymentStatusFilter('All')
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || orderStatusFilter !== 'All' || paymentStatusFilter !== 'All'

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
        Orders Management
      </h1>
      <div className="mt-6">
        <div className="bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
            <p className="text-sm text-slate-400 mt-1">Manage and track your recent orders</p>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-4 border-b border-gray-800 bg-[#0f0f0f]">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by Order ID or Product Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#1a1a1a] text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>

              {/* Order Status Filter */}
              <div className="min-w-[150px]">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="block w-full py-2 pl-3 pr-8 border border-gray-700 rounded-md leading-5 bg-[#1a1a1a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                >
                  <option value="All">All Order Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="min-w-[150px]">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="block w-full py-2 pl-3 pr-8 border border-gray-700 rounded-md leading-5 bg-[#1a1a1a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                >
                  <option value="All">All Payment Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500 transition-colors"
                >
                  Clear Filters
                </button>
              )}

              {/* Results Count */}
              <div className="ml-auto text-sm text-slate-400">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-900/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {order.productId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {formatPrice(order.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getOrderStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getPaymentStatusBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-12 w-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg">No orders found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredOrders.length} orders
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={filteredOrders.length === 0}>
                Previous
              </button>
              <button className="px-3 py-1 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={filteredOrders.length === 0}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainTable

