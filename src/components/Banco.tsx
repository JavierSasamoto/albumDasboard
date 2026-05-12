import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRightLeft,
  Hash,
  ArrowUpCircle,
  Pencil,
  X,
  Save,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

interface Transaccion {
  id: string;
  monto_dinero: number;
  cantidad_monedas: number;
  banco_origen: string;
  cuenta_origen: string;
  cuenta_destino: string;
  comprobante_url: string;
  referencia_bancaria: string;
  estado: string;
  fecha_hora_registro: string;
  transsaccion: string;
  fecha_hora_comprobante: string;
  key_control?: number;
  verificado?: boolean;
}

interface EditForm {
  banco_origen: string;
  referencia_bancaria: string;
  transsaccion: string;
  fecha_hora_comprobante: string;
  verificado: boolean;
}

const inputStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#f1f5f9',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748b',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
  display: 'block',
};

// Convierte "DD/MM/YYYY HH:mm" → "YYYY-MM-DDTHH:mm" para input datetime-local
const toInputDatetime = (valor: string): string => {
  if (!valor) return '';
  const [fechaParte, horaParte = ''] = valor.split(' ');
  const partes = fechaParte.split('/');
  if (partes.length !== 3) return '';
  const [dd, mm, yyyy] = partes;
  const hora = horaParte || '00:00';
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${hora}`;
};

// Convierte "YYYY-MM-DDTHH:mm" → "DD/MM/YYYY HH:mm"
const fromInputDatetime = (valor: string): string => {
  if (!valor) return '';
  const [fechaParte, horaParte = '00:00'] = valor.split('T');
  const [yyyy, mm, dd] = fechaParte.split('-');
  return `${dd}/${mm}/${yyyy} ${horaParte}`;
};

const Banco: React.FC = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busquedaRef, setBusquedaRef] = useState('');
  const [busquedaKey, setBusquedaKey] = useState('');
  // ── CAMBIO 2: ahora es tipo date (YYYY-MM-DD) para el input calendario
  const [busquedaFecha, setBusquedaFecha] = useState('');

  // Modal de edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    banco_origen: '',
    referencia_bancaria: '',
    transsaccion: '',
    fecha_hora_comprobante: '',
    verificado: false,
  });
  const [guardando, setGuardando] = useState(false);
  const [imagenError, setImagenError] = useState(false);

  // Modal de ticket (imagen comprobante)
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);

  // URL del comprobante del registro en edición (solo lectura, para preview)
  const [editComprobanteUrl, setEditComprobanteUrl] = useState<string>('');

  useEffect(() => { fetchTransacciones(); }, []);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .order('fecha_hora_registro', { ascending: false });
      if (error) throw error;
      setTransacciones(data || []);
    } catch (error: any) {
      console.error('Error cargando transacciones:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirEdicion = (tx: Transaccion) => {
    setEditandoId(tx.id);
    setImagenError(false);
    setEditComprobanteUrl(tx.comprobante_url || '');
    setEditForm({
      banco_origen: tx.banco_origen || '',
      referencia_bancaria: tx.referencia_bancaria || '',
      transsaccion: tx.transsaccion || '',
      fecha_hora_comprobante: tx.fecha_hora_comprobante || '',
      verificado: !!tx.verificado,
    });
  };

  const cerrarEdicion = () => {
    setEditandoId(null);
    setImagenError(false);
  };

  // ── CAMBIO 1: si verificado está chequeado, también se guarda estado='completado'
  const guardarEdicion = async () => {
    if (!editandoId) return;
    setGuardando(true);
    try {
      const updatePayload: any = {
        banco_origen: editForm.banco_origen,
        referencia_bancaria: editForm.referencia_bancaria,
        transsaccion: editForm.transsaccion,
        fecha_hora_comprobante: editForm.fecha_hora_comprobante,
        verificado: editForm.verificado,
      };

      // Si se marcó como verificado, el estado pasa a 'completado'
      if (editForm.verificado) {
        updatePayload.estado = 'completado';
      }

      const { error } = await supabase
        .from('transacciones')
        .update(updatePayload)
        .eq('id', editandoId);

      if (error) throw error;

      setTransacciones(prev =>
        prev.map(t =>
          t.id === editandoId
            ? { ...t, ...editForm, ...(editForm.verificado ? { estado: 'completado' } : {}) }
            : t
        )
      );
      cerrarEdicion();
    } catch (error: any) {
      console.error('Error al guardar:', error.message);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const toggleVerificacion = async (id: string, estadoActual: boolean) => {
    try {
      const nuevoEstado = !estadoActual;
      const { error } = await supabase
        .from('transacciones')
        .update({ verificado: nuevoEstado })
        .eq('id', id);
      if (error) throw error;
      setTransacciones(prev =>
        prev.map(t => t.id === id ? { ...t, verificado: nuevoEstado } : t)
      );
    } catch (error: any) {
      console.error('Error al actualizar:', error.message);
    }
  };

  const extraerNombreLimpio = (texto: string) => {
    if (!texto) return 'Remitente Desconocido';
    const lineas = texto.split(' - ');
    const indiceOrigen = lineas.findIndex(l => l.toUpperCase().includes('ORIGEN'));
    if (indiceOrigen !== -1 && lineas[indiceOrigen + 1]) return lineas[indiceOrigen + 1].trim();
    return lineas[0] || 'Remitente Desconocido';
  };

  const getStatusStyle = (estado: string) => {
    const e = (estado || '').toLowerCase().trim();
    if (e === 'completado') return { color: '#22c55e', icon: <CheckCircle2 size={16} />, bg: 'rgba(20, 83, 45, 0.4)' };
    if (e === 'pendiente')  return { color: '#fbbf24', icon: <Clock size={16} />,        bg: 'rgba(120, 53, 15, 0.4)' };
    return                         { color: '#ef4444', icon: <AlertCircle size={16} />,  bg: 'rgba(127, 29, 29, 0.4)' };
  };

  const extraerSoloFecha = (fechaTexto: string): string => {
    if (!fechaTexto) return '';
    return fechaTexto.split(/[\s,]/)[0].toLowerCase();
  };

  // Formatea fecha ISO de Supabase a algo legible
  const formatearFechaRegistro = (fecha: string): string => {
    if (!fecha) return '---';
    try {
      const d = new Date(fecha);
      const dd   = String(d.getDate()).padStart(2, '0');
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh   = String(d.getHours()).padStart(2, '0');
      const min  = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
      return fecha;
    }
  };

  // ── CAMBIO 2: el filtro de fecha compara YYYY-MM-DD del input contra DD/MM/YYYY guardado
  const transaccionesFiltradas = transacciones.filter(tx => {
    const estadoDB       = (tx.estado || '').toLowerCase().trim();
    const coincideEstado = filtroEstado === 'todos' || estadoDB === filtroEstado;
    const refDB          = (tx.referencia_bancaria || '').toLowerCase();
    const coincideRef    = refDB.includes(busquedaRef.toLowerCase());
    const keyDB          = String(tx.key_control || '');
    const coincideKey    = keyDB.includes(busquedaKey);

    // fecha_hora_registro viene en ISO (ej: "2026-05-10T14:32:00") → tomar solo YYYY-MM-DD
    let coincideFecha = true;
    if (busquedaFecha) {
      const fechaISO = (tx.fecha_hora_registro || '').slice(0, 10); // "YYYY-MM-DD"
      coincideFecha = fechaISO === busquedaFecha;
    }

    return coincideEstado && coincideRef && coincideKey && coincideFecha;
  });

  if (loading) return (
    <div style={{ color: 'white', textAlign: 'center', padding: '100px', fontSize: '16px' }}>
      Cargando transacciones...
    </div>
  );

  return (
    <div style={{ padding: '20px', color: '#f1f5f9', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* TÍTULO */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowRightLeft color="#fbbf24" /> Historial de Pagos
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
            ({transaccionesFiltradas.length} registros)
          </span>
        </h1>
      </div>

      {/* FILTROS */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px',
        background: '#1a2233', padding: '15px', borderRadius: '16px', border: '1px solid #2d3748',
      }}>
        <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '50px', gap: '4px' }}>
          {[
            { label: 'TODOS',       value: 'todos' },
            { label: 'PENDIENTES',  value: 'pendiente' },
            { label: 'COMPLETADOS', value: 'completado' },
          ].map(btn => (
            <button key={btn.value} onClick={() => setFiltroEstado(btn.value)}
              style={{
                border: 'none', padding: '8px 16px', borderRadius: '50px', cursor: 'pointer',
                fontSize: '11px', fontWeight: 'bold',
                background: filtroEstado === btn.value ? '#fbbf24' : 'transparent',
                color:      filtroEstado === btn.value ? '#0f172a'  : '#94a3b8',
                transition: 'all 0.2s',
              }}
            >{btn.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 16px', borderRadius: '50px', border: '1px solid #334155', flex: 1, minWidth: '160px' }}>
          <Hash size={13} color="#64748b" style={{ marginRight: '7px', flexShrink: 0 }} />
          <input
            type="text" placeholder="Referencia bancaria..."
            value={busquedaRef} onChange={e => setBusquedaRef(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 16px', borderRadius: '50px', border: '1px solid #334155', flex: 1, minWidth: '140px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', marginRight: '7px', flexShrink: 0 }}>🔑</span>
          <input
            type="text" placeholder="Key control..."
            value={busquedaKey} onChange={e => setBusquedaKey(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', outline: 'none', width: '100%' }}
          />
        </div>

        {/* ── CAMBIO 2: input type="date" con calendario nativo ── */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 16px', borderRadius: '50px', border: '1px solid #334155', flex: 1, minWidth: '180px' }}>
          <Calendar size={13} color="#64748b" style={{ marginRight: '7px', flexShrink: 0 }} />
          <input
            type="date"
            value={busquedaFecha}
            onChange={e => setBusquedaFecha(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: busquedaFecha ? 'white' : '#64748b',
              fontSize: '12px', outline: 'none', width: '100%', colorScheme: 'dark',
            }}
          />
          {busquedaFecha && (
            <button
              onClick={() => setBusquedaFecha('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0 0 0 6px', display: 'flex' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
        {transaccionesFiltradas.length > 0 ? transaccionesFiltradas.map(tx => {
          const status = getStatusStyle(tx.estado);
          return (
            <div key={tx.id} style={{
              background: '#1a2233',
              borderRadius: '14px',
              border: tx.verificado ? '2px solid #22c55e' : '1px solid #2d3748',
              overflow: 'hidden',
              transition: 'all 0.3s',
            }}>

              {/* CABECERA */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #2d3748' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold' }}>Bs {tx.monto_dinero}</div>
                    <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '2px' }}>
                      + {tx.cantidad_monedas} Monedas
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: status.bg, color: status.color,
                    padding: '5px 12px', borderRadius: '8px',
                    fontSize: '10px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    {status.icon} {tx.estado?.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* CUERPO */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {tx.banco_origen && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>🏦</span>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>BANCO</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24' }}>{tx.banco_origen}</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ArrowUpCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>TRANSACCIÓN</div>
                    <div style={{
                      fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6',
                    }}>
                      {tx.transsaccion || '---'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Hash size={18} color="#4a5568" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>REFERENCIA</div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#e2e8f0' }}>
                      {tx.referencia_bancaria || '---'}
                    </div>
                  </div>
                </div>

                {tx.key_control && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(251,191,36,0.07)', borderRadius: '8px', padding: '8px 10px',
                    border: '1px solid rgba(251,191,36,0.2)',
                  }}>
                    <span style={{ fontSize: '14px' }}>🔑</span>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>KEY CONTROL</div>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: '700' }}>
                        {tx.key_control}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── FECHA REGISTRO en card ── */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(100,116,139,0.08)', borderRadius: '8px', padding: '8px 10px',
                  border: '1px solid rgba(100,116,139,0.15)',
                }}>
                  <Clock size={14} color="#64748b" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>REGISTRADO</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {formatearFechaRegistro(tx.fecha_hora_registro)}
                    </div>
                  </div>
                </div>
              </div>

              {/* PIE */}
              <div style={{
                padding: '10px 20px', background: '#111827',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: '11px', color: '#718096', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={12} />
                  {tx.fecha_hora_comprobante || 'Sin fecha'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={!!tx.verificado}
                    onChange={() => toggleVerificacion(tx.id, !!tx.verificado)}
                    title="Marcar como verificado"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#22c55e' }}
                  />

                  <button
                    onClick={() => abrirEdicion(tx)}
                    title="Editar registro"
                    style={{
                      background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                      borderRadius: '6px', padding: '4px 8px', cursor: 'pointer',
                      color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(251,191,36,0.25)')}
                    onMouseOut={e  => (e.currentTarget.style.background = 'rgba(251,191,36,0.1)')}
                  >
                    <Pencil size={12} /> EDITAR
                  </button>

                  {/* BOTÓN TICKET → abre modal con imagen */}
                  {tx.comprobante_url && (
                    <button
                      onClick={() => setTicketUrl(tx.comprobante_url)}
                      title="Ver comprobante"
                      style={{
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)',
                        borderRadius: '6px', padding: '4px 8px', cursor: 'pointer',
                        color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.25)')}
                      onMouseOut={e  => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                    >
                      <ImageIcon size={12} /> TICKET
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '80px',
            color: '#4a5568', border: '2px dashed #2d3748', borderRadius: '15px',
          }}>
            No hay transacciones que coincidan con los filtros aplicados.
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL — VER COMPROBANTE (TICKET)
      ══════════════════════════════════════════════════ */}
      {ticketUrl && (
        <div
          onClick={() => setTicketUrl(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a2233', borderRadius: '20px',
              border: '1px solid #334155',
              maxWidth: '600px', width: '100%',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #2d3748',
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={16} color="#818cf8" />
                <span style={{ fontWeight: '800', fontSize: '14px', color: '#818cf8' }}>COMPROBANTE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Abrir en nueva pestaña"
                  style={{
                    color: '#64748b', display: 'flex', padding: '4px',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
                  }}
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setTicketUrl(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Imagen */}
            <div style={{ padding: '20px', background: '#0f172a', textAlign: 'center', maxHeight: '70vh', overflowY: 'auto' }}>
              <img
                src={ticketUrl}
                alt="Comprobante de pago"
                style={{
                  maxWidth: '100%',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                }}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="padding:60px;color:#64748b;font-size:13px">
                        <div style="font-size:40px;margin-bottom:12px">🖼️</div>
                        No se pudo cargar la imagen.<br/>
                        <a href="${ticketUrl}" target="_blank" rel="noreferrer"
                           style="color:#818cf8;text-decoration:underline;margin-top:8px;display:inline-block">
                          Abrir enlace original
                        </a>
                      </div>`;
                  }
                }}
              />
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px', background: '#111827',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setTicketUrl(null)}
                style={{
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '10px', padding: '8px 20px', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '13px', fontWeight: '600',
                }}
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — EDITAR TRANSACCIÓN
      ══════════════════════════════════════════════════ */}
      {editandoId && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#1a2233', borderRadius: '20px',
            border: '1px solid #334155',
            width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 24px', borderBottom: '1px solid #2d3748',
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Pencil size={18} color="#fbbf24" />
                <span style={{ fontWeight: '800', fontSize: '16px', color: '#fbbf24' }}>
                  EDITAR TRANSACCIÓN
                </span>
              </div>
              <button onClick={cerrarEdicion}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario scrolleable */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

              {/* ── IMAGEN DEL COMPROBANTE (solo lectura) ── */}
              <div>
                <label style={labelStyle}>🖼️ Comprobante</label>
                {editComprobanteUrl ? (
                  <div style={{
                    background: '#0f172a', borderRadius: '12px',
                    border: '1px solid #334155', overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {!imagenError ? (
                      <img
                        src={editComprobanteUrl}
                        alt="Comprobante"
                        onError={() => setImagenError(true)}
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }}
                      />
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                        <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🖼️</span>
                        No se pudo cargar la imagen
                      </div>
                    )}
                    {/* Botón abrir en nueva pestaña */}
                    <a
                      href={editComprobanteUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                        padding: '4px 8px', color: '#94a3b8',
                        fontSize: '10px', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ExternalLink size={11} /> ABRIR
                    </a>
                  </div>
                ) : (
                  <div style={{
                    background: '#0f172a', borderRadius: '12px', border: '1px dashed #334155',
                    padding: '24px', textAlign: 'center', color: '#4a5568', fontSize: '12px',
                  }}>
                    Sin comprobante adjunto
                  </div>
                )}
              </div>

              {/* Banco origen */}
              <div>
                <label style={labelStyle}>🏦 Banco Origen</label>
                <input
                  type="text"
                  value={editForm.banco_origen}
                  onChange={e => setEditForm(f => ({ ...f, banco_origen: e.target.value }))}
                  placeholder="Ej: BANCOSOL, BNB, BISA..."
                  style={inputStyle}
                />
              </div>

              {/* Referencia bancaria */}
              <div>
                <label style={labelStyle}># Referencia Bancaria</label>
                <input
                  type="text"
                  value={editForm.referencia_bancaria}
                  onChange={e => setEditForm(f => ({ ...f, referencia_bancaria: e.target.value }))}
                  placeholder="Ej: 05052026/295/398/056/5591"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
              </div>

              {/* ── FECHA COMPROBANTE con datetime-local ── */}
              <div>
                <label style={labelStyle}>📅 Fecha/Hora Comprobante</label>
                <input
                  type="datetime-local"
                  value={toInputDatetime(editForm.fecha_hora_comprobante)}
                  onChange={e =>
                    setEditForm(f => ({
                      ...f,
                      fecha_hora_comprobante: fromInputDatetime(e.target.value),
                    }))
                  }
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark',
                  }}
                />
                {/* Muestra el valor guardado en formato legible */}
                {editForm.fecha_hora_comprobante && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Guardado como: {editForm.fecha_hora_comprobante}
                  </div>
                )}
              </div>

              {/* Transacción (OCR) */}
              <div>
                <label style={labelStyle}>📄 Texto Transacción (OCR)</label>
                <textarea
                  value={editForm.transsaccion}
                  onChange={e => setEditForm(f => ({ ...f, transsaccion: e.target.value }))}
                  placeholder="Texto extraído del comprobante..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* Verificado */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: editForm.verificado ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${editForm.verificado ? 'rgba(34,197,94,0.4)' : '#334155'}`,
                borderRadius: '10px', padding: '12px 16px',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color={editForm.verificado ? '#22c55e' : '#64748b'} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: editForm.verificado ? '#22c55e' : '#f1f5f9' }}>
                      Verificado manualmente
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {editForm.verificado
                        ? 'Al guardar, ok  el estado pasará a COMPLETADO'
                        : 'Marca si el pago fue confirmado'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.verificado}
                  onChange={e => setEditForm(f => ({ ...f, verificado: e.target.checked }))}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#22c55e' }}
                />
              </div>
            </div>

            {/* Botones */}
            <div style={{
              display: 'flex', gap: '10px', padding: '16px 24px',
              borderTop: '1px solid #2d3748', background: '#111827',
              flexShrink: 0,
            }}>
              <button onClick={cerrarEdicion}
                style={{
                  flex: 1, background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '10px', padding: '11px', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '13px', fontWeight: '600',
                }}
              >Cancelar</button>

              <button
                onClick={guardarEdicion}
                disabled={guardando}
                style={{
                  flex: 2,
                  background: guardando ? '#334155' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  border: 'none', borderRadius: '10px', padding: '11px',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  color: '#0f172a', fontSize: '13px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  opacity: guardando ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Save size={15} />
                {guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS '}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banco;