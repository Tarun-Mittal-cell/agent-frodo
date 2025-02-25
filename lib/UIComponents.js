// lib/UIComponents.js
// Modern UI component templates for consistent, high-quality generated websites

// Import image utilities for reliable images
import ImageUtils from "./ImageUtils";

// Modern UI patterns that can be used in generated websites
const UIComponents = {
  // ----- HERO SECTIONS -----

  // Modern gradient hero with image
  gradientHero: `
<section className="relative min-h-[85vh] bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center">
  <div className="absolute inset-0 opacity-20">
    <img 
      src="${ImageUtils.getRandomImage("abstract").url}" 
      alt="Background texture" 
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
  <div className="container mx-auto px-4 py-20 relative z-10">
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        Your Modern <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Website</span> Solution
      </h1>
      <p className="text-xl text-slate-300 mb-8">
        Create stunning, modern websites with advanced features and beautiful designs.
      </p>
      <div className="flex flex-wrap gap-4">
        <a href="#features" className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95">
          Get Started
        </a>
        <a href="#learn-more" className="px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition-all duration-300 hover:bg-white/20">
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>`,

  // Video background hero
  videoHero: `
<section className="relative min-h-[90vh] overflow-hidden">
  <div className="absolute inset-0 bg-black/60 z-10"></div>
  <video 
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay 
    muted 
    loop 
    playsInline
  >
    <source src="https://assets.mixkit.co/videos/preview/mixkit-setting-up-a-tent-in-the-snow-4330-large.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <div className="container mx-auto px-4 py-20 relative z-20 h-[90vh] flex flex-col justify-center">
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        Experience the Difference
      </h1>
      <p className="text-xl text-white/80 mb-8">
        Stunning visuals and powerful performance combined in one beautiful package.
      </p>
      <a href="#discover" className="inline-block px-8 py-4 bg-white text-slate-900 font-bold rounded-full transition-all duration-300 hover:bg-opacity-90 hover:scale-105 active:scale-100">
        Discover Now
      </a>
    </div>
  </div>
</section>`,

  // Split content/image hero
  splitHero: `
<section className="min-h-[80vh] bg-slate-50 dark:bg-slate-900">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
      <div className="flex flex-col justify-center p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
          Modern Design <br/>For Modern <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600">Businesses</span>
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-xl">
          We create stunning websites that help you stand out from the competition and connect with your audience.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Learn More
          </button>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 opacity-90 rounded-l-3xl"></div>
        <img 
          src="${ImageUtils.getRandomImage("business").url}" 
          alt="Business team collaboration" 
          className="h-full w-full object-cover rounded-l-3xl mix-blend-overlay"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</section>`,

  // ----- CARD COMPONENTS -----

  // Glass morphism card
  glassCard: `
<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
  <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
    {/* Icon here */}
  </div>
  <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Feature Title</h3>
  <p className="text-gray-300">Feature description with clean, modern details explaining the value provided.</p>
</div>`,

  // Product card
  productCard: `
<div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
  <div className="relative h-64 overflow-hidden">
    <img 
      src="${ImageUtils.getRandomImage("products").url}" 
      alt="Product name" 
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      loading="lazy"
    />
    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">SALE</div>
  </div>
  <div className="p-6">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Product Name</h3>
    <div className="flex items-center mb-2">
      <div className="flex text-amber-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">(42 reviews)</span>
    </div>
    <div className="flex items-center justify-between mt-4">
      <div>
        <span className="text-lg font-bold text-slate-900 dark:text-white">$49.99</span>
        <span className="text-sm text-slate-500 dark:text-slate-400 line-through ml-2">$69.99</span>
      </div>
      <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      </button>
    </div>
  </div>
</div>`,

  // Testimonial card
  testimonialCard: `
<div className="backdrop-blur-md bg-white/10 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-xl shadow-xl p-6">
  <div className="flex items-center mb-4">
    <div className="mr-4 rounded-full overflow-hidden w-12 h-12 border-2 border-white/20">
      <img 
        src="${ImageUtils.getRandomImage("people").url}" 
        alt="Customer name" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div>
      <h4 className="text-lg font-semibold text-white dark:text-white">John Smith</h4>
      <p className="text-sm text-slate-300 dark:text-slate-400">CEO at TechCorp</p>
    </div>
  </div>
  <p className="italic text-slate-300 dark:text-slate-300 mb-4">
    "This product has completely transformed our workflow. The intuitive interface and powerful features have saved us countless hours."
  </p>
  <div className="flex text-amber-400">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  </div>
</div>`,

  // Team member card
  teamCard: `
<div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
  <div className="relative h-80">
    <img 
      src="${ImageUtils.getRandomImage("people").url}" 
      alt="Team member name" 
      className="w-full h-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
      <h3 className="text-xl font-bold text-white">Sarah Johnson</h3>
      <p className="text-white/80">Chief Design Officer</p>
    </div>
  </div>
  <div className="p-6">
    <p className="text-slate-600 dark:text-slate-300 mb-4">
      With over 10 years of experience in UX/UI design, Sarah leads our creative team with vision and expertise.
    </p>
    <div className="flex space-x-3">
      <a href="#" className="text-blue-500 hover:text-blue-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
      </a>
      <a href="#" className="text-blue-700 hover:text-blue-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.225 0H1.77C.79 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.77 24h20.452C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /><path d="M7.386 19.876H4.13V9.284h3.256v10.592zM5.758 7.9c-1.044 0-1.88-.845-1.88-1.887 0-1.043.836-1.886 1.88-1.886s1.88.843 1.88 1.886c0 1.042-.836 1.887-1.88 1.887zM20.13 19.876h-3.236v-5.14c0-1.202-.024-2.746-1.678-2.746-1.678 0-1.933 1.307-1.933 2.658v5.228H9.95V9.284h3.105v1.413h.043c.43-.812 1.48-1.67 3.047-1.67 3.26 0 3.86 2.14 3.86 4.925v5.923h.126z" />
        </svg>
      </a>
      <a href="#" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
        </svg>
      </a>
    </div>
  </div>
</div>`,

  // ----- SECTION COMPONENTS -----

  // Features section with glass cards
  featuresSection: `
<section className="py-20 bg-gradient-to-br from-slate-900 to-indigo-950">
  <div className="container mx-auto px-4">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
        Powerful <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Features</span>
      </h2>
      <p className="text-slate-300 text-lg">
        Everything you need to create stunning modern websites with advanced functionality.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Feature 1 */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Lightning Fast</h3>
        <p className="text-gray-300">Optimized performance ensures your website loads quickly and runs smoothly on all devices.</p>
      </div>
      
      {/* Feature 2 */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Stunning Design</h3>
        <p className="text-gray-300">Modern aesthetics with attention to detail create a beautiful user experience your visitors will love.</p>
      </div>
      
      {/* Feature 3 */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Fully Responsive</h3>
        <p className="text-gray-300">Your website looks perfect on all devices, from mobile phones to desktop computers.</p>
      </div>
      
      {/* Feature 4 */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Secure & Reliable</h3>
        <p className="text-gray-300">Built with security best practices to ensure your data is protected at all times.</p>
      </div>
      
      {/* Feature 5 */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">SEO Optimized</h3>
        <p className="text-gray-300">Built-in search engine optimization helps your website rank higher in search results.</p>
      </div>
      
      {/* Feature 6 */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Analytics Integration</h3>
        <p className="text-gray-300">Track your website's performance with built-in analytics and insightful reporting tools.</p>
      </div>
    </div>
  </div>
</section>`,

  // Modern contact form
  contactForm: `
<section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
  <div className="container mx-auto px-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 bg-gradient-to-br from-blue-600 to-violet-700 text-white">
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <p className="mb-8">Have questions or want to learn more? Send us a message and we'll get back to you as soon as possible.</p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Address</h3>
                  <p>123 Business Avenue, Suite 100<br />San Francisco, CA 94107</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Email</h3>
                  <p>info@yourcompany.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Phone</h3>
                  <p>(123) 456-7890</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors" 
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors" 
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors" 
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows="4" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors" 
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button type="submit" className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,

  // Modern footer
  modernFooter: `
<footer className="bg-slate-900 text-white pt-16 pb-8">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <div>
        <h3 className="text-xl font-bold mb-4">Company Name</h3>
        <p className="text-slate-400 mb-6">Creating beautiful digital experiences that help businesses succeed online.</p>
        <div className="flex space-x-4">
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
            </svg>
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
            </svg>
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
            </svg>
          </a>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Services</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Portfolio</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Testimonials</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Services</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Web Design</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Web Development</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">E-commerce</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Mobile Apps</a></li>
          <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Digital Marketing</a></li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Newsletter</h3>
        <p className="text-slate-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
        <form className="flex">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="px-4 py-2 rounded-l-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
          />
          <button 
            type="submit" 
            className="px-4 py-2 rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
    
    <div className="border-t border-slate-800 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Company Name. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </div>
</footer>`,

  // ----- NAVIGATION COMPONENTS -----

  // Modern glass navbar
  glassNavbar: `
<header className="fixed w-full top-0 left-0 z-50">
  <div className="backdrop-blur-md bg-white/10 border-b border-white/20">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <a href="#" className="text-2xl font-bold text-white">
          Logo
        </a>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-white hover:text-blue-400 transition-colors">Home</a>
          <a href="#" className="text-white hover:text-blue-400 transition-colors">About</a>
          <a href="#" className="text-white hover:text-blue-400 transition-colors">Services</a>
          <a href="#" className="text-white hover:text-blue-400 transition-colors">Portfolio</a>
          <a href="#" className="text-white hover:text-blue-400 transition-colors">Contact</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <a href="#" className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all">
            Login
          </a>
          <a href="#" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            Sign Up
          </a>
          
          <button className="block md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</header>`,

  // Modern sidebar navigation
  sidebarNav: `
<div className="flex h-screen bg-slate-900">
  <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
    <div className="flex items-center justify-center mb-8">
      <h1 className="text-2xl font-bold text-white">Logo</h1>
    </div>
    
    <nav className="space-y-2">
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-600 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Dashboard</span>
      </a>
      
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Profile</span>
      </a>
      
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Messages</span>
      </a>
      
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Settings</span>
      </a>
      
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Calendar</span>
      </a>
      
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Analytics</span>
      </a>
    </nav>
    
    <div className="absolute bottom-0 left-0 w-64 p-4">
      <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Logout</span>
      </a>
    </div>
  </div>
  
  <div className="flex-1 p-8 bg-slate-900">
    <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
    {/* Content goes here */}
  </div>
</div>`,

  // Utility function to generate a component from any of the above templates
  generateComponent: (componentType, customizations = {}) => {
    const component = UIComponents[componentType];
    if (!component) {
      return `<div>Component "${componentType}" not found</div>`;
    }

    // Apply any customizations (future enhancement)
    let customizedComponent = component;

    return customizedComponent;
  },
};

export default UIComponents;
