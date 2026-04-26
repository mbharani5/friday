import React, { useState, useEffect } from 'react'
import { remittanceAPI } from '../api'
import { ArrowRight, RefreshCw, TrendingUp } from 'lucide-react'

export default function Remittance() {
  const [rate, setRate] = useState(null)
  const [history, setHistory] = useState(null)
  const [form, setForm] = useState({ usd_amount: '', include_fee: true, fee_percent: '1.5' })
  const [result, setResult] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [rateLoading, setRateLoading] = useState(false)

  const fetchRate = async () => {
    setRateLoading(true)
    try {
      const [r, h] = await Promise.all([remittanceAPI.getRate(), remittanceAPI.getHistory()])
      setRate(r.data)
      setHistory(h.data)
    } finally {
      setRateLoading(false)
    }
  }

  useEffect(() => { fetchRate() }, [])

  const calculate = async (e) => {
    e.preventDefault()
    setCalcLoading(true)
    try {
      const r = await remittanceAPI.calculate({
        usd_amount: parseFloat(form.usd_amount),
        include_fee: form.include_fee,
        fee_percent: parseFloat(form.fee_percent),
      })
      setResult(r.data)
    } finally {
      setCalcLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Remittance Planner</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        USD → INR with live rate, fee calculator, and send recommendations
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rate && (
            <div className="card card-glow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Exchange Rate</p>
                  <p style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent)', margin: '0.25rem 0 0.1rem', textShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
                    ₹{rate.usd_to_inr.toFixed(2)}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    per 1 USD &nbsp;·&nbsp;
                    <span style={{ color: rate.is_live ? 'var(--success)' : 'var(--warning)' }}>
                      {rate.is_live ? '● Live' : '● Fallback'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={fetchRate}
                  disabled={rateLoading}
                  className="btn-ghost"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <RefreshCw size={15} style={{ animation: rateLoading ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
              </div>
            </div>
          )}

          {history && (
            <div className="card">
              <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={14} /> 30-Day Context
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                {[['Avg', history.average_30d], ['High', history.high_30d], ['Low', history.low_30d]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '0.6rem', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</p>
                    <p style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>₹{v}</p>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{history.recommendation}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form onSubmit={calculate} className="card">
            <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Calculate Transfer
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Amount (USD)</label>
                <input
                  type="number" placeholder="e.g. 1000"
                  value={form.usd_amount}
                  onChange={e => setForm({ ...form, usd_amount: e.target.value })}
                  required min="1" step="0.01" style={{ width: '100%' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox" checked={form.include_fee}
                  onChange={e => setForm({ ...form, include_fee: e.target.checked })}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                Include transfer fee
              </label>
              {form.include_fee && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Fee (%)</label>
                  <input
                    type="number" value={form.fee_percent}
                    onChange={e => setForm({ ...form, fee_percent: e.target.value })}
                    min="0" max="10" step="0.1" style={{ width: '100%' }}
                  />
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={calcLoading}>
                Calculate <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {result && (
            <div className="card card-glow">
              <h3 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transfer Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                {[
                  ['You Send', `$${result.usd_amount.toLocaleString()}`, null],
                  ['Transfer Fee', `-$${result.fee_usd}`, 'var(--danger)'],
                  ['Net USD', `$${result.net_usd.toLocaleString()}`, null],
                  ['Exchange Rate', `₹${result.exchange_rate}`, 'var(--text-muted)'],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: c || 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700 }}>Recipient Gets</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>₹{result.inr_amount.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ marginTop: '0.9rem', padding: '0.6rem 0.75rem', background: 'var(--accent-glow)', borderRadius: '8px', border: '1px solid var(--border-accent)', fontSize: '0.8rem', color: 'var(--accent)' }}>
                {result.recommendation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
