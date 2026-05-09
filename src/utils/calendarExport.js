// calendarExport.js — Tely 10 Training Plan
// Pure client-side ES6 module. generateICSContent is also imported by api/calendar.js.

const DAY_INDEX = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getMondayOfWeek(date) {
  const dow = date.getDay()
  const daysFromMon = dow === 0 ? 6 : dow - 1
  const mon = new Date(date)
  mon.setDate(date.getDate() - daysFromMon)
  return mon
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(date.getDate() + n)
  return d
}

function formatDateICS(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

// ─── Date assignment ──────────────────────────────────────────────────────────

function getWeekRunDates(week, plan) {
  const sortedDays = [...plan.trainingDays].sort((a, b) => DAY_INDEX[a] - DAY_INDEX[b])

  if (week.weekNumber === 7) {
    const week7Monday = getMondayOfWeek(new Date(2026, 5, 28))
    return week.runs.map(run => {
      if (run.isRaceDay) return new Date(2026, 5, 28) // June 28 — always
      return addDays(week7Monday, DAY_INDEX[sortedDays[0]])
    })
  }

  const week1Monday = getMondayOfWeek(parseLocalDate(plan.startDate))
  const weekMonday = addDays(week1Monday, (week.weekNumber - 1) * 7)

  const LONG_TYPES = new Set(['longRun', 'hillyLong'])
  const nonLongDays = sortedDays.filter(d => d !== plan.longRunDay)
  let nonLongIdx = 0

  return week.runs.map(run => {
    const dayName = LONG_TYPES.has(run.type)
      ? plan.longRunDay
      : (nonLongDays[nonLongIdx++] ?? sortedDays[0])
    return addDays(weekMonday, DAY_INDEX[dayName])
  })
}

// ─── ICS text helpers ─────────────────────────────────────────────────────────

function escapeICS(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

function foldLine(line) {
  if (line.length <= 75) return line + '\r\n'
  let result = line.slice(0, 75) + '\r\n'
  let rest = line.slice(75)
  while (rest.length > 0) {
    result += ' ' + rest.slice(0, 74) + '\r\n'
    rest = rest.slice(74)
  }
  return result
}

function buildRunDescription(run, week) {
  const parts = [run.description, '']
  parts.push(`Pace: ${run.pace}`)
  parts.push(`Heart rate: ${run.hrBpm} - ${run.hrFeel}`)
  parts.push(`Estimated time: ${run.estimatedTime}`)
  if (run.walkRunInstructions) parts.push(`Run/Walk: ${run.walkRunInstructions}`)
  if (run.elevationTip) parts.push(`Elevation: ${run.elevationTip}`)
  parts.push('')
  parts.push(`Coach tip: ${week.coachTip}`)
  parts.push('')
  parts.push('Plan by @vasumanocha16_ on Instagram')
  return parts.join('\n')
}

function buildRaceDescription() {
  return [
    'You made it to race day. Trust your training. Run your own race. See you at the finish line.',
    '',
    'Distance: 10 miles / 16.1km',
    'Location: Newfoundland, Canada',
    'Date: Sunday June 28, 2026',
    '',
    'Plan by @vasumanocha16_ on Instagram',
  ].join('\n')
}

// ─── ICS generation (also exported for use in api/calendar.js) ───────────────

function formatDTSTAMP(ms) {
  const d = new Date(ms)
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dy = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  const s = String(d.getUTCSeconds()).padStart(2, '0')
  return `${y}${mo}${dy}T${h}${mi}${s}Z`
}

export function generateICSContent(plan) {
  const ts = Date.now()
  const dtstamp = formatDTSTAMP(ts)
  const lines = []

  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Tely10TrainingPlan//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push('X-WR-CALNAME:Tely 10 Training Plan')

  plan.weeks.forEach(week => {
    const dates = getWeekRunDates(week, plan)
    week.runs.forEach((run, i) => {
      const runDate = dates[i]
      const uid = `tely10-w${week.weekNumber}-r${run.runNumber}-${ts + i}@tely10plan`
      const summary = run.isRaceDay
        ? 'RACE DAY - Tely 10 - 10 Miles - June 28'
        : `Week ${week.weekNumber} - ${run.name} - ${run.distance}km`
      const description = run.isRaceDay
        ? buildRaceDescription()
        : buildRunDescription(run, week)

      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${uid}`)
      lines.push(`DTSTAMP:${dtstamp}`)
      lines.push(`DTSTART;VALUE=DATE:${formatDateICS(runDate)}`)
      lines.push(`DTEND;VALUE=DATE:${formatDateICS(addDays(runDate, 1))}`)
      lines.push(`SUMMARY:${escapeICS(summary)}`)
      lines.push(`DESCRIPTION:${escapeICS(description)}`)
      lines.push('END:VEVENT')
    })
  })

  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('')
}

// ─── Platform detection ───────────────────────────────────────────────────────

export function detectPlatform() {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Macintosh/.test(ua)) return 'mac'
  return 'desktop'
}

// ─── Calendar open ────────────────────────────────────────────────────────────

/**
 * On iOS and macOS: generates a webcal:// URL pointing to the Vercel API route,
 * which serves the ICS — Calendar.app opens and prompts to subscribe.
 *
 * On Android and desktop (or during local dev): downloads the .ics file
 * so the user can open it in their calendar app.
 */
export function openCalendar(plan) {
  const platform = detectPlatform()
  const isLocal = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1'

  if (!isLocal) {
    // On production: all platforms use the real API URL so there's no blob navigation issue.
    // Build the query string once.
    const inputs = {
      inputType:    plan.inputType,
      inputSecs:    plan.inputSecs,
      trainingDays: plan.trainingDays,
      longRunDay:   plan.longRunDay,
      startDate:    plan.startDate,
      age:          plan.age,
    }
    const encoded = btoa(JSON.stringify(inputs))
    const qs = `?p=${encodeURIComponent(encoded)}`

    if (platform === 'ios') {
      // iOS: navigate current tab — iOS intercepts webcal:// without leaving the page
      window.location.href = `webcal://${window.location.host}/api/calendar${qs}`
      return 'webcal'
    } else if (platform === 'mac') {
      // Mac: open in new tab so plan page stays visible; browser hands off to Calendar.app
      window.open(`webcal://${window.location.host}/api/calendar${qs}`, '_blank')
      return 'webcal'
    } else if (platform === 'android') {
      // Direct navigation on Android: Chrome intercepts the attachment response, downloads
      // the .ics, and shows an "OPEN" button → Android asks "Open with Google Calendar / Outlook?"
      window.location.href = `${window.location.origin}/api/calendar${qs}`
      return 'download'
    } else {
      // Desktop: new tab so the user doesn't lose their plan page.
      window.open(`${window.location.origin}/api/calendar${qs}`, '_blank')
      return 'download'
    }
  }

  // Local dev fallback: blob download
  const icsContent = generateICSContent(plan)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tely10-training-plan.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'download'
}
