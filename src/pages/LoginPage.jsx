import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import './AuthPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // Demo: any credentials work
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-row">
          <Logo size={40} />
          <span className="auth-brand">Booky</span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Sign in to manage your library account.</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-field">
            <label className="input-label">Email</label>
            <div className="input-container">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-control"
              />
            </div>
          </div>

          <div className="input-field">
            <label className="input-label">Password</label>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-control"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>

        {/* Register link */}
        <div className="auth-footer">
          <span className="auth-footer-text">Don't have an account?</span>
          <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  )
}
