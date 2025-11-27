import { useState } from 'react'

const UsernamePrompt = ({ user, onSave, onCancel }) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateUsername = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Username is required'
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      // Check if username is available
      const checkResponse = await fetch(`/api/users/search?q=${encodeURIComponent(username)}`)
      const checkData = await checkResponse.json()
      
      if (checkData.users && checkData.users.length > 0 && checkData.users[0].username.toLowerCase() === username.toLowerCase()) {
        setError('Username is already taken')
        setLoading(false)
        return
      }

      // Save user with username
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          picture: user.picture,
          username: username.trim(),
          auth0Id: user.sub || user.auth0Id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save username')
      }

      const data = await response.json()
      onSave(data.user)
    } catch (err) {
      setError('Failed to save username. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#262a33',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <h2 style={{ color: '#f7fafc', marginBottom: '1rem' }}>Create Your Username</h2>
        <p style={{ color: '#a0aec0', marginBottom: '1.5rem' }}>
          Choose a unique username so your friends can find you!
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#2d313c',
                color: '#f7fafc',
                fontSize: '1rem'
              }}
              autoFocus
              disabled={loading}
            />
            {error && (
              <p style={{ color: '#fc8181', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="button primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : 'Save Username'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="button ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsernamePrompt

