import { useState } from 'react'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDefaultStartDate() {
  // Ideal start: Monday 7 weeks before race (June 28 2026) = May 11 2026
  // If that's in the past, use next upcoming Monday
  const ideal = new Date(2026, 4, 11) // May 11 2026
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let target = ideal < today ? (() => {
    const todayDow = today.getDay()
    const daysToMon = todayDow === 1 ? 0 : todayDow === 0 ? 1 : 8 - todayDow
    const next = new Date(today)
    next.setDate(today.getDate() + daysToMon)
    return next
  })() : ideal

  const y = target.getFullYear()
  const m = String(target.getMonth() + 1).padStart(2, '0')
  const d = String(target.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DEFAULT_START = getDefaultStartDate()

export default function InputPage({ onSubmit }) {
  const [inputType, setInputType]   = useState('new')
  const [hours, setHours]           = useState('')
  const [minutes, setMinutes]       = useState('')
  const [seconds, setSeconds]       = useState('')
  const [age, setAge]               = useState('')
  const [startDate, setStartDate]   = useState(DEFAULT_START)
  const [daysCount, setDaysCount]   = useState(null)       // 3 | 4 | 5 — chosen first
  const [selectedDays, setSelectedDays] = useState([])     // filled after count chosen
  const [longRunDay, setLongRunDay] = useState(null)
  const [errors, setErrors]         = useState({})

  function handleDaysCountSelect(count) {
    setDaysCount(count)
    setSelectedDays([])   // reset day picks when count changes
    setLongRunDay(null)
  }

  function toggleDay(day) {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        const next = prev.filter(d => d !== day)
        if (longRunDay === day) setLongRunDay(null)
        return next
      }
      if (prev.length >= daysCount) return prev   // already full
      return [...prev, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
    })
  }

  function handleSubmit() {
    const errs = {}

    if (!age || isNaN(age) || Number(age) < 10 || Number(age) > 80)
      errs.age = 'Please enter a valid age between 10 and 80'

    if (inputType !== 'new') {
      const s = (parseInt(hours || 0) * 3600) + (parseInt(minutes || 0) * 60) + parseInt(seconds || 0)
      if (s <= 0) errs.time = 'Please enter a valid time'
    }

    if (!startDate) errs.startDate = 'Please choose a start date'
    if (!daysCount) errs.daysCount = 'Please choose how many days per week'
    if (selectedDays.length < daysCount) errs.selectedDays = `Please pick all ${daysCount} training days`
    if (!longRunDay) errs.longRunDay = 'Please choose your long run day'

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const totalSecs = inputType === 'new' ? 0
      : (parseInt(hours || 0) * 3600) + (parseInt(minutes || 0) * 60) + parseInt(seconds || 0)

    onSubmit({
      inputType,
      inputSecs: totalSecs,
      trainingDays: selectedDays,
      longRunDay,
      startDate,
      age: parseInt(age),
    })
  }

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const sectionLabel = {
    fontSize: 12, fontWeight: 700, color: '#6b7280',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 10, fontFamily: 'DM Sans',
  }
  const sectionHeading = { fontSize: 18, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }
  const sectionSubtext = { fontSize: 13, color: '#6b7280', marginBottom: 16 }
  const errorText = { color: '#f43f5e', fontSize: 13, marginTop: 8 }

  const timeInputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#f9fafb',
    fontSize: 20, fontWeight: 700, fontFamily: 'DM Sans',
    padding: '10px 12px', width: 72, textAlign: 'center', outline: 'none',
  }
  const timeLabelStyle = {
    fontSize: 11, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: 1, marginTop: 6, textAlign: 'center', fontFamily: 'DM Sans',
  }

  const experienceCards = [
    { type: 'new',  icon: '🆕', title: 'New to Running',              subtitle: "I've never run regularly before" },
    { type: '5k',   icon: '🏃', title: 'I know my 5K time',           subtitle: 'e.g. 28:00' },
    { type: '10k',  icon: '🏃', title: 'I know my 10K time',          subtitle: 'e.g. 55:00' },
    { type: 'half', icon: '🏃', title: 'I know my Half Marathon time', subtitle: 'e.g. 2:05:00' },
  ]

  const daysCountCards = [
    { value: 3, label: '3 days', badge: 'MINIMUM',     badgeBg: 'rgba(255,255,255,0.07)', badgeColor: '#6b7280' },
    { value: 4, label: '4 days', badge: 'RECOMMENDED', badgeBg: 'rgba(244,63,94,0.15)',   badgeColor: '#f43f5e' },
    { value: 5, label: '5 days', badge: 'COMMITTED',   badgeBg: 'rgba(255,255,255,0.07)', badgeColor: '#6b7280' },
  ]

  const daysRemaining = daysCount ? daysCount - selectedDays.length : 0
  const allDaysFilled = daysCount && selectedDays.length === daysCount

  const startDateFormatted = startDate
    ? new Date(startDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, color: '#f43f5e', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
            FREE TRAINING PLAN
          </div>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 'clamp(36px, 8vw, 64px)', lineHeight: 1, color: '#f9fafb', margin: '0 0 16px' }}>
            Tely 10<br />Training Plan
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 15, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
            7 weeks. Personalized to your pace. Free forever.<br />Built for the Tely 10 community.
          </p>
        </div>

        {/* SECTION 1 — Running Experience */}
        <div style={{ marginBottom: 40 }}>
          <div style={sectionLabel}>Running Experience</div>
          <div style={sectionHeading}>What's your running experience?</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {experienceCards.map(card => {
              const sel = inputType === card.type
              return (
                <div
                  key={card.type}
                  onClick={() => { setInputType(card.type); if (card.type === 'new') setHours('') }}
                  style={{
                    border: sel ? '2px solid #f43f5e' : '1.5px solid rgba(255,255,255,0.08)',
                    background: sel ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)',
                    borderRadius: 14, padding: '16px 14px', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 3 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{card.subtitle}</div>
                </div>
              )
            })}
          </div>

          {inputType !== 'new' && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: errors.time ? '1.5px solid #f43f5e' : '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '18px 20px',
              }}>
                <div style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'DM Sans', marginBottom: 14, fontWeight: 600 }}>
                  Enter your {inputType === '5k' ? '5K' : inputType === '10k' ? '10K' : 'Half Marathon'} time
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {inputType === 'half' && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <input type="number" min={0} max={3} value={hours} onChange={e => setHours(e.target.value)} placeholder="0" style={timeInputStyle} />
                        <div style={timeLabelStyle}>Hours</div>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#4b5563', paddingTop: 8 }}>:</div>
                    </>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="00" style={timeInputStyle} />
                    <div style={timeLabelStyle}>Minutes</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#4b5563', paddingTop: 8 }}>:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input type="number" min={0} max={59} value={seconds} onChange={e => setSeconds(e.target.value)} placeholder="00" style={timeInputStyle} />
                    <div style={timeLabelStyle}>Seconds</div>
                  </div>
                </div>
              </div>
              {errors.time && <div style={errorText}>{errors.time}</div>}
            </div>
          )}
        </div>

        {/* SECTION 2 — Age */}
        <div style={{ marginBottom: 40 }}>
          <div style={sectionLabel}>About You</div>
          <div style={sectionHeading}>How old are you?</div>
          <p style={sectionSubtext}>Used to calculate your personal heart rate training zones</p>
          <input
            type="number" min={10} max={80} value={age} placeholder="e.g. 32"
            onChange={e => { setAge(e.target.value); setErrors(p => ({ ...p, age: undefined })) }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: errors.age ? '1.5px solid #f43f5e' : '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#f9fafb', fontSize: 18, fontWeight: 600,
              fontFamily: 'DM Sans', padding: '14px 18px', width: '100%', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {errors.age && <div style={errorText}>{errors.age}</div>}
        </div>

        {/* SECTION 3 — Start Date */}
        <div style={{ marginBottom: 40 }}>
          <div style={sectionLabel}>Plan Start</div>
          <div style={sectionHeading}>When do you want to start?</div>
          <p style={sectionSubtext}>The race is Sunday June 28, 2026. We recommend starting 7 weeks out.</p>
          <input
            type="date" value={startDate}
            min={new Date().toISOString().split('T')[0]} max="2026-06-21"
            onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, startDate: undefined })) }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: errors.startDate ? '1.5px solid #f43f5e' : '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#f9fafb', fontSize: 16, fontWeight: 600,
              fontFamily: 'DM Sans', padding: '14px 18px', width: '100%',
              outline: 'none', boxSizing: 'border-box', colorScheme: 'dark',
            }}
          />
          {startDate && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              📅 Week 1 begins {startDateFormatted}
            </div>
          )}
          {errors.startDate && <div style={errorText}>{errors.startDate}</div>}
        </div>

        {/* SECTION 4 — How many days */}
        <div style={{ marginBottom: 40 }}>
          <div style={sectionLabel}>Training Frequency</div>
          <div style={sectionHeading}>How many days per week can you train?</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
            {daysCountCards.map(card => {
              const sel = daysCount === card.value
              return (
                <div
                  key={card.value}
                  onClick={() => { handleDaysCountSelect(card.value); setErrors(p => ({ ...p, daysCount: undefined, selectedDays: undefined })) }}
                  style={{
                    border: sel ? '2px solid #f43f5e' : '1.5px solid rgba(255,255,255,0.08)',
                    background: sel ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)',
                    borderRadius: 14, padding: '18px 14px', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', fontFamily: 'Barlow Condensed', marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{
                    display: 'inline-block', background: card.badgeBg, color: card.badgeColor,
                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    padding: '3px 8px', borderRadius: 6, fontFamily: 'DM Sans',
                  }}>
                    {card.badge}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.daysCount && <div style={errorText}>{errors.daysCount}</div>}
        </div>

        {/* SECTION 5 — Which days (revealed after count chosen) */}
        {daysCount && (
          <div style={{ marginBottom: 40 }}>
            <div style={sectionLabel}>Your Training Days</div>
            <div style={sectionHeading}>Which {daysCount} days will you train?</div>
            <p style={sectionSubtext}>
              {allDaysFilled
                ? '✓ All days chosen. Now pick your long run day below.'
                : `Pick ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''}.`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {ALL_DAYS.map((day, i) => {
                const isSelected = selectedDays.includes(day)
                const isFull = !isSelected && selectedDays.length >= daysCount
                return (
                  <button
                    key={day}
                    onClick={() => { if (!isFull || isSelected) { toggleDay(day); setErrors(p => ({ ...p, selectedDays: undefined })) } }}
                    style={{
                      background: isSelected ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '2px solid #f43f5e' : '1.5px solid rgba(255,255,255,0.08)',
                      color: isSelected ? '#f9fafb' : isFull ? '#374151' : '#9ca3af',
                      borderRadius: 10, padding: '10px 0',
                      cursor: isFull ? 'not-allowed' : 'pointer',
                      fontFamily: 'DM Sans', fontWeight: 700, fontSize: 12,
                      transition: 'all 0.15s', textAlign: 'center',
                      opacity: isFull ? 0.4 : 1,
                    }}
                  >
                    {DAY_SHORT[i]}
                  </button>
                )
              })}
            </div>
            {errors.selectedDays && <div style={errorText}>{errors.selectedDays}</div>}
          </div>
        )}

        {/* SECTION 6 — Long run day (revealed after all days chosen) */}
        {allDaysFilled && (
          <div style={{ marginBottom: 40 }}>
            <div style={sectionLabel}>Long Run Day</div>
            <div style={sectionHeading}>Which day is your long run?</div>
            <p style={sectionSubtext}>Your biggest session each week — pick the day you have the most time.</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedDays.map(day => {
                const sel = longRunDay === day
                return (
                  <button
                    key={day}
                    onClick={() => { setLongRunDay(day); setErrors(p => ({ ...p, longRunDay: undefined })) }}
                    style={{
                      background: sel ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                      border: sel ? '2px solid #a78bfa' : '1.5px solid rgba(255,255,255,0.08)',
                      color: sel ? '#a78bfa' : '#9ca3af',
                      borderRadius: 10, padding: '12px 20px',
                      cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans',
                      fontSize: 14, transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {sel && '🏔️ '}{day}
                  </button>
                )
              })}
            </div>
            {errors.longRunDay && <div style={errorText}>{errors.longRunDay}</div>}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '18px 32px',
            background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
            color: '#fff', border: 'none', borderRadius: 14,
            fontSize: 18, fontWeight: 700, fontFamily: 'DM Sans',
            cursor: 'pointer', marginTop: 8, letterSpacing: 0.5,
          }}
        >
          Build My Free Plan →
        </button>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 16 }}>
          100% free · No email · No signup · Built by @vasumanocha16_ on Instagram for the Tely 10 community
        </p>

      </div>
    </div>
  )
}
