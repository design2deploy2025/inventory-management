export function How() {
  const steps = [
    "Connect your Instagram Shop in minutes",
    "Sync Your Products automatically",
    "Track & Manage Inventory in real-time",
    "Grow Your Sales with smart insights",
  ];

  return (
    <section className="relative bg-black text-white bg-top bg-cover pb-32" id="how-it-works">
      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-10 md:py-16 lg:py-20">
        {/* Heading */}
        <h2 className="mx-auto mb-12 max-w-sm text-center text-3xl font-bold md:mb-24 md:max-w-xl md:text-5xl bg-gradient-to-r from-[#748298] to-white text-transparent bg-clip-text">
          How InstaStock Works
        </h2>

        {/* Steps */}
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-start">
          {steps.map((text, index) => (
            <div
              key={index}
              style={{ transform: `translateY(${index * 56}px)` }}
              className="relative flex w-full items-center rounded-lg border border-white/15 bg-white/10 p-6"
            >
              {/* Icon */}
              <div className="flex-shrink-0 rounded-full bg-indigo-600 p-4">
                <svg
                  width="32"
                  height="33"
                  viewBox="0 0 32 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.2"
                    d="M29 21.1836L16.4875 28.2836C16.3374 28.3635 16.17 28.4053 16 28.4053C15.83 28.4053 15.6626 28.3635 15.5125 28.2836L3 21.1836L16 13.8086L29 21.1836Z"
                    fill="white"
                  />
                  <path
                    d="M29 13.1846L16 20.5596L3 13.1846L15.5125 6.08455C15.6626 6.00467 15.83 5.96289 16 5.96289C16.17 5.96289 16.3374 6.00467 16.4875 6.08455L29 13.1846Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="ml-4">
                <p className="text-lg font-semibold text-white">{text}</p>
              </div>

              {/* Step Number */}
              <div className="absolute -right-4 -top-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                <span className="font-bold text-white">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
