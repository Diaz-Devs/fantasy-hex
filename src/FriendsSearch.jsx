import { useState, useEffect } from 'react'

const FriendsList = ({ friends, currentUserId }) => {
  const [friendDetails, setFriendDetails] = useState({})

  useEffect(() => {
    const loadFriendDetails = async () => {
      const details = {}
      for (const friendship of friends) {
        const friendId = friendship.userId === currentUserId 
          ? friendship.friendId 
          : friendship.userId
        
        try {
          const response = await fetch(`/api/users`)
          const data = await response.json()
          const friend = data.users.find(u => u.id === friendId)
          if (friend) {
            details[friendId] = friend
          }
        } catch (error) {
          console.error('Failed to load friend details:', error)
        }
      }
      setFriendDetails(details)
    }
    loadFriendDetails()
  }, [friends, currentUserId])

  return (
    <div>
      {friends.map(friendship => {
        const friendId = friendship.userId === currentUserId 
          ? friendship.friendId 
          : friendship.userId
        const friend = friendDetails[friendId]
        
        return (
          <div
            key={friendship.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#2d313c',
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}
          >
            <img
              src={friend?.picture || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2363b3ed'/%3E%3C/svg%3E`}
              alt={friend?.username || 'Friend'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ color: '#f7fafc', fontWeight: '600' }}>
                {friend ? `@${friend.username}` : 'Loading...'}
              </div>
              <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
                {friend?.name || 'Friend'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FriendsSearch = ({ currentUser, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState([])
  const [message, setMessage] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      // Filter out current user
      const filtered = data.users.filter(u => u.id !== currentUser.id)
      setSearchResults(filtered)
      
      if (filtered.length === 0) {
        setMessage('No users found with that username')
      }
    } catch (error) {
      setMessage('Failed to search users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadFriends = async () => {
    try {
      const response = await fetch(`/api/friends?userId=${currentUser.id}`)
      const data = await response.json()
      setFriends(data.friends || [])
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  useEffect(() => {
    loadFriends()
  }, [])

  const addFriend = async (friendId) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: friendId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add friend')
      }

      setMessage('Friend added successfully!')
      loadFriends()
      setSearchResults([])
      setSearchQuery('')
    } catch (error) {
      setMessage('Failed to add friend')
      console.error(error)
    }
  }

  const isFriend = (userId) => {
    return friends.some(f => 
      (f.userId === currentUser.id && f.friendId === userId) ||
      (f.userId === userId && f.friendId === currentUser.id)
    )
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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#262a33',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#f7fafc' }}>Add Friends</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0aec0',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #4a5568',
                background: '#2d313c',
                color: '#f7fafc',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="button primary"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {message && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: message.includes('success') ? '#2d5016' : '#742a2a',
            color: message.includes('success') ? '#68d391' : '#fc8181',
            marginBottom: '1rem'
          }}>
            {message}
          </div>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#cbd5e0', marginBottom: '1rem' }}>Search Results</h3>
            {searchResults.map(user => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#2d313c',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={user.picture || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2363b3ed'/%3E%3C/svg%3E`}
                    alt={user.username}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <div style={{ color: '#f7fafc', fontWeight: '600' }}>@{user.username}</div>
                    <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>{user.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => addFriend(user.id)}
                  disabled={isFriend(user.id)}
                  className={isFriend(user.id) ? 'button ghost' : 'button primary'}
                  style={{ minWidth: '100px' }}
                >
                  {isFriend(user.id) ? 'Friends' : 'Add Friend'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <h3 style={{ color: '#cbd5e0', marginBottom: '1rem' }}>Your Friends</h3>
          {friends.length === 0 ? (
            <p style={{ color: '#a0aec0' }}>No friends yet. Search for users to add them!</p>
          ) : (
            <FriendsList friends={friends} currentUserId={currentUser.id} />
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsSearch

