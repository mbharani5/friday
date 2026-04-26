import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Calendar, PiggyBank, ArrowRightLeft } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: CreditCard },
  { to: '/emi', label: 'EMI', icon: Calendar },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/remittance', label: 'Remittance', icon: ArrowRightLeft },
]

export default function Navbar() {
  return (
    <nav style={{
      width: '220px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
    }}>
      <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          color: 'var(--accent)',
          letterSpacing: '3px',
          textShadow: '0 0 20px rgba(0,212,255,0.4)',
        }}>FRIDAY</h1>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', letterSpacing: '1px' }}>
          PERSONAL FINANCE AI
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0 0.75rem', flex: 1 }}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border-accent)' : 'transparent'}`,
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: '0 1.25rem', color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
        v1.0.0 · SCRUM-7
      </div>
    </nav>
  )
}
