/**
 * Shell — Mobile-responsive app layout.
 *
 * USAGE (in App.tsx or your router):
 *   <Shell sidebar={<MySidebarContent />}>
 *     <Page>...</Page>
 *   </Shell>
 *
 * The sidebar is hidden on mobile and toggled by the built-in hamburger button.
 * Customize sidebar width, colors, and nav items — but keep this structure.
 */
import React from 'react'
import {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  MobileSidebarTrigger,
} from '@blinkdotnew/ui'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './hooks/useTheme'

interface ShellProps {
  /** Sidebar content — e.g. <Sidebar><SidebarItem .../></Sidebar> */
  sidebar: React.ReactNode
  /** App name shown in mobile header */
  appName?: string
  children: React.ReactNode
}

export function Shell({ sidebar, appName = 'App', children }: ShellProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppShell>
      {/* Sidebar — hidden on mobile, always visible on md+ */}
      <AppShellSidebar>
        {sidebar}
      </AppShellSidebar>

      {/* Main content */}
      <AppShellMain>
        {/* Mobile header — hamburger + app name + theme toggle, only shown below md breakpoint */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <MobileSidebarTrigger />
          <span className="font-semibold text-sm flex-1">{appName}</span>
          {/* Mobile theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Page content */}
        {children}
      </AppShellMain>
    </AppShell>
  )
}
