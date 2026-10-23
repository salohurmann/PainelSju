import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/unbounded'
import './index.css'
import { SessaoProvider } from './auth/SessaoProvider'
import { PortaoAcesso } from './auth/PortaoAcesso'
import { AvisosApp } from './components/ui/AvisosApp'
import { registrarServiceWorker } from './lib/pwa'

registrarServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessaoProvider>
      <PortaoAcesso />
      <AvisosApp />
    </SessaoProvider>
  </StrictMode>,
)
