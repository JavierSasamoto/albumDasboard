import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// URL de un sonido de notificación (puedes cambiarla por uno local en /public)
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

interface UsuarioSimple {
  id: string;
  email: string;
  monedas: number;
  created_at: string;
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioSimple[]>([]);
  const [selectedUser, setSelectedUser] = useState<UsuarioSimple | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref para el audio para evitar recrearlo en cada render
  const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

  useEffect(() => {
    fetchUsuarios();

    // --- SUSCRIPCIÓN EN TIEMPO REAL ---
    const channel = supabase
      .channel('cambios-perfiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'perfiles' },
        (payload) => {
          const nuevoUsuario = payload.new as UsuarioSimple;
          
          // 1. Agregar a la lista
          setUsuarios((prev) => [nuevoUsuario, ...prev]);
          
          // 2. Reproducir sonido
          audioRef.current.play().catch(err => console.log("El navegador bloqueó el audio inicial:", err));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, email, monedas, created_at')
        .order('created_at', { ascending: false }); // Ver los más nuevos primero
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isOnline = (createdAt?: string) => {
    if (!createdAt) return false;
    const lastSeenDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastSeenDate) / (1000 * 60);
    return diffMinutes < 5; 
  };

  const filteredUsers = usuarios.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* HEADER CON CONTADOR */}
      <div style={statsHeader}>
        <div style={statCard}>
          <span style={statLabel}>USUARIOS REGISTRADOS</span>
          <span style={statValue}>{usuarios.length}</span>
        </div>
        <div style={statCard}>
          <span style={statLabel}>RESULTADOS FILTRADOS</span>
          <span style={statValue}>{filteredUsers.length}</span>
        </div>
      </div>

      <div style={containerStyle}>
        {/* LISTA DE USUARIOS */}
        <div style={listSide}>
          <div style={searchBox}>
            <input 
              type="text" 
              placeholder="Buscar por email..." 
              style={inputSearch} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div style={scrollArea}>
            {loading ? <p style={{padding:'20px'}}>Cargando jugadores...</p> : 
              filteredUsers.map(u => (
                <div key={u.id} onClick={() => setSelectedUser(u)} style={userItem(selectedUser?.id === u.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={statusDot(isOnline(u.created_at))} />
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
                  <p><strong>Registro:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                  <p><strong>ID:</strong> <code style={{color: '#888'}}>{selectedUser.id}</code></p>
                </div>
                
                <div style={infoCard}>
                  <label style={labelStyle}>CARTERA BOOGOL</label>
                  <p style={{fontSize: '24px', margin: '10px 0'}}>🪙 {selectedUser.monedas}</p>
                  <button style={btnAction}>Ajustar Monedas</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={emptyState}>Selecciona un usuario del panel izquierdo</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- NUEVOS ESTILOS PARA EL CONTADOR ---

const statsHeader: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  marginBottom: '10px'
};

const statCard: React.CSSProperties = {
  background: '#111',
  padding: '15px 25px',
  borderRadius: '10px',
  border: '1px solid #333',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '200px'
};

const statLabel: React.CSSProperties = {
  fontSize: '10px',
  color: '#888',
  letterSpacing: '1px',
  fontWeight: 'bold'
};

const statValue: React.CSSProperties = {
  fontSize: '28px',
  color: '#eab308',
  fontWeight: 'black',
  fontFamily: 'monospace'
};

// Reutilizamos los estilos anteriores (statusDot, containerStyle, etc.)
// ... (Aquí irían el resto de tus constantes de estilo del mensaje anterior)

const containerStyle: React.CSSProperties = { display: 'flex', height: '70vh', gap: '20px', color: 'white' };
const listSide: React.CSSProperties = { width: '300px', background: '#111', borderRadius: '10px', border: '1px solid #333', display: 'flex', flexDirection: 'column' };
const detailSide: React.CSSProperties = { flex: 1, background: '#111', borderRadius: '10px', border: '1px solid #333', padding: '25px' };
const searchBox: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #333' };
const inputSearch: React.CSSProperties = { width: '100%', padding: '8px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '4px' };
const scrollArea: React.CSSProperties = { flex: 1, overflowY: 'auto' };
const userItem = (active: boolean): React.CSSProperties => ({
  padding: '12px', borderBottom: '1px solid #222', cursor: 'pointer',
  background: active ? '#eab30822' : 'transparent', borderLeft: active ? '4px solid #eab308' : '4px solid transparent'
});
const statusDot = (online: boolean): React.CSSProperties => ({
    width: '10px', height: '10px', borderRadius: '50%', background: online ? '#4ade80' : '#444'
});
const statusDotLarge = (online: boolean): React.CSSProperties => ({
    width: '14px', height: '14px', borderRadius: '50%', background: online ? '#4ade80' : '#ff4444'
});
const statusBadge = (online: boolean): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', background: online ? '#4ade8022' : '#333', color: online ? '#4ade80' : '#888'
});
const profileContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const headerDetail: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const gridInfo: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const infoCard: React.CSSProperties = { background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #222' };
const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#eab308', fontWeight: 'bold', marginBottom: '10px', display: 'block' };
const btnAction = { background: '#222', color: '#eab308', border: '1px solid #eab308', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };
const emptyState: React.CSSProperties = { display: 'flex', height: '100%', alignItems: 'center', justifyComtent: 'center', color: '#555' };

export default Usuarios;