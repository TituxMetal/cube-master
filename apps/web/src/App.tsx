import { Layout } from '~/layouts/Layout'
import { Router } from '~/lib/router'
import { Coach } from '~/pages/Coach'
import { Home } from '~/pages/Home'
import { Solver } from '~/pages/Solver'
import { Timer } from '~/pages/Timer'

const routes = {
  '/': () => <Home />,
  '/solver': () => <Solver />,
  '/coach': () => <Coach />,
  '/timer': () => <Timer />
}

export const App = () => (
  <Layout>
    <Router routes={routes} fallback={() => <Home />} />
  </Layout>
)
