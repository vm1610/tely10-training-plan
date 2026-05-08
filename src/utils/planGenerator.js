// planGenerator.js — Tely 10 Free Training Plan Generator
// Pure ES6 module, no React, no JSX.

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function roundToHalf(n) {
  return Math.round(n * 2) / 2;
}

function secsToMmss(totalSecs) {
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.round(totalSecs % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatEstimatedTime(distanceKm, paceSecPerKm) {
  const totalSecs = distanceKm * paceSecPerKm;
  const totalMins = Math.round(totalSecs / 60);
  if (totalMins < 60) {
    return `${totalMins}min`;
  }
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function paceRange(paceSecPerKm) {
  const lo = secsToMmss(paceSecPerKm - 15);
  const hi = secsToMmss(paceSecPerKm + 15);
  return `${lo}–${hi}/km`;
}

export function formatPaceDisplay(mmss) {
  return mmss + '/km';
}

// ---------------------------------------------------------------------------
// LEVEL DETECTION
// ---------------------------------------------------------------------------

function detectLevel(inputType, inputSecs) {
  if (inputType === 'new') return 'new';

  let fiveK;
  if (inputType === '5k') {
    fiveK = inputSecs;
  } else if (inputType === '10k') {
    fiveK = inputSecs * Math.pow(5 / 10, 1.06);
  } else if (inputType === 'half') {
    fiveK = inputSecs * Math.pow(5 / 21.0975, 1.06);
  }

  const fiveKMin = fiveK / 60;

  if (fiveKMin > 35) return 'beginner';
  if (fiveKMin >= 25 && fiveKMin <= 35) return 'intermediate';
  return 'advanced';
}

function levelMeta(level) {
  const map = {
    new:          { label: 'New Runner',    color: '#4ade80' },
    beginner:     { label: 'Beginner',      color: '#f97316' },
    intermediate: { label: 'Intermediate',  color: '#a78bfa' },
    advanced:     { label: 'Advanced',      color: '#f43f5e' },
  };
  return map[level];
}

// ---------------------------------------------------------------------------
// PACE CALCULATION
// ---------------------------------------------------------------------------

function calcPaces(level, inputType, inputSecs) {
  let fiveKSecs;
  if (level === 'new') {
    fiveKSecs = 390 * 5; // 5K pace = 6:30/km (390 sec/km); total 5K = 1950 sec so base = 390 sec/km
  } else if (inputType === '5k') {
    fiveKSecs = inputSecs;
  } else if (inputType === '10k') {
    fiveKSecs = inputSecs * Math.pow(5 / 10, 1.06);
  } else if (inputType === 'half') {
    fiveKSecs = inputSecs * Math.pow(5 / 21.0975, 1.06);
  }

  const base = fiveKSecs / 5; // sec per km at 5K pace

  return {
    easySec:          base * 1.25,
    longRunSec:       base * 1.30,
    tempoSec:         base * 1.05,
    hillRepeatSec:    base * 1.00,
    raceSec:          base * 1.10,
    taperIntervalSec: base * 1.05,
    easy:          secsToMmss(base * 1.25),
    longRun:       secsToMmss(base * 1.30),
    tempo:         secsToMmss(base * 1.05),
    hillRepeat:    secsToMmss(base * 1.00),
    race:          secsToMmss(base * 1.10),
    taperInterval: secsToMmss(base * 1.05),
  };
}

// ---------------------------------------------------------------------------
// HEART RATE ZONES
// ---------------------------------------------------------------------------

function calcHRZones(age) {
  const maxHR = 220 - age;
  return {
    maxHR,
    zone1: { min: Math.round(maxHR * 0.50), max: Math.round(maxHR * 0.60) },
    zone2: { min: Math.round(maxHR * 0.60), max: Math.round(maxHR * 0.70) },
    zone3: { min: Math.round(maxHR * 0.70), max: Math.round(maxHR * 0.80) },
    zone4: { min: Math.round(maxHR * 0.80), max: Math.round(maxHR * 0.90) },
    zone5: { min: Math.round(maxHR * 0.90), max: maxHR },
  };
}

function hrBpmStr(zone) {
  return `${zone.min}–${zone.max} bpm`;
}

function hrFeelByZone(zoneNum) {
  const feels = {
    1: 'Very easy — warm up pace',
    2: 'Easy — you can hold a full conversation',
    3: 'Moderate — a few words at a time',
    4: 'Hard — tempo effort, controlled but tough',
    5: 'Very hard — race/sprint effort',
  };
  return feels[zoneNum];
}

// ---------------------------------------------------------------------------
// WORKOUT DESCRIPTIONS
// ---------------------------------------------------------------------------

const descriptions = {
  easy: {
    new:          'Slow and comfortable. You should be able to hold a full conversation the entire time. If you can\'t talk, slow down. This is not the time to push.',
    beginner:     'Slow and comfortable. You should be able to hold a full conversation the entire time. If you can\'t talk, slow down. This is not the time to push.',
    intermediate: 'Slow and comfortable. You should be able to hold a full conversation the entire time. If you can\'t talk, slow down. This is not the time to push.',
    advanced:     'Slow and comfortable. You should be able to hold a full conversation the entire time. If you can\'t talk, slow down. This is not the time to push.',
  },
  rolling400s: {
    new:          'Easy Effort Fartlek: During your run, whenever you pass a lamppost or tree, pick up your pace until the next one, then go back to easy. Do this 6–8 times naturally. Don\'t time it.',
    beginner:     'Gentle Pickups: Run slightly faster than easy for 2 minutes, then go back to easy for 3 minutes. Repeat 4–5 times. Not sprinting — just a bit more effort.',
    intermediate: 'Rolling 400s: Run 400m (about 2 minutes) at a comfortably hard pace, then jog easy for 90 seconds to recover. Repeat for the full distance. Aim for consistent pace across all reps.',
    advanced:     'Rolling 400s at 5K race pace: 400m hard at your 5K pace, 90 sec easy jog recovery. Maintain pace consistency. By rep 5–6 it should be working.',
  },
  rolling300s: {
    new:          'Easy Effort Fartlek: Pick up pace at natural landmarks 6–8 times. Shorter and sharper than usual — enjoy feeling quick.',
    beginner:     'Gentle Pickups: Run slightly faster for 90 seconds, recover for 2 minutes. Repeat 4–5 times. Slightly shorter than last tempo session — use that to feel a bit faster.',
    intermediate: 'Rolling 300s: Run hard for about 90 seconds, jog easy for 90 seconds. Repeat for the full distance. Slightly shorter than 400s — use the sharpness to stay fast.',
    advanced:     'Rolling 300s faster than 5K pace: 300m hard, 60 sec recovery. These should feel quick and sharp. Great for leg turnover before the taper.',
  },
  tempo321: {
    new:          'Easy Fartlek: Pick up pace at natural landmarks 6–8 times. Keep it playful and natural — no watch needed.',
    beginner:     'Steady Effort Run: Run at a pace you could hold for 30 minutes but not much longer. Slightly harder than easy. Do this for the middle 20 minutes of your run, easy pace to start and end.',
    intermediate: 'Tempo 3-2-1: Run hard for 3 min, recover 90 sec. Run hard for 2 min, recover 90 sec. Run hard for 1 min, recover 90 sec. That\'s one set. Repeat 2–3 times. Hard but controlled — not all-out.',
    advanced:     'Tempo 3-2-1 at 10K race pace: Hard 3 min / recover 90 sec / Hard 2 min / recover 90 sec / Hard 1 min / recover 90 sec. 2–3 full sets. Each hard effort controlled, save something each time.',
  },
  hills: {
    new:          'Hill Walks: Find a gentle hill. Walk up fast with good posture — lean slightly forward, drive your arms. Walk back down easy. Repeat 6 times. Focus on the feeling of using your glutes and arms.',
    beginner:     'Easy Hill Jogs: Find a gentle hill. Jog up at easy effort — slowing right down is completely fine. Walk back down to fully recover. Repeat 5–6 times.',
    intermediate: 'Hill Repeats: Find a hill that takes 60–90 seconds to run up. Run up at hard effort, jog back down to recover fully. Repeat 7–8 times. Hills build the leg strength you need for the Tely 10 course.',
    advanced:     'Power Hill Repeats: Sprint up at 90% effort, jog very slowly back down to fully recover. 8–10 reps. By rep 7 it should be hurting. That\'s correct.',
  },
  hillyLong: {
    new:          'Flat Long Run: Keep it flat this week. Focus on time on feet, not distance. Once you can run 10+ minutes without stopping, start adding gentle hills.',
    beginner:     'Gently Hilly Long Run: Choose a route with gentle rolling hills. Walk the uphills if needed — that still builds real strength. Keep the overall pace very easy and comfortable throughout.',
    intermediate: 'Hilly Long Run: Find a hilly route and aim for 240m+ of total elevation gain. Run the uphills at easy effort — slow way down if needed. This directly mirrors the Tely 10 course profile.',
    advanced:     'Hilly Progressive Long Run: Hilly route, 240m+ elevation. Run uphills at moderate effort, push the descents. Last 2–3km at your goal race pace.',
  },
  taperIntervals: {
    all: 'Race Pace Activation: Short run with a few kilometres at your goal Tely 10 pace in the middle. This wakes your legs up without tiring you out. Start easy, hit race pace for 2–3km in the middle, finish easy. You should feel sharp, not tired, after this session.',
  },
  race: {
    all: 'Race day! 10 miles along the streets of Newfoundland. You have done the work — now trust it. Start conservative, run your own race, and take in every moment. See you at the finish line.',
  },
  bonusEasy: {
    all: 'Active recovery run. Very easy effort — slower than your regular easy pace. Just keep the legs moving and blood flowing. If you feel stiff from yesterday, this will help.',
  },
  secondEasy: {
    all: 'Second easy run of the week. Keep it genuinely easy. This one is pure habit-building and active recovery — it should feel almost too easy.',
  },
};

function getDesc(type, level) {
  if (type === 'taperIntervals' || type === 'race') return descriptions[type].all;
  if (type === 'bonusEasy') return descriptions.bonusEasy.all;
  if (type === 'secondEasy') return descriptions.secondEasy.all;
  const map = descriptions[type];
  if (!map) return '';
  return map[level] || map.intermediate || '';
}

// ---------------------------------------------------------------------------
// WALK-RUN INSTRUCTIONS — new runners only
// ---------------------------------------------------------------------------

const walkRunByWeek = {
  1: 'Run 2 min, walk 2 min. Repeat for the full distance.',
  2: 'Run 3 min, walk 2 min. Repeat for the full distance.',
  3: 'Run 3 min, walk 2 min. Same as last week — notice how much easier it feels.',
  4: 'Run 5 min, walk 1 min. Repeat for the full distance.',
  5: 'Run 8 min, walk 1 min. Repeat for the full distance.',
  6: 'Run 10 min, walk 1 min. Repeat for the full distance.',
  7: {
    run1: 'Short activation run. Run easy with a few gentle pickups.',
    race: 'Aim to run as much as possible. Walk when you need to — no shame. Everyone walks at the Tely 10.',
  },
};

// ---------------------------------------------------------------------------
// ELEVATION TIPS
// ---------------------------------------------------------------------------

const elevationTips = {
  new:          null,
  beginner:     'Choose a route with gentle rolling hills. Walk uphills if needed.',
  intermediate: 'Aim for 240m+ of total elevation gain. Use Strava or komoot to find a hilly route.',
  advanced:     'Target 240m+ elevation. Push the uphills, use the descents to recover.',
};

// ---------------------------------------------------------------------------
// COACH TIPS
// ---------------------------------------------------------------------------

const coachTips = {
  new: [
    'Starting is the hardest part. You already did it. The walk breaks are part of the plan — don\'t skip them.',
    'Your legs might feel heavy. That\'s normal and actually a good sign. Slow down more if needed.',
    'Recovery week! Enjoy the shorter runs. Your body is adapting right now.',
    'Notice how much easier things feel compared to Week 1? That\'s real fitness building.',
    'Hardest week of the plan. Get through this and race day will feel manageable.',
    'Almost there. Don\'t add extra runs — trust the taper.',
    'Rest. Sleep. Eat well. You have done the work.',
  ],
  beginner: [
    'Build the habit first. Pace doesn\'t matter yet — consistency does.',
    'Hills feel hard because they are hard. That\'s the point — they make race day easier.',
    'Recovery week. Your easy runs should feel genuinely easy by now.',
    'This week introduces real speed work. Don\'t go too hard — comfortably hard is the target.',
    'Peak week. Your longest run ever might happen this Saturday. Respect the distance.',
    'The taper is real. You\'ll feel restless — that\'s your body storing energy for race day.',
    'Don\'t do anything new this week. No new shoes, no new food, no extra runs.',
  ],
  intermediate: [
    'Don\'t go out too hard — the easy runs should feel almost embarrassingly slow.',
    'Strength training complements your running this week if you can fit it in.',
    'You may notice your easy pace feels genuinely easier — that\'s adaptation working.',
    'Consistency beats intensity. Show up for all three runs this week.',
    'Getting used to hills is crucial for the Tely 10 course. Embrace them.',
    'The fitness is banked. It\'s all about staying sharp now.',
    'Race week. Trust everything you\'ve built over the last 6 weeks.',
  ],
  advanced: [
    'Discipline on easy runs now pays off on race day. Keep the easy runs genuinely easy.',
    'Progressive hill long run — treat the last 2km seriously.',
    'Recovery week is not optional. The adaptation happens here.',
    'Tempo 3-2-1 should feel controlled hard — not all-out. Save something.',
    'Peak week. Execute every session with intention.',
    'Taper well. Legs will feel heavy mid-week — that\'s normal.',
    'Race week prep: sleep, hydrate, carb load Thursday–Saturday. Race Sunday.',
  ],
};

// ---------------------------------------------------------------------------
// BASE PLAN TEMPLATE
// ---------------------------------------------------------------------------

// Each entry: { type, name, base, colorKey, hrZone }
const basePlan = [
  {
    weekNumber: 1,
    title: 'Build the Habit',
    isPeakWeek: false,
    isRecoveryWeek: false,
    isRaceWeek: false,
    runs: [
      { type: 'easy',     name: 'Easy Run',                        base: 7,    colorKey: 'green',  hrZone: 2 },
      { type: 'tempo',    name: 'Rolling 400s',                    base: 7,    colorKey: 'orange', hrZone: 3 },
      { type: 'longRun',  name: 'Long Run',                        base: 11,   colorKey: 'purple', hrZone: 2 },
    ],
  },
  {
    weekNumber: 2,
    title: 'Add the Hills',
    isPeakWeek: false,
    isRecoveryWeek: false,
    isRaceWeek: false,
    runs: [
      { type: 'hills',     name: 'Hill Repeats',                   base: 7.6,  colorKey: 'green',  hrZone: 3 },
      { type: 'easy',      name: 'Easy Run',                       base: 8,    colorKey: 'green',  hrZone: 2 },
      { type: 'hillyLong', name: 'Hilly Progressive Long Run',     base: 12,   colorKey: 'purple', hrZone: 2 },
    ],
  },
  {
    weekNumber: 3,
    title: 'Rest and Absorb',
    isPeakWeek: false,
    isRecoveryWeek: true,
    isRaceWeek: false,
    runs: [
      { type: 'easy',    name: 'Easy Run',  base: 6,    colorKey: 'green',  hrZone: 2 },
      { type: 'easy',    name: 'Easy Run',  base: 7,    colorKey: 'green',  hrZone: 2 },
      { type: 'longRun', name: 'Long Run',  base: 7.5,  colorKey: 'purple', hrZone: 2 },
    ],
  },
  {
    weekNumber: 4,
    title: 'Push the Pace',
    isPeakWeek: false,
    isRecoveryWeek: false,
    isRaceWeek: false,
    runs: [
      { type: 'tempo',     name: 'Tempo 3-2-1',                            base: 9,   colorKey: 'orange', hrZone: 4 },
      { type: 'easy',      name: 'Easy Run',                               base: 8,   colorKey: 'green',  hrZone: 2 },
      { type: 'hillyLong', name: 'Hilly Progressive Repeat Long Run',      base: 14,  colorKey: 'purple', hrZone: 2 },
    ],
  },
  {
    weekNumber: 5,
    title: 'Peak Week',
    isPeakWeek: true,
    isRecoveryWeek: false,
    isRaceWeek: false,
    runs: [
      { type: 'hills',   name: 'Shorter Hill Repeats',  base: 8.8,  colorKey: 'green',  hrZone: 3 },
      { type: 'easy',    name: 'Easy Run',               base: 9,    colorKey: 'green',  hrZone: 2 },
      { type: 'longRun', name: 'Block Long Run',         base: 16,   colorKey: 'purple', hrZone: 2 },
    ],
  },
  {
    weekNumber: 6,
    title: 'Trust the Taper',
    isPeakWeek: false,
    isRecoveryWeek: false,
    isRaceWeek: false,
    runs: [
      { type: 'tempo',     name: 'Rolling 300s',  base: 6.6,  colorKey: 'orange', hrZone: 3 },
      { type: 'easy',      name: 'Easy Run',       base: 8,    colorKey: 'green',  hrZone: 2 },
      { type: 'hillyLong', name: 'Hilly Long Run', base: 10,   colorKey: 'purple', hrZone: 2 },
    ],
  },
  {
    weekNumber: 7,
    title: 'Race Week',
    isPeakWeek: false,
    isRecoveryWeek: false,
    isRaceWeek: true,
    runs: [
      { type: 'taperIntervals', name: 'Race Pace Practice Kms', base: 6.5,  colorKey: 'taper', hrZone: 3, isRaceDay: false },
      { type: 'race',           name: 'Tely 10 — Race Day',     base: 16.1, colorKey: 'race',  hrZone: 4, isRaceDay: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// NEW RUNNER EXACT DISTANCES
// ---------------------------------------------------------------------------

const newRunnerDistances = {
  1: [4, 4, 6],
  2: [5, 5, 7],
  3: [4, 4, 5],
  4: [5, 5, 9],
  5: [6, 6, 11],
  6: [5, 5, 8],
  7: [4, 16.1],
};

// ---------------------------------------------------------------------------
// SCALE DISTANCE
// ---------------------------------------------------------------------------

function scaleDistance(base, level, isRaceDay) {
  if (isRaceDay) return 16.1;
  if (level === 'intermediate') return base;
  if (level === 'beginner') return roundToHalf(base * 0.80);
  if (level === 'advanced') return roundToHalf(base * 1.20);
  return base; // new handled separately
}

// ---------------------------------------------------------------------------
// PACE FOR RUN TYPE
// ---------------------------------------------------------------------------

function paceForType(type, paces, level) {
  // new runners use easy pace for all runs
  if (level === 'new') return { sec: paces.easySec, mmss: paces.easy };
  switch (type) {
    case 'easy':
      return { sec: paces.easySec, mmss: paces.easy };
    case 'longRun':
    case 'hillyLong':
      return { sec: paces.longRunSec, mmss: paces.longRun };
    case 'tempo':
      return { sec: paces.tempoSec, mmss: paces.tempo };
    case 'hills':
      return { sec: paces.hillRepeatSec, mmss: paces.hillRepeat };
    case 'race':
      return { sec: paces.raceSec, mmss: paces.race };
    case 'taperIntervals':
      return { sec: paces.taperIntervalSec, mmss: paces.taperInterval };
    default:
      return { sec: paces.easySec, mmss: paces.easy };
  }
}

// ---------------------------------------------------------------------------
// DESCRIPTION LOOKUP BY RUN NAME/TYPE
// ---------------------------------------------------------------------------

function getDescriptionForRun(type, name, level) {
  if (type === 'race') return getDesc('race', level);
  if (type === 'taperIntervals') return getDesc('taperIntervals', level);
  if (type === 'easy' || type === 'longRun') return getDesc('easy', level);
  if (type === 'hills') return getDesc('hills', level);
  if (type === 'hillyLong') return getDesc('hillyLong', level);
  if (type === 'tempo') {
    // distinguish between Rolling 400s, Rolling 300s, Tempo 3-2-1
    if (name.includes('400')) return getDesc('rolling400s', level);
    if (name.includes('300')) return getDesc('rolling300s', level);
    if (name.includes('3-2-1') || name.includes('Tempo')) return getDesc('tempo321', level);
    return getDesc('rolling400s', level);
  }
  return getDesc('easy', level);
}

// ---------------------------------------------------------------------------
// PROGRESSION NOTES
// ---------------------------------------------------------------------------

function progressionNote(weekNumber, prevKm, currKm, isPeakWeek, isRecoveryWeek, isRaceWeek) {
  if (weekNumber === 1) return 'Week 1 — Build the habit';
  if (isRecoveryWeek) return 'Recovery Week 🔄 — volume intentionally drops';
  if (isPeakWeek) return 'Peak Week 🔥 — your hardest week';
  if (isRaceWeek) return 'Race Week 🏁 — stay fresh';
  if (weekNumber === 6) return 'Taper Begins — trust the process';
  if (prevKm > 0) {
    const pct = Math.round(((currKm - prevKm) / prevKm) * 100);
    const sign = pct >= 0 ? '↑' : '↓';
    return `${sign} ${Math.abs(pct)}% from last week`;
  }
  return '';
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------

export function generatePlan({ inputType, inputSecs, trainingDays, longRunDay, startDate, age }) {
  const daysPerWeek = trainingDays.length;
  const level = detectLevel(inputType, inputSecs);
  const { label: levelLabel, color: levelColor } = levelMeta(level);
  const paces = calcPaces(level, inputType, inputSecs);
  const hrZones = calcHRZones(age);

  const weeks = [];
  let prevTotalKm = 0;

  for (let wi = 0; wi < basePlan.length; wi++) {
    const weekTemplate = basePlan[wi];
    const weekNum = weekTemplate.weekNumber;
    const runs = [];
    let weekTotalKm = 0;

    // Determine distances for this week's main runs
    const mainRunDistances = [];
    if (level === 'new') {
      const nd = newRunnerDistances[weekNum];
      for (let i = 0; i < weekTemplate.runs.length; i++) {
        mainRunDistances.push(nd[i] !== undefined ? nd[i] : weekTemplate.runs[i].base);
      }
    } else {
      for (let i = 0; i < weekTemplate.runs.length; i++) {
        const r = weekTemplate.runs[i];
        mainRunDistances.push(scaleDistance(r.base, level, r.isRaceDay || false));
      }
    }

    // Find the "main easy run" for this week (used to size extra days)
    // It's the run with type 'easy' and index closest to Run 2 position.
    // Per spec: Day 4 uses Run 2 (the second run) if it's easy, else the first easy run found.
    let mainEasyDist = 0;
    {
      // Try index 1 first (Run 2 in the template)
      if (weekTemplate.runs[1] && weekTemplate.runs[1].type === 'easy') {
        mainEasyDist = mainRunDistances[1];
      } else {
        // find first easy run
        for (let i = 0; i < weekTemplate.runs.length; i++) {
          if (weekTemplate.runs[i].type === 'easy') {
            mainEasyDist = mainRunDistances[i];
            break;
          }
        }
      }
    }

    // Build main runs
    for (let i = 0; i < weekTemplate.runs.length; i++) {
      const rt = weekTemplate.runs[i];
      const dist = mainRunDistances[i];
      const isRaceDay = rt.isRaceDay || false;
      const { sec: paceSec, mmss: paceStr } = paceForType(rt.type, paces, level);

      const hrZoneNum = rt.hrZone;
      const hrZoneObj = hrZones[`zone${hrZoneNum}`];

      // Walk-run instructions
      let walkRunInstructions = null;
      if (level === 'new') {
        if (weekNum === 7) {
          walkRunInstructions = isRaceDay
            ? walkRunByWeek[7].race
            : walkRunByWeek[7].run1;
        } else {
          walkRunInstructions = walkRunByWeek[weekNum] || null;
        }
      }

      // Elevation tip
      let elevationTip = null;
      if (rt.type === 'hillyLong') {
        elevationTip = elevationTips[level];
      }

      const description = isRaceDay
        ? getDesc('race', level)
        : getDescriptionForRun(rt.type, rt.name, level);

      weekTotalKm += dist;

      runs.push({
        runNumber: i + 1,
        name: rt.name,
        type: rt.type,
        colorKey: rt.colorKey,
        distance: dist,
        estimatedTime: formatEstimatedTime(dist, paceSec),
        pace: `${paceStr}/km`,
        paceRange: paceRange(paceSec),
        hrZone: hrZoneNum,
        hrBpm: hrBpmStr(hrZoneObj),
        hrFeel: hrFeelByZone(hrZoneNum),
        description,
        walkRunInstructions,
        elevationTip,
        isRaceDay,
      });
    }

    // Extra days — not for week 7
    if (weekNum !== 7) {
      const easyPaceSec = paces.easySec;
      const easyPaceStr = paces.easy;
      const hrZ2 = hrZones.zone2;

      if (daysPerWeek >= 4) {
        const rawDist = mainEasyDist * 0.6;
        const dist = Math.max(3, roundToHalf(rawDist));
        weekTotalKm += dist;

        let walkRunInstructions = null;
        if (level === 'new') {
          walkRunInstructions = walkRunByWeek[weekNum] || null;
        }

        runs.push({
          runNumber: runs.length + 1,
          name: 'Bonus Easy Run',
          type: 'easy',
          colorKey: 'green',
          distance: dist,
          estimatedTime: formatEstimatedTime(dist, easyPaceSec),
          pace: `${easyPaceStr}/km`,
          paceRange: paceRange(easyPaceSec),
          hrZone: 2,
          hrBpm: hrBpmStr(hrZ2),
          hrFeel: hrFeelByZone(2),
          description: descriptions.bonusEasy.all,
          walkRunInstructions,
          elevationTip: null,
          isRaceDay: false,
        });
      }

      if (daysPerWeek === 5) {
        const rawDist = mainEasyDist * 0.5;
        const dist = Math.max(2.5, roundToHalf(rawDist));
        weekTotalKm += dist;

        let walkRunInstructions = null;
        if (level === 'new') {
          walkRunInstructions = walkRunByWeek[weekNum] || null;
        }

        runs.push({
          runNumber: runs.length + 1,
          name: 'Second Easy Run',
          type: 'easy',
          colorKey: 'green',
          distance: dist,
          estimatedTime: formatEstimatedTime(dist, easyPaceSec),
          pace: `${easyPaceStr}/km`,
          paceRange: paceRange(easyPaceSec),
          hrZone: 2,
          hrBpm: hrBpmStr(hrZ2),
          hrFeel: hrFeelByZone(2),
          description: descriptions.secondEasy.all,
          walkRunInstructions,
          elevationTip: null,
          isRaceDay: false,
        });
      }
    }

    const totalKm = Math.round(weekTotalKm * 10) / 10;

    const note = progressionNote(
      weekNum,
      prevTotalKm,
      totalKm,
      weekTemplate.isPeakWeek,
      weekTemplate.isRecoveryWeek,
      weekTemplate.isRaceWeek
    );

    prevTotalKm = totalKm;

    weeks.push({
      weekNumber: weekNum,
      title: weekTemplate.title,
      totalKm,
      progressionNote: note,
      coachTip: coachTips[level][weekNum - 1],
      isPeakWeek: weekTemplate.isPeakWeek,
      isRecoveryWeek: weekTemplate.isRecoveryWeek,
      isRaceWeek: weekTemplate.isRaceWeek,
      runs,
    });
  }

  const totalDistance = Math.round(
    weeks.reduce((sum, w) => sum + w.totalKm, 0) * 10
  ) / 10;

  return {
    level,
    levelLabel,
    levelColor,
    daysPerWeek,
    trainingDays,
    longRunDay,
    startDate,
    age,
    inputType,
    inputSecs,
    paces: {
      easy:          paces.easy,
      tempo:         paces.tempo,
      longRun:       paces.longRun,
      race:          paces.race,
      hillRepeat:    paces.hillRepeat,
      taperInterval: paces.taperInterval,
    },
    hrZones,
    totalDistance,
    weeks,
  };
}
