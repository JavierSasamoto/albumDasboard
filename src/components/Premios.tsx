import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';

interface PerfilDetalles {
  cedula_identidad: string;
  nombres: string;
  apellidos: string;
  whatsapp: string | null;
  ciudad: string | null;
  fecha_nacimiento: string | null;
}

interface PerfilRanking {
  id: string | number;
  nombreCompleto: string;
  avatar: null;
  porcentaje: number;
  email: string;
  cromos_pegados_count: number;
  // Guardamos los detalles opcionales del LEFT JOIN
  detalles: PerfilDetalles | null;
}

const Premios: React.FC = () => {
  const [rankingData, setRankingData] = useState<PerfilRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const TOTAL_CROMOS_ALBUM = 1470;

  useEffect(() => {
    fetchRankingPremios();
  }, []);

  const fetchRankingPremios = async () => {
    try {
      setLoading(true);
      console.log("=== INICIANDO CAPTURA DE RANKING BOOGOL CON DETALLES ===");

      // 1. Ejecutamos el equivalente a un LEFT JOIN nativo en Supabase.
      // Reemplaza 'perfil_detalles' por el nombre exacto de tu tabla relacional si varía.
      const { data: tablaAlbum, error } = await supabase
        .from('perfiles')
        .select(`
          id, 
          email, 
          album_pasted,
          perfil_detalles (
            cedula_identidad,
            nombres,
            apellidos,
            whatsapp,
            ciudad,
            fecha_nacimiento
          )
        `);

      if (error) {
        console.error("Error de Supabase al leer perfiles con left join:", error);
        throw error;
      }

      const perfilesData = tablaAlbum || [];

      // 2. Procesamos la matriz de datos de forma segura
      const rankingCalculado = perfilesData.map((usuario: any, index) => {
        if (!usuario) {
          return {
            id: `err-${index}`,
            nombreCompleto: "Usuario Invalido",
            avatar: null,
            porcentaje: 0,
            email: "sin-datos@boogol.com",
            cromos_pegados_count: 0,
            detalles: null
          };
        }

        const arrBool = usuario.album_pasted;
        let pegados = 0;

        if (arrBool && Array.isArray(arrBool)) {
          统计: pegados = arrBool.filter(cromo => cromo === true).length;
        }

        const porcentaje = TOTAL_CROMOS_ALBUM > 0 ? Math.round((pegados / TOTAL_CROMOS_ALBUM) * 100) : 0;
        const porcentajeFinal = Math.min(porcentaje, 100);

        let nombreMapeado = "Usuario Anonimo";
        if (usuario.email && typeof usuario.email === 'string' && usuario.email.includes("@")) {
          nombreMapeado = usuario.email.split("@")[0];
        } else if (usuario.id && typeof usuario.id === 'string') {
          nombreMapeado = `User-${usuario.id.substring(0, 5).toUpperCase()}`;
        } else {
          nombreMapeado = `Coleccionista #${index + 1}`;
        }

        // Extraemos la relación del objeto o array que devuelve Supabase en el Left Join
        const relacionDetalles = usuario.perfil_detalles;
        let datosPerfil: PerfilDetalles | null = null;
        
        if (relacionDetalles) {
          datosPerfil = Array.isArray(relacionDetalles) ? relacionDetalles[0] : relacionDetalles;
        }

        return {
          id: usuario.id || `user-key-${index}`,
          nombreCompleto: nombreMapeado,
          avatar: null,
          porcentaje: porcentajeFinal,
          email: usuario.email || 'Sin correo registrado',
          cromos_pegados_count: pegados,
          detalles: datosPerfil
        };
      });

      rankingCalculado.sort((a, b) => b.porcentaje - a.porcentaje);
      setRankingData(rankingCalculado.slice(0, 50));
    } catch (err: any) {
      console.error(err);
      setRankingData([
        { 
          id: "error-state",
          nombreCompleto: "Error al cargar lideres", 
          porcentaje: 0, 
          avatar: null,
          email: "error@boogol.com",
          cromos_pegados_count: 0,
          detalles: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 👁️ NUEVA FUNCIÓN: Abre un SweetAlert2 con los detalles reales del usuario
  const verDetallesUsuario = (usuario: PerfilRanking) => {
    if (!usuario.detalles) {
      Swal.fire({
        icon: 'info',
        title: 'Perfil Incompleto',
        text: `El usuario ${usuario.email} aún no ha rellenado sus datos de identidad en la plataforma.`,
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    const d = usuario.detalles;

    Swal.fire({
      title: '📋 DATOS DE VERIFICACIÓN',
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#eab308',
      confirmButtonText: 'Cerrar ventana',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 2; padding: 10px;">
          <p><strong style="color: #eab308;">Nombres:</strong> ${d.nombres || 'No registrado'}</p>
          <p><strong style="color: #eab308;">Apellidos:</strong> ${d.apellidos || 'No registrado'}</p>
          <p><strong style="color: #eab308;">Cédula de Identidad:</strong> ${d.cedula_identidad || 'No registrado'}</p>
          <p><strong style="color: #eab308;">Ciudad / Estado:</strong> ${d.ciudad || 'No registrado'}</p>
          <p><strong style="color: #eab308;">WhatsApp de Perfil:</strong> ${d.whatsapp || 'No registrado'}</p>
          <p><strong style="color: #eab308;">Fecha Nacimiento:</strong> ${d.fecha_nacimiento || 'No registrado'}</p>
          <hr style="border-color: #334155; margin-top: 15px;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">UID: ${usuario.id}</p>
        </div>
      `
    });
  };

  const iniciarContactoWhatsApp = async (usuario: PerfilRanking, posicion: number) => {
    // Si ya tenemos el whatsapp en la tabla relacional, lo sugerimos como valor por defecto
    const telefonoPorDefecto = usuario.detalles?.whatsapp || '';

    const { value: telefono } = await Swal.fire({
      title: 'Contactar Ganador',
      text: `Introduce el número de WhatsApp para (${usuario.email}) con su prefijo de país:`,
      input: 'text',
      inputValue: telefonoPorDefecto,
      inputPlaceholder: 'Ej: 5917XXXXXX',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff',
      inputValidator: (value) => {
        if (!value) return '¡Debes ingresar un número válido!';
        if (/[^0-9]/g.test(value)) return 'Solo se permiten números';
      }
    });

    if (telefono) {
      const mensaje = encodeURIComponent(
        `¡Hola! Te contactamos porque estás en la posición #${posicion} del ranking global de premios de Boogol con tu cuenta (${usuario.email}).`
      );
      window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
    }
  };

  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', color: '#fff', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #1e293b', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#eab308', fontSize: '22px' }}>🏆 Panel de Premiación - TOP 50 Global</h2>
        </div>
        <button onClick={fetchRankingPremios} style={{ background: '#1e293b', border: '1px solid #334155', color: '#60a5fa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#eab308', fontWeight: 'bold' }}>
          🧮 Sincronizando datos del ranking con Left Join activo...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                <th style={{ padding: '12px', textAlign: 'center' }}>Posición</th>
                <th style={{ padding: '12px' }}>Usuario</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Cromos</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Porcentaje</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Acciones Avanzadas</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((usuario, index) => (
                <tr key={usuario.id} style={{ borderBottom: '1px solid #1e293b', background: (index + 1) % 2 === 0 ? '#111827' : 'transparent' }}>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>#{index + 1}</td>
                  <td style={{ padding: '12px' }}>👤 {usuario.nombreCompleto}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{usuario.email}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#38bdf8' }}>{usuario.cromos_pegados_count} / {TOTAL_CROMOS_ALBUM}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#eab308', fontWeight: 'bold' }}>{usuario.porcentaje}%</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => verDetallesUsuario(usuario)} 
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        👁️ Ver Datos
                      </button>
                      <button 
                        onClick={() => iniciarContactoWhatsApp(usuario, index + 1)} 
                        style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        💬 Chat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Premios;