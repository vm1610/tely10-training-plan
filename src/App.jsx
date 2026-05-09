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
  const [page, setPage] = useState('input') // 'input' | 'loading' | 'plan' | 'paywall'
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('paid') === PAID_TOKEN) {
      localStorage.setItem(ACCESS_KEY, '1')
      window.history.replaceState({}, '', window.location.pathname)
      // Auto-generate if they had a pending form submission before going to Stripe
      const pending = localStorage.getItem(PENDING_KEY)
      if (pending) {
        localStorage.removeItem(PENDING_KEY)
        try {
          const inputs = JSON.parse(pending)
          setPlan(generatePlan(inputs))
          setPage('plan')
          return
        } catch {}
      }
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
        // Free slot — increment in background then fall through to generate
        fetch('/api/access', { method: 'POST' })
      } catch {
        // API unavailable — don't block the user
      }
    }

    setPlan(generatePlan(inputs))
    setPage('plan')
  }

  function handleBack() {
    setPlan(null)
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
  return <InputPage onSubmit={handleSubmit} />
}
