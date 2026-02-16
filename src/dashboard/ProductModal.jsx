import React, { useState, useEffect } from 'react'

const ProductModal = ({ isOpen, onClose, product, onSave, onDelete, user }) => {
  const [formData, setFormData] = useState({
    id: '',
    productId: '',
    name: '',
    price: '',
    description: '',
    category: '',
    quantity: '',
    sku: '',
    status: 'Active',
    imageSrc: '',
    imageAlt: '',
    totalSold: 0,
    tags: [],
    isNew: true,
  })
  
  // Separate state for tags input (comma-separated string)
  const [tagsInput, setTagsInput] = useState('')
  
  const [uploadedFile, setUploadedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Categories for dropdown
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Food & Beverages',
    'Office Supplies',
    'Other',
  ]

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      // Convert tags array to comma-separated string
      const tagsString = Array.isArray(product.tags) 
        ? product.tags.join(', ') 
        : ''
      
      setFormData({
        id: product.id || '',
        productId: product.productId || product.id || '',
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || '',
        quantity: product.quantity || '',
        sku: product.sku || '',
        status: product.status || 'Active',
        imageSrc: product.imageSrc || '',
        imageAlt: product.imageAlt || '',
        totalSold: product.totalSold || 0,
        tags: product.tags || [],
        isNew: product.isNew !== undefined ? product.isNew : !product.id,
      })
      setTagsInput(tagsString)
      // Set image preview from product data
      if (product.imageSrc) {
        setImagePreview(product.imageSrc)
      } else {
        setImagePreview('')
      }
    }
  }, [product])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle tags input change
  const handleTagsChange = (e) => {
    const value = e.target.value
    setTagsInput(value)
    // Convert comma-separated string to array
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setFormData((prev) => ({
      ...prev,
      tags: tagsArray,
    }))
  }

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setFormData((prev) => ({
        ...prev,
        imageSrc: previewUrl,
        imageAlt: file.name,
      }))
    }
  }

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave({ ...formData })
    }
    onClose()
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
        <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {formData.isNew ? 'Add Product' : 'Edit Product'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {formData.isNew ? 'Add a new product to your catalog' : 'Update product information'}
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
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Image and basic info */}
              <div className="space-y-6">
                {/* Image preview */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Product Image
                  </label>
                  <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <img
                      src={imagePreview || 'https://via.placeholder.com/400'}
                      alt={formData.imageAlt || 'Product image'}
                      className="w-full h-full object-cover"
                    />
                    {imagePreview && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm">Click to preview</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white cursor-pointer hover:bg-gray-800 hover:border-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Image
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {uploadedFile && (
                      <p className="mt-2 text-xs text-emerald-400">
                        Selected: {uploadedFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Price and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price.replace(/[₹$]/g, '')}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="block w-full pl-8 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* SKU and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="SKU-XXX"
                      className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === 'Active'}
                        onChange={handleChange}
                        className="mr-2 w-4 h-4 text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500"
                      />
                      <span className="text-white text-sm">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === 'Inactive'}
                        onChange={handleChange}
                        className="mr-2 w-4 h-4 text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500"
                      />
                      <span className="text-white text-sm">Inactive</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="Discontinued"
                        checked={formData.status === 'Discontinued'}
                        onChange={handleChange}
                        className="mr-2 w-4 h-4 text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500"
                      />
                      <span className="text-white text-sm">Discontinued</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right column - Description and additional info */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Enter product description..."
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>

                {/* Additional Info Card */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                  <h4 className="text-sm font-medium text-white mb-3">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Product ID:</span>
                      <span className="text-white font-mono">#{formData.id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Modified:</span>
                      <span className="text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stock Value:</span>
                      <span className="text-white">
                        {formData.price && formData.quantity
                          ? `₹${(parseFloat(formData.price.replace(/[₹$]/g, '')) * parseInt(formData.quantity)).toFixed(2)}`
                          : '₹0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Items Sold - Read Only */}
                <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-indigo-300">Total Items Sold</h4>
                      <p className="text-xs text-slate-400 mt-1">Read-only - fetched from database</p>
                    </div>
                    <div className="text-2xl font-bold text-indigo-400">
                      {formData.totalSold?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                {/* Tags (optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={tagsInput}
                    onChange={handleTagsChange}
                    placeholder="Enter tags separated by commas"
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                  <p className="mt-1 text-xs text-slate-500">Separate tags with commas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            <div>
              {!formData.isNew && onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this product?')) {
                      onDelete(formData.productId)
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Delete Product
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {formData.isNew ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal

