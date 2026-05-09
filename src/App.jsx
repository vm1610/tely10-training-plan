import { useState, useEffect } from 'react'
import InputPage from './pages/InputPage'
import PlanPage from './pages/PlanPage'
import PaywallPage from './pages/PaywallPage'
import { generatePlan } from './utils/planGenerator'
import './index.css'

const PAID_TOKEN = 'tely10plan2026'
const ACCESS_KEY  = 'tely10_access'
const PENDING_KEY = 'tely10_pending'

export default function App() {
  const [page, setPage]                 = useState('input')
  const [plan, setPlan]                 = useState(null)
  const [justUnlocked, setJustUnlocked] = useState(false)

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search)
    const paidParam = (params.get('paid') || '').trim()
    if (paidParam !== PAID_TOKEN) return

    // Mark as paid — persists on this device forever
    localStorage.setItem(ACCESS_KEY, '1')
    window.history.replaceState({}, '', window.location.pathname)

    // Try to auto-generate from the inputs stored just before Stripe redirect
    const raw = localStorage.getItem(PENDING_KEY)
    if (raw) {
      localStorage.removeItem(PENDING_KEY)
      try {
        const p = JSON.parse(raw)
        const inputs = {
          inputType:    String(p.inputType ?? 'new'),
          inputSecs:    Number(p.inputSecs ?? 0),
          trainingDays: Array.isArray(p.trainingDays) ? p.trainingDays : [],
          longRunDay:   String(p.longRunDay ?? ''),
          startDate:    String(p.startDate ?? ''),
          age:          Number(p.age ?? 30),
        }
        // Only auto-generate if all required fields survived the round-trip
        if (
          inputs.trainingDays.length > 0 &&
          inputs.longRunDay &&
          inputs.startDate &&
          inputs.age > 0
        ) {
          const generated = generatePlan(inputs)
          setPlan(generated)
          setPage('plan')
          return
        }
      } catch {}
    }

    // Pending inputs missing or invalid — show form with unlocked banner
    setJustUnlocked(true)
  }, [])

  async function handleSubmit(inputs) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setPage('loading')

    const hasAccess = localStorage.getItem(ACCESS_KEY) === '1'

    if (!hasAccess) {
      try {
        const res  = await fetch('/api/access')
        const data = await res.json()
        if (!data.free) {
          localStorage.setItem(PENDING_KEY, JSON.stringify(inputs))
          setPage('paywall')
          return
        }
        fetch('/api/access', { method: 'POST' })
      } catch {
        // API unavailable — don't block the user
      }
    }

    const generated = generatePlan(inputs)
    setPlan(generated)
    setPage('plan')
  }

  function handleBack() {
    setPlan(null)
    setJustUnlocked(false)
    setPage('input')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (page === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{ color: '#888', fontSize: 16 }}>Building your plan…</p>
      </div>
    )
  }

  if (page === 'plan')    return <PlanPage plan={plan} onBack={handleBack} />
  if (page === 'paywall') return <PaywallPage onBack={() => setPage('input')} />

  return (
    <>
      {justUnlocked && (
        <div style={{
          background: '#0d2b1f', borderBottom: '1px solid #00d4aa',
          padding: '12px 20px', textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif", color: '#00d4aa', fontSize: 14, fontWeight: 600,
        }}>
          Payment confirmed — you're unlocked! Fill out the form below to get your plan.
        </div>
      )}
      <InputPage onSubmit={handleSubmit} />
    </>
  )
}
