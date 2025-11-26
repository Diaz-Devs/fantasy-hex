import { useEffect, useMemo, useState } from 'react'
import './App.css'

const fallbackWhispers = [
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
    title: 'Join a friend',
    detail: 'Enter a lobby code to jump into an existing adventure.',
    action: 'Enter code',
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

function randomWhisper(list, current) {
  if (!list.length) return ''
  const options = list.filter((whisper) => whisper !== current)
  const pool = options.length ? options : list
  return pool[Math.floor(Math.random() * pool.length)]
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
  const [whispers, setWhispers] = useState(fallbackWhispers)
  const [currentWhisper, setCurrentWhisper] = useState(
    () => fallbackWhispers[Math.floor(Math.random() * fallbackWhispers.length)]
  )
  const [whisperStatus, setWhisperStatus] = useState('')
  const [fireflies, setFireflies] = useState(() => generateFireflies())
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('landing') // landing | generator

  const featureSparkles = useMemo(() => generateFireflies(6), [])

  useEffect(() => {
    let isMounted = true
    const fetchWhispers = async () => {
      setWhisperStatus('Listening for fresh whispers from the API...')

      try {
        const response = await fetch('/api/whispers')
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        if (!Array.isArray(data.whispers) || data.whispers.length === 0) {
          throw new Error('No whispers returned from API')
        }

        if (!isMounted) return
        setWhispers(data.whispers)
        setCurrentWhisper(randomWhisper(data.whispers, data.whispers[0]))
        setWhisperStatus('')
      } catch (error) {
        if (!isMounted) return
        console.warn('Falling back to bundled whispers:', error)
        setWhisperStatus('Using bundled whispers while the API naps.')
      }
    }

    fetchWhispers()
    return () => {
      isMounted = false
    }
  }, [])

  const cycleWhisper = () => {
    setCurrentWhisper((prev) => randomWhisper(whispers, prev))
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
    setUser({ email, name })
    setAuthSuccess(`Welcome back, ${name}. Main menu unlocked.`)
    setFormData((prev) => ({ ...prev, password: '' }))
    setActiveView('landing')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogout = () => {
    setUser(null)
    setAuthError('')
    setAuthSuccess('')
    setFormData({ email: '', password: '' })
    setActiveView('landing')
  }

  const openGenerator = () => setActiveView('generator')
  const returnToMain = () => setActiveView('landing')

  return (
    <div className="page">
      <div className="aurora" aria-hidden />
      <div className="halo halo-one" aria-hidden />
      <div className="halo halo-two" aria-hidden />

      <main className="shell">
        <div className="pill">Under development</div>
        <h1>
          Fantasy Catan is brewing
          <span className="accent">exciting things are coming soon.</span>
        </h1>
        <p className="lede">
          We are weaving cozy strategy, gleaming dice, and a dash of magic into a
          fresh board game adventure. Settle in: the first playable realm is on the way.
        </p>

        <div className="actions">
          <button className="button primary" onClick={cycleWhisper}>
            Reveal a whisper
          </button>
          <button className="button ghost" onClick={refreshFireflies}>
            Release new fireflies
          </button>
        </div>
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
                {menuOptions.map((option) => (
                  <article className="menu-card" key={option.title}>
                    <div className="menu-card-top" />
                    <h3>{option.title}</h3>
                    <p>{option.detail}</p>
                    <button className="button ghost">{option.action}</button>
                  </article>
                ))}
                <article className="menu-card highlight">
                  <div className="menu-card-top" />
                  <h3>Generate a Catan map</h3>
                  <p>Open the built-in map generator to craft a fresh board.</p>
                  <button className="button primary" onClick={openGenerator}>
                    Launch generator
                  </button>
                </article>
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
    </div>
  )
}

export default App
