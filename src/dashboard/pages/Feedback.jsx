import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const Feedback = () => {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    subject: '',
    category: 'suggestion',
    description: ''
  })
  
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const categories = [
    { id: 'bug', label: 'Bug Report', icon: '🐛', description: 'Something is not working correctly' },
    { id: 'suggestion', label: 'Suggestion', icon: '💡', description: 'Ideas for improvement' },
    { id: 'feature', label: 'Feature Request', icon: '✨', description: 'New features you\'d like to see' },
    { id: 'other', label: 'Other', icon: '💬', description: 'Anything else' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSending(true)
      setError(null)
      
      // Get user name from profiles table
      let userName = null
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, owner_name')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          userName = profile.business_name || profile.owner_name || null
        }
      }
      
      // Insert feedback into database
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          user_name: userName,
          subject: formData.subject,
          category: formData.category,
          description: formData.description
        })
      
      if (feedbackError) {
        throw feedbackError
      }
      
      setSuccess(true)
      setFormData({
        subject: '',
        category: 'suggestion',
        description: ''
      })
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
      console.error('Feedback error:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Feedback</h1>
            <p className="text-slate-400">Help us improve your experience</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="text-emerald-400 font-medium">Thank you for your feedback!</span>
            <p className="text-emerald-400/70 text-sm">We appreciate your input and will use it to improve.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-red-400 font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Submit Feedback</h3>
            
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                    className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                      formData.category === cat.id
                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                        : 'bg-gray-800/30 border-white/5 hover:border-white/20 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{cat.icon}</span>
                    <span className={`text-sm font-medium block ${
                      formData.category === cat.id ? 'text-white' : 'text-slate-400'
                    }`}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all"
                  placeholder="Brief summary of your feedback"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all resize-none"
                rows="6"
                placeholder="Tell us more details about your feedback, bug, or suggestion..."
              ></textarea>
              <p className="text-xs text-slate-500 mt-2">
                Please provide as much detail as possible to help us understand and address your feedback.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Feedback...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Tips */}
          {/* <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tips for Great Feedback</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">1</span>
                </div>
                <p className="text-sm text-slate-400">Be specific about the issue or suggestion</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">2</span>
                </div>
                <p className="text-sm text-slate-400">Include steps to reproduce if reporting a bug</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">3</span>
                </div>
                <p className="text-sm text-slate-400">Share your expected vs actual outcome</p>
              </div>
            </div>
          </div> */}

          {/* Response Time */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Response Time</h4>
                <p className="text-xs text-slate-400">We typically reply within 24-48 hours</p>
              </div>
            </div>
          </div>

          {/* Contact Alternative */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
            <h4 className="font-semibold text-white mb-3">Other Ways to Reach Us</h4>
            <div className="space-y-3">
              <a href="mailto:design2deploy.2025@gmail.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support (design2deploy.2025@gmail.com)
              </a>

              <a 
  href="https://www.instagram.com/_design2deploy_/" 
  target="_blank" 
  rel="noopener noreferrer"
  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors"
>
  <svg 
    className="w-4 h-4" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M16 3h-8a5 5 0 00-5 5v8a5 5 0 005 5h8a5 5 0 005-5v-8a5 5 0 00-5-5z"
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M16 11.37a4 4 0 11-7.74 1.26 4 4 0 017.74-1.26z"
    />
    <line 
      x1="17.5" 
      y1="6.5" 
      x2="17.5" 
      y2="6.5" 
      strokeWidth="2"
    />
  </svg>
  Instagram (_design2deploy_)
</a>
              {/* <div className="flex items-center gap-3 text-sm text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Live Chat (Coming Soon)
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default Feedback

