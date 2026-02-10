import React, { useState } from 'react'
import ProductModal from './ProductModal'

// Enhanced product data with additional fields
const initialProducts = [
  {
    id: 1,
    name: 'Earthen Bottle',
    href: '#',
    price: '$48',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-01.jpg',
    imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
    description: 'Handcrafted earthen bottle with natural clay texture and authentic cork stopper. Perfect for storing water, beverages, or decorative purposes.',
    category: 'Home & Garden',
    quantity: 150,
    sku: 'EBT-001',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Nomad Tumbler',
    href: '#',
    price: '$35',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-02.jpg',
    imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
    description: 'Double-wall vacuum insulated tumbler that keeps drinks hot or cold for hours. Features leak-proof lid and ergonomic design.',
    category: 'Electronics',
    quantity: 200,
    sku: 'NMD-002',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Focus Paper Refill',
    href: '#',
    price: '$89',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-03.jpg',
    imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
    description: 'Premium quality paper refills for your Focus planner system. Lined with premium paper stock, perfect for productivity enthusiasts.',
    category: 'Office Supplies',
    quantity: 75,
    sku: 'FPR-003',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Machined Mechanical Pencil',
    href: '#',
    price: '$35',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg',
    imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
    description: 'Precision machined brass and steel mechanical pencil with comfortable grip. Features 0.5mm lead and smooth drafting experience.',
    category: 'Office Supplies',
    quantity: 120,
    sku: 'MMP-004',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Focus Card Tray',
    href: '#',
    price: '$64',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-05.jpg',
    imageAlt: 'Paper card sitting upright in walnut card holder on desk.',
    description: 'Elegant walnut card holder tray for organizing business cards, notes, or small items on your desk. Premium wood finish.',
    category: 'Office Supplies',
    quantity: 45,
    sku: 'FCT-005',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Focus Multi-Pack',
    href: '#',
    price: '$39',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-06.jpg',
    imageAlt: 'Stack of 3 small drab green cardboard paper card refill boxes with white text.',
    description: 'Convenient 3-pack of paper card refills. Perfect for home, office, or travel. Easy to replace and compatible with all Focus trays.',
    category: 'Office Supplies',
    quantity: 90,
    sku: 'FMP-006',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Brass Scissors',
    href: '#',
    price: '$50',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-07.jpg',
    imageAlt: 'Brass scissors with geometric design, black steel finger holes, and included upright brass stand.',
    description: 'Designer brass scissors with geometric patterns and black steel finger holes. Comes with a stylish brass stand.',
    category: 'Office Supplies',
    quantity: 60,
    sku: 'BSC-007',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Focus Carry Pouch',
    href: '#',
    price: '$32',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-08.jpg',
    imageAlt: 'Textured gray felt pouch for paper cards with snap button flap and elastic pen holder loop.',
    description: 'Premium felt carry pouch for your Focus cards and accessories. Features snap closure and built-in pen loop.',
    category: 'Accessories',
    quantity: 110,
    sku: 'FCP-008',
    status: 'Active',
  },
]

export default function ProductDetails() {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Open modal with product data
  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // Handle saving product changes
  const handleSaveProduct = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      )
    )
  }

  // Handle adding new product
  const handleAddProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: 'New Product',
      price: '$0',
      imageSrc: 'https://via.placeholder.com/400',
      imageAlt: 'New product image',
      description: 'Add product description here',
      category: '',
      quantity: 0,
      sku: `NP-${String(products.length + 1).padStart(3, '0')}`,
      status: 'Active',
    }
    setSelectedProduct(newProduct)
    setIsModalOpen(true)
  }

  // Handle product save (either new or existing)
  const handleSave = (productData) => {
    if (selectedProduct && selectedProduct.id <= products.length) {
      // Update existing product
      handleSaveProduct(productData)
    } else {
      // Add new product
      setProducts((prev) => [...prev, { ...productData, id: prev.length + 1 }])
    }
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'Inactive':
        return 'bg-gray-500/10 text-gray-400'
      default:
        return 'bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <div className="bg-[#0A0A0A]">
      <div className="p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Products Catalog
        </h1>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-slate-400 mt-1">
              {products.length} products in your catalog
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="group bg-[#0A0A0A] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:bg-gray-900 transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(product.status)}`}>
                    {product.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{product.category}</p>
                  </div>
                  <p className="text-lg font-semibold text-white ml-2">{product.price}</p>
                </div>
                
                {/* Quick stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {product.quantity} in stock
                  </div>
                  <div className="flex items-center text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {product.sku}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if no products */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No products</h3>
            <p className="mt-1 text-sm text-slate-400">Get started by adding a new product.</p>
            <div className="mt-6">
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSave={handleSave}
      />
    </div>
  )
}

