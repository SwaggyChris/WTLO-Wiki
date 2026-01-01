import { Marquee } from "@/components/magicui/marquee"

const testimonials = [
  {
    name: "Alex_Survivor",
    username: "Steam Player",
    body: "Amazing survival experience! The crafting system is deep and the world feels alive. Been playing for 200+ hours and still discovering new areas.",
    img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Maria_K",
    username: "VKPlay User",
    body: "Graphics are stunning and the atmosphere is incredible. Love the day/night cycle and weather effects. Perfect for immersive gameplay sessions.",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "DarkWanderer",
    username: "Steam Player",
    body: "The PvP is intense and rewarding. Base building mechanics are solid. Some bugs here and there but devs are actively fixing them.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Katya_Gaming",
    username: "VKPlay User",
    body: "Great community and regular updates. The survival mechanics feel realistic without being too punishing. Highly recommend for MMO fans.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "StalkerVet",
    username: "Steam Player",
    body: "Reminds me of the good old STALKER days. Atmospheric world with great sound design. Performance could be better but still enjoyable.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Elena_Streamer",
    username: "VKPlay User",
    body: "Perfect for streaming! Viewers love watching the tense survival moments. The game creates natural storytelling opportunities.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "WastelandExplorer",
    username: "Steam Player",
    body: "Huge open world with tons to explore. The faction system adds depth to gameplay. Some server issues but overall great experience.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Dmitry_Pro",
    username: "VKPlay User",
    body: "Love the weapon customization and realistic ballistics. Combat feels weighty and satisfying. Best survival MMO I've played in years.",
    img: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "NightRaider",
    username: "Steam Player",
    body: "The night gameplay is terrifying in the best way. Resource management keeps you on edge. Addictive gameplay loop that keeps me coming back.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

const TestimonialCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <div className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset]">
      <div className="absolute -top-5 -left-5 -z-10 h-40 w-40 rounded-full bg-gradient-to-b from-[#e78a53]/10 to-transparent blur-md"></div>

      <div className="text-white/90 leading-relaxed">{body}</div>

      <div className="mt-5 flex items-center gap-2">
        <div className="flex flex-col">
          <div className="leading-5 font-medium tracking-tight text-white">{name}</div>
          <div className="leading-5 tracking-tight text-white/60">{username}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="mb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-[540px]">
          <div className="flex justify-center">
            <button
              type="button"
              className="group relative z-[60] mx-auto rounded-full border border-white/20 bg-white/5 px-6 py-1 text-xs backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 md:text-sm"
            >
              <div className="absolute inset-x-0 -top-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-[#e78a53] to-transparent shadow-2xl transition-all duration-500 group-hover:w-3/4"></div>
              <div className="absolute inset-x-0 -bottom-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-[#e78a53] to-transparent shadow-2xl transition-all duration-500 group-hover:h-px"></div>
              <span className="relative text-white font-medium">Player Reviews
</span>
            </button>
          </div>
          <h2 className="mt-5 text-center text-4xl font-semibold tracking-tighter text-white md:text-[54px] md:leading-[60px] relative z-10">
            What players are saying
          </h2>

          <p className="mt-5 relative z-10 text-center text-lg text-zinc-400">
            Real feedback from our community of survivors across Steam and VKPlay platforms.
          </p>
        </div>

        <div className="my-16 flex max-h-[738px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <div>
            <Marquee pauseOnHover vertical className="[--duration:20s]">
              {firstColumn.map((testimonial) => (
                <TestimonialCard key={testimonial.username} {...testimonial} />
              ))}
            </Marquee>
          </div>

          <div className="hidden md:block">
            <Marquee reverse pauseOnHover vertical className="[--duration:25s]">
              {secondColumn.map((testimonial) => (
                <TestimonialCard key={testimonial.username} {...testimonial} />
              ))}
            </Marquee>
          </div>

          <div className="hidden lg:block">
            <Marquee pauseOnHover vertical className="[--duration:30s]">
              {thirdColumn.map((testimonial) => (
                <TestimonialCard key={testimonial.username} {...testimonial} />
              ))}
            </Marquee>
          </div>
        </div>

        <div className="-mt-8 flex justify-center">
          
        </div>
      </div>
    </section>
  )
}
