import { Outlet, useRouterState, Link } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
} from '@blinkdotnew/ui'
import { Shell } from '../Shell'
import {
  LayoutDashboard,
  Target,
  Bug,
  FileText,
  Shield,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/' },
  { label: 'Engagements', icon: <Target className="w-4 h-4" />, href: '/engagements' },
  { label: 'Findings', icon: <Bug className="w-4 h-4" />, href: '/findings' },
  { label: 'Reports', icon: <FileText className="w-4 h-4" />, href: '/reports' },
]

function AppSidebar() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-1 py-1 group">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-sidebar-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-sidebar-foreground leading-tight">Phisudo VAPT</p>
            <p className="text-xs text-sidebar-foreground/50 leading-tight">Security Platform</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isActive}
              />
            )
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <p className="text-xs text-sidebar-foreground/40 font-mono">v1.0.0 · Public Demo</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppLayout() {
  return (
    <Shell sidebar={<AppSidebar />} appName="Phisudo VAPT">
      <Outlet />
    </Shell>
  )
}
