import React, { useState, useEffect } from 'react'
import { emiAPI } from '../api'
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const EMPTY = { name: '', amount: '', due_day: '1', total_months: '12', paid_months: '0', start_date: new Date().toISOString().slice(0, 10), notes: '' }

export default function EMI() {
  const [emis, setEmis] = useState([])
  const [calendar, setCalendar] = useState({})
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [viewDate, setViewDate] = useState(new Date())

  const load = async () => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth() + 1
    const [e, c] = await Promise.all([emiAPI.getAll(), emiAPI.getCalendar(y, m)])
    setEmis(e.data)
    setCalendar(c.data)
  }

  useEffect(() => { load() }, [viewDate])

  const submit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      amount: parseFloat(form.amount),
      due_day: parseInt(form.due_day),
      total_months: parseInt(form.total_months),
      paid_months: parseInt(form.paid_months),
    }
    editId ? await emiAPI.update(editId, data) : await emiAPI.create(data)
    setForm(EMPTY)
    setEditId(null)
    load()
  }

  const startEdit = (emi) => {
    setEditId(emi.id)
    setForm({ name: emi.name, amount: String(emi.amount), due_day: String(emi.due_day), total_months: String(emi.total_months), paid_months: String(emi.paid_months), start_date: emi.start_date, notes: emi.notes || '' })
  }

  const del = async (id) => { await emiAPI.delete(id); load() }

  const totalEMI = emis.reduce((s, e) => s + e.amount, 0)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>EMI Tracker</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Manage loan EMIs with due date calendar</p>

      <form onSubmit={submit} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {editId ? 'Edit EMI' : 'Add EMI'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
          <input placeholder="EMI Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%' }} />
          <input type="number" placeholder="Monthly ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" style={{ width: '100%' }} />
          <input type="number" placeholder="Due Day (1–31)" value={form.due_day} onChange={e => setForm({ ...form, due_day: e.target.value })} required min="1" max="31" style={{ width: '100%' }} />
          <input type="number" placeholder="Total Months" value={form.total_months} onChange={e => setForm({ ...form, total_months: e.target.value })} required min="1" style={{ width: '100%' }} />
          <input type="number" placeholder="Paid Months" value={form.paid_months} onChange={e => setForm({ ...form, paid_months: e.target.value })} min="0" style={{ width: '100%' }} />
          <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem' }}>
          <button type="submit" className="btn-primary"><Plus size={14} /> {editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setForm(EMPTY) }}><X size={14} /> Cancel</button>}
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active EMIs</h3>
            <span style={{ color: 'var(--accent-dim)', fontWeight: 700, fontSize: '0.9rem' }}>${totalEMI.toLocaleString()}/mo</span>
          </div>
          {emis.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>No active EMIs.</p>
          ) : (
            emis.map(emi => {
              const pct = Math.round((emi.paid_months / emi.total_months) * 100)
              return (
                <div key={emi.id} style={{ padding: '0.85rem', background: 'var(--bg-hover)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{emi.name}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due day {emi.due_day} · {emi.remaining_months} months left · {pct}% paid</p>
                      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '0.5rem', width: '100%' }}>
                        <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px', width: `${pct}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.75rem' }}>
                      <span style={{ color: 'var(--accent-dim)', fontWeight: 700, fontSize: '0.9rem' }}>${emi.amount}/mo</span>
                      <button onClick={() => startEdit(emi)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.2rem', border: 'none' }}><Edit2 size={14} /></button>
                      <button onClick={() => del(emi.id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.2rem', border: 'none' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.2rem', border: 'none' }}><ChevronLeft size={18} /></button>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.2rem', border: 'none' }}><ChevronRight size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4px 0', fontWeight: 600 }}>{d}</div>
            ))}
            {days.map((day, i) => {
              const key = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
              const has = key && calendar[key]
              return (
                <div
                  key={i}
                  title={has ? calendar[key].map(e => `${e.name}: $${e.amount}`).join('\n') : undefined}
                  style={{
                    textAlign: 'center', padding: '4px 2px', borderRadius: '4px',
                    minHeight: '26px', fontSize: '0.72rem',
                    background: has ? 'var(--accent-glow)' : 'transparent',
                    border: `1px solid ${has ? 'var(--border-accent)' : 'transparent'}`,
                    color: day ? (has ? 'var(--accent)' : 'var(--text-primary)') : 'transparent',
                    cursor: has ? 'pointer' : 'default',
                  }}
                >
                  {day}
                  {has && <div style={{ width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%', margin: '1px auto 0' }} />}
                </div>
              )
            })}
          </div>

          {Object.keys(calendar).length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
              {Object.entries(calendar).sort().map(([date, items]) => (
                <div key={date} style={{ marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{date}</span>{'  '}
                  {items.map(e => `${e.name} ($${e.amount})`).join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
