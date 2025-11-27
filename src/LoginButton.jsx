import { useAuth0 } from '@auth0/auth0-react'

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0()
  const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}`
  
  return (
    <button 
      onClick={() => loginWithRedirect({
        authorizationParams: {
          redirect_uri: redirectUri
        }
      })} 
      className="button primary"
    >
      Log In with Auth0
    </button>
  )
}

export default LoginButton

