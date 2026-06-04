import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ApodPage from './pages/ApodPage'
import IssPage from './pages/IssPage'
import AsteroidPage from './pages/AsteroidPage'
import EpicPage from './pages/EpicPage'
import BookmarkPage from './pages/BookmarkPage'
import SharePage from './pages/SharePage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/apod" element={<ApodPage />} />
          <Route path="/iss" element={<IssPage />} />
          <Route path="/asteroids" element={<AsteroidPage />} />
          <Route path="/epic" element={<EpicPage />} />
          <Route path="/bookmark" element={
            <ProtectedRoute>
              <BookmarkPage />
            </ProtectedRoute>
          } />
          <Route path="/share/:type/:slug" element={<SharePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App