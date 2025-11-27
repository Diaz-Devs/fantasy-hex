import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

// Debug: Log the values being used (only in development)
if (import.meta.env.DEV) {
  console.log('Auth0 Configuration:', {
    domain,
    clientId,
    hasDomain: !!domain,
    hasClientId: !!clientId
  })
}

// Validate domain format - supports Auth0 default domains and custom domains
const isValidAuth0Domain = domain && (
  domain.includes('.auth0.com') || 
  domain.includes('.us.auth0.com') || 
  domain.includes('.eu.auth0.com') || 
  domain.includes('.au.auth0.com')
)

if (domain && !isValidAuth0Domain) {
  console.warn('Auth0 domain format might be incorrect. Expected format: your-domain.auth0.com or your-custom-domain.com')
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Construct redirect URI using current origin and base path
const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`

// Render app - validation happens inside App component to avoid blocking render
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {!domain || !clientId ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1e27', color: '#e2e8f0', fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>
        <div>
          <h1 style={{ color: '#fc8181', marginBottom: '1rem' }}>Configuration Error</h1>
          <p>Auth0 environment variables are missing.</p>
          <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginTop: '1rem' }}>
            Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in GitHub Secrets.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.5rem' }}>
            Domain: {domain || 'undefined'}<br />
            Client ID: {clientId ? `${clientId.substring(0, 10)}...` : 'undefined'}
          </p>
        </div>
      </div>
    ) : (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: redirectUri,
        }}
      >
        <App />
      </Auth0Provider>
    )}
  </React.StrictMode>,
)
