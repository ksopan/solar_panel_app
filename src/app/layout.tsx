// src/app/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth-provider'; // Import NextAuthProvider
import './globals.css'
import './fix.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Wrap children with NextAuthProvider */}
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
