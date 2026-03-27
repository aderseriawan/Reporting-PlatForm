/**
 * AppSidebar — Dark navy sidebar for Phisudo VAPT platform.
 *
 * Uses @blinkdotnew/ui Sidebar primitives and @tanstack/react-router
 * for active-route detection. Pass this as the `sidebar` prop to Shell.
 */
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarSeparator,
} from '@blinkdotnew/ui'
import { useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Briefcase,
  Bug,
  FileText,
  Settings,
  Shield,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

/* ── Nav item definitions ──────────────────────────────────────────────────── */
const mainNavItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',   href: '/' },
  { icon: <Briefcase       size={16} />, label: 'Engagements', href: '/engagements' },
  { icon: <Bug             size={16} />, label: 'Findings',    href: '/findings' },
  { icon: <FileText        size={16} />, label: 'Reports',     href: '/reports' },
]

const footerNavItems = [
  { icon: <Settings size={16} />, label: 'Settings', href: '/settings' },
]

/* ── Component ─────────────────────────────────────────────────────────────── */
export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname
  const { theme, toggleTheme } = useTheme()

  /** Returns true if the nav item should be highlighted as active */
  const isActive = (href: string) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href)

  return (
    <Sidebar>
      {/* ── Brand header ───────────────────────────────────────────────── */}
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-0.5">
          {/* Shield icon badge */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-sm">
            <Shield size={16} />
          </div>

          {/* Brand text */}
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-[hsl(var(--sidebar-foreground))]">
              Phisudo VAPT
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-[hsl(var(--sidebar-foreground)/0.45)]">
              Security Platform
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Main navigation ────────────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          {mainNavItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
            />
          ))}
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer — Settings + Theme Toggle ───────────────────────────── */}
      <SidebarFooter>
        <SidebarSeparator />

        <SidebarGroup>
          {footerNavItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
            />
          ))}
        </SidebarGroup>

        {/* Theme toggle button */}
        <div className="px-3 pb-1">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-[hsl(var(--sidebar-foreground)/0.65)] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200"
          >
            {/* Animated icon swap */}
            <span className="relative h-4 w-4 shrink-0 overflow-hidden">
              <Sun
                size={15}
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 rotate-90 scale-75'
                }`}
              />
              <Moon
                size={15}
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === 'light'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-75'
                }`}
              />
            </span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Version tag */}
        <div className="px-3 pb-2 pt-1">
          <p className="text-[10px] font-medium text-[hsl(var(--sidebar-foreground)/0.40)]">
            Phisudo VAPT · v1.0.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
