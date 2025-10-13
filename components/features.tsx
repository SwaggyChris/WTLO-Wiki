"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { theme } = useTheme()
  const [isHovering, setIsHovering] = useState(false)
  const [isCliHovering, setIsCliHovering] = useState(false)
  const [isFeature3Hovering, setIsFeature3Hovering] = useState(false)
  const [isFeature4Hovering, setIsFeature4Hovering] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const [baseColor, setBaseColor] = useState<[number, number, number]>([0.906, 0.541, 0.325]) // #e78a53 in RGB normalized
  const [glowColor, setGlowColor] = useState<[number, number, number]>([0.906, 0.541, 0.325]) // #e78a53 in RGB normalized

  const [dark, setDark] = useState<number>(theme === "dark" ? 1 : 0)

  useEffect(() => {
    setBaseColor([0.906, 0.541, 0.325]) // #e78a53
    setGlowColor([0.906, 0.541, 0.325]) // #e78a53
    setDark(theme === "dark" ? 1 : 0)
  }, [theme])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setInputValue("")
    }
  }

  return (
    <section id="features" className="text-foreground relative overflow-hidden py-12 sm:py-24 md:py-32">
      <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl select-none"></div>
      <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent transition-all ease-in-out"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">About the Game</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover an immersive gaming experience like no other
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Game Cover Image */}
          <div className="relative group">
            <img
              src="/cover-image-wtlo.png"
              alt="Will To Live Online Game Poster"
              className="w-full h-[500px] object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Game Description */}
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Epic Adventure Awaits</h3>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Embark on a legendary journey through mystical realms where every decision shapes your destiny.
                Experience cutting-edge gameplay mechanics that blend traditional RPG elements with innovative real-time
                strategy components.
              </p>
              <p className="text-lg leading-relaxed">
                Master powerful abilities, forge alliances with unique characters, and uncover ancient secrets in a
                world that responds dynamically to your choices. With stunning visuals powered by the latest technology
                and an immersive soundtrack, prepare for an unforgettable adventure.
              </p>
            </div>

            {/* Game Features */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Open World Exploration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Dynamic Combat System</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Multiplayer Co-op</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Epic Boss Battles</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
