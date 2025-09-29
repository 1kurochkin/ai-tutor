import { Loader2 } from 'lucide-react'
import React from 'react'

const FullScreenPreloader = ({
  className,
  message,
}: {
  className?: string
  message?: string
}) => (
  <div
    className={`w-full h-full flex flex-col gap-4 justify-center items-center absolute bg-white z-10 ${className}`}>
    <span>{message}</span>
    <Loader2 className="animate-spin w-16 h-16 text-black mx-auto" />
  </div>
)

export default FullScreenPreloader
