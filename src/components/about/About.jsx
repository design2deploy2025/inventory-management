export function About() {
	return (
		<section className="bg-black">
		  {/* Container */}
		  <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-10 md:py-16 lg:py-20">
		    {/* Component */}
		    <div className="flex flex-col gap-14 lg:gap-20">
		      {/* Image */}
		      <img src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2Fbg-about.png?alt=media&token=0d5ea1c5-61cf-4b0d-beab-bd023e3d9ee8" alt="" className="w-full" />
		      {/* Content */}
		      <div className="flex flex-col gap-14 lg:gap-20">
		        <div className="flex flex-col md:flex-row gap-5">
		          <h2 className="text-3xl md:text-5xl font-bold flex-1 text-white">
		            Our Story
		          </h2>
		          <p className="flex-1 text-slate-300">
		            InstaStock was founded by Instagram sellers, for Instagram sellers. We understood firsthand the challenges of managing inventory across multiple platforms while running an Instagram business. What started as a simple spreadsheet solution evolved into a powerful tool used by thousands of sellers worldwide.
		          </p>
		        </div>
		        <div className="flex flex-col md:flex-row gap-5">
		          <h2 className="text-3xl md:text-5xl font-bold flex-1 text-white">
		            Mission
		          </h2>
		          <p className="flex-1 text-slate-300">
		            Our mission is to empower Instagram sellers with smart, automated inventory management solutions. We believe that every seller deserves tools that save time, reduce errors, and help them focus on what they do best: growing their business and serving their customers.
		          </p>
		        </div>
		        <div className="flex flex-col md:flex-row gap-5">
		          <h2 className="text-3xl md:text-5xl font-bold flex-1 text-white">
		            Approach
		          </h2>
		          <p className="flex-1 text-slate-300">
		            We take a seller-first approach to everything we build. Our platform integrates seamlessly with your existing Instagram workflow, providing real-time sync, automated alerts, and powerful analytics. We combine intuitive design with robust functionality to create an inventory solution that actually works the way you do.
		          </p>
		        </div>
		      </div>
		    </div>
		  </div>
		</section>
	);
}

