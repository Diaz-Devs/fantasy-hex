import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import DashboardPage from './pages/DashboardPage'
import GeneratorPage from './pages/GeneratorPage'
import './App.css'
import './styles/cartographer-theme.css'

function App() {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading: auth0Loading,
    error: auth0Error,
    logout 
  } = useAuth0()

  const [localUser, setLocalUser] = useState(null)
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard' | 'generator'
  const [authError, setAuthError] = useState('')

  // Sync Auth0 user with local user state
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      setLocalUser({ 
        email: auth0User.email, 
        name: auth0User.name || auth0User.email?.split('@')[0] || 'Cartographer',
        picture: auth0User.picture
      })
    } else if (!isAuthenticated) {
      // Keep localUser if dev bypass was used
      if (!localUser || localUser.email !== 'dev@fantasy-hex.local') {
        setLocalUser(null)
      }
    }
  }, [isAuthenticated, auth0User])

  // Handle Auth0 errors
  useEffect(() => {
    if (auth0Error) {
      setAuthError(`Auth0 error: ${auth0Error.message}`)
    }
  }, [auth0Error])

  const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`

  const handleLogout = () => {
    if (isAuthenticated) {
      logout({ logoutParams: { returnTo: redirectUri } })
    } else {
      setLocalUser(null)
      setAuthError('')
    }
  }

  const handleDevBypass = () => {
    setAuthError('')
    setLocalUser({ 
      email: 'dev@fantasy-hex.local', 
      name: 'DevMaster',
      picture: null
    })
  }

  const openGenerator = () => setActiveView('generator')
  const returnToDashboard = () => setActiveView('dashboard')

  // Use Auth0 user if authenticated, otherwise use local user
  const user = isAuthenticated ? localUser : (localUser || null)
  const isLoading = auth0Loading

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-seal">
          <div style={{ textAlign: 'center' }}>
            <h3>Entering the Guild Hall...</h3>
            <p className="text-muted">Verifying your cartographer credentials</p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!user) {
    return (
      <div className="dashboard-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="parchment scroll-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div className="badge-seal" style={{ margin: '0 auto 1.5rem' }}>
            CG
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>The Cartographer's Guild</h2>
          <p className="text-accent" style={{ marginBottom: '2rem' }}>
            Draft maps, launch expeditions, track your victories
          </p>
          
          {authError && (
            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(139, 38, 53, 0.1)',
              border: '1px solid var(--seal-red)',
              borderRadius: '4px',
              color: 'var(--seal-red)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {authError}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="wax-seal large" 
              onClick={handleDevBypass}
              style={{ width: '100%' }}
            >
              Dev Login
            </button>
            
            <p className="text-small text-muted" style={{ marginTop: '0.5rem' }}>
              Use dev login to explore the dashboard without Auth0 setup
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main app views
  return (
    <>
      {activeView === 'dashboard' && (
        <DashboardPage 
          user={user}
          onLaunchGenerator={openGenerator}
        />
      )}
      
      {activeView === 'generator' && (
        <GeneratorPage 
          onReturnToDashboard={returnToDashboard}
        />
      )}
    </>
  )
}

export default App