import { useAuth0 } from '@auth0/auth0-react'

const LogoutButton = () => {
  const { logout } = useAuth0()
  const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`
  
  return (
    <button
      onClick={() => logout({ logoutParams: { returnTo: redirectUri } })}
      className="button primary"
    >
      Log Out
    </button>
  )
}

export default LogoutButton

