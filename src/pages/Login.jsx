import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate("/dashboard")
    }
  }

  return (
    <section>
      {/* Container */}
      <div className="grid gap-0 md:h-screen md:grid-cols-2">
        {/* Component */}
        <div className="flex items-center justify-center bg-black">
          <div className="mx-auto max-w-md px-5 py-16 md:px-10 md:py-20">
            <div className="mb-5 flex h-14 w-14 flex-col items-center justify-center bg-indigo-600 md:mb-6 lg:mb-8">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="8" fill="#6366F1"/>
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="mb-8 text-sm sm:text-base md:mb-12 lg:mb-16 text-slate-300">
              Join thousands of Instagram sellers who are transforming their inventory management with InstaStock.
            </p>
            <p className="text-sm font-bold sm:text-base text-white">Sarah Chen</p>
            <p className="text-sm sm:text-sm text-slate-300">
              Founder & CEO, InstaStock
            </p>
          </div>
        </div>
        {/* Component */}
        <div className="flex items-center justify-center px-5 py-16 md:px-10 md:py-20 bg-black bg-[url(https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-4.svg)] bg-center bg-cover">
          <div className="max-w-md text-center">
            <h2 className="mb-8 text-3xl font-bold md:mb-12 md:text-5xl lg:mb-16 bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text">
              Please Log In here
            </h2>
            {/* Form */}
            <div className="mx-auto mb-4 max-w-sm pb-4">
              <form onSubmit={handleLogin}>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <img alt="" src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9455fae6cf89_EnvelopeSimple.svg" className="absolute left-5 top-3 inline-block" />
                  <input 
                    type="email" 
                    className="mb-4 block h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 py-6 pl-14 text-sm text-white placeholder:text-slate-400" 
                    placeholder="Email Address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative mb-4">
                  <img alt="" src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a946794e6cf8a_Lock-2.svg" className="absolute left-5 top-3 inline-block" />
                  <input 
                    type="password" 
                    className="mb-4 block h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 py-6 pl-14 text-sm text-white placeholder:text-slate-400" 
                    placeholder="Password (min 8 characters)" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-block w-full cursor-pointer items-center bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 text-center font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>
            </div>
            <p className="text-sm text-slate-300 sm:text-sm">
              Don't have an account?
              <a href="/signup" className="font-bold text-indigo-400 ml-1">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

