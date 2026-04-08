import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Cromos: React.FC = () => {
  const [cromos, setCromos] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  
  const [vaciosPorPais, setVaciosPorPais] = useState<Record<string, number>>({});
  const [conImagenPorPais, setConImagenPorPais] = useState<Record<string, number>>({});
  const [rotasPorPais, setRotasPorPais] = useState<Record<string, number>>({});
  const [checkingStorage, setCheckingStorage] = useState(false);

  const [search, setSearch] = useState('');
  const [filterSeleccion, setFilterSeleccion] = useState('Todas');
  const [activeGrupo, setActiveGrupo] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 30;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCromo, setSelectedCromo] = useState<any>(null);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  const STORAGE_URL = "https://gmwwnjxglvzszsbasyra.supabase.co/storage/v1/object/public/cromos/";

  const GRUPOS = [
    { id: 'TODOS', nombre: 'Todos' },
    { id: 'A', nombre: 'Grupo A', equipos: ['México','Sudáfrica', 'Corea del Sur', 'Cheqcoslovaquia'] },
    { id: 'B', nombre: 'Grupo B', equipos: ['Canadá', 'Qatar','Suiza','Bosnia'] },
    { id: 'C', nombre: 'Grupo C', equipos: ['Brasil', 'Marruecos', 'Haití','Escocia' ] },
    { id: 'D', nombre: 'Grupo D', equipos: ['Estados Unidos', 'Paraguay','Australia', 'Turquía'] },
    { id: 'E', nombre: 'Grupo E', equipos: ['Alemania', 'Costa de Marfil', 'Curazao','Ecuador'] },
    { id: 'F', nombre: 'Grupo F', equipos: ['Países Bajos', 'Japón', 'Túnez', 'Suecia'] },
    { id: 'G', nombre: 'Grupo G', equipos: ['Bélgica','Egipto', 'Irán',  'Nueva Zelanda'] },
    { id: 'H', nombre: 'Grupo H', equipos: ['España','Cabo Verde',  'Arabia Saudí', 'Uruguay'] },
    { id: 'I', nombre: 'Grupo I', equipos: ['Irak','Francia', 'Senegal', 'Noruega' ] },
    { id: 'J', nombre: 'Grupo J', equipos: ['Argentina','Argelia', 'Austria',  'Jordania'] },
    { id: 'K', nombre: 'Grupo K', equipos: ['RD Congo','Portugal','Uzbekistán','Colombia' ] },
    { id: 'L', nombre: 'Grupo L', equipos: ['Inglaterra', 'Croacia','Ghana', 'Panamá' ] },
  ];

  const selecciones = [
    { nombre: 'Todas', flag: '🌍' },
    // GRUPO A
    { nombre: 'México', flag: '🇲🇽' },
    { nombre: 'Sudáfrica', flag: '🇿🇦' },
    { nombre: 'Corea del Sur', flag: '🇰🇷' },
    { nombre: 'Cheqcoslovaquia', flag: '🇨🇿' },
    // GRUPO B
    { nombre: 'Canadá', flag: '🇨🇦' },
    { nombre: 'Qatar', flag: '🇶🇦' },
    { nombre: 'Suiza', flag: '🇨🇭' },
    { nombre: 'Bosnia', flag: '🇧🇦' },
    // GRUPO C
    { nombre: 'Brasil', flag: '🇧🇷' },
    { nombre: 'Marruecos', flag: '🇲🇦' },
    { nombre: 'Haití', flag: '🇭🇹' },
    { nombre: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    // GRUPO D
    { nombre: 'Estados Unidos', flag: '🇺🇸' },
    { nombre: 'Paraguay', flag: '🇵🇾' },
    { nombre: 'Australia', flag: '🇦🇺' },
    { nombre: 'Turquía', flag: '🇹🇷' },
    // GRUPO E
    { nombre: 'Alemania', flag: '🇩🇪' },
    { nombre: 'Costa de Marfil', flag: '🇨🇮' },
    { nombre: 'Curazao', flag: '🇨🇼' },
    { nombre: 'Ecuador', flag: '🇪🇨' },
    // GRUPO F
    { nombre: 'Países Bajos', flag: '🇳🇱' },
    { nombre: 'Japón', flag: '🇯🇵' },
    { nombre: 'Túnez', flag: '🇹🇳' },
    { nombre: 'Suecia', flag: '🇸🇪' },
    // GRUPO G
    { nombre: 'Bélgica', flag: '🇧🇪' },
    { nombre: 'Egipto', flag: '🇪🇬' },
    { nombre: 'Irán', flag: '🇮🇷' },
    { nombre: 'Nueva Zelanda', flag: '🇳🇿' },
    // GRUPO H
    { nombre: 'España', flag: '🇪🇸' },
    { nombre: 'Cabo Verde', flag: '🇨🇻' },
    { nombre: 'Arabia Saudí', flag: '🇸🇦' },
    { nombre: 'Uruguay', flag: '🇺🇾' },
    // GRUPO I
    { nombre: 'Irak', flag: '🇮🇶' },
    { nombre: 'Francia', flag: '🇫🇷' },
    { nombre: 'Senegal', flag: '🇸🇳' },
    { nombre: 'Noruega', flag: '🇳🇴' },
    // GRUPO J
    { nombre: 'Argentina', flag: '🇦🇷' },
    { nombre: 'Argelia', flag: '🇩🇿' },
    { nombre: 'Austria', flag: '🇦🇹' },
    { nombre: 'Jordania', flag: '🇯🇴' },
    // GRUPO K
    { nombre: 'RD Congo', flag: '🇨🇩' },
    { nombre: 'Portugal', flag: '🇵🇹' },
    { nombre: 'Uzbekistán', flag: '🇺🇿' },
    { nombre: 'Colombia', flag: '🇨🇴' },
 
    // GRUPO L
    { nombre: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { nombre: 'Croacia', flag: '🇭🇷' },
    { nombre: 'Ghana', flag: '🇬🇭' },
    { nombre: 'Panamá', flag: '🇵🇦' }
  ];
  const seleccionesVisibles = activeGrupo === 'TODOS' 
    ? selecciones 
    : selecciones.filter(s => GRUPOS.find(g => g.id === activeGrupo)?.equipos?.includes(s.nombre) || s.nombre === 'Todas');

  // ── Stats: vacíos y con imagen por país ──────────────────────────────────
  async function fetchStats() {
    // Cromos SIN imagen
    const { data: sinImg } = await supabase
      .from('cromos_info')
      .select('seleccion')
      .is('url_imagen', null);

    if (sinImg) {
      const conteo: Record<string, number> = {};
      sinImg.forEach(item => {
        conteo[item.seleccion] = (conteo[item.seleccion] || 0) + 1;
      });
      setVaciosPorPais(conteo);
    }

    // Cromos CON imagen
    const { data: conImg } = await supabase
      .from('cromos_info')
      .select('seleccion')
      .not('url_imagen', 'is', null);

    if (conImg) {
      const conteo: Record<string, number> = {};
      conImg.forEach(item => {
        conteo[item.seleccion] = (conteo[item.seleccion] || 0) + 1;
      });
      setConImagenPorPais(conteo);
    }
  }

  // ── Verificar archivos rotos en storage ───────────────────────────────────
  async function checkStorageIntegrity() {
    setCheckingStorage(true);

    // Traer TODOS los registros que tienen url_imagen
    const { data } = await supabase
      .from('cromos_info')
      .select('id, seleccion, url_imagen')
      .not('url_imagen', 'is', null);

    if (!data) { setCheckingStorage(false); return; }

    // Verificar en lotes de 50 con HEAD requests
    const rotas: Record<string, number> = {};
    const BATCH = 50;

    for (let i = 0; i < data.length; i += BATCH) {
      const lote = data.slice(i, i + BATCH);
      await Promise.all(
        lote.map(async (cromo) => {
          try {
            const res = await fetch(`${STORAGE_URL}${cromo.url_imagen}`, { method: 'HEAD' });
            if (!res.ok) {
              rotas[cromo.seleccion] = (rotas[cromo.seleccion] || 0) + 1;
            }
          } catch {
            rotas[cromo.seleccion] = (rotas[cromo.seleccion] || 0) + 1;
          }
        })
      );
    }

    setRotasPorPais(rotas);
    setCheckingStorage(false);
  }

  async function fetchCromos() {
    setLoading(true);
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('cromos_info')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(from, to);

    if (filterSeleccion !== 'Todas') {
      query = query.eq('seleccion', filterSeleccion);
    } else if (activeGrupo !== 'TODOS') {
      const equiposDelGrupo = GRUPOS.find(g => g.id === activeGrupo)?.equipos || [];
      query = query.in('seleccion', equiposDelGrupo);
    }

    if (search) {
      const isNumber = /^\d+$/.test(search);
      if (isNumber) {
        query = query.eq('id', parseInt(search));
      } else {
        query = query.ilike('nombre_cromo', `%${search}%`);
      }
    }

    const { data, count, error } = await query;
    if (!error) {
      setCromos(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
    fetchStats();
  }

  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      fetchCromos();
    }
  }, [filterSeleccion, search, activeGrupo]);

  useEffect(() => {
    fetchCromos();
  }, [currentPage]);

  // Verificar storage al montar (solo una vez)
  useEffect(() => {
    checkStorageIntegrity();
  }, []);

  const handleUpdateImage = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    const fileName = `${id}.jpg`;
    
    const { error: storageError } = await supabase.storage
      .from('cromos')
      .upload(fileName, file, { upsert: true, cacheControl: '0' });

    if (!storageError) {
      const { error: updateError } = await supabase
        .from('cromos_info')
        .update({ url_imagen: fileName })
        .eq('id', id);

      if (!updateError) {
        fetchCromos();
        checkStorageIntegrity();
      }
    }
    setUploadingId(null);
  };

  const handleSaveInfo = async () => {
    if (!selectedCromo) return;
    const { error } = await supabase.from('cromos_info').update({
      nombre_cromo: selectedCromo.nombre_cromo,
      rareza: selectedCromo.rareza
    }).eq('id', selectedCromo.id);
    if (!error) {
      setIsModalOpen(false);
      fetchCromos();
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div style={{ color: 'white', padding: '10px' }}>
      <div style={filterBar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             <h3 style={{ margin: 0, color: '#eab308' }}>Gestión de Cromos</h3>
             <span style={countBadge}>{totalCount} resultados</span>
             {checkingStorage && (
               <span style={{ fontSize: '11px', color: '#666' }}>⏳ Verificando storage...</span>
             )}
          </div>
          <input 
            type="text" 
            placeholder="🔍 Busca por ID o Nombre..." 
            style={searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={groupRow}>
          {GRUPOS.map((g) => (
            <button 
              key={g.id} 
              onClick={() => {
                setActiveGrupo(g.id);
                setFilterSeleccion('Todas');
              }}
              style={groupBtn(activeGrupo === g.id)}
            >
              {g.nombre}
            </button>
          ))}
        </div>

        <div style={flagsContainer}>
          {seleccionesVisibles.map((s) => {
            const faltantes   = vaciosPorPais[s.nombre] || 0;
            const conImagen   = conImagenPorPais[s.nombre] || 0;
            const rotas       = rotasPorPais[s.nombre] || 0;
            const esPais      = s.nombre !== 'Todas';

            return (
              <button 
                key={s.nombre}
                onClick={() => setFilterSeleccion(s.nombre)}
                style={flagBtn(filterSeleccion === s.nombre)}
              >
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                  <span style={{ fontSize: '22px' }}>{s.flag}</span>

                  {/* 🟢 Círculo verde — cromos con imagen */}
                  {esPais && conImagen > 0 && (
                    <span style={{ ...bubbleBase, background: '#22c55e', top: '-8px', right: '-10px' }}>
                      {conImagen}
                    </span>
                  )}

                  {/* 🔴 Círculo rojo — imágenes rotas en storage */}
                  {esPais && rotas > 0 && (
                    <span style={{ ...bubbleBase, background: '#ef4444', top: '-8px', left: '-10px' }}>
                      {rotas}
                    </span>
                  )}

                  {/* 🟡 Círculo amarillo — sin imagen en tabla */}
                  {esPais && faltantes > 0 && (
                    <span style={{ ...bubbleBase, background: '#eab308', bottom: '-8px', right: '-10px', color: '#000' }}>
                      {faltantes}
                    </span>
                  )}
                </div>

                <small style={{ fontSize: '9px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {s.nombre.length > 12 ? s.nombre.substring(0, 10) + '..' : s.nombre}
                </small>
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#22c55e' }}>🟢 Con imagen</span>
          <span style={{ fontSize: '11px', color: '#ef4444' }}>🔴 Rotas en storage</span>
          <span style={{ fontSize: '11px', color: '#eab308' }}>🟡 Sin imagen en tabla</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>Cargando datos...</div>
      ) : (
        <>
          <div style={gridStyle}>
            {cromos.map((c) => (
              <div key={c.id} style={cardStyle}>
                <div style={imgContainer}>
                  {c.url_imagen ? (
                    <img 
                      src={`${STORAGE_URL}${c.url_imagen}?t=${new Date().getTime()}`} 
                      style={{ ...imgStyle, cursor: 'zoom-in' }} 
                      alt={c.nombre_cromo}
                      onClick={() => setShowFullImage(`${STORAGE_URL}${c.url_imagen}`)}
                    />
                  ) : (
                    <div style={emptyIcon}>
                        <span style={{fontSize: '30px'}}>🖼️</span>
                        <small style={{marginTop: '5px'}}>Sin Imagen</small>
                    </div>
                  )}
                  {uploadingId === c.id && <div style={loaderOverlay}>⏳</div>}
                  <div style={actionButtons}>
                    <label style={iconBtn} title="Cambiar Foto">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      <input type="file" hidden accept="image/*" onChange={(e) => handleUpdateImage(e, c.id)} />
                    </label>
                    <button style={iconBtn} onClick={() => { setSelectedCromo(c); setIsModalOpen(true); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                  <div style={idBadgeFloating}>#{c.id}</div>
                </div>
                <div style={idLabel}>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{c.nombre_cromo || `Cromo ${c.id}`}</div>
                  <div style={{ fontSize: '9px', color: '#eab308', marginTop: '3px' }}>{c.seleccion}</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={paginationArea}>
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} style={pageNavBtn}> Anterior </button>
              <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '60vw', padding: '5px' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)} style={pageNumberBtn(currentPage === i)}>{i + 1}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} style={pageNavBtn}> Siguiente </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && selectedCromo && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ color: '#eab308', marginTop: 0 }}>Editar Cromo #{selectedCromo.id}</h3>
            <label style={labelS}>Nombre del Personaje</label>
            <input style={inputS} value={selectedCromo.nombre_cromo || ''} onChange={(e) => setSelectedCromo({...selectedCromo, nombre_cromo: e.target.value})} />
            <label style={labelS}>Rareza</label>
            <select style={inputS} value={selectedCromo.rareza || 'Común'} onChange={(e) => setSelectedCromo({...selectedCromo, rareza: e.target.value})}>
              <option value="Común">Común</option>
              <option value="Inusual">Inusual</option>
              <option value="Raro">Raro</option>
              <option value="Épico">Épico</option>
              <option value="Legendario">Legendario</option>
              <option value="Único">Único</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleSaveInfo} style={btnSave}>Guardar Cambios</button>
              <button onClick={() => setIsModalOpen(false)} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showFullImage && (
        <div style={modalOverlay} onClick={() => setShowFullImage(null)}>
          <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}} onClick={e => e.stopPropagation()}>
            <img src={showFullImage} style={{ maxHeight: '85vh', maxWidth: '85vw', borderRadius: '15px', border: '2px solid #eab308', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }} alt="Full" />
          </div>
        </div>
      )}
    </div>
  );
};

const bubbleBase: React.CSSProperties = {
  position: 'absolute',
  fontSize: '9px',
  fontWeight: 'bold',
  minWidth: '17px',
  height: '17px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #0a0a0a',
  color: 'white',
  zIndex: 10,
  lineHeight: 1,
  padding: '0 2px',
};

const filterBar: React.CSSProperties = { background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222', marginBottom: '20px' };
const countBadge: React.CSSProperties = { background: '#222', color: '#eab308', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', border: '1px solid #eab30833' };
const searchInput: React.CSSProperties = { flex: 1, maxWidth: '400px', padding: '12px 15px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '14px' };
const groupRow: React.CSSProperties = { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #222', scrollbarWidth: 'none' };
const groupBtn = (active: boolean): React.CSSProperties => ({ padding: '6px 14px', background: active ? '#eab308' : 'transparent', color: active ? '#000' : '#666', border: active ? '1px solid #eab308' : '1px solid #333', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' });
const flagsContainer: React.CSSProperties = { display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 5px', scrollbarWidth: 'none' };
const flagBtn = (active: boolean): React.CSSProperties => ({ minWidth: '75px', padding: '10px 8px', background: active ? '#eab308' : '#0a0a0a', color: active ? '#000' : '#888', border: active ? '1px solid #eab308' : '1px solid #222', borderRadius: '12px', cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.2s', gap: '2px' });
const emptyBadge: React.CSSProperties = { position: 'absolute', top: '-8px', right: '-10px', background: '#ff4444', color: 'white', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a0a0a', zIndex: 10 };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' };
const cardStyle: React.CSSProperties = { background: '#111', borderRadius: '15px', overflow: 'hidden', border: '1px solid #222', position: 'relative' };
const imgContainer: React.CSSProperties = { position: 'relative', aspectRatio: '1/1', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const imgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const idBadgeFloating: React.CSSProperties = { position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #333' };
const actionButtons: React.CSSProperties = { position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '5px', zIndex: 10 };
const iconBtn: React.CSSProperties = { background: 'rgba(0,0,0,0.85)', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' };
const idLabel: React.CSSProperties = { padding: '15px', textAlign: 'center', borderTop: '1px solid #222' };
const emptyIcon: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.3 };
const loaderOverlay: React.CSSProperties = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 };
const paginationArea: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '40px', paddingBottom: '40px' };
const pageNavBtn: React.CSSProperties = { padding: '8px 16px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer' };
const pageNumberBtn = (active: boolean): React.CSSProperties => ({ minWidth: '35px', height: '35px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? '#eab308' : '#111', color: active ? '#000' : '#888', fontWeight: 'bold' });
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 };
const modalContent: React.CSSProperties = { background: '#111', padding: '30px', borderRadius: '15px', width: '380px', border: '1px solid #333' };
const inputS: React.CSSProperties = { width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px', marginBottom: '15px' };
const labelS: React.CSSProperties = { fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' };
const btnSave: React.CSSProperties = { flex: 1, padding: '12px', background: '#eab308', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const btnCancel: React.CSSProperties = { flex: 1, padding: '12px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '8px', cursor: 'pointer' };

export default Cromos;