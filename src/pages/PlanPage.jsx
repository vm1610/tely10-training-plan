import { useState } from 'react'
import { openCalendar, detectPlatform } from '../utils/calendarExport'

const PLATFORM_HINTS = {
  webcal: {
    ios:  { icon: '📱', title: 'Opening Calendar…', body: 'Tap "Subscribe" when Calendar.app prompts you. All your training runs will appear instantly.' },
    mac:  { icon: '💻', title: 'Opening Calendar…', body: 'Click "Subscribe" when Calendar.app opens. All your training runs will appear instantly.' },
  },
  download: {
    android: { icon: '📱', title: 'Almost there!', body: 'Tap the download notification → your calendar app opens → tap "Add" to import all your training runs.' },
    desktop: { icon: '💻', title: 'File saved!', body: 'Open your Downloads folder, double-click tely10-training-plan.ics, and your calendar app will import all runs. For Google Calendar: Settings → Import.' },
  },
}

const colorMap = {
  green:  { border: '#4ade80', bg: 'rgba(74,222,128,0.08)',  badge: 'rgba(74,222,128,0.15)',  text: '#4ade80'  },
  orange: { border: '#f97316', bg: 'rgba(249,115,22,0.08)',  badge: 'rgba(249,115,22,0.15)',  text: '#f97316'  },
  purple: { border: '#a78bfa', bg: 'rgba(167,139,250,0.08)', badge: 'rgba(167,139,250,0.15)', text: '#a78bfa'  },
  taper:  { border: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  badge: 'rgba(56,189,248,0.15)',  text: '#38bdf8'  },
  race:   { border: '#f43f5e', bg: 'rgba(244,63,94,0.10)',   badge: 'rgba(244,63,94,0.15)',   text: '#f43f5e'  },
}

const typeLabel = {
  easy:           'EASY RUN',
  tempo:          'TEMPO',
  hills:          'HILLS',
  longRun:        'LONG RUN',
  hillyLong:      'HILLY LONG RUN',
  taperIntervals: 'TAPER',
  race:           'RACE DAY',
}

function ProgressionBadge({ note, isPeak, isRecovery, isRace }) {
  if (isRecovery) {
    return (
      <span style={{
        background: 'rgba(56,189,248,0.15)',
        color: '#38bdf8',
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Barlow Condensed',
        letterSpacing: 1,
      }}>
        {note || 'RECOVERY'}
      </span>
    )
  }
  if (isPeak) {
    return (
      <span style={{
        background: 'rgba(244,63,94,0.15)',
        color: '#f43f5e',
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Barlow Condensed',
        letterSpacing: 1,
      }}>
        {note || 'PEAK WEEK'}
      </span>
    )
  }
  if (isRace) {
    return (
      <span style={{
        background: 'rgba(244,63,94,0.15)',
        color: '#f43f5e',
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Barlow Condensed',
        letterSpacing: 1,
      }}>
        {note || 'RACE WEEK'}
      </span>
    )
  }
  if (note) {
    return (
      <span style={{
        background: 'rgba(74,222,128,0.12)',
        color: '#4ade80',
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Barlow Condensed',
        letterSpacing: 1,
      }}>
        {note}
      </span>
    )
  }
  return null
}

function RaceDayCard({ run }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(239,68,68,0.08))',
      borderLeft: '4px solid #f43f5e',
      padding: '32px 24px',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
      <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 32, color: '#f9fafb', marginBottom: 8 }}>
        RACE DAY — TELY 10
      </div>
      <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        Sunday June 28, 2026 · Newfoundland, Canada
      </div>
      <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
        <span>📏 <strong style={{ color: '#f9fafb' }}>10 Miles · 16.1km</strong></span>
        <span>⏱ <strong style={{ color: '#f9fafb' }}>{run.estimatedTime}</strong></span>
      </div>
      <div style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.7, fontStyle: 'italic' }}>
        "You've done the work. Trust your training. Run your own race."
      </div>
    </div>
  )
}

