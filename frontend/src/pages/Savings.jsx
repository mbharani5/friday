import React, { useState, useEffect } from 'react'
import { savingsAPI, salaryAPI } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const EMPTY = { amount: '', date: new Date().toISOString().slice(0, 10), currency: 'USD', notes: '' }

function LabeledInput({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{
        fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.5px', color: 'var(--text-muted)',
      }}>{label}</label>
      {children}
    </div>
  )
}

export default function Savings() {
  const [summary, setSummary] = useState(null)
  const [forecast, setForecast] = useState([])
  const [salaries, setSalaries] = useState([])
  const [salCalendar, setSalCalendar] = useState({})
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [calDate, setCalDate] = useState(new Date())
  const currentMonth = new Date().toISOString().slice(0, 7)

  const load = (cd = calDate) => {
    const y = cd.getFullYear()
    const m = cd.getMonth() + 1
    Promise.all([
      savingsAPI.get(currentMonth),
      savingsAPI.getForecast(),
      salaryAPI.getAll(),
      salaryAPI.getCalendar(y, m),
    ])
      .then(([s, f, sal, cal]) => {
        setSummary(s.data)
        setForecast(f.data)
        setSalaries(sal.data)
        setSalCalendar(cal.data)
      })
      .catch(console.error)
  }

  useEffect(() => { load(calDate) }, [calDate])

  const addSalary = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await salaryAPI.create({ ...form, amount: parseFloat(form.amount) })
      setForm(EMPTY)
      load(calDate)
    } finally { setSaving(false) }
  }

  const delSalary = async (id) => { await salaryAPI.delete(id); load(calDate) }

  // Calendar grid
  const year = calDate.getFullYear()
  const calMonth = calDate.getMonth()
  const daysInMonth = new Date(year, calMonth + 1, 0).getDate()
  const firstDay = new Date(year, calMonth, 1).getDay()
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const calMonthTotal = Object.values(salCalendar).flat().reduce((s, e) => s + e.amount, 0)

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

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1.5rem' }}>

        {/* 3-month forecast chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            3-Month Forecast
          </h3>
          <ResponsiveContainer width="100%" height={250}>
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

        {/* Salary calendar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.2rem', border: 'none' }}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {calDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Pay Calendar</p>
            </div>
            <button
              onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.2rem', border: 'none' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', fontSize: '0.7rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4px 0', fontWeight: 600 }}>{d}</div>
            ))}
            {days.map((day, i) => {
              const key = day
                ? `${year}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : null
              const entries = key && salCalendar[key]
              const dayTotal = entries ? entries.reduce((s, e) => s + e.amount, 0) : 0
              return (
                <div
                  key={i}
                  title={entries ? entries.map(e => `$${e.amount.toLocaleString()}${e.notes ? ' — ' + e.notes : ''}`).join('\n') : undefined}
                  style={{
                    textAlign: 'center', padding: '4px 2px', borderRadius: '4px',
                    minHeight: '28px', fontSize: '0.72rem',
                    background: entries ? 'rgba(16,185,129,0.12)' : 'transparent',
                    border: `1px solid ${entries ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                    color: day ? (entries ? 'var(--success)' : 'var(--text-primary)') : 'transparent',
                    cursor: entries ? 'pointer' : 'default',
                  }}
                >
                  {day}
                  {entries && (
                    <div style={{ width: '4px', height: '4px', background: 'var(--success)', borderRadius: '50%', margin: '1px auto 0' }} />
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
            {Object.keys(salCalendar).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '0.25rem 0' }}>No payslips this month.</p>
            ) : (
              <>
                {Object.entries(salCalendar).sort().map(([date, entries]) => (
                  <div key={date} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{date}</span>
                    <span>${entries.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)', paddingTop: '0.4rem', marginTop: '0.25rem',
                  fontWeight: 700, fontSize: '0.8rem',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Month Total</span>
                  <span style={{ color: 'var(--success)' }}>${calMonthTotal.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Log form + history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form onSubmit={addSalary} className="card">
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Log Payslip
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <LabeledInput label="Pay Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </LabeledInput>
              <LabeledInput label="Amount ($)">
                <input
                  type="number"
                  placeholder="e.g. 2500.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required min="0" step="0.01"
                />
              </LabeledInput>
              <LabeledInput label="Notes (optional)">
                <input
                  placeholder="e.g. 1st payslip"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </LabeledInput>
              <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '0.1rem' }}>
                <Plus size={14} /> Log Payslip
              </button>
            </div>
          </form>

          <div className="card" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Payslip History
            </h3>
            {salaries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No records yet.</p>
            ) : (
              salaries.map(s => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.6rem', background: 'var(--bg-hover)',
                  borderRadius: '6px', marginBottom: '0.35rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>{s.date}</span>
                    {s.notes && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{s.notes}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>${s.amount.toLocaleString()}</span>
                    <button
                      onClick={() => delSalary(s.id)}
                      style={{ background: 'transparent', color: 'var(--danger)', padding: '0.15rem', border: 'none' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
