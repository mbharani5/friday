import React, { useState, useEffect } from 'react'
import { expensesAPI } from '../api'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Rent', 'Other']
const EMPTY = { title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [saving, setSaving] = useState(false)

  const load = () => expensesAPI.getAll(month).then(r => setExpenses(r.data)).catch(console.error)
  useEffect(() => { load() }, [month])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...form, amount: parseFloat(form.amount) }
    try {
      editId ? await expensesAPI.update(editId, data) : await expensesAPI.create(data)
      setForm(EMPTY)
      setEditId(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (exp) => {
    setEditId(exp.id)
    setForm({ title: exp.title, amount: String(exp.amount), category: exp.category, date: exp.date, notes: exp.notes || '' })
  }

  const cancelEdit = () => { setEditId(null); setForm(EMPTY) }

  const del = async (id) => { await expensesAPI.delete(id); load() }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Expenses</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Track and categorize your monthly spending</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      <form onSubmit={submit} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {editId ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ width: '100%' }} />
          <input type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" style={{ width: '100%' }} />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={{ width: '100%' }} />
          <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: '100%', gridColumn: 'span 1' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {editId ? <><Check size={14} /> Update</> : <><Plus size={14} /> Add</>}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={cancelEdit}>
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} this month
          </h3>
          <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
            Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {expenses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0', fontSize: '0.85rem' }}>
            No expenses recorded for this month.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {expenses.map(exp => (
              <div
                key={exp.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 0.85rem', borderRadius: '8px',
                  background: editId === exp.id ? 'var(--accent-glow)' : 'var(--bg-hover)',
                  border: `1px solid ${editId === exp.id ? 'var(--border-accent)' : 'transparent'}`,
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontWeight: 600, flex: 1 }}>{exp.title}</span>
                <span style={{
                  fontSize: '0.72rem', color: 'var(--accent-dim)',
                  background: 'rgba(14,165,233,0.1)', padding: '0.15rem 0.5rem',
                  borderRadius: '4px', border: '1px solid rgba(14,165,233,0.2)',
                }}>{exp.category}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', minWidth: '80px', textAlign: 'right' }}>{exp.date}</span>
                <span style={{ color: 'var(--warning)', fontWeight: 700, minWidth: '72px', textAlign: 'right' }}>
                  ${exp.amount.toLocaleString()}
                </span>
                <button onClick={() => startEdit(exp)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.25rem', border: 'none' }}><Edit2 size={14} /></button>
                <button onClick={() => del(exp.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.25rem', border: 'none' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