function RunCard({ run }) {
  const colors = colorMap[run.colorKey] || colorMap.green
  return (
    <div style={{
      borderLeft: `4px solid ${colors.border}`,
      background: colors.bg,
      padding: '20px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{
          background: colors.badge,
          color: colors.text,
          padding: '3px 10px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Barlow Condensed',
          letterSpacing: 1.5,
        }}>
          {typeLabel[run.type] || run.type.toUpperCase()}
        </span>
        <span style={{ color: '#f9fafb', fontWeight: 700, fontSize: 16, fontFamily: 'DM Sans' }}>
          {run.name}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#9ca3af', flexWrap: 'wrap', marginBottom: 14 }}>
        <span>📏 <strong style={{ color: '#f9fafb' }}>{run.distance}km</strong></span>
        <span>⏱ <strong style={{ color: '#f9fafb' }}>{run.estimatedTime}</strong></span>
        <span>🎯 <strong style={{ color: '#f9fafb' }}>{run.paceRange}</strong></span>
      </div>

      {/* HR zone */}
      <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
        ❤️ Zone {run.hrZone} · <span style={{ color: '#f9fafb' }}>{run.hrBpm}</span> · {run.hrFeel}
      </div>

      {/* Description */}
      <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6, marginBottom: run.walkRunInstructions || run.elevationTip ? 12 : 0 }}>
        {run.description}
      </div>

      {/* Walk/run instructions for new runners */}
      {run.walkRunInstructions && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#a78bfa', marginTop: 10 }}>
          🔄 <strong>Run/Walk:</strong> {run.walkRunInstructions}
        </div>
      )}

      {/* Elevation tip */}
      {run.elevationTip && (
        <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#a78bfa', marginTop: 10 }}>
          ⛰️ {run.elevationTip}
        </div>
      )}
    </div>
  )
}

function WeekCard({ week, isExpanded, onToggle, plan }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Week header */}
      <div
        onClick={onToggle}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: isExpanded ? '16px 16px 0 0' : 16,
          padding: '20px 24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          {/* Week number + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 22, color: '#f9fafb' }}>
              Week {week.weekNumber} — {week.title}
            </span>
            <ProgressionBadge
              note={week.progressionNote}
              isPeak={week.isPeakWeek}
              isRecovery={week.isRecoveryWeek}
              isRace={week.isRaceWeek}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9ca3af', flexWrap: 'wrap' }}>
            <span>📏 {week.totalKm.toFixed(1)}km total</span>
            <span>🏃 {week.runs.length} runs</span>
          </div>
          {/* Coach tip — show always */}
          <div style={{ marginTop: 10, fontSize: 13, color: '#a78bfa', fontStyle: 'italic' }}>
            💬 {week.coachTip}
          </div>
        </div>
        <div style={{
          fontSize: 20,
          color: '#6b7280',
          transform: isExpanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          flexShrink: 0,
        }}>
          ▾
        </div>
      </div>

      {/* Expanded runs list */}
      {isExpanded && (
        <div style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden',
        }}>
          {week.runs.map(run =>
            run.isRaceDay
              ? <RaceDayCard key={run.runNumber} run={run} />
              : <RunCard key={run.runNumber} run={run} />
          )}
        </div>
      )}
    </div>
  )
}

