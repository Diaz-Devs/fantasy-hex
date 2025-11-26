import { useMemo, useState } from 'react'
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
  const [currentWhisper, setCurrentWhisper] = useState(
    () => whispers[Math.floor(Math.random() * whispers.length)]
  )
  const [fireflies, setFireflies] = useState(() => generateFireflies())

  const featureSparkles = useMemo(() => generateFireflies(6), [])

  const cycleWhisper = () => {
    setCurrentWhisper((prev) => randomWhisper(prev))
  }

  const refreshFireflies = () => {
    setFireflies(generateFireflies())
  }

  return (
    <div className="page">
      <div className="aurora" aria-hidden />
      <div className="halo halo-one" aria-hidden />
      <div className="halo halo-two" aria-hidden />

      <main className="shell">
        <div className="pill">Under development</div>
        <h1>
          Fantasy Catan is brewing
          <span className="accent">—exciting things are coming soon.</span>
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

        <section className="prophecy" aria-live="polite">
          <p>{currentWhisper}</p>
          <div className="subtle">New notes emerge as we craft each milestone.</div>
        </section>

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

        <section className="progress">
          <div className="progress-header">
            <h2>Our cauldron checklist</h2>
            <p>Follow along as we stir ingredients into the realm.</p>
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
