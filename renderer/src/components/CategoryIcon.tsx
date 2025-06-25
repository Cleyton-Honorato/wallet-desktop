import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

interface CategoryIconProps {
  icon: string
  color?: string
  className?: string
  size?: number | 'sm' | 'md' | 'lg'
}

export function CategoryIcon({ icon, color, className, size = 'md' }: CategoryIconProps) {
  // Get the icon component from lucide-react or fallback to HelpCircle
  const IconComponent = (Icons[icon as keyof typeof Icons] as LucideIcon) || Icons.HelpCircle

  // Convert size to pixels
  let sizeInPixels: number
  switch (size) {
    case 'sm':
      sizeInPixels = 16
      break
    case 'lg':
      sizeInPixels = 24
      break
    case 'md':
      sizeInPixels = 20
      break
    default:
      sizeInPixels = typeof size === 'number' ? size : 20
  }

  return (
    <div 
      className={cn('inline-flex items-center justify-center', className)} 
      style={{ color }}
    >
      <IconComponent size={sizeInPixels} />
    </div>
  )
} 