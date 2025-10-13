'use client'
import { useState, useEffect } from 'react'
import Hero from '@/components/home/hero'
import Features from '@/components/features'
import { TestimonialsSection } from '@/components/testimonials'
import { NewReleasePromo } from '@/components/new-release-promo'
import { FAQSection } from '@/components/faq-section'
import { PricingSection } from '@/components/pricing-section'
import { StickyFooter } from '@/components/sticky-footer'
import Image from 'next/image'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'system')
    root.classList.add('dark')
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    if (isHighContrast) {
      try {
        root.style.setProperty('--background', '0 0% 0%')
        root.style.setProperty('--foreground', '0 0% 100%')
        root.style.setProperty('--muted-foreground', '0 0% 90%')
        root.style.setProperty('--border', '0 0% 100%')
        root.style.setProperty('--input', '0 0% 5%')
        root.style.setProperty('--card', '0 0% 5%')
        root.style.setProperty('--card-foreground', '0 0% 100%')
        root.style.setProperty('--primary', '0 0% 100%')
        root.style.setProperty('--primary-foreground', '0 0% 0%')
        root.style.setProperty('--secondary', '0 0% 10%')
        root.style.setProperty('--secondary-foreground', '0 0% 100%')
        root.style.setProperty('--accent', '0 0% 15%')
        root.style.setProperty('--accent-foreground', '0 0% 100%')
        root.style.setProperty('--destructive', '0 0% 100%')
        root.style.setProperty('--destructive-foreground', '0 0% 0%')
        root.style.setProperty('--ring', '0 0% 100%')
        root.style.setProperty('--radius', '0rem')
        root.classList.add('high-contrast')
      } catch (error) {
        console.error('Error setting high contrast styles:', error)
      }
    } else {
      try {
        const propertiesToRemove = [
          '--background',
          '--foreground',
          '--muted-foreground',
          '--border',
          '--input',
          '--card',
          '--card-foreground',
          '--primary',
          '--primary-foreground',
          '--secondary',
          '--secondary-foreground',
          '--accent',
          '--accent-foreground',
          '--destructive',
          '--destructive-foreground',
          '--ring',
          '--radius',
        ]

        propertiesToRemove.forEach((prop) => {
          root.style.removeProperty(prop)
        })
        root.classList.remove('high-contrast')
      } catch (error) {
        console.error('Error removing high contrast styles:', error)
      }
    }
  }, [isHighContrast])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        const headerOffset = 120 // Account for sticky header height + margin
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-background/80 md:flex backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 ${isScrolled ? 'max-w-4xl px-2' : 'max-w-6xl px-4'} py-3`}
        style={{          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      >
        <a
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${isScrolled ? 'ml-4' : ''}`}
          href='/'
        >
          <Image src='/GameLogoWhite.png' alt='Will to Live Online' width={52} height={52} className='object-contain' />
          <span className='text-sm font-semibold text-foreground hidden lg:block'></span>
        </a>

        

        <div className='absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground md:flex md:space-x-2 shadow-md mr-32'>
          <a
            className='relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            href='/database'
          >
            <span className='relative z-20'>WTLO Database</span>
          </a>
          <a
            className='relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            href='/map'
          >
            <span className='relative z-20'>WTLO Map</span>
          </a>
          <a
            className='relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById('testimonials')
              if (element) {
                const headerOffset = 120 // Account for sticky header height + margin
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                })
              }
            }}
          >
            <span className='relative z-20'>Community</span>
          </a>
          <a
            className='relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById('faq')
              if (element) {
                const headerOffset = 120 // Account for sticky header height + margin
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                })
              }
            }}
          >
            <span className='relative z-20'>About Us</span>
          </a>
          <a
            className='relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
              })
            }}
          >
            <span className='relative z-20'>Contact Us</span>
          </a>
        </div>

        <div className='flex items-center space-x-3 z-50'>
          {/* Search Bar */}
          <div className='relative'>
            <input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-40 px-3 py-1.5 text-sm bg-background/50 border border-border/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all'
            />
            <svg
              className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          {/* High Contrast Button */}
        </div>
      </header>

      {/* Mobile Header */}
      <div className='fixed top-4 left-4 right-4 z-[9999] md:hidden'>
        <header className={`flex w-full flex-row items-center justify-between ${isMobileMenuOpen ? 'rounded-t-2xl' : 'rounded-full'} bg-background/90 backdrop-blur-md ${isMobileMenuOpen ? 'border-x border-t' : 'border'} border-border/50 shadow-xl px-4 py-4 transition-all duration-300`}>
          <a className='flex items-center justify-center gap-2' href='/'>
            <Image src='/GameLogoWhite.png' alt='Will to Live Online' width={48} height={48} className='object-contain' />
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='flex items-center justify-center w-10 h-10 rounded-full bg-background/60 border border-border/50 transition-all duration-300 hover:bg-background/80 hover:scale-105 active:scale-95'
            aria-label='Toggle menu'
          >
            <div className='flex flex-col items-center justify-center w-5 h-5 space-y-1'>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
              ></span>
            </div>
          </button>
        </header>

        {/* Mobile Menu - Attached to navbar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className='bg-background/95 backdrop-blur-md border-x border-b border-border/50 rounded-b-2xl shadow-2xl p-6 mt-0'>
            <nav className='flex flex-col space-y-3'>
              <a
                href='/database'
                className='text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-background/60 hover:scale-[1.02] hover:shadow-sm'
              >
                WTLO Database
              </a>
              <a
                href='/map'
                className='text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-background/60 hover:scale-[1.02] hover:shadow-sm'
              >
                WTLO Map
              </a>
              <button
                onClick={() => handleMobileNavClick('testimonials')}
                className='text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-background/60 hover:scale-[1.02] hover:shadow-sm'
              >
                Community
              </button>
              <button
                onClick={() => handleMobileNavClick('faq')}
                className='text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-background/60 hover:scale-[1.02] hover:shadow-sm'
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth',
                    })
                  }, 100)
                }}
                className='text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-background/60 hover:scale-[1.02] hover:shadow-sm mb-4'
              >
                Contact Us
              </button>

              <div className='border-t border-border/50 pt-6 mt-6'>
                <div className='relative mb-4'>
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full px-4 py-3 text-lg bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all'
                  />
                  <svg
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div id='features'>
        <Features />
      </div>

      {/* Pricing Section */}
      <div id='pricing'>
        <PricingSection />
      </div>

      {/* Testimonials Section */}
      <div id='testimonials'>
        <TestimonialsSection />
      </div>

      <NewReleasePromo />

      {/* FAQ Section */}
      <div id='faq'>
        <FAQSection />
      </div>

      {/* Sticky Footer */}
      <StickyFooter />
    </div>
  )
}
