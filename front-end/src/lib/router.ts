import { createRouter } from '@tanstack/react-router'
import { rootRoute } from '@/routes/__root'
import { atendenteIdRoute } from '@/routes/atendente/$id'
import { atendenteRoute } from '@/routes/atendente/index'
import { atendimentosIdRoute } from '@/routes/atendimentos/$id'
import { atendimentosRoute } from '@/routes/atendimentos/index'
import { indexRoute } from '@/routes/index'

const routeTree = rootRoute.addChildren([
  indexRoute,
  atendimentosRoute,
  atendimentosIdRoute,
  atendenteRoute,
  atendenteIdRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
