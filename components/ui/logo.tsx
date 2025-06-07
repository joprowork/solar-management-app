import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Panneau solaire stylisé */}
        <rect
          x="8"
          y="12"
          width="24"
          height="16"
          rx="2"
          fill="#3B82F6"
          className="fill-primary-600"
        />
        
        {/* Grille du panneau */}
        <line x1="14" y1="12" x2="14" y2="28" stroke="white" strokeWidth="0.5" />
        <line x1="20" y1="12" x2="20" y2="28" stroke="white" strokeWidth="0.5" />
        <line x1="26" y1="12" x2="26" y2="28" stroke="white" strokeWidth="0.5" />
        <line x1="8" y1="16" x2="32" y2="16" stroke="white" strokeWidth="0.5" />
        <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeWidth="0.5" />
        <line x1="8" y1="24" x2="32" y2="24" stroke="white" strokeWidth="0.5" />
        
        {/* Soleil */}
        <circle
          cx="20"
          cy="8"
          r="3"
          fill="#FACC15"
          className="fill-solar-400"
        />
        
        {/* Rayons du soleil */}
        <g stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" className="stroke-solar-400">
          <line x1="20" y1="2" x2="20" y2="4" />
          <line x1="20" y1="12" x2="20" y2="14" />
          <line x1="14" y1="8" x2="16" y2="8" />
          <line x1="24" y1="8" x2="26" y2="8" />
          <line x1="15.76" y1="4.24" x2="17.17" y2="5.66" />
          <line x1="22.83" y1="10.34" x2="24.24" y2="11.76" />
          <line x1="24.24" y1="4.24" x2="22.83" y2="5.66" />
          <line x1="17.17" y1="10.34" x2="15.76" y2="11.76" />
        </g>
        
        {/* Support/toit stylisé */}
        <path
          d="M6 30 L20 22 L34 30 L32 32 L20 26 L8 32 Z"
          fill="#6B7280"
          className="fill-gray-500"
        />
      </svg>
    </div>
  )
}