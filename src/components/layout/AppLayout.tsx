import { Outlet, useLocation } from '@tanstack/react-router'
import {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  MobileSidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
} from '@blinkdotnew/ui'
import {
  LayoutDashboard,
  Shield,
  Bug,
  FileText,
  Settings,
} from 'lucide-react'

const navItems = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard',   href: '/' },
  { icon: <Shield         size={16} />, label: 'Engagements',  href: '/engagements' },
  { icon: <Bug            size={16} />, label: 'Findings',     href: '/findings' },
  { icon: <FileText       size={16} />, label: 'Reports',      href: '/reports' },
  { icon: <Settings       size={16} />, label: 'Settings',     href: '/settings' },
]

export function AppLayout() {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <AppShell>
      <AppShellSidebar>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Shield size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-sidebar-foreground">
                  Phisudo VAPT
                </span>
                <span className="text-[10px] leading-tight text-sidebar-foreground/50">
                  Security Platform
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={
                    item.href === '/'
                      ? currentPath === '/'
                      : currentPath.startsWith(item.href)
                  }
                />
              ))}
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-2 py-1">
              <p className="text-xs font-medium text-sidebar-foreground/60">VAPT Platform</p>
              <p className="text-[10px] text-sidebar-foreground/40">v1.0.0</p>
            </div>
          </SidebarFooter>
        </Sidebar>
      </AppShellSidebar>

      <AppShellMain>
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <MobileSidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground">
              <Shield size={12} />
            </div>
            <span className="font-semibold text-sm text-foreground">Phisudo VAPT</span>
          </div>
        </div>

        <Outlet />
      </AppShellMain>
    </AppShell>
  )
}
