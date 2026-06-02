import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const GREEN = '#16a34a'
const DARK = '#18181b'

const s = {
  page: { minHeight:'100vh', fontFamily:"'Segoe UI', system-ui, sans-serif", background:'#f8fafc' },
  card: { background:'#fff', borderRadius:'16px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', padding:'40px', maxWidth:'420px', margin:'0 auto' },
  logo: { fontSize:'32px', fontWeight:'800', letterSpacing:'-1px' },
  dot: { color: GREEN },
  label: { fontSize:'13px', fontWeight:'600', color:'#52525b', marginBottom:'6px', display:'block' },
  input: { width:'100%', padding:'12px 14px', fontSize:'15px', border:'1.5px solid #e4e4e7', borderRadius:'10px', outline:'none', boxSizing:'border-box', background:'#fff', color:'#18181b', marginBottom:'16px', transition:'border .2s' },
  btnGreen: { width:'100%', padding:'14px', background: GREEN, color:'#fff', fontSize:'16px', fontWeight:'700', border:'none', borderRadius:'12px', cursor:'pointer', letterSpacing:'0.3px' },
  btnGhost: { width:'100%', padding:'12px', background:'transparent', color: GREEN, fontSize:'15px', fontWeight:'600', border:`1.5px solid ${GREEN}`, borderRadius:'12px', cursor:'pointer', marginTop:'10px' },
  tag: (status) => ({ display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', background: status==='oczekujaca' ? '#fef9c3' : '#dcfce7', color: status==='oczekujaca' ? '#854d0e' : '#15803d' }),
  vizCard: { background:'#fff', border:'1px solid #f0f0f0', borderRadius:'12px', padding:'18px 20px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
}

export default function App() {
  const [sesja, setSesja] = useState(null)
  const [email, setEmail] = useState('')
  const [haslo, setHaslo] = useState('')
  const [wizyty, setWizyty] = useState([])
  const [widok, setWidok] = useState('logowanie')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesja(session)
      if (session) { setWidok('panel'); pobierzWizyty() }
    })
  }, [])

  const pobierzWizyty = async () => {
    const { data } = await supabase.from('wizyty').select('*').order('data_czas', { ascending: true })
    setWizyty(data || [])
  }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: haslo })
    setLoading(false)
    if (error) alert('Błąd logowania: ' + error.message)
    else { setWidok('panel'); pobierzWizyty() }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut(); setSesja(null); setWidok('logowanie')
  }

  if (widok === 'rezerwacja') return <Rezerwacja onPowrot={() => setWidok('logowanie')} />

  if (widok === 'logowanie') return (
    <div style={{...s.page, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div style={s.card}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <div style={s.logo}>wizyta<span style={s.dot}>.</span>app</div>
          <div style={{color:'#71717a', marginTop:'6px', fontSize:'14px'}}>System rezerwacji dla salonów</div>
        </div>
        <form onSubmit={handleLogin}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="elwira@salon.pl" value={email} onChange={e=>setEmail(e.target.value)} required />
          <label style={s.label}>Hasło</label>
          <input style={s.input} type="password" placeholder="••••••••" value={haslo} onChange={e=>setHaslo(e.target.value)} required />
          <button type="submit" style={s.btnGreen} disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się →'}
          </button>
        </form>
        <hr style={{margin:'28px 0', border:'none', borderTop:'1px solid #f0f0f0'}}/>
        <p style={{textAlign:'center', color:'#a1a1aa', fontSize:'13px', marginBottom:'12px'}}>Chcesz zarezerwować wizytę?</p>
        <button style={s.btnGhost} onClick={() => setWidok('rezerwacja')}>📅 Zarezerwuj wizytę</button>
      </div>
    </div>
  )

  return (
    <div style={{...s.page, padding:'0'}}>
      {/* Navbar */}
      <div style={{background:'#fff', borderBottom:'1px solid #f0f0f0', padding:'0 32px', display:'flex', justifyContent:'space-between', alignItems:'center', height:'60px'}}>
        <div style={{...s.logo, fontSize:'22px'}}>wizyta<span style={s.dot}>.</span>app</div>
        <button onClick={handleLogout} style={{background:'none', border:'1px solid #e4e4e7', color:'#52525b', padding:'7px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px'}}>
          Wyloguj
        </button>
      </div>

      <div style={{maxWidth:'720px', margin:'0 auto', padding:'40px 20px'}}>
        {/* Statystyki */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'32px'}}>
          {[
            { label:'Wszystkie', value: wizyty.length, icon:'📋' },
            { label:'Oczekujące', value: wizyty.filter(w=>w.status==='oczekujaca').length, icon:'⏳' },
            { label:'Potwierdzone', value: wizyty.filter(w=>w.status==='potwierdzona').length, icon:'✅' },
          ].map(stat => (
            <div key={stat.label} style={{background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center'}}>
              <div style={{fontSize:'28px', marginBottom:'4px'}}>{stat.icon}</div>
              <div style={{fontSize:'28px', fontWeight:'800', color: DARK}}>{stat.value}</div>
              <div style={{fontSize:'13px', color:'#a1a1aa'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{fontSize:'18px', fontWeight:'700', color: DARK, marginBottom:'16px'}}>
          Nadchodzące rezerwacje
        </h2>

        {wizyty.length === 0 && (
          <div style={{textAlign:'center', padding:'60px 0', color:'#a1a1aa'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>📭</div>
            <div>Brak rezerwacji</div>
          </div>
        )}

        {wizyty.map(w => (
          <div key={w.id} style={s.vizCard}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <div style={{fontWeight:'700', fontSize:'16px', color: DARK, marginBottom:'4px'}}>
                  👤 {w.klient_imie}
                </div>
                <div style={{color:'#52525b', fontSize:'14px', marginBottom:'4px'}}>📞 {w.klient_telefon}</div>
                <div style={{color:'#52525b', fontSize:'14px'}}>
                  📅 {new Date(w.data_czas).toLocaleString('pl-PL', {weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
              <span style={s.tag(w.status)}>{w.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Rezerwacja({ onPowrot }) {
  const [imie, setImie] = useState('')
  const [telefon, setTelefon] = useState('')
  const [data, setData] = useState('')
  const [godzina, setGodzina] = useState('')
  const [wyslano, setWyslano] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRezerwacja = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('wizyty').insert({
      klient_imie: imie, klient_telefon: telefon,
      data_czas: `${data}T${godzina}:00`,
    })
    setLoading(false)
    if (!error) setWyslano(true)
    else alert('Błąd: ' + error.message)
  }

  if (wyslano) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:'system-ui'}}>
      <div style={{textAlign:'center', padding:'40px'}}>
        <div style={{fontSize:'72px', marginBottom:'16px'}}>✅</div>
        <h2 style={{fontSize:'24px', fontWeight:'800', color:'#18181b', marginBottom:'8px'}}>Rezerwacja przyjęta!</h2>
        <p style={{color:'#71717a', marginBottom:'32px'}}>Zadzwonimy wkrótce, aby potwierdzić wizytę.</p>
        <button onClick={onPowrot} style={{...s.btnGhost, width:'auto', padding:'12px 28px'}}>← Powrót</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'20px', fontFamily:'system-ui'}}>
      <div style={s.card}>
        <button onClick={onPowrot} style={{background:'none', border:'none', color: GREEN, cursor:'pointer', fontSize:'14px', fontWeight:'600', marginBottom:'24px', padding:'0'}}>← Powrót</button>
        <div style={{textAlign:'center', marginBottom:'28px'}}>
          <div style={s.logo}>wizyta<span style={s.dot}>.</span>app</div>
          <div style={{color:'#71717a', marginTop:'6px', fontSize:'14px'}}>Zarezerwuj swoją wizytę</div>
        </div>
        <form onSubmit={handleRezerwacja}>
          <label style={s.label}>Imię i nazwisko</label>
          <input style={s.input} placeholder="Anna Kowalska" value={imie} onChange={e=>setImie(e.target.value)} required />
          <label style={s.label}>Numer telefonu</label>
          <input style={s.input} placeholder="600 123 456" value={telefon} onChange={e=>setTelefon(e.target.value)} required />
          <label style={s.label}>Data wizyty</label>
          <input style={s.input} type="date" value={data} onChange={e=>setData(e.target.value)} required />
          <label style={s.label}>Godzina</label>
          <input style={s.input} type="time" value={godzina} onChange={e=>setGodzina(e.target.value)} required />
          <button type="submit" style={s.btnGreen} disabled={loading}>
            {loading ? 'Wysyłanie...' : '📅 Zarezerwuj wizytę'}
          </button>
        </form>
      </div>
    </div>
  )
}
