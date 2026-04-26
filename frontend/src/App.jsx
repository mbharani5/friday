import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import EMI from './pages/EMI'
import Savings from './pages/Savings'
import Remittance from './pages/Remittance'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem', marginLeft: '220px', maxWidth: 'calc(100vw - 220px)' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/emi" element={<EMI />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/remittance" element={<Remittance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
