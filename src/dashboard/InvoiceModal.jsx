import React, { useRef } from 'react'

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const invoiceRef = useRef(null)

  // Don't render if not open or no order
  if (!isOpen || !order) return null

  // Format price to currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Calculate subtotal
  const calculateSubtotal = () => {
    return order.products.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }

  // Calculate tax (assuming 10%)
  const calculateTax = () => {
    return calculateSubtotal() * 0.10
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
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${product.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${product.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(product.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(product.price * product.quantity)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #1f2937;
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
          }
          .company-info h1 {
            font-size: 28px;
            color: #4f46e5;
            margin-bottom: 8px;
          }
          .company-info p {
            color: #6b7280;
            font-size: 14px;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-details h2 {
            font-size: 32px;
            color: #1f2937;
            margin-bottom: 12px;
          }
          .invoice-details p {
            color: #6b7280;
            font-size: 14px;
            margin: 4px 0;
          }
          .bill-to {
            margin-bottom: 40px;
          }
          .bill-to h3 {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
          }
          .bill-to p {
            color: #1f2937;
            font-size: 16px;
            font-weight: 500;
          }
          .bill-to span {
            color: #6b7280;
            font-size: 14px;
            display: block;
            margin-top: 4px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          .items-table th {
            background: #4f46e5;
            color: white;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
          }
          .items-table th:not(:first-child) {
            text-align: center;
          }
          .items-table th:last-child {
            text-align: right;
          }
          .totals {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 32px;
          }
          .totals-table {
            width: 280px;
          }
          .totals-table .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .totals-table .row.subtotal {
            border-bottom: 1px solid #e5e7eb;
          }
          .totals-table .row.total {
            border-top: 2px solid #4f46e5;
            margin-top: 8px;
            padding-top: 16px;
            font-weight: 700;
            font-size: 18px;
          }
          .totals-table .label {
            color: #6b7280;
          }
          .totals-table .value {
            color: #1f2937;
            font-weight: 500;
          }
          .totals-table .value.total {
            color: #4f46e5;
            font-size: 20px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .footer p {
            margin: 4px 0;
          }
          .payment-info {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .payment-info h4 {
            color: #1f2937;
            margin-bottom: 8px;
          }
          .payment-info p {
            color: #6b7280;
            font-size: 14px;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>Design2Deploy</h1>
              <p>Professional Web Solutions</p>
              <p>123 Tech Park, Silicon Valley</p>
              <p>California, USA 94025</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${order.id.replace('#', '')}</p>
              <p><strong>Date:</strong> ${order.invoiceDate || order.date}</p>
              <p><strong>Due Date:</strong> ${order.dueDate}</p>
            </div>
          </div>

          <div class="bill-to">
            <h3>Bill To</h3>
            <p>${order.customerName}</p>
            ${order.customerPhone ? `<span>Phone: ${order.customerPhone}</span>` : ''}
            ${order.customerInstagram ? `<span>Instagram: @${order.customerInstagram}</span>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-table">
              <div class="row subtotal">
                <span class="label">Subtotal</span>
                <span class="value">${formatPrice(calculateSubtotal())}</span>
              </div>
              <div class="row">
                <span class="label">Tax (10%)</span>
                <span class="value">${formatPrice(calculateTax())}</span>
              </div>
              <div class="row total">
                <span class="label">Total</span>
                <span class="value total">${formatPrice(order.price)}</span>
              </div>
            </div>
          </div>

          <div class="payment-info">
            <h4>Payment Information</h4>
            <p><strong>Payment Type:</strong> ${order.paymentType}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact us.</p>
            <p>© 2025 Design2Deploy. All rights reserved.</p>
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
        <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Invoice - {order.id}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                View and manage invoice details
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="overflow-y-auto flex-1 p-6" ref={invoiceRef}>
            {/* Invoice Paper */}
            <div className="bg-white rounded-lg p-8 text-gray-800 max-w-3xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-8 pb-4 border-b-4 border-indigo-600">
                <div>
                  <h1 className="text-3xl font-bold text-indigo-600">Design2Deploy</h1>
                  <p className="text-gray-500 mt-1">Professional Web Solutions</p>
                  <p className="text-gray-500 text-sm">123 Tech Park, Silicon Valley</p>
                  <p className="text-gray-500 text-sm">California, USA 94025</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-gray-800">INVOICE</h2>
                  <p className="text-gray-500 mt-2"><strong>#:</strong> {order.id.replace('#', '')}</p>
                  <p className="text-gray-500"><strong>Date:</strong> {order.invoiceDate || order.date}</p>
                  <p className="text-gray-500"><strong>Due Date:</strong> {order.dueDate}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill To</h3>
                <p className="text-xl font-semibold text-gray-800">{order.customerName}</p>
                {order.customerPhone && <p className="text-gray-600">Phone: {order.customerPhone}</p>}
                {order.customerInstagram && <p className="text-gray-600">Instagram: @{order.customerInstagram}</p>}
              </div>

              {/* Products Table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="py-3 px-4 text-left rounded-tl-lg">Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4 text-center">{product.quantity}</td>
                      <td className="py-3 px-4 text-right">{formatPrice(product.price)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatPrice(product.price * product.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{formatPrice(calculateTax())}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b-2 border-indigo-600 mt-2">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-indigo-600">{formatPrice(order.price)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-100 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-gray-800 mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Payment Type</p>
                    <p className="font-medium">{order.paymentType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className={`font-medium ${
                      order.paymentStatus === 'Paid' ? 'text-green-600' : 
                      order.paymentStatus === 'Unpaid' ? 'text-yellow-600' : 
                      order.paymentStatus === 'Failed' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-sm">Notes: {order.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Thank you for your business!</p>
                <p className="text-gray-400 text-xs mt-1">If you have any questions about this invoice, please contact us.</p>
                <p className="text-gray-400 text-xs mt-2">© 2025 Design2Deploy. All rights reserved.</p>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
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
          .bg-indigo-600 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

export default InvoiceModal

