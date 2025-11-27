import { useMemo, useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import UsernamePrompt from './UsernamePrompt'
import FriendsSearch from './FriendsSearch'
import './App.css'

const whispers = [
  'Settlers are packing their enchanted wagons—routes open soon.',
  'Mystic dice are warming up; fortune favors the playful.',
  'Guilds are drafting trade pacts for the bravest builders.',
  'Dragons nap on the horizon; they only wake for grand openings.',
  'A breeze carries rumors of glowing harbors and moonlit sheep.',
  'Merchants whisper of crystalline ore hidden in foggy forests.',
]

const featureHints = [
  {
    title: 'Story-rich exploration',
    detail: 'Journey through cozy biomes with seasonal events and delightful NPCs.',
  },
  {
    title: 'Tactile board magic',
    detail: 'Snap tiles, roll animated dice, and nudge caravans with gentle physics.',
  },
  {
    title: 'Cozy social play',
    detail: 'Invite friends, share resources, and unlock whimsical achievements together.',
  },
]

const progressSteps = [
  {
    label: 'World-building',
    status: 'Shaping landscapes and lore',
    percent: 55,
  },
  {
    label: 'Mechanics & playtests',
    status: 'Designing delightful turns and clever trades',
    percent: 42,
  },
  {
    label: 'Co-op magic',
    status: 'Polishing journeys you can share with friends',
    percent: 36,
  },
]

const menuOptions = [
  {
    title: 'Start solo build',
    detail: 'Practice tile placement and trade timing against calm AI rivals.',
    action: 'Begin solo',
  },
  {
    title: 'Host an online lobby',
    detail: 'Spin up a private realm, invite friends, and keep trades transparent.',
    action: 'Open lobby',
  },
  {
    title: 'Add friends',
    detail: 'Search for friends by username and add them to your list.',
    action: 'Search friends',
  },
  {
    title: 'Learn the realm',
    detail: 'Browse the quickstart, tile glossary, and house rules.',
    action: 'Read guide',
  },
  {
    title: 'Profile & settings',
    detail: 'Tune your avatar, colors, and notifications.',
    action: 'Open profile',
  },
]

const sparklePalette = ['#f7c1ff', '#c1d8ff', '#ffe29f', '#b8ffda']

function randomWhisper(current) {
  const options = whispers.filter((whisper) => whisper !== current)
  return options[Math.floor(Math.random() * options.length)]
}

function generateFireflies(count = 14) {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${Date.now()}-${index}`,
    top: Math.random() * 80 + 5,
    left: Math.random() * 90 + 5,
    delay: Math.random() * 4,
    size: Math.random() * 6 + 6,
    color: sparklePalette[Math.floor(Math.random() * sparklePalette.length)],
  }))
}

function App() {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading: auth0Loading,
    error: auth0Error,
    loginWithRedirect,
    loginWithPopup,
    logout 
  } = useAuth0()

  const [currentWhisper, setCurrentWhisper] = useState(
    () => whispers[Math.floor(Math.random() * whispers.length)]
  )
  const [fireflies, setFireflies] = useState(() => generateFireflies())
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [localUser, setLocalUser] = useState(null)
  const [activeView, setActiveView] = useState('landing') // landing | generator
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)
  const [showFriendsSearch, setShowFriendsSearch] = useState(false)
  const [userData, setUserData] = useState(null) // Full user data from server

  const featureSparkles = useMemo(() => generateFireflies(6), [])

  // Sync Auth0 user with local user state and check for username
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const checkUserAndUsername = async () => {
        try {
          // Check if user exists in our database
          const response = await fetch(`/api/users?email=${encodeURIComponent(auth0User.email)}`)
          const data = await response.json()
          
          if (data.user) {
            // User exists, check if they have username
            setUserData(data.user)
            setLocalUser({ 
              email: data.user.email, 
              name: data.user.name || auth0User.name || auth0User.email?.split('@')[0] || 'settler',
              picture: data.user.picture || auth0User.picture,
              username: data.user.username,
              id: data.user.id
            })
            
            // Show username prompt if they don't have one
            if (!data.user.username) {
              setShowUsernamePrompt(true)
            }
          } else {
            // New user - save to database and prompt for username
            const saveResponse = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: auth0User.email,
                name: auth0User.name || auth0User.email?.split('@')[0] || 'settler',
                picture: auth0User.picture,
                auth0Id: auth0User.sub
              })
            })
            
            if (saveResponse.ok) {
              const saveData = await saveResponse.json()
              setUserData(saveData.user)
              setLocalUser({ 
                email: saveData.user.email, 
                name: saveData.user.name,
                picture: saveData.user.picture,
                username: saveData.user.username,
                id: saveData.user.id
              })
              
              // Prompt for username since it's a new user
              setShowUsernamePrompt(true)
            } else {
              // Fallback if save fails
              setLocalUser({ 
                email: auth0User.email, 
                name: auth0User.name || auth0User.email?.split('@')[0] || 'settler',
                picture: auth0User.picture
              })
            }
          }
        } catch (error) {
          console.error('Error checking user:', error)
          // Fallback to basic user data
          setLocalUser({ 
            email: auth0User.email, 
            name: auth0User.name || auth0User.email?.split('@')[0] || 'settler',
            picture: auth0User.picture
          })
        }
      }
      
      checkUserAndUsername()
    } else if (!isAuthenticated) {
      setLocalUser(null)
      setUserData(null)
      setShowUsernamePrompt(false)
    }
  }, [isAuthenticated, auth0User])

  // Handle Auth0 errors
  useEffect(() => {
    if (auth0Error) {
      setAuthError(`Auth0 error: ${auth0Error.message}`)
    }
  }, [auth0Error])

  const cycleWhisper = () => {
    setCurrentWhisper((prev) => randomWhisper(prev))
  }

  const refreshFireflies = () => {
    setFireflies(generateFireflies())
  }

  const handleLogin = (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    const email = formData.email.trim()
    const password = formData.password.trim()

    if (!email || !email.includes('@')) {
      setAuthError('Enter a valid email to access the realm.')
      return
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }

    const name = email.split('@')[0] || 'settler'
    setLocalUser({ email, name })
    setAuthSuccess(`Welcome back, ${name}. Main menu unlocked.`)
    setFormData((prev) => ({ ...prev, password: '' }))
    setActiveView('landing')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`

  const handleLogout = () => {
    if (isAuthenticated) {
      logout({ logoutParams: { returnTo: redirectUri } })
    } else {
      setLocalUser(null)
      setAuthError('')
      setAuthSuccess('')
      setFormData({ email: '', password: '' })
      setActiveView('landing')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setAuthError('')
      await loginWithPopup({
        authorizationParams: {
          redirect_uri: redirectUri,
          connection: 'google-oauth2'
        }
      })
    } catch (error) {
      setAuthError('Failed to sign in with Google. Please try again.')
      console.error(error)
    }
  }

  const handleAppleLogin = async () => {
    try {
      setAuthError('')
      await loginWithPopup({
        authorizationParams: {
          redirect_uri: redirectUri,
          connection: 'apple'
        }
      })
    } catch (error) {
      setAuthError('Failed to sign in with Apple. Please try again.')
      console.error(error)
    }
  }

  const handleAuth0Login = async () => {
    try {
      setAuthError('')
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: redirectUri
        }
      })
    } catch (error) {
      setAuthError('Failed to sign in. Please try again.')
      console.error(error)
    }
  }

  // Use Auth0 user if authenticated, otherwise use local user
  const user = isAuthenticated ? localUser : (localUser || null)
  const isLoading = auth0Loading

  const openGenerator = () => setActiveView('generator')
  const returnToMain = () => setActiveView('landing')

  const handleUsernameSave = (user) => {
    setUserData(user)
    setLocalUser(prev => ({
      ...prev,
      username: user.username,
      id: user.id
    }))
    setShowUsernamePrompt(false)
  }

  const handleUsernameCancel = () => {
    // Allow cancel for now, but they'll need username to use friends feature
    setShowUsernamePrompt(false)
  }

  if (isLoading) {
    return (
      <div className="page">
        <div className="aurora" aria-hidden />
        <main className="shell">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#e2e8f0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '500' }}>Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="aurora" aria-hidden />
      <div className="halo halo-one" aria-hidden />
      <div className="halo halo-two" aria-hidden />

      <main className="shell">
        {!user && activeView === 'landing' && (
          <>
            <h1>
              Fantasy Catan access portal
              <span className="accent">Log in to unlock the main menu.</span>
            </h1>
            <p className="lede">
              Sign in to reserve your seat at the table. Once inside you can jump to lobbies,
              solo sessions, and the quickstart guide while the realm keeps growing.
            </p>

            <div className="actions">
              <button className="button primary" onClick={cycleWhisper}>
                Reveal a whisper
              </button>
            </div>

            <div className="portal-grid">
              <section className="panel login-panel">
                <div className="panel-header">
                  <h2>Log in to continue</h2>
                  <p className="subtle">
                    Use your email to unlock alpha features. We only validate locally for now.
                  </p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                  <label className="field">
                    <span className="field-label">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={updateField}
                      placeholder="you@catan.realm"
                      required
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Password</span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={updateField}
                      placeholder="At least 6 characters"
                      required
                    />
                  </label>

                  {authError && <div className="alert error">{authError}</div>}
                  {authSuccess && <div className="alert success">{authSuccess}</div>}

                  <div className="form-actions">
                    <button type="submit" className="button primary">
                      Log in
                    </button>
                    <div className="subtle helper">
                      This is a local-only check while servers come online.
                    </div>
                    
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                      <div style={{ textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem', marginBottom: '5px' }}>
                        Or sign in with:
                      </div>
                      <button 
                        type="button" 
                        className="button ghost" 
                        onClick={handleGoogleLogin}
                        style={{ width: '100%' }}
                      >
                        Continue with Google
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              <section className="prophecy" aria-live="polite">
                <p>{currentWhisper}</p>
                <div className="subtle">New notes emerge as we craft each milestone.</div>
              </section>
            </div>

            <section className="feature-grid">
              {featureHints.map((hint) => (
                <article className="feature-card" key={hint.title}>
                  <div className="feature-glow" />
                  <h3>{hint.title}</h3>
                  <p>{hint.detail}</p>
                  <div className="spark-trail">
                    {featureSparkles.map((sparkle) => (
                      <span
                        className="spark"
                        key={`${hint.title}-${sparkle.id}`}
                        style={{
                          top: `${sparkle.top}%`,
                          left: `${sparkle.left}%`,
                          animationDelay: `${sparkle.delay}s`,
                          width: sparkle.size,
                          height: sparkle.size,
                          background: sparkle.color,
                        }}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {user && activeView === 'landing' && (
          <>
            <div className="pill">Session active</div>
            <h1>
              Main menu unlocked
              <span className="accent">Choose where you want to go next.</span>
            </h1>
            <div className="actions">
              <button className="button primary" onClick={handleLogout}>
                Switch account
              </button>
              <button className="button ghost" onClick={refreshFireflies}>
                Refresh the realm
              </button>
            </div>

            <section className="main-menu">
              <div className="menu-header">
                <div>
                  <p className="subtle">Welcome, {user.name}</p>
                  <h2>Main menu</h2>
                </div>
                <span className="status-chip">Alpha ready</span>
              </div>
              <div className="menu-grid">
                <article className="menu-card highlight">
                  <div className="menu-card-top" />
                  <h3>Generate a Catan map</h3>
                  <p>Open the built-in map generator to craft a fresh board.</p>
                  <button className="button primary" onClick={openGenerator}>
                    Launch generator
                  </button>
                </article>
                {menuOptions.map((option) => (
                  <article className="menu-card" key={option.title}>
                    <div className="menu-card-top" />
                    <h3>{option.title}</h3>
                    <p>{option.detail}</p>
                    <button 
                      className="button ghost"
                      onClick={() => {
                        if (option.title === 'Add friends') {
                          if (!localUser?.username) {
                            setAuthError('Please create a username first to add friends')
                            setShowUsernamePrompt(true)
                          } else {
                            setShowFriendsSearch(true)
                          }
                        }
                      }}
                    >
                      {option.action}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="progress">
              <div className="progress-header">
                <h2>Realm progress</h2>
                <p>Watch the build as you explore.</p>
              </div>
              <div className="progress-rows">
                {progressSteps.map((step) => (
                  <div className="progress-row" key={step.label}>
                    <div className="row-top">
                      <span className="label">{step.label}</span>
                      <span className="percent">{step.percent}%</span>
                    </div>
                    <div className="bar">
                      <span
                        className="fill"
                        style={{ width: `${step.percent}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="status">{step.status}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {user && activeView === 'generator' && (
          <section className="generator-shell">
            <div className="generator-header">
              <div>
                <p className="subtle">Catan board lab</p>
                <h2>Generate a fresh map</h2>
                <p className="lede">
                  Use the advanced generator to tweak house rules and build a ready-to-play board.
                </p>
              </div>
              <div className="actions">
                <button className="button ghost" onClick={returnToMain}>
                  Back to menu
                </button>
                <button className="button primary" onClick={refreshFireflies}>
                  Refresh the realm
                </button>
              </div>
            </div>

            <div className="generator-frame-wrap">
              <iframe
                title="Catan map generator"
                src={`${import.meta.env.BASE_URL}catan/index.html`}
                className="generator-frame"
              />
            </div>
          </section>
        )}

        <section className="firefly-field" aria-hidden>
          {fireflies.map((fly) => (
            <span
              key={fly.id}
              className="firefly"
              style={{
                top: `${fly.top}%`,
                left: `${fly.left}%`,
                animationDelay: `${fly.delay}s`,
                width: fly.size,
                height: fly.size,
                background: fly.color,
              }}
            />
          ))}
        </section>
      </main>

      {/* Username Prompt Modal */}
      {showUsernamePrompt && localUser && (
        <UsernamePrompt
          user={{
            email: localUser.email,
            name: localUser.name,
            picture: localUser.picture,
            sub: auth0User?.sub,
            auth0Id: auth0User?.sub
          }}
          onSave={handleUsernameSave}
          onCancel={handleUsernameCancel}
        />
      )}

      {/* Friends Search Modal */}
      {showFriendsSearch && localUser && userData && (
        <FriendsSearch
          currentUser={userData}
          onClose={() => setShowFriendsSearch(false)}
        />
      )}
    </div>
  )
}

export default App
