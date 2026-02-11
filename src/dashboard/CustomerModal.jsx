import React, { useState, useEffect } from 'react'

const CustomerModal = ({ isOpen, onClose, onSave, onUpdate, customerToEdit }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    insta: '',
  })

  // Determine if we're in edit mode
  const isEditMode = !!customerToEdit

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && customerToEdit) {
        // Edit mode: pre-fill with existing customer data
        setFormData({
          id: customerToEdit.id,
          name: customerToEdit.name || '',
          phone: customerToEdit.phone || '',
          insta: customerToEdit.insta || '',
        })
      } else {
        // Create mode: generate new customer ID
        const customerNumber = Math.floor(Math.random() * 900) + 1
        const paddedNumber = String(customerNumber).padStart(3, '0')
        setFormData({
          id: `CUST-${paddedNumber}`,
          name: '',
          phone: '',
          insta: '',
        })
      }
    }
  }, [isOpen, isEditMode, customerToEdit])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle save/create
  const handleSave = () => {
    const customerData = {
      id: formData.id,
      name: formData.name,
      phone: formData.phone,
      insta: formData.insta,
    }
    
    if (isEditMode) {
      if (onUpdate) {
        onUpdate(customerData)
      }
    } else {
      if (onSave) {
        onSave(customerData)
      }
    }
    onClose()
    
    // Reset form
    setFormData({
      id: '',
      name: '',
      phone: '',
      insta: '',
    })
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
        <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isEditMode ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isEditMode ? 'Update customer details below' : 'Fill in the customer details below'}
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
            <div className="space-y-4">
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Customer ID {isEditMode && <span className="text-xs text-slate-500">(Fixed in edit mode)</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
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

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Customer Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="insta"
                    value={formData.insta}
                    onChange={handleChange}
                    placeholder="username"
                    className="block w-full pl-11 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-400 font-medium">Note</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Additional customer information like lifetime value, repeat orders, and last order details will be automatically populated when orders are created for this customer.
                    </p>
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
              disabled={!formData.name}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              {isEditMode ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerModal

