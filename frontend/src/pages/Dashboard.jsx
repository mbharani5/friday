import React, { useState, useEffect } from 'react'
import { savingsAPI, expensesAPI } from '../api'
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#00d4ff', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: '150px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, color: color || 'var(--accent)', margin: '0.3rem 0 0.15rem' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [forecast, setForecast] = useState([])
  const [catSummary, setCatSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const month = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    Promise.all([
      savingsAPI.get(month),
      savingsAPI.getForecast(),
      expensesAPI.getCategorySummary(month),
    ])
      .then(([s, f, c]) => {
        setSummary(s.data)
        setForecast(f.data)
        setCatSummary(c.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
        <span style={{ fontSize: '1.2rem' }}>⚡</span> Initializing FRIDAY...
      </div>
    )
  }

  const pieData = Object.entries(catSummary).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  const barData = forecast.map(f => ({
    month: f.month,
    Salary: f.salary,
    Expenses: f.total_expenses,
    EMI: f.total_emi,
    Savings: f.savings,
  }))

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.75rem' }}>
        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Overview
      </p>

      {summary && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard label="Salary" value={`$${summary.salary.toLocaleString()}`} color="var(--success)" />
          <StatCard label="Expenses" value={`$${summary.total_expenses.toLocaleString()}`} color="var(--warning)" />
          <StatCard label="EMI" value={`$${summary.total_emi.toLocaleString()}`} color="var(--accent-dim)" />
          <StatCard
            label="Net Savings"
            value={`$${summary.savings.toLocaleString()}`}
            color={summary.savings >= 0 ? 'var(--success)' : 'var(--danger)'}
            sub={summary.salary > 0 ? `${((summary.savings / summary.salary) * 100).toFixed(1)}% of salary` : undefined}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
        {pieData.length > 0 ? (
          <div className="card">
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Expenses by Category
            </h3>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => `$${v.toLocaleString()}`}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No expenses recorded this month.
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            3-Month Forecast
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                formatter={(v) => `$${v.toLocaleString()}`}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
              <Bar dataKey="Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="EMI" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Savings" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
