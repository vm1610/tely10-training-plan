import { useState } from 'react'
import InputPage from './pages/InputPage'
import PlanPage from './pages/PlanPage'
import './index.css'

export default function App() {
  const [plan, setPlan] = useState(null)

  function handleGenerate(generatedPlan) {
    setPlan(generatedPlan)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setPlan(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (plan) {
    return <PlanPage plan={plan} onBack={handleBack} />
  }

  return <InputPage onGenerate={handleGenerate} />
}
