import React, { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Sample products data (fallback if no products in DB)
const sampleProducts = [
  { id: 1, name: 'Earthen Bottle', price: 48, category: 'Home & Garden' },
  { id: 2, name: 'Nomad Tumbler', price: 35, category: 'Electronics' },
  { id: 3, name: 'Focus Paper Refill', price: 89, category: 'Office Supplies' },
  { id: 4, name: 'Machined Mechanical Pencil', price: 35, category: 'Office Supplies' },
  { id: 5, name: 'Focus Card Tray', price: 64, category: 'Office Supplies' },
  { id: 6, name: 'Focus Multi-Pack', price: 39, category: 'Office Supplies' },
  { id: 7, name: 'Brass Scissors', price: 50, category: 'Office Supplies' },
  { id: 8, name: 'Focus Carry Pouch', price: 32, category: 'Accessories' },
]

const OrderModal = ({ isOpen, onClose, onSave, onUpdate, orderToEdit, user }) => {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    customerWhatsApp: '',
    customerInstagram: '',
    customerEmail: '',
    customerAddress: '',
    paymentType: 'Cash',
    paymentStatus: 'Unpaid',
    orderStatus: 'Pending',
    selectedProducts: [],
    notes: '',
    source: 'WhatsApp',
  })

  // Customer search dropdown state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const customerDropdownRef = useRef(null)

  const [nextOrderNumber, setNextOrderNumber] = useState(1)

  // Determine if we're in edit mode
  const isEditMode = !!orderToEdit

  // Fetch products from Supabase
  const fetchProducts = async () => {
    if (!user) return
    
    try {
      setLoadingProducts(true)
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category')
        .eq('user_id', user.id)
        .eq('status', 'Active')
        .order('name', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setProducts(data)
      } else {
        // Fallback to sample products if no products in DB
        setProducts(sampleProducts)
      }
    } catch (err) {
      console.error('Error fetching products:', err.message)
      // Fallback to sample products on error
      setProducts(sampleProducts)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Fetch customers from Supabase
  const fetchCustomers = async () => {
    if (!user) return
    
    try {
      setLoadingCustomers(true)
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp, instagram, insta, email, address')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err.message)
    } finally {
      setLoadingCustomers(false)
    }
  }

  // Filtered customers for dropdown search
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers // Show all customers when no search query
    const query = customerSearchQuery.toLowerCase()
    return customers.filter(customer => 
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.whatsapp?.includes(query) ||
      customer.insta?.toLowerCase().includes(query)
    ) // Show all matching results (no limit)
  }, [customers, customerSearchQuery])

  // Click outside handler for customer dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch products and customers when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchProducts()
      fetchCustomers()
    }
  }, [isOpen, user])

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && orderToEdit) {
        // Edit mode: pre-fill with existing order data
        setFormData({
          orderId: orderToEdit.id,
          customerName: orderToEdit.customerName || '',
          customerPhone: orderToEdit.customerPhone || '',
          customerWhatsApp: orderToEdit.customerWhatsApp || '',
          customerInstagram: orderToEdit.customerInstagram || '',
          customerEmail: '',
          customerAddress: '',
          paymentType: orderToEdit.paymentType || 'Cash',
          paymentStatus: orderToEdit.paymentStatus || 'Unpaid',
          orderStatus: orderToEdit.orderStatus || 'Pending',
          selectedProducts: orderToEdit.products || [],
          notes: orderToEdit.notes || '',
          source: orderToEdit.source || 'WhatsApp',
        })
        setCustomerSearchQuery(orderToEdit.customerName || '')
      } else {
        // Create mode: generate new order ID
        const orderNumber = Math.floor(Math.random() * 900) + 100
        setNextOrderNumber(orderNumber)
        setFormData({
          orderId: `#ORD-${orderNumber}`,
          customerName: '',
          customerPhone: '',
          customerWhatsApp: '',
          customerInstagram: '',
          customerEmail: '',
          customerAddress: '',
          paymentType: 'Cash',
          paymentStatus: 'Unpaid',
          orderStatus: 'Pending',
          selectedProducts: [],
          notes: '',
          source: 'WhatsApp',
        })
        setCustomerSearchQuery('')
        setSelectedCustomerId(null)
      }
    }
  }, [isOpen, isEditMode, orderToEdit])

  // Handle customer search input
  const handleCustomerSearch = (e) => {
    const value = e.target.value
    setCustomerSearchQuery(value)
    setFormData((prev) => ({
      ...prev,
      customerName: value,
    }))
    setSelectedCustomerId(null)
    setShowCustomerDropdown(true)
  }

  // Handle selecting a customer from dropdown
  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.name || '',
      customerPhone: customer.phone || '',
      customerWhatsApp: customer.whatsapp || customer.phone || '',
      customerInstagram: customer.instagram || customer.insta || '',
      customerEmail: customer.email || '',
      customerAddress: customer.address || '',
    }))
    setCustomerSearchQuery(customer.name || '')
    setSelectedCustomerId(customer.id)
    setShowCustomerDropdown(false)
  }

  // Clear customer selection
  const handleClearCustomer = () => {
    setFormData((prev) => ({
      ...prev,
      customerName: '',
      customerPhone: '',
      customerWhatsApp: '',
      customerInstagram: '',
      customerEmail: '',
      customerAddress: '',
    }))
    setCustomerSearchQuery('')
    setSelectedCustomerId(null)
    setShowCustomerDropdown(false)
  }

  // Handle customer selection (legacy - from dropdown)
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value
    if (!customerId) {
      handleClearCustomer()
      return
    }

    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      handleSelectCustomer(customer)
    }
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle product selection
  const handleProductToggle = (product) => {
    setFormData((prev) => {
      const isSelected = prev.selectedProducts.some((p) => p.id === product.id)
      if (isSelected) {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter((p) => p.id !== product.id),
        }
      } else {
        return {
          ...prev,
          selectedProducts: [...prev.selectedProducts, { ...product, quantity: 1 }],
        }
      }
    })
  }

  // Handle product quantity change
  const handleQuantityChange = (productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1)
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity: qty } : p
      ),
    }))
  }

  // Handle individual product price override
  const handlePriceChange = (productId, price) => {
    const newPrice = parseFloat(price) || 0
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) =>
        p.id === productId ? { ...p, price: newPrice } : p
      ),
    }))
  }

  // Remove product from selection
  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((p) => p.id !== productId),
    }))
  }

  // Calculate total price
  const calculateTotal = () => {
    return formData.selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }

  // Check if customer with similar details already exists
  const checkExistingCustomer = async (customerData) => {
    if (!user) return { exists: false, customer: null }
    
    try {
      // Build query to find existing customer
      let query = supabase
        .from('customers')
        .select('id, name, phone, whatsapp, instagram, insta, email, address')
        .eq('user_id', user.id)
        .limit(1)

      // Check by phone if provided
      if (customerData.phone) {
        const { data: phoneData } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp, instagram, insta, email, address')
          .eq('user_id', user.id)
          .eq('phone', customerData.phone)
          .limit(1)
        
        if (phoneData && phoneData.length > 0) {
          return { exists: true, customer: phoneData[0], field: 'phone' }
        }
      }

      // Check by whatsapp if provided
      if (customerData.whatsapp) {
        const { data: whatsappData } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp, instagram, insta, email, address')
          .eq('user_id', user.id)
          .eq('whatsapp', customerData.whatsapp)
          .limit(1)
        
        if (whatsappData && whatsappData.length > 0) {
          return { exists: true, customer: whatsappData[0], field: 'whatsapp' }
        }
      }

      // Check by instagram/insta if provided
      if (customerData.instagram) {
        const { data: instaData } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp, instagram, insta, email, address')
          .eq('user_id', user.id)
          .eq('instagram', customerData.instagram.toLowerCase())
          .limit(1)
        
        if (instaData && instaData.length > 0) {
          return { exists: true, customer: instaData[0], field: 'instagram' }
        }
      }

      // Check by email if provided
      if (customerData.email) {
        const { data: emailData } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp, instagram, insta, email, address')
          .eq('user_id', user.id)
          .eq('email', customerData.email.toLowerCase())
          .limit(1)
        
        if (emailData && emailData.length > 0) {
          return { exists: true, customer: emailData[0], field: 'email' }
        }
      }

      return { exists: false, customer: null, field: null }
    } catch (err) {
      console.error('Error checking existing customer:', err.message)
      return { exists: false, customer: null, field: null }
    }
  }

  // Handle save/create
  const handleSave = async () => {
    let customerId = selectedCustomerId

    // If it's a new customer (not selected from dropdown), check for duplicates and save
    if (!customerId && formData.customerName) {
      // Prepare customer data for checking
      const customerData = {
        name: formData.customerName,
        phone: formData.customerPhone || null,
        whatsapp: formData.customerWhatsApp || formData.customerPhone || null,
        instagram: formData.customerInstagram || null,
        email: formData.customerEmail || null,
      }

      // Check if customer with similar details already exists
      const existingCheck = await checkExistingCustomer(customerData)
      
      if (existingCheck.exists) {
        const existing = existingCheck.customer
        const fieldName = existingCheck.field
        
        // Show confirmation dialog
        const useExisting = window.confirm(
          `A customer with the same ${fieldName} already exists:\n\n` +
          `Name: ${existing.name}\n` +
          `Phone: ${existing.phone || 'N/A'}\n` +
          `Instagram: ${existing.instagram || existing.insta || 'N/A'}\n` +
          `Email: ${existing.email || 'N/A'}\n\n` +
          `Do you want to use this existing customer instead?`
        )
        
        if (useExisting) {
          // Use existing customer
          customerId = existing.id
          handleSelectCustomer(existing)
          return // Exit the function, customer is already selected
        } else {
          // User chose to create new anyway - continue with creation
          // Add a note that duplicate check was bypassed
          console.log('User chose to create new customer despite duplicate')
        }
      }

      // Save new customer to database
      try {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            name: formData.customerName,
            phone: formData.customerPhone || null,
            whatsapp: formData.customerWhatsApp || formData.customerPhone || null,
            instagram: formData.customerInstagram || null,
            insta: formData.customerInstagram || null,
            email: formData.customerEmail || null,
            address: formData.customerAddress || null,
          })
          .select('id, name, phone, whatsapp, instagram, insta, email, address')
          .single()

        if (customerError) throw customerError
        if (newCustomer) {
          customerId = newCustomer.id
          // Update local customers state with the new customer
          setCustomers(prev => [...prev, newCustomer])
        }
      } catch (err) {
        console.error('Error saving customer:', err.message)
        alert('Failed to create customer: ' + err.message)
        return // Don't proceed with order creation if customer save fails
      }
    }

    const orderData = {
      id: formData.orderId,
      customerId: customerId, // Include customer ID if available
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerWhatsApp: formData.customerWhatsApp,
      customerInstagram: formData.customerInstagram,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress,
      paymentType: formData.paymentType,
      paymentStatus: formData.paymentStatus,
      orderStatus: formData.orderStatus,
      products: formData.selectedProducts,
      totalPrice: calculateTotal(),
      notes: formData.notes,
      source: formData.source,
      date: isEditMode 
        ? (orderToEdit?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: isEditMode ? orderToEdit?.createdAt : new Date().toISOString(),
    }
    
    if (isEditMode) {
      if (onUpdate) {
        onUpdate(orderData)
      }
    } else {
      if (onSave) {
        onSave(orderData)
      }
    }
    onClose()
    
    // Reset form
    setFormData({
      orderId: '',
      customerName: '',
      customerPhone: '',
      customerWhatsApp: '',
      customerInstagram: '',
      customerEmail: '',
      customerAddress: '',
      paymentType: 'Cash',
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      selectedProducts: [],
      notes: '',
      source: 'WhatsApp',
    })
    setCustomerSearchQuery('')
    setSelectedCustomerId(null)
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isEditMode ? 'Edit Order' : 'Create New Order'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isEditMode ? 'Update order details below' : 'Fill in the order details below'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Order & Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Details Card */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Order ID (Auto-generated in create mode) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Order ID {isEditMode && <span className="text-xs text-slate-500">(Fixed in edit mode)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="orderId"
                          value={formData.orderId}
                          readOnly={isEditMode}
                          className={`block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${isEditMode ? 'cursor-not-allowed opacity-75' : ''}`}
                        />
                        {!isEditMode && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            Auto-generated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Payment Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Payment Type
                      </label>
                      <select
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Wallet">Wallet</option>
                        <option value="COD">Cash on Delivery</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    {/* Order Status */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Order Status
                      </label>
                      <select
                        name="orderStatus"
                        value={formData.orderStatus}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Details Card */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Details
                    {selectedCustomerId && (
                      <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Existing Customer
                      </span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Name with Search Dropdown */}
                    <div className="relative" ref={customerDropdownRef}>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Customer Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="customerSearch"
                          value={customerSearchQuery}
                          onChange={handleCustomerSearch}
                          onFocus={() => setShowCustomerDropdown(true)}
                          placeholder="Search or enter customer name..."
                          autoComplete="off"
                          className="block w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />
                        {(customerSearchQuery || selectedCustomerId) && (
                          <button
                            type="button"
                            onClick={handleClearCustomer}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <svg className="h-4 w-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* Customer Dropdown */}
                      {showCustomerDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-auto">
                          {loadingCustomers ? (
                            <div className="px-4 py-3 text-sm text-slate-400">Loading customers...</div>
                          ) : filteredCustomers.length > 0 ? (
                            <>
                              {!selectedCustomerId && customerSearchQuery && (
                                <div 
                                  className="px-4 py-3 text-sm text-indigo-400 border-b border-gray-700 cursor-pointer hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => {
                                    // This will create a new customer with the entered name
                                    setShowCustomerDropdown(false)
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add new customer: <span className="font-medium">{customerSearchQuery}</span>
                                </div>
                              )}
                              {filteredCustomers.map((customer) => (
                                <div
                                  key={customer.id}
                                  className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                                  onClick={() => handleSelectCustomer(customer)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-white">{customer.name}</p>
                                      <p className="text-xs text-slate-400">
                                        {customer.phone || customer.whatsapp ? `+91 ${(customer.phone || customer.whatsapp)?.slice(-10)}` : ''}
                                        {customer.phone && customer.whatsapp ? ' • ' : ''}
                                        {customer.insta || customer.instagram ? `@${customer.insta || customer.instagram}` : ''}
                                      </p>
                                    </div>
                                    {customer.id === selectedCustomerId && (
                                      <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : customerSearchQuery ? (
                            <div 
                              className="px-4 py-3 text-sm text-indigo-400 cursor-pointer hover:bg-gray-700 flex items-center gap-2"
                              onClick={() => setShowCustomerDropdown(false)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Add new customer: <span className="font-medium">{customerSearchQuery}</span>
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-400">No customers found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="customerWhatsApp"
                        value={formData.customerWhatsApp}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        placeholder="customer@example.com"
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Instagram Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                        <input
                          type="text"
                          name="customerInstagram"
                          value={formData.customerInstagram}
                          onChange={handleChange}
                          placeholder="username"
                          className="block w-full pl-8 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Address
                      </label>
                      <textarea
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleChange}
                        placeholder="Enter customer address..."
                        rows={2}
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Products Selection Card */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Select Products
                  </h3>

                  {/* Loading State */}
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                      <span className="ml-3 text-slate-400">Loading products...</span>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No products found</p>
                      <p className="text-sm text-slate-500 mt-1">Add products to your inventory first</p>
                    </div>
                  ) : (
                    <>
                      {/* Available Products */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {products.map((product) => {
                          const isSelected = formData.selectedProducts.some((p) => p.id === product.id || p.id === product.id)
                          return (
                            <div
                              key={product.id}
                              onClick={() => handleProductToggle(product)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-indigo-500/10 border-indigo-500/50'
                                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600'
                                      : 'border-gray-600'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{product.name}</p>
                                    <p className="text-xs text-slate-400">{product.category}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-white">₹{product.price}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Selected Products List */}
                      {formData.selectedProducts.length > 0 && (
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          <h4 className="text-sm font-medium text-white mb-3">Selected Products</h4>
                          <div className="space-y-3">
                            {formData.selectedProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{product.name}</p>
                                </div>
                                
                                {/* Quantity */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400">Qty:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                    className="w-16 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>

                                {/* Price Override */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400">Price:</span>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={product.price}
                                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                      className="w-20 pl-5 pr-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                </div>

                                {/* Line Total */}
                                <div className="text-right min-w-[80px]">
                                  <p className="text-sm font-semibold text-white">
                                    ₹{(product.price * product.quantity).toFixed(2)}
                                  </p>
                                </div>

                                {/* Remove */}
                                <button
                                  onClick={() => handleRemoveProduct(product.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary Card */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 sticky top-4">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Order Summary
                  </h3>

                  {/* Summary Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="text-white font-mono">{formData.orderId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Items:</span>
                      <span className="text-white">{formData.selectedProducts.reduce((acc, p) => acc + p.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment:</span>
                      <span className="text-white">{formData.paymentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        formData.orderStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        formData.orderStatus === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        formData.orderStatus === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                        formData.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {formData.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-white">Total</span>
                      <span className="text-2xl font-bold text-white">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Order Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Add any special instructions..."
                      className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.customerName || formData.selectedProducts.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              {isEditMode ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderModal
