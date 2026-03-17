import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

const ImportCustomerModal = ({ isOpen, onClose, onImportComplete, user }) => {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState({ success: 0, skipped: 0, errors: 0 })
  const [duplicateAction, setDuplicateAction] = useState('skip') // 'skip', 'update'

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setParsedData([])
      setImportStats({ success: 0, skipped: 0, errors: 0 })
    }
  }, [isOpen])

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  // Parse CSV or Excel file
  const parseFile = (selectedFile) => {
    setIsParsing(true)
    setParsedData([])

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validatedData = validateAndTransformData(results.data)
          setParsedData(validatedData)
          setIsParsing(false)
        },
        error: (error) => {
          console.error('CSV parse error:', error)
          setIsParsing(false)
        }
      })
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        if (jsonData.length > 1) {
          const headers = jsonData[0]
          const rows = jsonData.slice(1)
          const csvData = rows.map(row => {
            let obj = {}
            headers.forEach((header, i) => {
              obj[header] = row[i]
            })
            return obj
          })
          const validatedData = validateAndTransformData(csvData)
          setParsedData(validatedData)
        }
        setIsParsing(false)
      }
      reader.readAsArrayBuffer(selectedFile)
    } else {
      alert('Please select a CSV or Excel (.xls, .xlsx) file.')
      setIsParsing(false)
    }
  }

  // Validate and transform data to match customer schema
  const validateAndTransformData = (data) => {
    return data.map((row, index) => {
      const transformed = {
        rowIndex: index + 2, // Excel row number (1-based + header)
        name: (row.name || row.Name || '').trim(),
        phone: (row.phone || row.Phone || row['Phone Number'] || '').trim(),
        insta: (row.insta || row.instagram || row.Instagram || row['Instagram Handle'] || '').replace('@', '').trim().toLowerCase(),
        email: (row.email || row.Email || '').trim().toLowerCase(),
        address: row.address || row.Address || '',
        notes: row.notes || row.Notes || '',
        valid: false,
        errors: []
      }

      // Validation
      if (!transformed.name) {
        transformed.errors.push('Name is required')
      }

      if (transformed.phone && !/^\+?\d{10,15}$/.test(transformed.phone.replace(/\D/g, ''))) {
        transformed.errors.push('Invalid phone number')
      }

      if (transformed.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(transformed.email)) {
        transformed.errors.push('Invalid email')
      }

      if (transformed.insta && transformed.insta.length > 30) {
        transformed.errors.push('Instagram handle too long')
      }

      transformed.valid = transformed.errors.length === 0

      return transformed
    }).filter(row => row.name || row.phone || row.insta) // Remove completely empty rows
  }

  // Check for existing customers (bulk)
  const checkExistingCustomers = async (customersData) => {
    if (!customersData.length || !user) return []

    // Batch check by phone, insta, email
    const phones = customersData.map(c => c.phone).filter(Boolean)
    const instas = customersData.map(c => c.insta).filter(Boolean)
    const emails = customersData.map(c => c.email).filter(Boolean)

    const existing = []

    if (phones.length) {
      const { data: phoneMatches } = await supabase
        .from('customers')
        .select('id, phone, insta, email')
        .in('phone', phones.slice(0, 100)) // Supabase limit
        .eq('user_id', user.id)
      existing.push(...phoneMatches)
    }

    if (instas.length) {
      const { data: instaMatches } = await supabase
        .from('customers')
        .select('id, insta, phone, email')
        .in('insta', instas.slice(0, 100))
        .eq('user_id', user.id)
      existing.push(...instaMatches)
    }

    if (emails.length) {
      const { data: emailMatches } = await supabase
        .from('customers')
        .select('id, email, phone, insta')
        .in('email', emails.slice(0, 100))
        .eq('user_id', user.id)
      existing.push(...emailMatches)
    }

    return existing
  }

  // Handle import
  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.valid)
    // if (validRows.length === 0) {
    //   alert('No valid rows to import. Please fix errors in the preview.')
    //   return
    // }

    setIsImporting(true)
    const stats = { success: 0, skipped: 0, errors: 0 }

    try {
      // Check duplicates
      const existing = await checkExistingCustomers(validRows)
      const existingMap = new Map()
      existing.forEach(cust => {
        if (cust.phone) existingMap.set(`phone:${cust.phone}`, cust)
        if (cust.insta) existingMap.set(`insta:${cust.insta}`, cust)
        if (cust.email) existingMap.set(`email:${cust.email}`, cust)
      })

      // Process in batches of 50
      const batchSize = 50
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize)
        if (duplicateAction === 'update') {
          // Split: UPDATE existing + INSERT new (fix indexOf bug)
          const toUpdate = []
          const toInsert = []

          for (let j = 0; j < batch.length; j++) {
            const rowObj = batch[j]
            const rowData = {
              user_id: user.id,
              name: rowObj.name,
              phone: rowObj.phone || null,
              insta: rowObj.insta || null,
              instagram: rowObj.insta || null,
              email: rowObj.email || null,
              address: rowObj.address || null,
              notes: rowObj.notes || null
            }

            let existingKey = null
            if (rowObj.phone) existingKey = `phone:${rowObj.phone}`
            else if (rowObj.insta) existingKey = `insta:${rowObj.insta}`
            else if (rowObj.email) existingKey = `email:${rowObj.email}`

            const existing = existingKey ? existingMap.get(existingKey) : null
            if (existing) {
              toUpdate.push({ ...rowData, id: existing.id })
            } else {
              toInsert.push(rowData)
            }
          }

          // Batch UPDATE existing (safe on id PK)
          if (toUpdate.length > 0) {
            const { error: updateError } = await supabase
              .from('customers')
              .upsert(toUpdate, { onConflict: 'id' })
            if (updateError) {
              console.error('Batch UPDATE error:', updateError)
              stats.errors += toUpdate.length
            } else {
              stats.success += toUpdate.length
            }
          }

          // Batch INSERT new
          if (toInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('customers')
              .insert(toInsert)
            if (insertError) {
              console.error('Batch INSERT error:', insertError)
              stats.errors += toInsert.length
            } else {
              stats.success += toInsert.length
            }
          }
        } else {
          // 'skip' mode: filter new only, then insert (use same logic as update)
          const toInsert = []

          for (let j = 0; j < batch.length; j++) {
            const rowObj = batch[j]
            const rowData = {
              user_id: user.id,
              name: rowObj.name,
              phone: rowObj.phone || null,
              insta: rowObj.insta || null,
              instagram: rowObj.insta || null,
              email: rowObj.email || null,
              address: rowObj.address || null,
              notes: rowObj.notes || null
            }

            let existingKey = null
            if (rowObj.phone) existingKey = `phone:${rowObj.phone}`
            else if (rowObj.insta) existingKey = `insta:${rowObj.insta}`
            else if (rowObj.email) existingKey = `email:${rowObj.email}`

            const existing = existingKey ? existingMap.get(existingKey) : null
            if (!existing) {
              toInsert.push(rowData)
            }
          }

          if (toInsert.length > 0) {
            const { error } = await supabase
              .from('customers')
              .insert(toInsert)
            if (error) {
              console.error('Skip mode INSERT error:', error)
              stats.errors += toInsert.length
            } else {
              stats.success += toInsert.length
            }
          }
          stats.skipped += batch.length - toInsert.length
        }
      }

      onImportComplete?.(stats)
      
      // Success alert only if no errors, else console only
      // if (stats.errors === 0) {
      //   alert(`Import complete! Success: ${stats.success}, Skipped: ${stats.skipped}`)
      // } else {
      //   console.warn(`Import partial success: Success: ${stats.success}, Skipped: ${stats.skipped}, Errors: ${stats.errors}. Check console.`)
      // }
    } catch (error) {
      // console.error('Critical import error:', error)
      // alert(`Critical error: ${error.message}. Some data may have imported.`)
    } finally {
      setIsImporting(false)
      setFile(null)
      setParsedData([])
    }
  }

  // Don't render if not open
  if (!isOpen) return null

  const validCount = parsedData.filter(row => row.valid).length
  const errorCount = parsedData.filter(row => !row.valid).length

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0A0A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">Import Customers</h2>
              <p className="text-sm text-slate-400 mt-1">
                Upload CSV or Excel file. Expected columns: name (required), phone, instagram/insta, email, address, notes.
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {!file ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-2 border-dashed border-teal-500/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  ref={(input) => { if (input) input.value = '' }}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Choose CSV or Excel file
                </label>
                <p className="text-sm text-slate-400 mt-4 max-w-md mx-auto">
                  Supports CSV, XLS, XLSX. Max 1000 rows recommended. Name column required.
                </p>
              </div>
            ) : isParsing ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
                <p className="mt-4 text-slate-300">Parsing {file.name}...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File info */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-sm text-slate-400">{file.size ? Math.round(file.size / 1024) + ' KB' : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null)
                        setParsedData([])
                      }}
                      className="text-slate-400 hover:text-white p-1 -m-1 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">{validCount}</p>
                    <p className="text-sm text-slate-400 mt-1">Valid rows</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-amber-400">{errorCount}</p>
                    <p className="text-sm text-slate-400 mt-1">Errors</p>
                  </div>
                  <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-400">{parsedData.length}</p>
                    <p className="text-sm text-slate-400 mt-1">Total rows</p>
                  </div>
                </div>

                {/* Duplicate handling */}
                {parsedData.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Handle duplicates (same phone/insta/email):
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="duplicateAction"
                          value="skip"
                          checked={duplicateAction === 'skip'}
                          onChange={(e) => setDuplicateAction(e.target.value)}
                          className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-300">Skip duplicates</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="duplicateAction"
                          value="update"
                          checked={duplicateAction === 'update'}
                          onChange={(e) => setDuplicateAction(e.target.value)}
                          className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-300">Update existing</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Preview table */}
                {parsedData.length > 0 && (
                  <div className="border border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-gray-900/50 px-6 py-3 border-b border-gray-700">
                      <h3 className="font-semibold text-slate-300">Preview</h3>
                      <p className="text-xs text-slate-500">First 10 rows shown. Errors shown in red.</p>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-gray-900/70">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Row</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Instagram</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {parsedData.slice(0, 10).map((row) => (
                            <tr key={row.rowIndex} className={row.valid ? 'bg-gray-900/30' : 'bg-red-500/10'}>
                              <td className="px-4 py-3 text-sm text-slate-300">{row.rowIndex}</td>
                              <td className={`px-4 py-3 text-sm ${row.valid || row.name ? 'text-white' : 'text-red-400'}`}>
                                {row.name || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-300">{row.phone || '-'}</td>
                              <td className="px-4 py-3 text-sm text-pink-400">@{row.insta || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-300">{row.email || '-'}</td>
                              <td className="px-4 py-3">
                                {row.valid ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                                    Valid
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                                    {row.errors[0]}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            <button
              onClick={onClose}
              disabled={isParsing || isImporting}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {file && !isParsing && (
              <button
                onClick={handleImport}
                disabled={isImporting || validCount === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import {validCount} Customers
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportCustomerModal

