const LogoutButton = ({ onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
      return
    }

    window.alert('Attach an onLogout prop to hook up this demo button!')
  }

  return (
    <button onClick={handleLogout} className="button primary">
      Log out (demo)
    </button>
  )
}

export default LogoutButton

