import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebLLMProvider } from './context/WebLLMContext.tsx'
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebLLMProvider>
      <App />
    </WebLLMProvider>
  </StrictMode>,
)
