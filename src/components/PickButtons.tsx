'use client'

import { Pick } from '@/lib/types'

interface PickButtonsProps {
  selected: Pick | null
  onSelect: (pick: Pick) => void
  disabled?: boolean
}

const LABELS: Record<Pick, string> = { H: 'L', D: 'E', A: 'V' }
const COLORS: Record<Pick, string> = {
  H: 'border-[#0C53A1] bg-[#0C53A1] text-white',
  D: 'border-yellow-500 bg-yellow-500 text-black',
  A: 'border-blue-500 bg-blue-500 text-white',
}
const INACTIVE: Record<Pick, string> = {
  H: 'border-[#0C53A1]/40 text-[#2970CA] hover:border-[#0C53A1] hover:bg-[#0C53A1]/20',
  D: 'border-yellow-500/40 text-yellow-400 hover:border-yellow-500 hover:bg-yellow-500/20',
  A: 'border-blue-500/40 text-blue-400 hover:border-blue-500 hover:bg-blue-500/20',
}

export function PickButtons({ selected, onSelect, disabled }: PickButtonsProps) {
  return (
    <div className="flex gap-2 justify-center">
      {(['H', 'D', 'A'] as Pick[]).map((pick) => (
        <button
          key={pick}
          onClick={() => !disabled && onSelect(pick)}
          disabled={disabled}
          className={`w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all duration-150
            ${selected === pick ? COLORS[pick] : INACTIVE[pick]}
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {LABELS[pick]}
        </button>
      ))}
    </div>
  )
}
