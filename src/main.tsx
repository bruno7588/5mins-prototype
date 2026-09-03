import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/typography.css'
import App from './App'
import './App.css'

// Design Inspect is dev tooling; the lazy import keeps it out of the production bundle.
const DesignInspect = import.meta.env.DEV
  ? lazy(() => import('./dev/DesignInspect/DesignInspect'))
  : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {DesignInspect && (
        <Suspense fallback={null}>
          <DesignInspect />
        </Suspense>
      )}
    </BrowserRouter>
  </StrictMode>,
)
