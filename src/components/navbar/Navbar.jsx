import React from 'react'

const Navbar = () => {
  return (
    <div>
      <nav className="flex items-center justify-between p-4 border-b border-white/25 md:px-16 lg:px-24 xl:px-32 w-full bg-black bg-[url(https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-4.svg)] bg-center bg-cover">
          <a href="/" className="flex items-center gap-2">
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
            <span className="text-xl font-bold text-white">InstaStock</span>
          </a>
          <ul
            id="menu"
            className="max-md:absolute max-md:h-full max-md:w-full max-md:top-0 max-md:-left-full transition-all duration-300 max-md:backdrop-blur max-md:bg-black/80 max-md:text-white text-white flex flex-col md:flex-row items-center justify-center gap-8 font-medium"
          >
            <li className="hover:text-gray-300 transition">
              <a href="#features">Features</a>
            </li>
            <li className="hover:text-gray-300 transition">
              <a href="#how-it-works">How it Works</a>
            </li>
            <li className="hover:text-gray-300 transition">
              <a href="#testimonials">Testimonials</a>
            </li>
            <li className="hover:text-gray-300 transition">
              <a href="#pricing">Pricing</a>
            </li>
            <li className="hover:text-gray-300 transition">
              <a href="#contact">Contact</a>
            </li>

            <button
              id="close-menu"
              className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </ul>

          <button id="open-menu" className="md:hidden">
            <svg
              className="size-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="max-md:hidden flex items-center gap-4">
            <a href="/login" className="text-white hover:text-gray-300 transition font-medium">Login</a>
            {/* <a href="/signup" className="text-white px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition rounded-full font-medium">
              Get Started Free
            </a> */}
          </div>
        </nav>
    </div>
  )
}

export default Navbar
