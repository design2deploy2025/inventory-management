import React, { useState, useMemo, useEffect } from 'react'
import PurchaseOrderModal from './PurchaseOrderModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PurchaseOrders = () => {
  const { user } = useAuth()
  
  // State for purchase orders from Supabase
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination
  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)
  
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)
  const [poToEdit, setPoToEdit] = useState(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [poStatusFilter, setPoStatusFilter] = useState('All')

  // Fetch purchase orders with pagination from Supabase (table: purchase_orders)
  const fetchPurchaseOrders = async (page = currentPage, resetTotal = false) => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('purchase_orders')
        .select('*', { count: resetTotal ? 'exact' : 'head' })
        .eq('user_id', user.id)

      // Search: PO ID (po_number), supplier_name, products (JSON contains)
      if (searchTerm) {
        query = query.or(`po_number.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%`)
      }

      // Status filter
      if (poStatusFilter !== 'All') {
        query = query.eq('status', poStatusFilter)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data, count, error } = await query

      if (error) throw error

      if (resetTotal && count !== null) {
        setTotalCount(count)
      }

      // Transform data
      const transformedPOs = data?.map(po => ({
        id: po.po_number || po.id,
        poId: po.id,
        supplier: po.supplier_name || 'Unknown Supplier',
        products: po.products || [],
        totalCost: po.total_cost || 0,
        expectedDate: po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        status: po.status || 'Pending',
        paymentStatus: po.payment_status || 'Unpaid',
        notes: po.notes || '',
        created_at: po.created_at,
        updated_at: po.updated_at
      })) || []

      setPurchaseOrders(transformedPOs)
    } catch (err) {
      console.error('Error fetching purchase orders:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPurchaseOrders(1, true)
    }
  }, [user])

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const poChannel = supabase
      .channel('purchase-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_orders',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchPurchaseOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(poChannel)
    }
  }, [user])

// Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'Partially Received':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'Unpaid':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'Partially Paid':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  // Clear all filters and reset pagination
  const clearFilters = () => {
    setSearchTerm('')
    setPoStatusFilter('All')
    setCurrentPage(1)
    fetchPurchaseOrders(1, true)
  }

  // Handle filter changes - reset to page 1
  const handleFilterChange = () => {
    setCurrentPage(1)
    fetchPurchaseOrders(1, true)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchPurchaseOrders(page)
  }

  const hasActiveFilters = searchTerm !== '' || poStatusFilter !== 'All'

  // Handlers
  const handleEditPO = (po) => {
    setPoToEdit({
      ...po,
      supplierName: po.supplier,
      status: po.status,
      paymentStatus: po.paymentStatus
    })
    setIsPOModalOpen(true)
  }

  const handleReceivePO = async (po) => {
    if (!confirm(`Mark PO ${po.id} as received and update stock?`)) return
    
    try {
      // Update PO status
      const { error: updateError } = await supabase
        .from('purchase_orders')
        .update({ 
          status: 'Received', 
          received_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', po.poId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Add stock for each product
      for (const product of po.products) {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', product.id)
          .eq('user_id', user.id)
          .single()

        const newQuantity = (currentProduct?.quantity || 0) + (product.quantity || 1)

        await supabase
          .from('products')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', product.id)
          .eq('user_id', user.id)

        // Log stock history
        await supabase.from('stock_history').insert({
          user_id: user.id,
          product_id: product.id,
          quantity_change: product.quantity || 1,
          previous_quantity: currentProduct?.quantity || 0,
          new_quantity: newQuantity,
          reason: `Purchase Order #${po.id} received`
        })
      }

      fetchPurchaseOrders() // Refresh
    } catch (err) {
      alert('Error receiving PO: ' + err.message)
    }
  }

  const handleSavePO = async (poData) => {
    if (!user) return;

    try {
      const supabaseData = {
        user_id: user.id,
        supplier_name: poData.supplierName,
        products: poData.selectedProducts,
        total_cost: parseFloat(poData.totalCost) || 0,
        status: poData.status || 'Pending',
        payment_status: poData.paymentStatus || 'Unpaid',
        expected_delivery: poData.expectedDelivery,
        notes: poData.notes
      };

      console.log('Saving PO data:', supabaseData); // Debug log

      let result;
      if (poToEdit) {
        // Update
        const { error } = await supabase
          .from('purchase_orders')
          .update(supabaseData)
          .eq('id', poToEdit.poId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Create with retry for po_number conflict
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          try {
            result = await supabase
              .from('purchase_orders')
              .insert([supabaseData])
              .select()
              .single();
            break;
          } catch (insertErr) {
            attempts++;
            if (insertErr.message.includes('duplicate key value violates unique constraint "purchase_orders_po_number_key"') && attempts < maxAttempts) {
              console.log(`PO number conflict (attempt ${attempts}), retrying...`);
              await new Promise(resolve => setTimeout(resolve, 100));
              continue;
            }
            throw insertErr;
          }
        }
        if (!result?.data) throw new Error('Failed to create PO');
      }

      setIsPOModalOpen(false);
      setPoToEdit(null);
      fetchPurchaseOrders();
    } catch (err) {
      console.error('Full PO save error:', err);
      console.error('Supabase error code:', err.code);
      console.error('Supabase error details:', err.details);
      
      let userMessage = `Failed to save PO: ${err.message}`;
      if (err.message.includes('supplier_name')) {
        userMessage = 'Supplier name is required and cannot be empty.';
      } else if (err.message.includes('products')) {
        userMessage = 'Invalid products data. Please select products and quantities.';
      } else if (err.code === 'P0001') {
        userMessage = 'Database constraint violation. Please check supplier/products data.';
      }
      
      alert(userMessage);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Purchase Orders
        </h1>
        <button
          onClick={() => {
            setPoToEdit(null)
            setIsPOModalOpen(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New PO
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-gray-800 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Incoming Purchase Orders</h2>
          <p className="text-sm text-slate-400 mt-1">Manage supplier orders and stock receipts</p>
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
                placeholder="Search PO ID, Supplier, Products..."
                value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilterChange()
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-[#1a1a1a] text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
              />
            </div>
            <select
              value={poStatusFilter}
              onChange={(e) => {
                setPoStatusFilter(e.target.value)
                handleFilterChange()
              }}
              className="min-w-[150px] py-2 pl-3 pr-8 border border-gray-700 rounded-md bg-[#1a1a1a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500">
                Clear
              </button>
            )}
            <div className="ml-auto text-sm text-slate-400">
              {purchaseOrders.length} of {totalCount} POs
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="mt-4 text-slate-400">Loading purchase orders...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg text-red-400">{error}</p>
              <button onClick={fetchPurchaseOrders} className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Retry
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">PO ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Expected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-900/50">
                    <td className="px-6 py-4 text-sm font-medium text-white">{po.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{po.supplier}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {po.products.map(p => p.name).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">{formatPrice(po.totalCost)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{po.expectedDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusBadge(po.paymentStatus)}`}>
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditPO(po)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                      {po.status !== 'Received' && (
                        <button
                          onClick={() => handleReceivePO(po)}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                        >
                          Receive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                      <svg className="h-12 w-12 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg">No purchase orders</p>
                      <p className="text-sm mt-1">Create your first PO to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - needs PurchaseOrderModal component */}
      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setPoToEdit(null);
        }}
        onSave={handleSavePO}
        onUpdate={handleSavePO}
        poToEdit={poToEdit}
        user={user}
      />
    </div>
  )
}

export default PurchaseOrders

