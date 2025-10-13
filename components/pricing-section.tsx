"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { useState } from "react"

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started with v0",
    features: ["5 components per month", "Basic templates", "Community support", "Standard components"],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 24,
    description: "For professionals building serious projects",
    features: [
      "Unlimited components",
      "Premium templates",
      "Priority support",
      "Advanced animations",
      "Custom themes",
      "Export to GitHub",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Team",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For teams collaborating on projects",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Shared component library",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated support",
    ],
    popular: false,
    cta: "Contact Sales",
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section className="relative py-24 px-4">
      
    </section>
  )
}
