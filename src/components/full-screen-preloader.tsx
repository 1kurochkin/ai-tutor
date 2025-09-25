import { Loader2 } from 'lucide-react'

const FullScreenPreloader = ({ className }: { className?: string }) => (
  <div
    className={`w-full h-full flex justify-center items-center absolute bg-white z-10 ${className}`}>
    <Loader2 className="animate-spin w-16 h-16 text-black mx-auto" />
  </div>
)

export default FullScreenPreloader
