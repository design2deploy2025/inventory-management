import React, { useState, useMemo, useEffect } from 'react'
import OrderModal from './OrderModal'
import InvoiceModal from './InvoiceModal'
import Pagination from './Pagination'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PendingOrdersTable = () => {
  const { user } = useAuth()
  
  // State for orders from Supabase
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToEdit, setOrderToEdit] = useState(null)

  // Filter states - Default to Pending and Processing
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('Pending')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  // Fetch ALL orders from Supabase (client-side pagination/filtering)
  const fetchOrders = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform data
      const transformedOrders = data?.map(order => ({
        id: order.order_number,
        orderId: order.id,
        products: order.products || [],
        totalPrice: order.total_price || 0,
        date: order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        orderStatus: order.order_status || 'Pending',
        paymentStatus: order.payment_status || 'Unpaid',
        customerName: order.customer_name || '',
        customerPhone: order.customer_phone || '',
        customerWhatsApp: order.customer_whatsapp || '',
        customerInstagram: order.customer_instagram || '',
        paymentType: order.payment_type || 'Cash',
        notes: order.notes || '',
        source: order.source || 'WhatsApp',
        invoiceDate: order.invoice_date || '',
        dueDate: order.due_date || '',
        created_at: order.created_at,
        updated_at: order.updated_at
      })) || []

      setOrders(transformedOrders)
    } catch (err) {
      console.error('Error fetching orders:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders - Always Pending/Processing + user filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const isPendingOrProcessing = order.orderStatus === 'Pending' || order.orderStatus === 'Processing'
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.products && order.products.some(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())))
      const matchesOrderStatus = orderStatusFilter === 'All' || order.orderStatus === orderStatusFilter
      const matchesPaymentStatus = paymentStatusFilter === 'All' || order.paymentStatus === paymentStatusFilter
      
      return isPendingOrProcessing && matchesSearch && matchesOrderStatus && matchesPaymentStatus
    })
  }, [orders, searchTerm, orderStatusFilter, paymentStatusFilter])

  // Client-side pagination
  const paginatedOrders = useMemo(() => {
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE
    return filteredOrders.slice(from, to)
  }, [filteredOrders, currentPage])

  // Handlers
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setOrderStatusFilter('Pending')
    setPaymentStatusFilter('All')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm !== '' || paymentStatusFilter !== 'All'

// Missing handlers implementation
  const handleViewInvoice = (order) => {
    setSelectedOrder(order)
    setIsInvoiceModalOpen(true)
  }

  const handleEditOrder = (order) => {
    setOrderToEdit(order)
    setIsOrderModalOpen(true)
  }

  const handleSaveOrder = async (orderData) => {
    if (!user) return

    try {
      // Transform frontend data back to DB format
      const dbOrder = {
        user_id: user.id,
        order_number: orderData.id,
        products: orderData.products,
        total_price: orderData.totalPrice,
        order_status: orderData.orderStatus || 'Pending',
        payment_status: orderData.paymentStatus || 'Unpaid',
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_whatsapp: orderData.customerWhatsApp,
        customer_instagram: orderData.customerInstagram,
        payment_type: orderData.paymentType || 'Cash',
        notes: orderData.notes,
        source: orderData.source || 'WhatsApp',
        invoice_date: orderData.invoiceDate,
        due_date: orderData.dueDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .insert([dbOrder])

      if (error) throw error

      setIsOrderModalOpen(false)
      setOrderToEdit(null)
      fetchOrders() // Refresh list
    } catch (err) {
      console.error('Error saving order:', err)
      alert('Failed to save order: ' + err.message)
    }
  }

  const handleUpdateOrder = async (orderData) => {
    if (!user || !orderData.orderId) return

    try {
      const dbOrder = {
        order_number: orderData.id,
        products: orderData.products,
        total_price: orderData.totalPrice,
        order_status: orderData.orderStatus,
        payment_status: orderData.paymentStatus,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_whatsapp: orderData.customerWhatsApp,
        customer_instagram: orderData.customerInstagram,
        payment_type: orderData.paymentType,
        notes: orderData.notes,
        source: orderData.source,
        invoice_date: orderData.invoiceDate,
        due_date: orderData.dueDate,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(dbOrder)
        .eq('id', orderData.orderId)

      if (error) throw error

      setIsOrderModalOpen(false)
      setOrderToEdit(null)
      fetchOrders()
    } catch (err) {
      console.error('Error updating order:', err)
      alert('Failed to update order: ' + err.message)
    }
  }

  // Load orders on mount and user change
  useEffect(() => {
    fetchOrders()
  }, [user])

  // Badge helpers (same as before)
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

  const getSourceBadge = (source) => {
    switch (source) {
      case 'WhatsApp':
        return 'bg-green-500/10 text-green-400'
      case 'Instagram':
        return 'bg-pink-500/10 text-pink-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  return (
    <div className="p-6">
      {/* Header - same */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Pending Orders
        </h1>
        <button onClick={() => { setOrderToEdit(null); setIsOrderModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Order
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Pending Orders</h2>
          <p className="text-sm text-slate-400 mt-1">Orders awaiting processing (Pending & Processing)</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-800 bg-[#0f0f0f]">
          <div className="flex flex-wrap gap-4 items-center">
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
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilterChange()
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-[#1a1a1a] text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>

            <div className="min-w-[150px]">
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value)
                  handleFilterChange()
                }}
                className="block w-full py-2 pl-3 pr-8 border border-gray-700 rounded-md bg-[#1a1a1a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            )}

            <div className="ml-auto text-sm text-slate-400">
              Page {currentPage} • {filteredOrders.length} pending orders
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-slate-400">Loading...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg text-red-400">{error}</p>
              <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Retry
              </button>
            </div>
          ) : (
            <table className="w-full">
              {/* Table header - same */}
              <thead className="bg-[#0A0A0A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-900/50">
                      {/* Row content - same as before */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.products.map(p => p.name).slice(0,2).join(', ') || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatPrice(order.totalPrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceBadge(order.source)}`}>
                          {order.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button onClick={() => handleViewInvoice(order)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          Invoice
                        </button>
                        <button onClick={() => handleEditOrder(order)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-400 mb-1">No pending orders</h3>
                        <p className="text-sm text-slate-500">Great job! All orders processed 🎉</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredOrders.length / PAGE_SIZE)}
          totalItems={filteredOrders.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />

        {/* Modals */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => { setIsOrderModalOpen(false); setOrderToEdit(null); }}
          onSave={handleSaveOrder}
          onUpdate={handleUpdateOrder}
          orderToEdit={orderToEdit}
          user={user}
        />
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => { setIsInvoiceModalOpen(false); setSelectedOrder(null); }}
          order={selectedOrder}
        />
      </div>
    </div>
  )
}

export default PendingOrdersTable

