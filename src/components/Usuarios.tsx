import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UsuarioSimple {
  id: string;
  email: string;
  monedas: number;
  created_at: string;
  last_seen?: string; // Simularemos esto con la última actividad
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioSimple[]>([]);
  const [selectedUser, setSelectedUser] = useState<UsuarioSimple | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      // Nota: Si tienes una columna 'updated_at' o 'last_seen' en perfiles, úsala.
      // Por ahora usaremos 'created_at' como fallback si no tienes otra.
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, email, monedas, created_at');
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar si está online (Simulación: activo en los últimos 5 min)
  // En un sistema real, compararías con una columna 'last_seen' de tu DB
  const isOnline = (lastSeen?: string) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastSeenDate) / (1000 * 60);
    return diffMinutes < 5; 
  };

  const filteredUsers = usuarios.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={containerStyle}>
      {/* LISTA DE USUARIOS */}
      <div style={listSide}>
        <div style={searchBox}>
          <input type="text" placeholder="Buscar..." style={inputSearch} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={scrollArea}>
          {loading ? <p style={{padding:'20px'}}>Cargando...</p> : 
            filteredUsers.map(u => (
              <div key={u.id} onClick={() => setSelectedUser(u)} style={userItem(selectedUser?.id === u.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Punto de estado */}
                  <div style={statusDot(isOnline(u.created_at))} title={isOnline(u.created_at) ? "En línea" : "Desconectado"} />
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{u.email.split('@')[0]}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginLeft: '18px' }}>{u.email}</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* PANEL DE DETALLE */}
      <div style={detailSide}>
        {selectedUser ? (
          <div style={profileContainer}>
            <div style={headerDetail}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={statusDotLarge(isOnline(selectedUser.created_at))} />
                <h2 style={{ margin: 0 }}>{selectedUser.email}</h2>
              </div>
              <span style={statusBadge(isOnline(selectedUser.created_at))}>
                {isOnline(selectedUser.created_at) ? 'ACTIVO AHORA' : 'DESCONECTADO'}
              </span>
            </div>

            <div style={gridInfo}>
              <div style={infoCard}>
                <label style={labelStyle}>ESTADO DE SESIÓN</label>
                <p><strong>Última actividad:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                <p><strong>ID de Sistema:</strong> <code style={{color: '#888'}}>{selectedUser.id.slice(0,12)}...</code></p>
              </div>
              
              <div style={infoCard}>
                <label style={labelStyle}>CARTERA</label>
                <p style={{fontSize: '24px', margin: '10px 0'}}>🪙 {selectedUser.monedas}</p>
                <button style={btnAction}>Gestionar Monedas</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={emptyState}>Selecciona un usuario para ver su actividad</div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS DINÁMICOS Y NUEVOS ---

const statusDot = (online: boolean): React.CSSProperties => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: online ? '#4ade80' : '#444',
  boxShadow: online ? '0 0 8px #4ade80' : 'none',
  flexShrink: 0
});

const statusDotLarge = (online: boolean): React.CSSProperties => ({
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  background: online ? '#4ade80' : '#ff4444',
  boxShadow: online ? '0 0 12px #4ade80' : 'none',
  animation: online ? 'pulse 2s infinite' : 'none'
});

const statusBadge = (online: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: 'bold',
  background: online ? '#4ade8022' : '#333',
  color: online ? '#4ade80' : '#888',
  border: `1px solid ${online ? '#4ade80' : '#444'}`
});

const btnAction = {
  background: '#222',
  color: '#eab308',
  border: '1px solid #eab308',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

// ... (se mantienen los estilos base: containerStyle, listSide, detailSide, etc.)
const containerStyle: React.CSSProperties = { display: 'flex', height: '80vh', gap: '20px', color: 'white' };
const listSide: React.CSSProperties = { width: '300px', background: '#111', borderRadius: '10px', border: '1px solid #333', display: 'flex', flexDirection: 'column' };
const detailSide: React.CSSProperties = { flex: 1, background: '#111', borderRadius: '10px', border: '1px solid #333', padding: '25px' };
const searchBox: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #333' };
const inputSearch: React.CSSProperties = { width: '100%', padding: '8px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '4px' };
const scrollArea: React.CSSProperties = { flex: 1, overflowY: 'auto' };
const userItem = (active: boolean): React.CSSProperties => ({
  padding: '12px', borderBottom: '1px solid #222', cursor: 'pointer',
  background: active ? '#eab30822' : 'transparent', borderLeft: active ? '4px solid #eab308' : '4px solid transparent'
});
const profileContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const headerDetail: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const idBadge: React.CSSProperties = { fontSize: '10px', color: '#888', background: '#000', padding: '4px 8px', borderRadius: '4px' };
const gridInfo: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const infoCard: React.CSSProperties = { background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #222' };
const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#eab308', fontWeight: 'bold', marginBottom: '10px', display: 'block' };
const emptyState: React.CSSProperties = { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#555' };

export default Usuarios;