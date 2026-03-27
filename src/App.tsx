import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import { Shell } from './Shell'
import { AppSidebar } from './components/layout/AppSidebar'
import { DashboardPage } from './pages/DashboardPage'
import { EngagementsPage } from './pages/EngagementsPage'
import { EngagementDetailPage } from './pages/EngagementDetailPage'
import { FindingsPage } from './pages/FindingsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

/* ── Root layout — Shell wraps every route via <Outlet /> ─────────────────── */
function RootLayout() {
  return (
    <Shell sidebar={<AppSidebar />} appName="Phisudo VAPT">
      <Outlet />
    </Shell>
  )
}

/* ── Route tree ───────────────────────────────────────────────────────────── */
const rootRoute = createRootRoute({ component: RootLayout })

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const engagementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/engagements',
  component: EngagementsPage,
})

const engagementDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/engagements/$id',
  component: EngagementDetailPage,
})

const findingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/findings',
  component: FindingsPage,
})

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  engagementsRoute,
  engagementDetailRoute,
  findingsRoute,
  reportsRoute,
  settingsRoute,
])

/* ── Router instance ──────────────────────────────────────────────────────── */
const router = createRouter({ routeTree })

/* ── Type registration (required by @tanstack/react-router) ──────────────── */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/* ── App entry ────────────────────────────────────────────────────────────── */
export default function App() {
  return <RouterProvider router={router} />
}
