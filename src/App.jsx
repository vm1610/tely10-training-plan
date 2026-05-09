import { useState, useEffect } from 'react'
import InputPage from './pages/InputPage'
import PlanPage from './pages/PlanPage'
import PaywallPage from './pages/PaywallPage'
import { generatePlan } from './utils/planGenerator'
import './index.css'

const PAID_TOKEN = 'tely10plan2026'
const ACCESS_KEY = 'tely10_access'
const PENDING_KEY = 'tely10_pending'

export default function App() {
  const [page, setPage] = useState('input')
  const [plan, setPlan] = useState(null)
  const [justUnlocked, setJustUnlocked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paidParam = (params.get('paid') || '').trim()

    if (paidParam === PAID_TOKEN) {
      localStorage.setItem(ACCESS_KEY, '1')
      window.history.replaceState({}, '', window.location.pathname)

      const pending = localStorage.getItem(PENDING_KEY)
      if (pending) {
        localStorage.removeItem(PENDING_KEY)
        try {
          const inputs = JSON.parse(pending)
          const generatedPlan = generatePlan(inputs)
          setPlan(generatedPlan)
          setPage('plan')
          return
        } catch {}
      }
      // Pending inputs missing or failed — show InputPage with unlocked banner
      setJustUnlocked(true)
    }
  }, [])

  async function handleSubmit(inputs) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setPage('loading')

    const hasAccess = localStorage.getItem(ACCESS_KEY) === '1'

    if (!hasAccess) {
      try {
        const res = await fetch('/api/access')
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

    try {
      setPlan(generatePlan(inputs))
      setPage('plan')
    } catch {
      setPage('input')
    }
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
