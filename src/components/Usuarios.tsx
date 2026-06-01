import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';

// URL de un sonido de notificación (puedes cambiarla por uno local en /public)
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

// 💡 INTERFAZ NUEVA: Datos personales del Left Join
interface PerfilDetalles {
  cedula_identidad: string;
  nombres: string;
  apellidos: string;
  whatsapp: string | null;
  ciudad: string | null;
  fecha_nacimiento: string | null;
}

interface UsuarioSimple {
  id: string;
  email: string;
  monedas: number;
  created_at: string;
  perfil_detalles?: PerfilDetalles | PerfilDetalles[] | null; // 💡 Relación añadida
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
        async (payload) => {
          const nuevoUsuarioBase = payload.new as UsuarioSimple;
          
          // 💡 Para mantener la consistencia del Left Join en tiempo real,
          // hacemos un fetch rápido de los detalles del nuevo usuario insertado
          const { data: extData } = await supabase
            .from('perfiles')
            .select('perfil_detalles(cedula_identidad, nombres, apellidos, whatsapp, ciudad, fecha_nacimiento)')
            .eq('id', nuevoUsuarioBase.id)
            .single();

          const nuevoUsuarioCompleto = {
            ...nuevoUsuarioBase,
            perfil_detalles: extData?.perfil_detalles || null
          };
          
          // 1. Agregar a la lista
          setUsuarios((prev) => [nuevoUsuarioCompleto, ...prev]);
          
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
      // 💡 ADAPTACIÓN LEFT JOIN: Se añade el sub-query hacia perfil_detalles
      const { data, error } = await supabase
        .from('perfiles')
        .select(`
          id, 
          email, 
          monedas, 
          created_at,
          perfil_detalles (
            cedula_identidad,
            nombres,
            apellidos,
            whatsapp,
            ciudad,
            fecha_nacimiento
          )
        `)
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

  // 💡 Extractor seguro para normalizar el objeto relacional (Maneja {} o [{}])
  const obtenerDetallesSeguros = (usuario: UsuarioSimple): PerfilDetalles | null => {
    if (!usuario.perfil_detalles) return null;
    if (Array.isArray(usuario.perfil_detalles)) {
      return usuario.perfil_detalles.length > 0 ? usuario.perfil_detalles[0] : null;
    }
    return usuario.perfil_detalles;
  };

  // --- 💡 NUEVAS FUNCIONALIDADES DE BOTONES ---

  const verPerfilDetallesModal = () => {
    if (!selectedUser) return;
    const d = obtenerDetallesSeguros(selectedUser);

    if (!d) {
      Swal.fire({
        icon: 'info',
        title: 'Perfil Incompleto',
        text: 'Este usuario no cuenta con registros guardados en perfil_detalles.',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    Swal.fire({
      title: '📋 IDENTIDAD COLECCIONISTA',
      background: '#111',
      color: '#fff',
      confirmButtonColor: '#eab308',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.8; padding: 5px;">
          <p><strong style="color: #eab308;">Nombre Completo:</strong> ${d.nombres || ''} ${d.apellidos || ''}</p>
          <p><strong style="color: #eab308;">Cédula de Identidad:</strong> ${d.cedula_identidad || 'No registrada'}</p>
          <p><strong style="color: #eab308;">Ciudad:</strong> ${d.ciudad || 'No registrada'}</p>
          <p><strong style="color: #eab308;">WhatsApp de Registro:</strong> ${d.whatsapp || 'No registrado'}</p>
          <p><strong style="color: #eab308;">F. Nacimiento:</strong> ${d.fecha_nacimiento || 'No registrada'}</p>
        </div>
      `
    });
  };

  const contactarWhatsApp = async () => {
    if (!selectedUser) return;
    const d = obtenerDetallesSeguros(selectedUser);
    let telefonoInicial = d?.whatsapp || '';

    const { value: telefono } = await Swal.fire({
      title: 'Enviar Mensaje WhatsApp',
      text: `Ingresa o confirma el número de WhatsApp con código de país para ${selectedUser.email}:`,
      input: 'text',
      inputValue: telefonoInicial,
      inputPlaceholder: 'Ej: 5917XXXXXX',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#333',
      background: '#111',
      color: '#fff',
      inputValidator: (value) => {
        if (!value) return '¡Debes introducir un número!';
        if (/[^0-9]/g.test(value)) return 'Solo se permiten caracteres numéricos';
      }
    });

    if (telefono) {
      const msg = encodeURIComponent("¡Hola de parte del equipo de Boogol 2026! ⚽ Te contactamos para revisar novedades de tu cuenta en el álbum.");
      window.open(`https://wa.me/${telefono}?text=${msg}`, '_blank');
    }
  };

  const enviarCorreoElectronico = () => {
    if (!selectedUser) return;
    const asunto = encodeURIComponent("Soporte Técnico Oficial - Álbum Boogol 2026");
    const cuerpo = encodeURIComponent(`Hola,\n\nTe contactamos desde el área de administración de Boogol 2026 en relación a tu cuenta de coleccionista.`);
    window.location.href = `mailto:${selectedUser.email}?subject=${asunto}&body=${cuerpo}`;
  };

  const restablecerPasswordUsuario = async () => {
    if (!selectedUser) return;

    const confirmacion = await Swal.fire({
      title: '¿Restablecer Contraseña?',
      text: `Se enviará de forma automática un correo electrónico a ${selectedUser.email} con el enlace de recuperación seguro de Supabase.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#333',
      background: '#111',
      color: '#fff',
      confirmButtonText: 'Sí, enviar enlace',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      // Llamada al método nativo de autenticación de Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
        redirectTo: `${window.location.origin}/reset-password`, // Ruta destino configurada en tu Dashboard de Supabase
      });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Enlace Enviado',
        text: 'El correo de recuperación ha sido despachado.',
        background: '#111',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de Auth',
        text: err.message || 'No se pudo procesar la solicitud de reajuste.',
        background: '#111',
        color: '#fff'
      });
    }
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
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{u.email ? u.email.split('@')[0] : 'Anonimo'}</span>
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

              {/* 💡 BLOQUE NUEVO INTEGRADO: PANEL DE ACCIONES AVANZADAS DE PERFIL DETALLES */}
              <div style={{ ...infoCard, width: '100%' }}>
                <label style={labelStyle}>💥 OPERACIONES DE IDENTIDAD Y SEGURIDAD (PERFIL DETALLES)</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button onClick={verPerfilDetallesModal} style={{ ...btnAction, background: '#1e3a8a', color: '#60a5fa', borderColor: '#3b82f6', fontWeight: 'bold', padding: '8px 14px' }}>
                    👁️ Ver Perfil Detalles
                  </button>
                  <button onClick={contactarWhatsApp} style={{ ...btnAction, background: '#064e3b', color: '#34d399', borderColor: '#059669', fontWeight: 'bold', padding: '8px 14px' }}>
                    💬 Enviar WhatsApp
                  </button>
                  <button onClick={enviarCorreoElectronico} style={{ ...btnAction, background: '#7c2d12', color: '#fb923c', borderColor: '#ea580c', fontWeight: 'bold', padding: '8px 14px' }}>
                    ✉️ Enviar Correo
                  </button>
                  <button onClick={restablecerPasswordUsuario} style={{ ...btnAction, background: '#451a03', color: '#fbbf24', borderColor: '#d97706', fontWeight: 'bold', padding: '8px 14px' }}>
                    🔑 Resetear Password
                  </button>
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

// --- ESTILOS NATIVOS MANTENIDOS INTACTOS ---

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
  fontWeight: 'bold',
  fontFamily: 'monospace'
};

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
const headerDetail: React.CSSProperties = { display: 'flex', justifyBetween: 'space-between', alignItems: 'center' };
const gridInfo: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const infoCard: React.CSSProperties = { background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #222' };
const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#eab308', fontWeight: 'bold', marginBottom: '10px', display: 'block' };
const btnAction = { background: '#222', color: '#eab308', border: '1px solid #eab308', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' };
const emptyState: React.CSSProperties = { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#555' };

export default Usuarios;