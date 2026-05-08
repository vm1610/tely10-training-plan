// api/calendar.js — Vercel serverless function
// Decodes plan inputs from ?p= query param, generates ICS, serves it.
// webcal://yourapp.vercel.app/api/calendar?p=... triggers Calendar.app on iOS/macOS.

import { generatePlan } from '../src/utils/planGenerator.js'
import { generateICSContent } from '../src/utils/calendarExport.js'

export default function handler(req, res) {
  const { p } = req.query
  if (!p) {
    res.status(400).send('Missing plan data')
    return
  }

  let inputs
  try {
    inputs = JSON.parse(Buffer.from(decodeURIComponent(p), 'base64').toString('utf-8'))
  } catch {
    res.status(400).send('Invalid plan data')
    return
  }

  const { inputType, inputSecs, trainingDays, longRunDay, startDate, age } = inputs
  if (!inputType || !trainingDays || !longRunDay || !startDate || age == null) {
    res.status(400).send('Missing required fields')
    return
  }

  try {
    const plan = generatePlan({ inputType, inputSecs, trainingDays, longRunDay, startDate, age })
    const ics = generateICSContent(plan)

    res.setHeader('Content-Type', 'text/calendar;charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="tely10-training-plan.ics"')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(ics)
  } catch (err) {
    res.status(500).send('Failed to generate plan')
  }
}
