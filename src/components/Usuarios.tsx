import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UsuarioCompleto {
  id: string;
  email: string;
  monedas: number;
  created_at: string;
  perfil_detalles: {
    nombres: string;
    apellidos: string;
    whatsapp: string;
    ciudad: string;
    cedula_identidad: string;
    qr_bancario_url: string;
  } | null;
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UsuarioCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    // Traemos datos de perfiles y perfil_detalles unidos por ID
    const { data, error } = await supabase
      .from('perfiles')
      .select(`
        id, email, monedas, created_at,
        perfil_detalles (
          nombres, apellidos, whatsapp, ciudad, cedula_identidad, qr_bancario_url
        )
      `);

    if (error) {
      console.error("Error cargando usuarios:", error);
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  const handleBloquear = async () => {
    if (!selectedUser) return;
    
    const confirmar = confirm(`¿Estás seguro de bloquear a ${selectedUser.perfil_detalles?.nombres}?`);
    if (!confirmar) return;

    // 1. Insertamos en tu tabla de auditoria_log según tu esquema
    const { error: logError } = await supabase.from('auditoria_log').insert({
      accion: 'BLOQUEO_USUARIO',
      tabla_afectada: 'perfiles',
      registro_id: selectedUser.id,
      detalle_cambio: { motivo: 'Bloqueo administrativo', fecha: new Date().toISOString() }
    });

    if (logError) alert("Error en auditoría: " + logError.message);
    else alert("Usuario bloqueado (Registrado en Auditoría)");
  };

  const filteredUsers = usuarios.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.perfil_detalles?.nombres?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      {/* COLUMNA IZQUIERDA: BUSCADOR Y LISTA */}
      <div style={listSide}>
        <div style={searchBox}>
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            style={inputSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={scrollArea}>
          {loading ? (
            <div style={{ padding: '20px', color: '#666' }}>Cargando usuarios...</div>
          ) : (
            filteredUsers.map(u => (
              <div 
                key={u.id} 
                onClick={() => setSelectedUser(u)}
                style={userItem(selectedUser?.id === u.id)}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {u.perfil_detalles?.nombres || 'Sin nombre'} {u.perfil_detalles?.apellidos || ''}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>{u.email}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: MAESTRO DETALLE */}
      <div style={detailSide}>
        {selectedUser ? (
          <div style={profileContainer}>
            <div style={headerDetail}>
              <h2 style={{ margin: 0, color: '#eab308' }}>Detalles del Perfil</h2>
              <span style={idBadge}>ID: {selectedUser.id.slice(0, 8)}...</span>
            </div>

            <div style={gridInfo}>
              <div style={infoCard}>
                <label style={labelStyle}>DATOS PERSONALES</label>
                <p><strong>CI:</strong> {selectedUser.perfil_detalles?.cedula_identidad || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> {selectedUser.perfil_detalles?.whatsapp || 'N/A'}</p>
                <p><strong>Ciudad:</strong> {selectedUser.perfil_detalles?.ciudad || 'N/A'}</p>
              </div>

              <div style={infoCard}>
                <label style={labelStyle}>ESTADO FINANCIERO</label>
                <p style={{ fontSize: '20px' }}><strong>Monedas:</strong> 🪙 {selectedUser.monedas}</p>
                <p><strong>Registro:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedUser.perfil_detalles?.qr_bancario_url && (
              <div style={{ marginTop: '20px' }}>
                <label style={labelStyle}>QR BANCARIO</label>
                <img src={selectedUser.perfil_detalles.qr_bancario_url} alt="QR" style={{ width: '100px', display: 'block', marginTop: '10px', borderRadius: '5px' }} />
              </div>
            )}

            <div style={actionArea}>
              <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Acciones de Administrador</h4>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button style={btnReset}>🔑 Reset Password</button>
                <button style={btnMsg}>✉️ Enviar Mensaje</button>
                <button onClick={handleBloquear} style={btnBlock}>🚫 Bloquear Acceso</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={emptyState}>Selecciona un usuario para ver su información detallada</div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS ---
const containerStyle: React.CSSProperties = { display: 'flex', height: 'calc(100vh - 180px)', gap: '20px', color: 'white' };
const listSide: React.CSSProperties = { width: '320px', background: '#111', borderRadius: '10px', border: '1px solid #222', display: 'flex', flexDirection: 'column' };
const detailSide: React.CSSProperties = { flex: 1, background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '30px', overflowY: 'auto' };
const searchBox: React.CSSProperties = { padding: '15px', borderBottom: '1px solid #222' };
const inputSearch: React.CSSProperties = { width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '5px' };
const scrollArea: React.CSSProperties = { flex: 1, overflowY: 'auto' };
const userItem = (active: boolean): React.CSSProperties => ({
  padding: '15px', borderBottom: '1px solid #222', cursor: 'pointer',
  background: active ? '#eab30822' : 'transparent', borderLeft: active ? '4px solid #eab308' : '4px solid transparent'
});
const profileContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const headerDetail: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const idBadge: React.CSSProperties = { fontSize: '10px', color: '#555', background: '#000', padding: '4px 8px', borderRadius: '4px' };
const gridInfo: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const infoCard: React.CSSProperties = { background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #222' };
const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#eab308', fontWeight: 'bold', marginBottom: '10px', display: 'block' };
const actionArea: React.CSSProperties = { marginTop: '20px', background: '#0a0a0a', padding: '20px', borderRadius: '8px' };
const emptyState: React.CSSProperties = { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#444' };

const btnReset = { padding: '10px 15px', background: 'transparent', border: '1px solid #2196F3', color: '#2196F3', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as 'bold' };
const btnMsg = { padding: '10px 15px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as 'bold' };
const btnBlock = { padding: '10px 15px', background: '#ff4444', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as 'bold' };

export default Usuarios;