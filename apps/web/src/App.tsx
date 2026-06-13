import { Layout } from '~/layouts/Layout'
import type { RouteMap } from '~/lib/router'
import { Router } from '~/lib/router'
import { Coach } from '~/pages/Coach'
import { Home } from '~/pages/Home'
import { Solver } from '~/pages/Solver'
import { Timer } from '~/pages/Timer'

const routes: RouteMap = {
  '/': () => <Home />,
  '/solver': () => <Solver />,
  '/coach': () => <Coach />,
  '/coach/:lessonId': params => <Coach lessonId={params.lessonId} />,
  '/timer': () => <Timer />
}

export const App = () => (
  <Layout>
    <Router routes={routes} fallback={() => <Home />} />
  </Layout>
)
