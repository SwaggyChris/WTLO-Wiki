import type React from "react"
import type { Metadata } from "next"
import "./globals.css"


export const metadata: Metadata = {
<<<<<<< HEAD
  title: "WTLO Wiki",
=======
  title: "WTLO",
>>>>>>> 27388ac2a7a233b3fba15223bff6fb747a20ac51
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark font-sans">
      <head>
        <link rel="icon" href="/GameLogoWhite.png" />
      </head>
      <body className="dark">
        {children}
      </body>
    </html>
  )
}