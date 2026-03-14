import React from 'react'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  pageSize = 10,
  className = '' 
}) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l = Math.max(2, currentPage - delta)
    let r = Math.min(totalPages - 1, currentPage + delta)
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= l && i <= r)) {
        range.push(i)
      }
    }

    for (let i of range) {
      if (rangeWithDots.length && i - rangeWithDots[rangeWithDots.length - 1] !== 1) {
        rangeWithDots.push('...')
      }
      if (Array.isArray(i)) {
        rangeWithDots.push(...i)
      } else {
        rangeWithDots.push(i)
      }
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#0A0A0A] ${className}`}>
      {/* Left: Info */}
      <div className="text-sm text-slate-400">
        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 text-slate-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors size-10 flex items-center justify-center"
          title="First page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 text-slate-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors size-10 flex items-center justify-center"
          title="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-slate-400">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 text-slate-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors size-10 flex items-center justify-center"
          title="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 text-slate-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors size-10 flex items-center justify-center"
          title="Last page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Pagination

