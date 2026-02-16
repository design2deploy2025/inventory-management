import React, { useState, useMemo } from 'react'
import CustomerModal from './CustomerModal'

const CustomersTable = () => {
  // Sample customers data - WhatsApp/Instagram sellers customers
  const [customers, setCustomers] = useState([
    {
      id: 'CUST-001',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      insta: 'priya_sharma',
      lastOrderDate: 'Jan 15, 2025',
      lifetimeValue: 4500.00,
      repeatOrders: 5,
      lastOrderDetails: 'Gift Box - Anniversary - ₹1250',
      source: 'WhatsApp',
    },
    {
      id: 'CUST-002',
      name: 'Amit Kumar',
      phone: '+91 98765 43211',
      whatsapp: '+91 98765 43211',
      insta: 'amit_creations',
      lastOrderDate: 'Jan 14, 2025',
      lifetimeValue: 2800.00,
      repeatOrders: 2,
      lastOrderDetails: 'Handmade Candle Set - ₹2800',
      source: 'Instagram',
    },
    {
      id: 'CUST-003',
      name: 'Riya Patel',
      phone: '+91 98765 43212',
      whatsapp: '+91 98765 43212',
      insta: 'riya_gifts',
      lastOrderDate: 'Jan 13, 2025',
      lifetimeValue: 650.00,
      repeatOrders: 1,
      lastOrderDetails: 'Customized Rakhi Set - ₹650',
      source: 'WhatsApp',
    },
    {
      id: 'CUST-004',
      name: 'Sneha Reddy',
      phone: '+91 98765 43213',
      whatsapp: '+91 98765 43213',
      insta: 'sneha_handmade',
      lastOrderDate: 'Jan 12, 2025',
      lifetimeValue: 1800.00,
      repeatOrders: 3,
      lastOrderDetails: 'Festival Gift Hamper - ₹1800',
      source: 'Instagram',
    },
    {
      id: 'CUST-005',
      name: 'Vikram Singh',
      phone: '+91 98765 43214',
      whatsapp: '+91 98765 43214',
      insta: 'vikram_home',
      lastOrderDate: 'Jan 11, 2025',
      lifetimeValue: 8900.00,
      repeatOrders: 8,
      lastOrderDetails: '3x Handloom Items - ₹8900',
      source: 'WhatsApp',
    },
    {
      id: 'CUST-006',
      name: 'Anjali Mehta',
      phone: '+91 98765 43215',
      whatsapp: '+91 98765 43215',
      insta: 'anjali_designs',
      lastOrderDate: 'Jan 10, 2025',
      lifetimeValue: 0.00,
      repeatOrders: 0,
      lastOrderDetails: 'No orders yet',
      source: 'Instagram',
    },
    {
      id: 'CUST-007',
      name: 'Kavita Joshi',
      phone: '+91 98765 43216',
      whatsapp: '+91 98765 43216',
      insta: 'kavita_art',
      lastOrderDate: 'Jan 9, 2025',
      lifetimeValue: 2250.00,
      repeatOrders: 4,
      lastOrderDetails: 'Terracotta Decor Set - ₹2250',
      source: 'WhatsApp',
    },
    {
      id: 'CUST-008',
      name: 'Rohit Verma',
      phone: '+91 98765 43217',
      whatsapp: '+91 98765 43217',
      insta: 'rohit_frames',
      lastOrderDate: 'Jan 8, 2025',
      lifetimeValue: 4200.00,
      repeatOrders: 2,
      lastOrderDetails: '2x Photo Frames - ₹4200',
      source: 'WhatsApp',
    },
  ])
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sourceFilter, setSourceFilter] = useState('All')

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
    setSortBy('name')
    setSourceFilter('All')
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || sortBy !== 'name' || sourceFilter !== 'All'

  // Handle adding new customer
  const handleAddCustomer = () => {
    setCustomerToEdit(null)
    setIsCustomerModalOpen(true)
  }

  // Handle editing customer
  const handleEditCustomer = (customer) => {
    setCustomerToEdit(customer)
    setIsCustomerModalOpen(true)
  }

  // Handle saving new customer
  const handleSaveCustomer = (customerData) => {
    const newCustomer = {
      id: customerData.id,
      name: customerData.name,
      phone: customerData.phone,
      whatsapp: customerData.whatsapp,
      insta: customerData.insta,
      lastOrderDate: 'No orders yet',
      lifetimeValue: 0,
      repeatOrders: 0,
      lastOrderDetails: 'No orders yet',
      source: customerData.source || 'WhatsApp',
    }
    
    setCustomers((prev) => [newCustomer, ...prev])
  }

  // Handle updating existing customer
  const handleUpdateCustomer = (updatedCustomerData) => {
    setCustomers((prev) =>
      prev.map(customer =>
        customer.id === updatedCustomerData.id ? { ...updatedCustomerData } : customer
      )
    )
  }

  // Handle deleting customer
  const handleDeleteCustomer = (customerId) => {
    setCustomers((prev) =>
      prev.filter(customer => customer.id !== customerId)
    )
  }

  // Filter and sort customers based on current filters
  const filteredCustomers = useMemo(() => {
    let result = [...customers]
    
    // Search filter
    if (searchTerm) {
      result = result.filter(customer =>
        customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.whatsapp.includes(searchTerm) ||
        customer.insta.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Source filter
    if (sourceFilter !== 'All') {
      result = result.filter(customer => customer.source === sourceFilter)
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'lifetimeValue':
          return b.lifetimeValue - a.lifetimeValue
        case 'repeatOrders':
          return b.repeatOrders - a.repeatOrders
        case 'recent':
          return new Date(b.lastOrderDate) - new Date(a.lastOrderDate)
        default:
          return 0
      }
    })
    
    return result
  }, [customers, searchTerm, sortBy, sourceFilter])

  // Repeat order badge color helper
  const getRepeatOrderBadge = (count) => {
    if (count === 0) {
      return 'bg-gray-500/10 text-gray-400'
    } else if (count === 1) {
      return 'bg-blue-500/10 text-blue-400'
    } else if (count <= 3) {
      return 'bg-yellow-500/10 text-yellow-400'
    } else {
      return 'bg-emerald-500/10 text-emerald-400'
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Customers Management
        </h1>
        <button
          onClick={handleAddCustomer}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>
      <div className="mt-6">
        <div className="bg-[#0A0A0A] border border-gray-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">All Customers</h2>
            <p className="text-sm text-slate-400 mt-1">Manage your WhatsApp & Instagram customers</p>
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
                  placeholder="Search by Name, Phone, or WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#1a1a1a] text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>

              {/* Source Filter */}
              <div className="min-w-[150px]">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="block w-full py-2 pl-3 pr-8 border border-gray-700 rounded-md leading-5 bg-[#1a1a1a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                >
                  <option value="All">All Sources</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="min-w-[150px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full py-2 pl-3 pr-8 border border-gray-700 rounded-md leading-5 bg-[#1a1a1a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                >
                  <option value="name">Sort by Name</option>
                  <option value="lifetimeValue">Sort by Lifetime Value</option>
                  <option value="repeatOrders">Sort by Repeat Orders</option>
                  <option value="recent">Sort by Recent</option>
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
                Showing {filteredCustomers.length} of {customers.length} customers
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Instagram
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Lifetime Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Repeat Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-900/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {customer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <span className="text-green-400">+91 {customer.whatsapp.slice(-10)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <span className="text-pink-400">@{customer.insta}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getSourceBadge(customer.source)}`}>
                          {customer.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {customer.lastOrderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {formatPrice(customer.lifetimeValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getRepeatOrderBadge(customer.repeatOrders)}`}>
                          {customer.repeatOrders} orders
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 max-w-[200px] truncate">
                        {customer.lastOrderDetails}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-12 w-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg">No customers found</p>
                        <p className="text-sm mt-1">Try adjusting your search</p>
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
              Showing {filteredCustomers.length} customers
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={filteredCustomers.length === 0}>
                Previous
              </button>
              <button className="px-3 py-1 text-sm text-slate-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={filteredCustomers.length === 0}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false)
          setCustomerToEdit(null)
        }}
        onSave={handleSaveCustomer}
        onUpdate={handleUpdateCustomer}
        customerToEdit={customerToEdit}
      />
    </div>
  )
}

export default CustomersTable

