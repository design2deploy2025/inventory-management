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
    status: 'Pending'
  })

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

  // Simplified supplier list (can be extended)
  const availableSuppliers = ['Local Wholesaler', 'Main Supplier', 'Import Co.', 'Custom Supplier']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.supplierName.trim()) {
      alert('Please enter a supplier name')
      return
    }
    if (formData.selectedProducts.length === 0) {
      alert('Please select at least one product')
      return
    }
    
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
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {poToEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Supplier</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-green-500"
              list="suppliers"
            />
            <datalist id="suppliers">
              {availableSuppliers.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          {/* Expected Delivery */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Expected Delivery</label>
            <input
              type="date"
              name="expectedDelivery"
              value={formData.expectedDelivery}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-green-500"
            />
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-4">Products to Order</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {products.map(product => {
                const isSelected = formData.selectedProducts.some(p => p.id === product.id)
                return (
                  <div 
                    key={product.id}
                    onClick={() => handleProductToggle(product)}
                    className={`p-4 border rounded-xl cursor-pointer hover:shadow-lg transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-500/5' 
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-slate-400">₹{product.price}</p>
                      </div>
                      {isSelected && <span className="text-green-400">✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected products with quantities */}
            {formData.selectedProducts.map(product => (
              <div key={product.id} className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-slate-400">₹{product.price} x</p>
                  </div>
                  <div className="flex items-center space-x-2">
<div className="flex items-center bg-gray-800 rounded-lg border border-gray-600">
                    <button
                    type='button'
                      onClick={() => decrementQuantity(product.id)}
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
                    type='button'
                      onClick={() => incrementQuantity(product.id)}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                    <span className="text-white font-medium">
                      ₹{(product.price * product.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Notes */}
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">Total Cost:</span>
                <span className="text-2xl font-bold text-green-400">
                  ₹{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 text-slate-400 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.selectedProducts.length === 0}
              className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
            >
              {poToEdit ? 'Update PO' : 'Create PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PurchaseOrderModal

