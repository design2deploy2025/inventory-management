import React, { useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const { user } = useAuth()
  const invoiceRef = useRef(null)
  const [profile, setProfile] = useState(null)

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(data || {})
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }

    fetchProfile()
  }, [user])

  // Don't render if not open or no order
  if (!isOpen || !order) return null

  // Get company info from profile
  const companyName = profile?.business_name || 'Your Business'
  const companyAddress = profile?.address || ''
  const companyLogo = profile?.logo_url || null
  const ownerName = profile?.owner_name || ''

  // Format price to currency (INR - Indian Rupees)
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(0)
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  // Calculate subtotal
  const calculateSubtotal = () => {
    return order.products.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }

  // Calculate total (subtotal without tax)
  const calculateTotal = () => {
    return calculateSubtotal()
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  // Handle PDF download (using print to PDF)
  const handleDownloadPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank')
    const productsHTML = order.products.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${product.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(product.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(product.price * product.quantity)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; color: #1f2937; line-height: 1.5; padding: 40px; }
          .invoice-container { max-width: 700px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-section { display: flex; gap: 16px; align-items: flex-start; }
          .company-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; }
          .company-info h1 { font-size: 20px; color: #111827; margin-bottom: 4px; }
          .company-info p { font-size: 13px; color: #6b7280; white-space: pre-line; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 28px; color: #111827; margin-bottom: 8px; }
          .invoice-title p { font-size: 13px; color: #6b7280; margin: 2px 0; }
          .bill-to { margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; }
          .bill-to h3 { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          .bill-to p { font-size: 15px; font-weight: 500; color: #111827; }
          .bill-to span { font-size: 13px; color: #6b7280; display: block; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #1f2937; color: white; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
          th:not(:first-child) { text-align: center; }
          th:last-child { text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-table { width: 220px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .totals-row.subtotal { border-bottom: 1px solid #e5e7eb; }
          .totals-row.total { border-top: 2px solid #1f2937; margin-top: 8px; padding-top: 10px; font-weight: 700; font-size: 16px; }
          .payment-info { margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; }
          .payment-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
          .payment-info p { font-size: 13px; color: #6b7280; margin: 4px 0; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-section">
              ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="company-logo" />` : ''}
              <div class="company-info">
                <h1>${companyName}</h1>
                ${companyAddress ? `<p>${companyAddress}</p>` : ''}
              </div>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p><strong>#:</strong> ${order.id.replace('#', '')}</p>
              <p><strong>Date:</strong> ${order.invoiceDate || order.date}</p>
            </div>
          </div>

          <div class="bill-to">
            <h3>Bill To</h3>
            <p>${order.customerName}</p>
            ${order.customerPhone ? `<span>Phone: ${order.customerPhone}</span>` : ''}
            ${order.customerInstagram ? `<span>Instagram: @${order.customerInstagram}</span>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-table">
              <div class="totals-row subtotal">
                <span>Subtotal</span>
                <span>${formatPrice(calculateSubtotal())}</span>
              </div>
              <div class="totals-row total">
                <span>Total</span>
                <span>${formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div class="payment-info">
            <h4>Payment Details</h4>
            <p><strong>Type:</strong> ${order.paymentType} | <strong>Status:</strong> ${order.paymentStatus}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>${companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Invoice - {order.id}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                View and download invoice
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="overflow-y-auto flex-1 p-5" ref={invoiceRef}>
            <div className="bg-white rounded-lg p-6 text-gray-800 max-w-2xl mx-auto shadow-sm">
              {/* Header - Simplified */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
                <div className="flex items-start gap-3">
                  {companyLogo && (
                    <img 
                      src={companyLogo} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
                    {companyAddress && (
                      <p className="text-sm text-gray-500 mt-0.5 whitespace-pre-line">{companyAddress}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                  <p className="text-sm text-gray-500 mt-1">#{order.id.replace('#', '')}</p>
                  <p className="text-xs text-gray-400">Date: {order.invoiceDate || order.date}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                {order.customerPhone && <p className="text-sm text-gray-600">Ph: {order.customerPhone}</p>}
                {order.customerInstagram && <p className="text-sm text-gray-600">@{order.customerInstagram}</p>}
              </div>

              {/* Products Table - Simplified */}
              <table className="w-full mb-5">
                <thead>
                  <tr className="bg-gray-800 text-white text-sm">
                    <th className="py-2 px-3 text-left rounded-tl-md">Item</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right rounded-tr-md">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 text-sm">
                      <td className="py-2 px-3">{product.name}</td>
                      <td className="py-2 px-3 text-center">{product.quantity}</td>
                      <td className="py-2 px-3 text-right">{formatPrice(product.price)}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatPrice(product.price * product.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals - Simplified */}
              <div className="flex justify-end mb-5">
                <div className="w-48">
                  <div className="flex justify-between py-1.5 text-sm border-b border-gray-100">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b-2 border-gray-800 mt-1">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info - Compact */}
              {(order.paymentType || order.paymentStatus || order.notes) && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment</h4>
                  <div className="flex gap-4 text-sm">
                    {order.paymentType && (
                      <p><span className="text-gray-500">Type:</span> <span className="font-medium">{order.paymentType}</span></p>
                    )}
                    {order.paymentStatus && (
                      <p>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className={`font-medium ${
                          order.paymentStatus === 'Paid' ? 'text-green-600' : 
                          order.paymentStatus === 'Unpaid' ? 'text-yellow-600' : 
                          order.paymentStatus === 'Failed' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    )}
                  </div>
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-1"><span className="text-gray-500">Note:</span> {order.notes}</p>
                  )}
                </div>
              )}

              {/* Footer - Simple */}
              <div className="text-center pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">Thank you!</p>
                <p className="text-xs text-gray-400 mt-0.5">{companyName}</p>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end px-5 py-3 border-t border-gray-800 bg-gray-900/30">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-white bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            border: none;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .bg-white {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-gray-800 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

export default InvoiceModal

