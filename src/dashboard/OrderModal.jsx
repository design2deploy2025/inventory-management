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
    customOrderId: '', // Custom order ID input
    customerName: '',
    customerPhone: '',
    customerInstagram: '',
    customerEmail: '',
    customerAddress: '',
    paymentType: 'Cash',
    paymentStatus: 'Unpaid',
    orderStatus: 'Pending',
    selectedProducts: [],
    notes: '',
    source: 'Instagram',
  })

  // Custom order ID toggle
  const [useCustomOrderId, setUseCustomOrderId] = useState(false)

  // Customer search dropdown state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const customerDropdownRef = useRef(null)

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
        .select('id, name, phone, instagram, insta, email, address')
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
      customer.insta?.toLowerCase().includes(query)
    ) // Show all matching results (no limit)
  }, [customers, customerSearchQuery])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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
          customOrderId: '', // Custom order ID not editable in edit mode
          customerName: orderToEdit.customerName || '',
          customerPhone: orderToEdit.customerPhone || '',
          customerInstagram: orderToEdit.customerInstagram || '',
          customerEmail: '',
          customerAddress: '',
          paymentType: orderToEdit.paymentType || 'Cash',
          paymentStatus: orderToEdit.paymentStatus || 'Unpaid',
          orderStatus: orderToEdit.orderStatus || 'Pending',
          selectedProducts: orderToEdit.products || [],
          notes: orderToEdit.notes || '',
          source: orderToEdit.source || 'Instagram',
        })
        setCustomerSearchQuery(orderToEdit.customerName || '')
        setUseCustomOrderId(false) // Disable custom order ID in edit mode
      } else {
        // Create mode: Show a placeholder - the actual order number will be 
        // generated by the database when saved, and we'll display it from there
        setFormData({
          orderId: 'Generating...', // Placeholder - DB will generate actual number
          customOrderId: '',
          customerName: '',
          customerPhone: '',
          customerInstagram: '',
          customerEmail: '',
          customerAddress: '',
          paymentType: 'Cash',
          paymentStatus: 'Unpaid',
          orderStatus: 'Pending',
          selectedProducts: [],
          notes: '',
          source: 'Instagram',
        })
        setCustomerSearchQuery('')
        setSelectedCustomerId(null)
        setUseCustomOrderId(false)
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

  // Check if customer with similar details already exists
  const checkExistingCustomer = async (customerData) => {
    try {
      // Build query to check for existing customer
      let query = supabase
        .from('customers')
        .select('id, name, phone, instagram, insta, email, address')
        .eq('user_id', user.id)
        .limit(10)

      // Check by name first (case insensitive)
      if (customerData.name) {
        const { data: nameMatches, error: nameError } = await supabase
          .from('customers')
          .select('id, name, phone, instagram, insta, email, address')
          .eq('user_id', user.id)
          .ilike('name', customerData.name)
          .limit(5)

        if (nameError) throw nameError

        if (nameMatches && nameMatches.length > 0) {
          return {
            exists: true,
            customer: nameMatches[0],
            field: 'name'
          }
        }
      }

      // Check by phone if provided
      if (customerData.phone) {
        const { data: phoneMatches, error: phoneError } = await supabase
          .from('customers')
          .select('id, name, phone, instagram, insta, email, address')
          .eq('user_id', user.id)
          .eq('phone', customerData.phone)
          .limit(5)

        if (phoneError) throw phoneError

        if (phoneMatches && phoneMatches.length > 0) {
          return {
            exists: true,
            customer: phoneMatches[0],
            field: 'phone'
          }
        }
      }

      // Check by instagram if provided
      if (customerData.instagram) {
        const { data: instaMatches, error: instaError } = await supabase
          .from('customers')
          .select('id, name, phone, instagram, insta, email, address')
          .eq('user_id', user.id)
          .or(`instagram.ilike.%${customerData.instagram}%,insta.ilike.%${customerData.instagram}%`)
          .limit(5)

        if (instaError) throw instaError

        if (instaMatches && instaMatches.length > 0) {
          return {
            exists: true,
            customer: instaMatches[0],
            field: 'instagram'
          }
        }
      }

      // Check by email if provided
      if (customerData.email) {
        const { data: emailMatches, error: emailError } = await supabase
          .from('customers')
          .select('id, name, phone, instagram, insta, email, address')
          .eq('user_id', user.id)
          .eq('email', customerData.email)
          .limit(5)

        if (emailError) throw emailError

        if (emailMatches && emailMatches.length > 0) {
          return {
            exists: true,
            customer: emailMatches[0],
            field: 'email'
          }
        }
      }

      return { exists: false, customer: null, field: null }
    } catch (err) {
      console.error('Error checking existing customer:', err.message)
      return { exists: false, customer: null, field: null }
    }
  }

  // Calculate total price
  const calculateTotal = () => {
    return formData.selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }

  // Handle save/create
  const handleSave = async () => {
    let customerId = selectedCustomerId

    // If it's a new customer (not selected from dropdown), check for duplicates and save
    // Only run this check when creating a new order (not editing)
    if (!isEditMode && !customerId && formData.customerName) {
      // Prepare customer data for checking
      const customerData = {
        name: formData.customerName,
        phone: formData.customerPhone || null,
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
            instagram: formData.customerInstagram || null,
            insta: formData.customerInstagram || null,
            email: formData.customerEmail || null,
            address: formData.customerAddress || null,
          })
          .select('id, name, phone, instagram, insta, email, address')
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

    // 🔧 FIXED: Strip products for update mode to prevent "column product does not exist"
    const baseOrderData = {
      // Only include id in edit mode - in create mode, DB generates order_number via trigger
      ...(isEditMode && { id: formData.orderId }),
      orderId: isEditMode ? orderToEdit?.orderId : null, // Include the UUID for editing
      customOrderNumber: !isEditMode && useCustomOrderId && formData.customOrderId ? formData.customOrderId.trim() : null, // Custom order number if provided
      customerId: customerId || orderToEdit?.customerId || null, // Include customer ID if available
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerInstagram: formData.customerInstagram,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress,
      paymentType: formData.paymentType,
      paymentStatus: formData.paymentStatus,
      orderStatus: formData.orderStatus,
      totalPrice: calculateTotal(),
      notes: formData.notes,
      source: formData.source,
      date: isEditMode 
        ? (orderToEdit?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: isEditMode ? orderToEdit?.createdAt : new Date().toISOString(),
    }
    
    const orderData = {
      ...baseOrderData,
      // Include products ONLY for CREATE (onSave), exclude for UPDATE (onUpdate)
      ...( !isEditMode ? { products: formData.selectedProducts } : {} )
    }
    
    console.log('📤 OrderModal sending:', isEditMode ? 'UPDATE (products stripped)' : 'CREATE (with products)')
    
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
      customOrderId: '',
      customerName: '',
      customerPhone: '',
      customerInstagram: '',
      customerEmail: '',
      customerAddress: '',
      paymentType: 'Cash',
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      selectedProducts: [],
      notes: '',
      source: 'Instagram',
    })
    setCustomerSearchQuery('')
    setSelectedCustomerId(null)
    setUseCustomOrderId(false)
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with fade animation */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        style={{
          opacity: isOpen ? 1 : 0,
        }}
      />

      {/* Modal container with scale and fade animation */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-7xl bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out max-h-[92vh] flex flex-col"
          style={{
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.95,
          }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
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
              className="p-2.5 text-slate-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Left column - Order & Customer Info */}
              <div className="xl:col-span-3 space-y-6">
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
                          readOnly
                          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors cursor-not-allowed opacity-75"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          {isEditMode ? 'Fixed' : (useCustomOrderId ? 'Custom' : 'Auto-generated')}
                        </span>
                      </div>
                    </div>

                    {/* Custom Order ID Toggle - Only in create mode */}
                    {!isEditMode && (
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          Custom Order ID
                        </label>
                        <button
                          type="button"
                          onClick={() => setUseCustomOrderId(!useCustomOrderId)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                            useCustomOrderId ? 'bg-indigo-600' : 'bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              useCustomOrderId ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-slate-500 mt-1">
                          {useCustomOrderId ? 'Enable to enter custom ID' : 'Enable for custom order ID'}
                        </span>
                      </div>
                    )}

                    {/* Custom Order ID Input - Only in create mode when enabled */}
                    {!isEditMode && useCustomOrderId && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          Enter Custom Order ID
                        </label>
                        <input
                          type="text"
                          name="customOrderId"
                          value={formData.customOrderId}
                          onChange={handleChange}
                          placeholder="e.g., MYSTORE-001, ORDER-123, INV-2024"
                          className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />
                        <span className="text-xs text-slate-500 mt-1 block">
                          Leave blank to auto-generate ORD-YY-XXX format
                        </span>
                      </div>
                    )}

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

                    {/* Source */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Source
                      </label>
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Call">Call</option>
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
                                        {customer.phone ? `+91 ${customer.phone?.slice(-10)}` : ''}
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
                  {/* Available Products - 3 column grid for better visibility */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {products.map((product) => {
                          const isSelected = formData.selectedProducts.some((p) => p.id === product.id || p.id === product.id)
                          return (
                            <div
                              key={product.id}
                              onClick={() => handleProductToggle(product)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                isSelected
                                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-indigo-500/20'
                                  : 'bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                                    isSelected
                                      ? 'bg-indigo-600 border-indigo-600'
                                      : 'border-gray-600 group-hover:border-gray-500'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400">{product.category}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-white flex-shrink-0">₹{product.price}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Selected Products List - Enhanced with better spacing */}
                      {formData.selectedProducts.length > 0 && (
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selected Products ({formData.selectedProducts.length})
                          </h4>
                          <div className="space-y-3">
                            {formData.selectedProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-4 p-4 bg-gray-900/80 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-200"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                  <p className="text-xs text-slate-400">₹{product.price} each</p>
                                </div>
                                
                                {/* Quantity */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400">Qty:</span>
                                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600">
                                    <button
                                      onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-gray-700 rounded-l-lg transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={product.quantity}
                                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                      className="w-12 px-1 py-1 text-sm bg-transparent border-x border-gray-600 rounded-none text-white text-center focus:outline-none focus:ring-0"
                                    />
                                    <button
                                      onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  </div>
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
                                      className="w-20 pl-5 pr-2 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    />
                                  </div>
                                </div>

                                {/* Line Total */}
                                <div className="text-right min-w-[90px]">
                                  <p className="text-sm font-bold text-white">
                                    ₹{(product.price * product.quantity).toFixed(2)}
                                  </p>
                                </div>

                                {/* Remove */}
                                <button
                                  onClick={() => handleRemoveProduct(product.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Remove product"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
              <div className="space-y-4">
                {/* Order Summary Card */}
                <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800 sticky top-4">
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Order Summary
                  </h3>

                  {/* Summary Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded">{formData.orderId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-slate-400">Items:</span>
                      <span className="text-white font-medium">{formData.selectedProducts.reduce((acc, p) => acc + p.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-slate-400">Payment:</span>
                      <span className="text-white">{formData.paymentType}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-slate-400">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        formData.orderStatus === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        formData.orderStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        formData.orderStatus === 'Processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        formData.orderStatus === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {formData.orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400">Source:</span>
                      <span className="text-white">{formData.source}</span>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="mt-5 pt-5 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-white">Total</span>
                      <span className="text-3xl font-bold text-white tracking-tight">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Order Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Add any special instructions..."
                      className="block w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-500 hover:bg-gray-800 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.customerName || formData.selectedProducts.length === 0}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-indigo-700 disabled:hover:shadow-lg disabled:hover:shadow-indigo-500/25"
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
