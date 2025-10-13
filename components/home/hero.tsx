"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  const fullText = "Will To Live Online"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTypingComplete(true)
        clearInterval(typingInterval)
      }
    }, 100) // Adjust speed here (100ms per character)

    return () => clearInterval(typingInterval)
  }, [mounted])

  if (!mounted) {
    return null
  }

  const renderColoredText = (text: string) => {
    return text.split(" ").map((word, index) => {
      if (word === "To" || word === "Live" || word === "Online") {
        return (
          <span key={index} className="text-primary">
            {word}{" "}
          </span>
        )
      }
      return <span key={index}>{word} </span>
    })
  }

  return (
    <>
      <section
        className="relative overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat -mt-20 z-10"
        style={{ backgroundImage: "url(/header_bg.jpg)", height: "calc(100vh + 17px)" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0 -top-20"></div>

        <div className="container mx-auto px-4 py-24 pt-32 relative z-10 flex-1 flex flex-col sm:py-14 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center flex-1 flex flex-col justify-center">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              
            </div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4" />
                Latest component
              </Badge>
            </motion.div>

            {/* Main Heading with Typing Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h1
                id="main-title"
                className="text-4xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl px-0 w-full"
              >
                {renderColoredText(displayedText)}
                <span className="animate-pulse text-white">|</span>
              </h1>
              <style jsx>{`
                @keyframes blink {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0; }
                }
              `}</style>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-12 max-w-2xl drop-shadow-lg font-semibold tracking-normal text-2xl text-primary"
            >
              Ultimate MMORPG experience
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Decorative Elements */}

              {/* Get started button */}
              <div className="flex items-center justify-center">
                <a href="/database">
                  <div className="group cursor-pointer border border-border bg-card gap-2 h-[60px] flex items-center p-[10px] rounded-full">
                    <div className="border border-border h-[40px] rounded-full flex items-center justify-center bg-border text-card">
                      <p className="font-medium tracking-tight mr-3 ml-3 flex items-center gap-2 justify-center text-base text-white">
                        Learn More
                      </p>
                    </div>
                    <div className="text-muted-foreground group-hover:ml-4 ease-in-out transition-all size-[24px] flex items-center justify-center rounded-full border-2 border-border">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-right group-hover:rotate-180 ease-in-out transition-all"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Social Proof Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-auto pr-0 pb-px"
          >
            <div className="text-center px-0 mx-0 py-0 my-auto">
              <p className="text-sm text-muted-foreground mb-6">Supported by</p>
              <div className="flex items-center justify-center gap-12 w-auto h-auto my-0 px-0 mx-0 py-[-10px]">
                {/* NVIDIA GeForce Logo */}
                <div className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:drop-shadow-[0_0_8px_rgba(118,185,0,0.5)] transition-all duration-300">
                  <img
                    src="/T_MainMenu_NvidiaGW_Logo.png"
                    alt="NVIDIA GeForce"
                    className="h-10 w-auto object-contain"
                  />
                </div>

                {/* FMOD Logo */}
                <div className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-300">
                  <img src="/T_MainMenu_FMOD_Logo.png" alt="FMOD Audio Engine" className="h-10 w-auto object-contain" />
                </div>

                {/* Unreal Engine Logo */}
                <div className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300">
                  <img src="/T_MainMenu_UE_Logo.png" alt="Unreal Engine" className="object-contain w-full h-20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
