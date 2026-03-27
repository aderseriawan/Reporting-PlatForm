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
  Sun,
  Moon,
  ShieldCheck,
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

  const isActive = (href: string) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href)

  return (
    <Sidebar>
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1 py-1">
          {/* Logo mark */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
            style={{ background: 'var(--verdigris)' }}
          >
            <ShieldCheck size={18} color="#fff" strokeWidth={2} />
          </div>
          {/* Brand text */}
          <div className="flex flex-col leading-none">
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: 'var(--snow)' }}
            >
              Phisudo
            </span>
            <span
              className="text-[10px] font-medium uppercase tracking-widest mt-0.5"
              style={{ color: 'var(--pearl-aqua)', opacity: 0.75 }}
            >
              VAPT Platform
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Main nav ──────────────────────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
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

      {/* ── Footer ────────────────────────────────────────────────────────── */}
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

        {/* Theme toggle */}
        <div className="px-2 pb-1">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              color: 'hsl(var(--sidebar-foreground) / 0.65)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--sidebar-accent))'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--sidebar-foreground))'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = ''
              ;(e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--sidebar-foreground) / 0.65)'
            }}
          >
            <span className="relative h-4 w-4 shrink-0 overflow-hidden">
              <Sun
                size={14}
                className={`absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'}`}
              />
              <Moon
                size={14}
                className={`absolute inset-0 transition-all duration-300 ${theme === 'light' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}
              />
            </span>
            <span className="text-[13px]">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Version */}
        <div className="px-3 pb-3 pt-0.5">
          <p className="text-[10px] font-medium tracking-wide" style={{ color: 'hsl(var(--sidebar-foreground) / 0.35)' }}>
            Phisudo VAPT · v1.0.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
