'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TC } from '@/translate/components/client/TClient'

export function DarkModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">
            <TC keys="DarkModeToggle">Design wechseln</TC>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <TC keys="DarkModeToggle" note="This is used in a Dark Mode Toggle.">
            Hell
          </TC>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <TC keys="DarkModeToggle" note="This is used in a Dark Mode Toggle.">
            Dunkel
          </TC>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <TC keys="DarkModeToggle" note="This is used in a Dark Mode Toggle.">
            Automatisch
          </TC>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
