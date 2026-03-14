import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Cromos from './components/Cromos';
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios'; // Importación corregida

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
  };

  if (!session) {
    return (
      <div style={loginWrapper}>
        <form onSubmit={handleLogin} style={loginCard}>
          <h1 style={{ color: '#eab308', marginBottom: '20px' }}>PANEL ADMIN</h1>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={inputS} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={inputS} />
          <button type="submit" style={loginBtn}>ENTRAR</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={{ padding: '20px', borderBottom: '1px solid #222' }}>
          <h2 style={{ color: '#eab308', margin: 0, fontSize: '18px' }}>ALBUM PRO</h2>
          <small style={{ color: '#666' }}>Administración</small>
        </div>

        <nav style={{ flex: 1, padding: '20px 10px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={navBtn(activeTab === 'dashboard')}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('usuarios')} style={navBtn(activeTab === 'usuarios')}>👥 Usuarios</button>
          <button onClick={() => setActiveTab('cromos')} style={navBtn(activeTab === 'cromos')}>🖼️ Gestión de Cromos</button>
          <button onClick={() => setActiveTab('paquetes')} style={navBtn(activeTab === 'paquetes')}>📦 Abrir Paquetes</button>
          <button onClick={() => setActiveTab('stats')} style={navBtn(activeTab === 'stats')}>📈 Estadísticas</button>
          <button onClick={() => setActiveTab('config')} style={navBtn(activeTab === 'config')}>⚙️ Configuración</button>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>{session.user.email}</div>
          <button onClick={() => supabase.auth.signOut()} style={logoutBtn}>Cerrar Sesión</button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'capitalize' }}>
            {activeTab.replace('_', ' ')}
          </h1>
        </header>

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'usuarios' && <Usuarios />}
        {activeTab === 'cromos' && <Cromos />}
        
        {['paquetes', 'stats', 'config'].includes(activeTab) && (
          <div style={placeholderStyle}>Sección de {activeTab} en desarrollo...</div>
        )}
      </main>
    </div>
  );
}

// Estilos App (CSS-in-JS)
const sidebarStyle: React.CSSProperties = { width: '250px', background: '#111', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' };
const navBtn = (active: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 15px', textAlign: 'left', background: active ? '#eab308' : 'transparent',
  color: active ? '#000' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '5px',
  fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
});
const logoutBtn: React.CSSProperties = { width: '100%', padding: '8px', background: '#311', color: '#f44', border: '1px solid #522', borderRadius: '4px', cursor: 'pointer' };
const loginWrapper: React.CSSProperties = { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#000' };
const loginCard: React.CSSProperties = { background: '#111', padding: '40px', borderRadius: '12px', width: '320px', textAlign: 'center', border: '1px solid #222' };
const inputS: React.CSSProperties = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', background: '#000', border: '1px solid #333', color: 'white' };
const loginBtn: React.CSSProperties = { width: '100%', padding: '12px', background: '#eab308', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const placeholderStyle: React.CSSProperties = { padding: '40px', border: '2px dashed #333', borderRadius: '12px', textAlign: 'center', color: '#666' };