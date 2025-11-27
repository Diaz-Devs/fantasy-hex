import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

// Debug: Log the values being used
console.log('Auth0 Configuration:', {
  domain,
  clientId,
  hasDomain: !!domain,
  hasClientId: !!clientId
})

// Validate Auth0 configuration
if (!domain || !clientId) {
  console.error('Auth0 configuration missing. Please check your .env file or GitHub Secrets.')
  console.error('Required environment variables:')
  console.error('- VITE_AUTH0_DOMAIN')
  console.error('- VITE_AUTH0_CLIENT_ID')
  console.error('Current values:', { domain, clientId })
  // Show error in UI instead of throwing
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1e27; color: #e2e8f0; font-family: system-ui; padding: 2rem; text-align: center;">
        <div>
          <h1 style="color: #fc8181; margin-bottom: 1rem;">Configuration Error</h1>
          <p>Auth0 environment variables are missing.</p>
          <p style="font-size: 0.9rem; color: #a0aec0; margin-top: 1rem;">
            Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in GitHub Secrets.
          </p>
        </div>
      </div>
    `
  }
  throw new Error('Auth0 domain and client ID must be set')
}

// Validate domain format - supports Auth0 default domains and custom domains
const isValidAuth0Domain = domain.includes('.auth0.com') || 
                           domain.includes('.us.auth0.com') || 
                           domain.includes('.eu.auth0.com') || 
                           domain.includes('.au.auth0.com')

if (!isValidAuth0Domain) {
  console.warn('Auth0 domain format might be incorrect. Expected format: your-domain.auth0.com or your-custom-domain.com')
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Construct redirect URI using current origin and base path
const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
