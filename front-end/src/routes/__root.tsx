import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useWebSocket } from '@/hooks/useWebSocket'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { location } = useRouterState()
  const isLandingPage = location.pathname === '/'

  useWebSocket()

  if (isLandingPage) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Triagem IA</h1>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
