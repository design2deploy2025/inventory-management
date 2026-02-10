export function Login() {
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
		          <form name="signup-form" method="get">
		            <div className="relative">
		              <img alt="" src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9455fae6cf89_EnvelopeSimple.svg" className="absolute left-5 top-3 inline-block" />
		              <input type="email" className="mb-4 block h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 py-6 pl-14 text-sm text-white placeholder:text-slate-400" placeholder="Email Address" required="" />
		            </div>
		            <div className="relative mb-4">
		              <img alt="" src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a946794e6cf8a_Lock-2.svg" className="absolute left-5 top-3 inline-block" />
		              <input type="password" className="mb-4 block h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 py-6 pl-14 text-sm text-white placeholder:text-slate-400" placeholder="Password (min 8 characters)" required="" />
		            </div>
            {/* <label className="mb-6 flex items-center justify-start pb-12 pl-5 font-medium md:mb-10 lg:mb-1 text-slate-300">
		              <input type="checkbox" name="checkbox" className="float-left mt-1" />
		              <span className="ml-4 inline-block cursor-pointer text-sm" htmlFor="checkbox">
		                I agree with the
		                <a href="/terms" className="font-bold text-indigo-400">
		                  Terms & Conditions
		                </a>
		              </span>
		            </label> */}
		            <input type="submit" value="Log In" className="inline-block w-full cursor-pointer items-center bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 text-center font-semibold text-white rounded-full" />
		          </form>
		        </div>
		        {/* <p className="text-sm text-slate-300 sm:text-sm">
		          Already have an account?
		          <a href="/login" className="font-bold text-indigo-400">
		            <span> </span> Login now
		          </a>
		        </p> */}
		      </div>
		    </div>
		  </div>
		</section>
	);
}

