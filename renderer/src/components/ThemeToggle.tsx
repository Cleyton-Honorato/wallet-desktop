import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Modo Claro'
      case 'dark':
        return 'Modo Escuro'
      default:
        return 'Modo Sistema'
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="flex items-center gap-2 h-9 px-3"
      title={`Tema atual: ${getThemeLabel()}. Clique para alternar.`}
    >
      {getThemeIcon()}
      <span className="hidden sm:inline-block text-sm">
        {getThemeLabel()}
      </span>
    </Button>
  )
} 