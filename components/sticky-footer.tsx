"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100

          setIsAtBottom(isNearBottom)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="fixed z-50 bottom-0 left-0 w-full h-auto max-h-[70vh] md:h-72 flex justify-center items-center border-t border-border/50 bg-background/95 backdrop-blur-sm"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(120, 119, 198, 0.3), transparent)" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative overflow-y-auto w-full h-full flex flex-col md:flex-row justify-between px-4 md:px-12 py-4 md:py-8 text-foreground">
            {/* Logo and Description */}
            <motion.div
              className="flex flex-col md:flex-row w-full space-y-6 md:space-y-0 md:space-x-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex flex-col space-y-3 md:space-y-4 md:w-1/3">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/GameLogoWhite.png"
                    alt="Will to Live Online"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <h3 className="text-xl font-bold">WTLO Wiki</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Survive in a post-apocalyptic world filled with danger, mystery, and endless possibilities. Join
                  thousands of players in this immersive MMORPG survival experience.
                </p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Powered by</span>
                  <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="36" height="36" viewBox="0 0 48 48">
                      <path fill="white" d="M18.974,31.5c0,0.828-0.671,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-14c0-0.653,0.423-1.231,1.045-1.43 c0.625-0.198,1.302,0.03,1.679,0.563l16.777,23.704C40.617,36.709,44,30.735,44,24c0-11-9-20-20-20S4,13,4,24s9,20,20,20 c3.192,0,6.206-0.777,8.89-2.122L18.974,22.216V31.5z M28.974,16.5c0-0.828,0.671-1.5,1.5-1.5s1.5,0.672,1.5,1.5v13.84l-3-4.227 V16.5z"></path>
                    </svg>
                    <span>Next.js</span>
                  </a>
                </div>
              </div>

              {/* Links Grid for Mobile */}
              <div className="grid grid-cols-2 gap-6 md:flex md:space-x-8 md:w-2/3">
                {/* Game Links */}
                <div className="flex flex-col space-y-2 md:space-y-3">
                  <h4 className="text-md font-semibold text-primary">Play Now</h4>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        Steam Store
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        VKPlay
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        Official Website
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        System Requirements
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Resources */}
                <div className="flex flex-col space-y-2 md:space-y-3">
                  <h4 className="text-md font-semibold text-primary">Resources</h4>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        Game Guide
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        Wiki
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        Patch Notes
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-primary transition-colors cursor-pointer">
                        Support
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Social Media */}
                <div className="flex flex-col space-y-2 md:space-y-3 col-span-2 md:col-span-1">
                  <h4 className="text-md font-semibold text-primary">Follow Us</h4>
                  <div className="grid grid-cols-4 gap-2 md:grid-cols-2 md:gap-3 text-sm">
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/005-discord.png" alt="Discord" width={18} height={18} />
                      <span className="hidden md:inline">Discord</span>
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/002-twitter.png" alt="Twitter" width={18} height={18} className="filter invert" />
                      <span className="hidden md:inline">Twitter</span>
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/001-youtube.png" alt="YouTube" width={18} height={18} />
                      <span className="hidden md:inline">YouTube</span>
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/006-reddit.png" alt="Reddit" width={18} height={18} />
                      <span className="hidden md:inline">Reddit</span>
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/004-vk.png" alt="VK" width={18} height={18} />
                      <span className="hidden md:inline">VK</span>
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/007-twitch.png" alt="Twitch" width={18} height={18} />
                      <span className="hidden md:inline">Twitch</span>
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Image src="/003-tiktok.png" alt="TikTok" width={18} height={18} />
                      <span className="hidden md:inline">TikTok</span>
                    </a>
                  </div>
                </div>

                {/* Credit Line */}
                <div className="flex flex-col items-center space-y-2 col-span-2 md:col-span-1">
                  <div className="flex flex-col items-center space-y-2">
                    <Image 
                      src="/SWAGG Gold Metal.png" 
                      alt="SwaggyChris Logo" 
                      width={78} 
                      height={78} 
                      className="object-contain opacity-90"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Made by <span className="text-primary font-medium">SwaggyChris</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
