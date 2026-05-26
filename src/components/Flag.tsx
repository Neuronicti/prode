interface FlagProps {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl' }

export function Flag({ code, size = 'md' }: FlagProps) {
  return (
    <span
      className={`fi fi-${code} rounded-sm ${sizeClass[size]}`}
      style={{ fontSize: size === 'lg' ? '2rem' : size === 'md' ? '1.25rem' : '1rem' }}
    />
  )
}
