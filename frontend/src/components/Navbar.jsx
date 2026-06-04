import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Nebula</Link>
      <div className="flex gap-4">
        <Link to="/apod">APOD</Link>
        <Link to="/iss">ISS</Link>
        <Link to="/asteroids">Asteroid</Link>
        <Link to="/epic">EPIC</Link>
        {user ? (
          <>
            <Link to="/bookmark">Bookmark</Link>
            <span>{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar