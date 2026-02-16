import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const Settings = () => {
  const { user } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    whatsapp_number: '',
    instagram_handle: '',
    description: '',
    address: '',
    logo_url: ''
  })
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  
  const fileInputRef = useRef(null)

  // Fetch profile data from Supabase
  const fetchProfile = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        // If no profile exists, create one
        if (fetchError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: user.id, 
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
          
          if (insertError) throw insertError
          
          // Try fetching again after insert
          const { data: newData, error: newFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (newFetchError) throw newFetchError
          
          setFormData({
            business_name: newData.business_name || '',
            owner_name: newData.owner_name || '',
            email: newData.email || user.email || '',
            whatsapp_number: newData.whatsapp_number || '',
            instagram_handle: newData.instagram_handle || '',
            description: newData.description || '',
            address: newData.address || '',
            logo_url: newData.logo_url || ''
          })
          setLogoPreview(newData.logo_url || null)
          return
        }
        throw fetchError
      }

      // Update form with fetched data
      setFormData({
        business_name: data.business_name || '',
        owner_name: data.owner_name || '',
        email: data.email || user.email || '',
        whatsapp_number: data.whatsapp_number || '',
        instagram_handle: data.instagram_handle || '',
        description: data.description || '',
        address: data.address || '',
        logo_url: data.logo_url || ''
      })
      setLogoPreview(data.logo_url || null)
    } catch (err) {
      console.error('Error fetching profile:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch profile on mount
  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!user) return

    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile change detected:', payload)
          fetchProfile() // Refresh profile on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profileChannel)
    }
  }, [user])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear success message on change
    setSuccess(false)
  }

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
      return
    }

    try {
      setUploadingLogo(true)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setLogoPreview(e.target.result)
      reader.readAsDataURL(file)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('business-logos')
        .getPublicUrl(filePath)

      // Update form data with new logo URL
      setFormData(prev => ({
        ...prev,
        logo_url: urlData.publicUrl
      }))
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error uploading logo:', err.message)
      alert('Failed to upload logo: ' + err.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData(prev => ({
      ...prev,
      logo_url: ''
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault()
    console.log('Save button clicked')
    console.log('User:', user)
    console.log('Form data:', formData)
    
    if (!user) {
      setError('User not authenticated. Please log in again.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Prepare profile data - only include fields that exist in the database
      const profileData = {
        business_name: formData.business_name || null,
        owner_name: formData.owner_name || null,
        whatsapp_number: formData.whatsapp_number || null,
        instagram_handle: formData.instagram_handle || null,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        address: formData.address || null,
        updated_at: new Date().toISOString()
      }

      console.log('Updating profile with data:', profileData)
      console.log('User ID:', user.id)

      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      console.log('Existing profile check:', existingProfile, checkError)

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let result
      if (!existingProfile) {
        // Profile doesn't exist, create it
        console.log('Creating new profile...')
        result = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            email: user.email,
            ...profileData
          }])
      } else {
        // Profile exists, update it
        console.log('Updating existing profile...')
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
          .select()
      }

      const { data, error: updateError } = result

      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw updateError
      }

      console.log('Save successful:', data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      console.error('Error details:', err.message, err.details, err.hint)
      setError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
        Profile Settings
      </h1>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400">Profile saved successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400">{error}</span>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Business Profile</h2>
        
        <form onSubmit={handleSave}>
          <div className="space-y-6">
            {/* Business Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Business Logo" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    {uploadingLogo ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Logo
                      </>
                    )}
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Recommended: Square image, PNG or JPG, max 2MB</p>
            </div>

            {/* Read-only Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
              <input 
                type="text" 
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Handmade Treasures, Gift Corner"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner Name</label>
              <input 
                type="text" 
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
              <input 
                type="text" 
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-gray-500 mt-1">This number will be shared with customers for orders</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram Handle</label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2.5 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                  @
                </span>
                <input 
                  type="text" 
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-r-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="your_handle"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                placeholder="Tell customers about your business, products, and what makes them special..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                placeholder="Your workshop or pickup address"
              ></textarea>
            </div>
          </div>
        
          <button 
            type="submit"
            disabled={saving}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings

