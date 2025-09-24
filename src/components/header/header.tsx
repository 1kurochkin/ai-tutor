'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Header = () => {
  const navigationRender = [
    { label: 'Login', href: '/login' },
    { label: 'Signup', href: '/signup' },
  ]

  return (
    <header className="w-full border-b border-dashed border-black transition-transform duration-300">
      <nav className="px-6 lg:px-20 py-5 lg:py-6 w-full flex justify-between items-center">
        <Link href="/" className="font-mono text-xl hover:scale-105">
          {'< AI-TUTOR >'}
        </Link>
        <div className="flex gap-x-2 items-center">
          {navigationRender.map(item => (
            <Button key={item.label} asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
