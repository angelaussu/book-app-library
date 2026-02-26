import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import './AuthPage.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-row">
          <Logo size={40} />
          <span className="auth-brand">Booky</span>
        </div>

        <div className="auth-heading" style={{ width: '100%' }}>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register to access your library account.</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-name-row">
            <div className="input-field">
              <label className="input-label">First Name</label>
              <div className="input-container">
                <input name="firstName" type="text" placeholder="John" className="input-control"
                  value={form.firstName} onChange={handleChange} />
              </div>
            </div>
            <div className="input-field">
              <label className="input-label">Last Name</label>
              <div className="input-container">
                <input name="lastName" type="text" placeholder="Doe" className="input-control"
                  value={form.lastName} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="input-field">
            <label className="input-label">Email</label>
            <div className="input-container">
              <input name="email" type="email" placeholder="john@example.com" className="input-control"
                value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="input-field">
            <label className="input-label">Password</label>
            <div className="input-container">
              <input name="password" type={showPassword ? 'text' : 'password'}
                placeholder="Create a password" className="input-control"
                value={form.password} onChange={handleChange} />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary">Create Account</button>
        </form>

        <div className="auth-footer">
          <span className="auth-footer-text">Already have an account?</span>
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
