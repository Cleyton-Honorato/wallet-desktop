import * as Icons from 'lucide-react'
import { LucideProps } from 'lucide-react'

interface CategoryIconProps {
  name: string
  color?: string
  size?: number
  className?: string
}

export function CategoryIcon({ name, color, size = 24, className }: CategoryIconProps) {
  // Mapear nomes de ícones para componentes Lucide
  const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    // Income icons
    'Briefcase': Icons.Briefcase,
    'Laptop': Icons.Laptop,
    'TrendingUp': Icons.TrendingUp,
    'ShoppingBag': Icons.ShoppingBag,
    'DollarSign': Icons.DollarSign,
    'PiggyBank': Icons.PiggyBank,
    'Gift': Icons.Gift,
    'Award': Icons.Award,
    
    // Expense icons
    'UtensilsCrossed': Icons.UtensilsCrossed,
    'Car': Icons.Car,
    'Home': Icons.Home,
    'Heart': Icons.Heart,
    'GraduationCap': Icons.GraduationCap,
    'Gamepad2': Icons.Gamepad2,
    'ShoppingCart': Icons.ShoppingCart,
    'Plane': Icons.Plane,
    'Shirt': Icons.Shirt,
    'Fuel': Icons.Fuel,
    'Phone': Icons.Phone,
    'Zap': Icons.Zap,
    'Wifi': Icons.Wifi,
    'CreditCard': Icons.CreditCard,
    'Building': Icons.Building,
    'Users': Icons.Users,
    'PawPrint': Icons.PawPrint,
    'Wrench': Icons.Wrench,
    'Book': Icons.Book,
    'Music': Icons.Music,
    
    // Default icons
    'Circle': Icons.Circle,
    'Square': Icons.Square,
    'Triangle': Icons.Triangle,
    'Star': Icons.Star,
    'Hash': Icons.Hash,
    'Tag': Icons.Tag,
  }

  const IconComponent = iconMap[name] || Icons.Circle

  return (
    <IconComponent
      size={size}
      style={{ color }}
      className={className}
    />
  )
} 