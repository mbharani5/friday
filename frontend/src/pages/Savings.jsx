import React, { useState, useEffect } from 'react'
import { savingsAPI, salaryAPI } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { Plus, Trash2 } from 'lucide-react'

const EMPTY_SAL = { amount: '', month: new Date().toISOString().slice(0, 7), currency: 'USD', notes: '' }

export default function Savings() {
  const [summary, setSummary] = useState(null)
  const [forecast, setForecast] = useState([])
  const [salaries, setSalaries] = useState([])
  const [form, setForm] = useState(EMPTY_SAL)
  const [saving, setSaving] = useState(false)
  const month = new Date().toISOString().slice(0, 7)

  const load = () =>
    Promise.all([savingsAPI.get(month), savingsAPI.getForecast(), salaryAPI.getAll()])
      .then(([s, f, sal]) => { setSummary(s.data); setForecast(f.data); setSalaries(sal.data) })
      .catch(console.error)

  useEffect(() => { load() }, [])

  const addSalary = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await salaryAPI.create({ ...form, amount: parseFloat(form.amount) })
      setForm(EMPTY_SAL)
      load()
    } finally {
      setSaving(false)
    }
  }

  const delSalary = async (id) => { await salaryAPI.delete(id); load() }

  const barData = forecast.map(f => ({
    month: f.month,
    Salary: f.salary,
    Expenses: f.total_expenses,
    EMI: f.total_emi,
    Savings: f.savings,
  }))

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Savings & Planning</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        Net Savings = Salary − Expenses − EMIs
      </p>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Salary', val: summary.salary, color: 'var(--success)' },
            { label: 'Expenses', val: summary.total_expenses, color: 'var(--warning)' },
            { label: 'EMI', val: summary.total_emi, color: 'var(--accent-dim)' },
            { label: 'Net Savings', val: summary.savings, color: summary.savings >= 0 ? 'var(--success)' : 'var(--danger)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color, marginTop: '0.3rem' }}>
                ${val.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            3-Month Forecast
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                formatter={v => `$${v.toLocaleString()}`}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
              <Bar dataKey="Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="EMI" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Savings" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form onSubmit={addSalary} className="card">
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Log Salary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <input type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" />
              <input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} required />
              <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <button type="submit" className="btn-primary" disabled={saving}><Plus size={14} /> Add</button>
            </div>
          </form>

          <div className="card" style={{ flex: 1, overflow: 'auto' }}>
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Salary History
            </h3>
            {salaries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No records yet.</p>
            ) : (
              salaries.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.6rem', background: 'var(--bg-hover)', borderRadius: '6px', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{s.month}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>${s.amount.toLocaleString()}</span>
                  <button onClick={() => delSalary(s.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.15rem', border: 'none' }}><Trash2 size={13} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
