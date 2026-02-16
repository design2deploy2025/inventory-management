import React, { useState } from 'react'
import ProductModal from './ProductModal'

// Enhanced product data with additional fields - Gift items & Handicrafts
const initialProducts = [
  {
    id: 1,
    name: 'Gift Box - Anniversary Special',
    href: '#',
    price: '₹850',
    imageSrc: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    imageAlt: 'Beautiful anniversary gift box with flowers and chocolates.',
    description: 'Luxurious anniversary gift box including scented candles, premium chocolates, and a handwritten card. Perfect for celebrating special moments.',
    category: 'Gift Boxes',
    quantity: 25,
    sku: 'GB-ANN-001',
    status: 'Active',
    totalSold: 156,
  },
  {
    id: 2,
    name: 'Handmade Scented Candle Set',
    href: '#',
    price: '₹450',
    imageSrc: 'https://images.unsplash.com/photo-1602607434640-bce8c9e5b88c?w=400&h=400&fit=crop',
    imageAlt: 'Set of 3 handcrafted scented candles in ceramic holders.',
    description: 'Hand-poured scented candles made with natural soy wax. Set of 3 in vanilla, lavender, and rose fragrances. Long-lasting burn time.',
    category: 'Handmade Candles',
    quantity: 40,
    sku: 'HSC-002',
    status: 'Active',
    totalSold: 289,
  },
  {
    id: 3,
    name: 'Handcrafted Wooden Photo Frame',
    href: '#',
    price: '₹320',
    imageSrc: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop',
    imageAlt: 'Intricately carved wooden photo frame with traditional design.',
    description: 'Handcrafted wooden photo frame with intricate traditional carvings. Perfect for showcasing cherished memories. Available in multiple sizes.',
    category: 'Home Decor',
    quantity: 18,
    sku: 'HWF-003',
    status: 'Active',
    totalSold: 98,
  },
  {
    id: 4,
    name: 'Customized Rakhi Set',
    href: '#',
    price: '₹280',
    imageSrc: 'https://images.unsplash.com/photo-1604890563134-85537bd4c981?w=400&h=400&fit=crop',
    imageAlt: 'Beautiful rakhi with beads and decorative elements.',
    description: 'Handmade rakhi with traditional and modern designs. Includes rakhi, roli, chawal, and a sweet box. Customization available for names.',
    category: 'Festival Special',
    quantity: 50,
    sku: 'RAK-004',
    status: 'Active',
    totalSold: 420,
  },
  {
    id: 5,
    name: 'Handloom Table Runner',
    href: '#',
    price: '₹650',
    imageSrc: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop',
    imageAlt: 'Handwoven cotton table runner with traditional patterns.',
    description: 'Beautiful handloom table runner made by local artisans. Features traditional patterns and vibrant colors. Adds elegance to any table.',
    category: 'Home Decor',
    quantity: 12,
    sku: 'HTR-005',
    status: 'Active',
    totalSold: 67,
  },
  {
    id: 6,
    name: 'Personalized Mug Set',
    href: '#',
    price: '₹350',
    imageSrc: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    imageAlt: 'Customized ceramic mugs with printed photos.',
    description: 'High-quality ceramic mugs with full-color photo print. Microwave and dishwasher safe. Perfect gift for birthdays, anniversaries, and special occasions.',
    category: 'Customized Gifts',
    quantity: 35,
    sku: 'PMG-006',
    status: 'Active',
    totalSold: 185,
  },
  {
    id: 7,
    name: 'Terracotta Home Decor',
    href: '#',
    price: '₹520',
    imageSrc: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    imageAlt: 'Handcrafted terracotta decorative items.',
    description: 'Beautiful handcrafted terracotta home decor items. Made by skilled artisans using traditional techniques. Each piece is unique.',
    category: 'Handicrafts',
    quantity: 22,
    sku: 'THD-007',
    status: 'Active',
    totalSold: 134,
  },
  {
    id: 8,
    name: 'Festival Gift Hamper',
    href: '#',
    price: '₹1200',
    imageSrc: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    imageAlt: 'Luxurious festival gift hamper with various items.',
    description: 'Premium festival gift hamper containing gourmet chocolates, dry fruits, scented candles, and decorative items. Perfect for gifting to loved ones.',
    category: 'Gift Hampers',
    quantity: 15,
    sku: 'FGH-008',
    status: 'Active',
    totalSold: 89,
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
      price: '₹0',
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

