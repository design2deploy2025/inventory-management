import React, { useState, useMemo, useEffect } from 'react'
import OrderModal from './OrderModal'
import InvoiceModal from './InvoiceModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MainTable = () => {
  const { user } = useAuth()
  
  // State for orders from Supabase
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToEdit, setOrderToEdit] = useState(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')

  // Fetch orders from Supabase
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

      // Transform data to match component's expected format
      const transformedOrders = data?.map(order => ({
        id: order.order_number,
        orderId: order.id, // Keep the UUID for editing
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

  // Fetch orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!user) return

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Order change detected:', payload)
          fetchOrders() // Refresh orders on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
    }
  }, [user])

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

  // Source badge helper
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

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter (Order ID or Product Name)
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Order Status filter
      const matchesOrderStatus = orderStatusFilter === 'All' || order.orderStatus === orderStatusFilter
      
      // Payment Status filter
      const matchesPaymentStatus = paymentStatusFilter === 'All' || order.paymentStatus === paymentStatusFilter
      
      return matchesSearch && matchesOrderStatus && matchesPaymentStatus
    })
  }, [orders, searchTerm, orderStatusFilter, paymentStatusFilter])

  // Format price to currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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

  // Handle viewing invoice
  const handleViewInvoice = (order) => {
    setSelectedOrder(order)
    setIsInvoiceModalOpen(true)
  }

  // Handle editing order
  const handleEditOrder = (order) => {
    setOrderToEdit(order)
    setIsOrderModalOpen(true)
  }

  // Handle saving new order to Supabase
  const handleSaveOrder = async (orderData) => {
    if (!user) return

    try {
      // Prepare order data for Supabase
      const supabaseOrderData = {
        user_id: user.id,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_whatsapp: orderData.customerWhatsApp || orderData.customerPhone,
        customer_instagram: orderData.customerInstagram,
        total_price: orderData.totalPrice,
        order_status: orderData.orderStatus,
        payment_status: orderData.paymentStatus,
        payment_type: orderData.paymentType,
        notes: orderData.notes,
        products: orderData.products,
        source: orderData.source || 'WhatsApp',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([supabaseOrderData])
        .select()

      if (error) throw error

      // The real-time subscription will automatically update the list
      // But we can also optimistically add to local state
      if (data && data[0]) {
        const newOrder = {
          id: data[0].order_number,
          orderId: data[0].id,
          products: data[0].products || [],
          totalPrice: data[0].total_price || 0,
          date: new Date(data[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          orderStatus: data[0].order_status || 'Pending',
          paymentStatus: data[0].payment_status || 'Unpaid',
          customerName: data[0].customer_name || '',
          customerPhone: data[0].customer_phone || '',
          customerWhatsApp: data[0].customer_whatsapp || '',
          customerInstagram: data[0].customer_instagram || '',
          paymentType: data[0].payment_type || 'Cash',
          notes: data[0].notes || '',
          source: data[0].source || 'WhatsApp',
          invoiceDate: data[0].invoice_date || '',
          dueDate: data[0].due_date || '',
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        }
        setOrders((prev) => [newOrder, ...prev])
      }
    } catch (err) {
      console.error('Error creating order:', err.message)
      alert('Failed to create order: ' + err.message)
    }
  }

  // Handle updating existing order in Supabase
  const handleUpdateOrder = async (updatedOrderData) => {
    if (!user || !updatedOrderData.orderId) return

    try {
      const supabaseOrderData = {
        customer_name: updatedOrderData.customerName,
        customer_phone: updatedOrderData.customerPhone,
        customer_whatsapp: updatedOrderData.customerWhatsApp || updatedOrderData.customerPhone,
        customer_instagram: updatedOrderData.customerInstagram,
        total_price: updatedOrderData.totalPrice,
        order_status: updatedOrderData.orderStatus,
        payment_status: updatedOrderData.paymentStatus,
        payment_type: updatedOrderData.paymentType,
        notes: updatedOrderData.notes,
        products: updatedOrderData.products,
        source: updatedOrderData.source,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(supabaseOrderData)
        .eq('id', updatedOrderData.orderId)
        .eq('user_id', user.id)

      if (error) throw error

      // The real-time subscription will automatically update the list
      // But we can also optimistically update local state
      setOrders((prev) =>
        prev.map(order =>
          order.id === updatedOrderData.id 
            ? { 
                ...order,
                ...updatedOrderData,
                invoiceDate: order.invoiceDate, 
                dueDate: order.dueDate 
              } 
            : order
        )
      )
    } catch (err) {
      console.error('Error updating order:', err.message)
      alert('Failed to update order: ' + err.message)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Orders Management
        </h1>
        <button
          onClick={() => {
            setOrderToEdit(null)
            setIsOrderModalOpen(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Order
        </button>
      </div>
      <div className="mt-6">
        <div className="bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
            <p className="text-sm text-slate-400 mt-1">Manage orders from WhatsApp & Instagram</p>
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
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-slate-400">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg text-red-400">Error loading orders</p>
                <p className="text-sm text-slate-400 mt-1">{error}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#0A0A0A]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Product Names
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Edit Order
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
                          {order.products && order.products.length > 0 ? order.products.map(p => p.name).join(', ') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getSourceBadge(order.source)}`}>
                            {order.source}
                          </span>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewInvoice(order)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
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
            )}
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

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false)
          setOrderToEdit(null)
        }}
        onSave={handleSaveOrder}
        onUpdate={handleUpdateOrder}
        orderToEdit={orderToEdit}
        user={user}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />
    </div>
  )
}

export default MainTable

