import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PurchaseOrderModal = ({ isOpen, onClose, onSave, onUpdate, poToEdit, user }) => {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [formData, setFormData] = useState({
    supplierName: '',
    selectedProducts: [],
    expectedDelivery: '',
    notes: '',
    status: 'Pending',
    paymentStatus: 'Unpaid'
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch products
  useEffect(() => {
    if (isOpen && user) {
      supabase
        .from('products')
        .select('id, name, price, category')
        .eq('user_id', user.id)
        .order('name')
        .then(({ data }) => setProducts(data || []))
    }
  }, [isOpen, user])

  // Populate form when editing
  useEffect(() => {
    if (poToEdit && isOpen) {
      setFormData({
        supplierName: poToEdit.supplierName || poToEdit.supplier || '',
        selectedProducts: poToEdit.products || poToEdit.selectedProducts || [],
        expectedDelivery: poToEdit.expectedDate ? poToEdit.expectedDate.split('/').reverse().join('-') : '',
        notes: poToEdit.notes || '',
        status: poToEdit.status || 'Pending',
        paymentStatus: poToEdit.paymentStatus || 'Unpaid'
      })
      setErrors({})
    } else if (isOpen) {
      setFormData({
        supplierName: '',
        selectedProducts: [],
        expectedDelivery: '',
        notes: '',
        status: 'Pending',
        paymentStatus: 'Unpaid'
      })
      setErrors({})
    }
  }, [poToEdit, isOpen])

// Status badges preview
  const getStatusBadgeClass = (status) => {
    const base = 'inline-flex px-3 py-1 rounded-full text-xs font-semibold border'
    switch (status) {
      case 'Received':
        return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/30`
      case 'Pending':
        return `${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/30`
      case 'Cancelled':
        return `${base} bg-red-500/10 text-red-400 border-red-500/30`
      case 'Partially Received':
        return `${base} bg-blue-500/10 text-blue-400 border-blue-500/30`
      default:
        return `${base} bg-gray-500/10 text-gray-400 border-gray-500/30`
    }
  }

  const getPaymentStatusBadgeClass = (status) => {
    const base = 'inline-flex px-3 py-1 rounded-full text-xs font-semibold border'
    switch (status) {
      case 'Paid':
        return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/30`
      case 'Unpaid':
        return `${base} bg-orange-500/10 text-orange-400 border-orange-500/30`
      case 'Partially Paid':
        return `${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/30`
      default:
        return `${base} bg-gray-500/10 text-gray-400 border-gray-500/30`
    }
  }

  // Simplified supplier list (can be extended)
  const availableSuppliers = ['Local Wholesaler', 'Main Supplier', 'Import Co.', 'Custom Supplier']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleProductToggle = (product) => {
    setFormData(prev => {
      const isSelected = prev.selectedProducts.some(p => p.id === product.id)
      if (isSelected) {
        return { ...prev, selectedProducts: prev.selectedProducts.filter(p => p.id !== product.id) }
      }
      return { ...prev, selectedProducts: [...prev.selectedProducts, { ...product, quantity: 1 }]}
    })
  }

 const incrementQuantity = (productId) => {
  setFormData(prev => ({
    ...prev,
    selectedProducts: prev.selectedProducts.map(p =>
      p.id === productId
        ? { ...p, quantity: (p.quantity || 1) + 1 }
        : p
    )
  }))
}

 const handleQuantityChange = (productId, quantityStr) => {
  const quantity = Math.max(1, parseInt(quantityStr) || 1)
  setFormData(prev => ({
    ...prev,
    selectedProducts: prev.selectedProducts.map(p =>
      p.id === productId ? { ...p, quantity } : p
    )
  }))
}

const decrementQuantity = (productId) => {
  setFormData(prev => ({
    ...prev,
    selectedProducts: prev.selectedProducts.map(p =>
      p.id === productId
        ? { ...p, quantity: Math.max(1, (p.quantity || 1) - 1) }
        : p
    )
  }))
}

  const calculateTotal = () => {
    return formData.selectedProducts.reduce((total, p) => total + (p.price * p.quantity), 0)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required'
    }
    
    if (formData.selectedProducts.length === 0) {
      newErrors.products = 'Please select at least one product'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const poData = {
        ...formData,
        totalCost: calculateTotal(),
        userId: user.id,
        poToEditId: poToEdit?.poId
      }
      
      // Ensure quantities are integers
      poData.selectedProducts = poData.selectedProducts.map(p => ({
        ...p,
        quantity: parseInt(p.quantity) || 1
      }))
      
      onSave(poData)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
  <h2 className="text-xl font-bold text-white">
    {poToEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
  </h2>

  <button
    type="button"
    onClick={onClose}
    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
    aria-label="Close modal"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Order Details Section */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-3">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="supplierName" className="block text-sm font-medium text-slate-400 mb-2">
                    Supplier <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="supplierName"
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-900 border rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.supplierName ? 'border-red-500 ring-red-400' : 'border-gray-700 hover:border-gray-500'
                    }`}
                    list="suppliers"
                    aria-invalid={!!errors.supplierName}
                    aria-describedby={errors.supplierName ? "supplier-error" : undefined}
                  />
                  {errors.supplierName && (
                    <p id="supplier-error" className="mt-1 text-sm text-red-400">{errors.supplierName}</p>
                  )}
                  <datalist id="suppliers">
                    {availableSuppliers.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="expectedDelivery" className="block text-sm font-medium text-slate-400 mb-2">
                    Expected Delivery
                  </label>
                  <input
                    id="expectedDelivery"
                    type="date"
                    name="expectedDelivery"
                    value={formData.expectedDelivery}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-3">Order Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-400 mb-2">Order Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-500 transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-slate-400 mb-2">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-500 transition-all"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-3">Products to Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto">
              {products.map(product => {
                const isSelected = formData.selectedProducts.some(p => p.id === product.id)
                return (
                  <div 
                    key={product.id}
                    onClick={() => handleProductToggle(product)}
                    className={`p-5 border-2 rounded-2xl cursor-pointer hover:shadow-xl transition-all group ${
                      isSelected 
                        ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/30 shadow-green-500/25' 
                        : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleProductToggle(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white group-hover:text-green-400 transition-colors">{product.name}</p>
                        <p className="text-sm text-slate-400 mt-1">₹{product.price.toLocaleString()}</p>
                      </div>
                      {isSelected && <span className="text-green-400 text-lg font-bold">✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected products list */}
            <div className="space-y-3">
              {formData.selectedProducts.length > 0 ? (
                formData.selectedProducts.map(product => (
                  <div key={product.id} className="p-5 bg-gray-800/50 rounded-2xl border border-green-500/30 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-lg">{product.name}</p>
                        <p className="text-sm text-slate-400">Unit Price: ₹{product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-900/80 rounded-xl border border-gray-600 p-1">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(product.id)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex-shrink-0"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-16 p-2 text-lg font-medium bg-transparent border-0 text-center text-white focus:outline-none focus:ring-1 focus:ring-green-500 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label={`Quantity for ${product.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => incrementQuantity(product.id)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex-shrink-0"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="text-xl font-bold text-green-400 min-w-[100px] text-right">
                          ₹{(product.price * product.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-500 text-lg">No products selected yet</p>
              )}
            </div>
            </div>

          {/* Subtotal & Notes */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-green-400">Total Cost</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ₹{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-400 mb-2">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-500 transition-all resize-vertical"
                placeholder="Additional notes about this purchase order..."
              />
            </div>
          </div>

          {errors.products && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <p className="text-sm text-red-400 font-medium">{errors.products}</p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 p-4 text-slate-400 border-2 border-gray-700 rounded-xl hover:border-gray-500 hover:bg-gray-800 hover:text-white transition-all font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.selectedProducts.length === 0}
              className="flex-1 p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={poToEdit ? 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z' : 'M12 4v16m8-8H4'} />
                  </svg>
                  {poToEdit ? 'Update PO' : 'Create PO'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PurchaseOrderModal

