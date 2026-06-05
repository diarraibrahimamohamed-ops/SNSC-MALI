'use client';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #0f2a1e 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Nav */}
      <nav style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>💉</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>Vaccin-Track</span>
            <span style={{ marginLeft: '8px', color: '#34d399', fontWeight: 800 }}>Mali</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/agent-auth" style={{
            padding: '10px 22px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}>🩺 Espace Agent</a>
          <a href="/login" style={{
            padding: '10px 22px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(37,99,235,0.5)',
            border: 'none',
          }}>🛡️ Administration</a>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#34d399', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '28px' }}>
            🇲🇱 Système National de Suivi Vaccinal
          </span>
          <h1 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: '24px', margin: '0 0 24px 0' }}>
            Protéger chaque enfant,<br />
            <span style={{ background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>partout au Mali.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '48px', maxWidth: '460px' }}>
            Une plateforme intelligente pour le suivi en temps réel de la vaccination, l'analyse prédictive des risques et la gestion des centres de santé.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="/agent-auth" style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '14px',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(16,185,129,0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>🩺 Commencer le suivi</a>
            <a href="/login" style={{
              padding: '16px 32px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '14px',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>🛡️ Espace Admin</a>
          </div>
        </div>

        {/* Right side: stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { icon: '👶', value: '15 000+', label: 'Enfants suivis', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
            { icon: '🏥', value: '247', label: 'Centres actifs', color: '#60a5fa', bg: 'rgba(37,99,235,0.1)' },
            { icon: '💉', value: '98%', label: 'Taux de saisie', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: '🇲🇱', value: '84.2%', label: 'Couverture Nationale', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '28px 24px',
              background: stat.bg,
              border: `1px solid ${stat.color}30`,
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: stat.color, letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 12px 0' }}>
            Pourquoi <span style={{ color: '#34d399' }}>Vaccin-Track</span> ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px', margin: 0 }}>Une solution complète pensée pour les réalités du terrain.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '📊', title: 'Suivi en temps réel', desc: 'Visualisez instantanément la couverture vaccinale par zone et identifiez les enfants à risque.' },
            { icon: '🔔', title: 'Alertes intelligentes', desc: 'Recevez des notifications automatiques pour les rappels de vaccination et les retards détectés.' },
            { icon: '📱', title: 'Accès simplifié', desc: "Interface intuitive accessible aux agents de terrain, même avec une connexion Internet limitée." },
          ].map(f => (
            <div key={f.title} style={{
              padding: '28px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 10px 0' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '28px 48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
        © 2026 Vaccin-Track Mali · Système National de Suivi de la Couverture Vaccinale · "SAVOIR POUR SAUVER"
      </footer>
    </div>
  );
}
