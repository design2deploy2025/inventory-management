export default function Footer() {
    return (
        <footer className="w-full bg-black text-white bg-center bg-cover">
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6">
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
                </div>
                <p className="text-center max-w-xl text-sm font-normal leading-relaxed text-slate-300">
                    Empowering Instagram sellers with smart inventory management tools. Track, manage, and grow your social commerce business with ease.
                </p>
            </div>
            <div className="border-t border-white/15">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal">
                    <a href="/" className="text-indigo-400 hover:text-indigo-300">InstaStock</a> 2024. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

