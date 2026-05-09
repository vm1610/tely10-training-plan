const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '#'

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: 16,
    padding: '40px 32px',
    maxWidth: 440,
    width: '100%',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-block',
    background: '#1a1a2e',
    color: '#7c6af7',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: 20,
    marginBottom: 20,
  },
  heading: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 36,
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.15,
    marginBottom: 12,
  },
  sub: {
    color: '#888',
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 28,
  },
  divider: {
    borderTop: '1px solid #2a2a3a',
    margin: '24px 0',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px 0',
    textAlign: 'left',
  },
  featureItem: {
    color: '#ccc',
    fontSize: 14,
    padding: '6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  check: {
    color: '#00d4aa',
    fontWeight: 700,
    flexShrink: 0,
  },
  price: {
    fontSize: 48,
    fontWeight: 800,
    color: '#ffffff',
    fontFamily: "'Barlow Condensed', sans-serif",
    marginBottom: 4,
  },
  priceNote: {
    color: '#555',
    fontSize: 13,
    marginBottom: 24,
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #7c6af7, #5b4ee0)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    textDecoration: 'none',
    marginBottom: 12,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: 13,
    cursor: 'pointer',
    padding: '8px',
    width: '100%',
  },
  stripe: {
    color: '#444',
    fontSize: 12,
    marginTop: 16,
  },
}

export default function PaywallPage({ onBack }) {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.badge}>Free spots filled</div>
        <h1 style={S.heading}>Your 7-Week<br />Tely 10 Plan</h1>
        <p style={S.sub}>
          All the free spots are gone. Get your personalized plan for a one-time $4 — less than a coffee.
        </p>

        <div style={S.divider} />

        <ul style={S.featureList}>
          {[
            'Personalized to your exact pace',
            'Adapts to your schedule (3–5 days/week)',
            'All 7 weeks with full workout details',
            'HR zones, coach tips, walk/run guidance',
            'One-tap export to Google Calendar / Apple Calendar / Outlook',
          ].map(f => (
            <li key={f} style={S.featureItem}>
              <span style={S.check}>✓</span> {f}
            </li>
          ))}
        </ul>

        <div style={S.divider} />

        <div style={S.price}>$4</div>
        <div style={S.priceNote}>One-time · Instant access · No account needed</div>

        <a href={STRIPE_LINK} style={S.btn}>
          Get my training plan →
        </a>

        <button style={S.backBtn} onClick={onBack}>
          ← Go back
        </button>

        <p style={S.stripe}>Secure payment by Stripe</p>
      </div>
    </div>
  )
}
