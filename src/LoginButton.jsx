const LoginButton = ({ onLogin }) => {
  const handleLogin = () => {
    if (onLogin) {
      onLogin({ name: 'Demo Settler', email: 'settler@catan.realm' })
      return
    }

    window.alert('Attach an onLogin prop to hook up this demo button!')
  }

  return (
    <button onClick={handleLogin} className="button primary">
      Log in (demo)
    </button>
  )
}

export default LoginButton

