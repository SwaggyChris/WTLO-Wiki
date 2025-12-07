import type React from "react"
import type { Metadata } from "next"
import "./globals.css"


export const metadata: Metadata = {
  title: "WTLO",
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