export default function PlanPage({ plan, onBack }) {
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1]))
  const [calendarHint, setCalendarHint] = useState(null)

  function handleCalendar() {
    const method = openCalendar(plan)          // 'webcal' or 'download'
    const platform = detectPlatform()          // 'ios' | 'android' | 'mac' | 'desktop'
    const hints = PLATFORM_HINTS[method]
    setCalendarHint(hints[platform] ?? hints[Object.keys(hints)[0]])
  }

  function toggleWeek(weekNumber) {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekNumber)) next.delete(weekNumber)
      else next.add(weekNumber)
      return next
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '0 0 80px' }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(244,63,94,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 20px 40px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Back button */}
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#9ca3af',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              marginBottom: 32,
              fontFamily: 'DM Sans',
            }}
          >
            ← Back to Start
          </button>

          {/* Title + level badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <h1 style={{
              fontFamily: 'Barlow Condensed',
              fontWeight: 900,
              fontSize: 'clamp(32px, 7vw, 56px)',
              lineHeight: 1,
              color: '#f9fafb',
              margin: 0,
            }}>
              Your Tely 10<br />Training Plan
            </h1>
            <span style={{
              background: plan.levelColor + '22',
              color: plan.levelColor,
              border: `1px solid ${plan.levelColor}44`,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'Barlow Condensed',
              letterSpacing: 1,
              alignSelf: 'flex-start',
              marginTop: 4,
            }}>
              {plan.levelLabel.toUpperCase()}
            </span>
          </div>

          {/* Pace summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Easy Pace', value: plan.paces.easy + '/km' },
              { label: 'Tempo Pace', value: plan.paces.tempo + '/km' },
              { label: 'Long Run', value: plan.paces.longRun + '/km' },
              { label: 'Race Pace', value: plan.paces.race + '/km' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', fontFamily: 'Barlow Condensed' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* HR zones row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            {[2, 3, 4].map(z => (
              <div key={z} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
              }}>
                <span style={{ color: '#6b7280' }}>Zone {z}: </span>
                <span style={{ color: '#f9fafb', fontWeight: 600 }}>
                  {plan.hrZones['zone' + z].min}–{plan.hrZones['zone' + z].max} bpm
                </span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32, color: '#9ca3af', fontSize: 14 }}>
            <span>📏 <strong style={{ color: '#f9fafb' }}>{plan.totalDistance.toFixed(1)}km</strong> total</span>
            <span>📅 <strong style={{ color: '#f9fafb' }}>7 weeks</strong> · Race June 28</span>
            <span>🏃 <strong style={{ color: '#f9fafb' }}>{plan.trainingDays.map(d => d.slice(0, 3)).join(' · ')}</strong></span>
            <span>🏔️ Long run: <strong style={{ color: '#f9fafb' }}>{plan.longRunDay}</strong></span>
          </div>

          {/* Export button */}
          <button
            onClick={handleCalendar}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'DM Sans',
              marginRight: 12,
            }}
          >
            Add to Calendar 📅
          </button>

          {/* Post-click hint */}
          {calendarHint && (
            <div style={{
              marginTop: 16,
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22 }}>{calendarHint.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#4ade80', fontSize: 14, marginBottom: 4 }}>
                  {calendarHint.title}
                </div>
                <div style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.5 }}>
                  {calendarHint.body}
                </div>
              </div>
              <button
                onClick={() => setCalendarHint(null)}
                style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 16, marginLeft: 'auto', padding: 0 }}
              >✕</button>
            </div>
          )}
        </div>
      </div>

      {/* WEEKS LIST */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
        {plan.weeks.map(week => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            isExpanded={expandedWeeks.has(week.weekNumber)}
            onToggle={() => toggleWeek(week.weekNumber)}
            plan={plan}
          />
        ))}
      </div>

      {/* FOLLOW SECTION */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px 48px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>🙏</div>
          <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 28, color: '#f9fafb', marginBottom: 12 }}>
            This plan took a lot of work
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 24px' }}>
            If this gets you to that Tely 10 start line, it would mean the world if you followed my journey. I'm running the Tely 10 too — follow along for training updates, race day content, and more free plans.
          </p>
          <a
            href="https://instagram.com/vasumanocha16_"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'DM Sans',
              marginBottom: 12,
            }}
          >
            Follow @vasumanocha16_ on Instagram
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#4b5563',
        fontSize: 13,
      }}>
        Free forever · Built for the Tely 10 community · @vasumanocha16_
      </div>

    </div>
  )
}
