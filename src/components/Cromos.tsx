import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

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
  const [showFullImage, setShowFullImage] = useState<any | null>(null);
  const [iframeModal, setIframeModal] = useState<{ url: string; titulo: string; is3D?: boolean } | null>(null);

  // ── NUEVOS ESTADOS PARA UPLOAD ──
  const [uploadingAnim, setUploadingAnim] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);

  const STORAGE_URL = "https://gmwwnjxglvzszsbasyra.supabase.co/storage/v1/object/public/cromos/";
  const RA_STORAGE_URL = "https://gmwwnjxglvzszsbasyra.supabase.co/storage/v1/object/public/objetosra/";
  const ANIM_STORAGE_URL = "https://gmwwnjxglvzszsbasyra.supabase.co/storage/v1/object/public/animaciones/";

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
    document.head.appendChild(script);
  }, []);

  const GRUPOS = [
    { id: 'TODOS', nombre: 'Todos' },
    { id: 'A', nombre: 'Grupo A', equipos: ['México','Sudáfrica','Corea del Sur','Rep. Checa'] },
    { id: 'B', nombre: 'Grupo B', equipos: ['Canadá', 'Qatar','Suiza','Bosnia'] },
    { id: 'C', nombre: 'Grupo C', equipos: ['Brasil', 'Marruecos','Haití','Escocia'] },
    { id: 'D', nombre: 'Grupo D', equipos: ['Estados Unidos','Paraguay','Australia','Turquía'] },
    { id: 'E', nombre: 'Grupo E', equipos: ['Alemania','Costa de Marfil','Curazao','Ecuador'] },
    { id: 'F', nombre: 'Grupo F', equipos: ['Países Bajos','Japón','Túnez','Suecia'] },
    { id: 'G', nombre: 'Grupo G', equipos: ['Bélgica','Egipto','Irán','Nueva Zelanda'] },
    { id: 'H', nombre: 'Grupo H', equipos: ['España','Cabo Verde','Arabia Saudí','Uruguay'] },
    { id: 'I', nombre: 'Grupo I', equipos: ['Irak','Francia', 'Senegal', 'Noruega'] },
    { id: 'J', nombre: 'Grupo J', equipos: ['Argentina','Argelia', 'Austria', 'Jordania'] },
    { id: 'K', nombre: 'Grupo K', equipos: ['RD Congo','Portugal','Uzbekistán','Colombia'] },
    { id: 'L', nombre: 'Grupo L', equipos: ['Inglaterra', 'Croacia','Ghana', 'Panamá'] },
  ];

  const selecciones = [
    { nombre: 'Todas', flag: '🌍' }, { nombre: 'México', flag: '🇲🇽' }, { nombre: 'Sudáfrica', flag: '🇿🇦' },
    { nombre: 'Corea del Sur', flag: '🇰🇷' }, { nombre: 'Rep. Checa', flag: '🇨🇿' }, { nombre: 'Canadá', flag: '🇨🇦' },
    { nombre: 'Qatar', flag: '🇶🇦' }, { nombre: 'Suiza', flag: '🇨🇭' }, { nombre: 'Bosnia', flag: '🇧🇦' },
    { nombre: 'Brasil', flag: '🇧🇷' }, { nombre: 'Marruecos', flag: '🇲🇦' }, { nombre: 'Haití', flag: '🇭🇹' },
    { nombre: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }, { nombre: 'Estados Unidos', flag: '🇺🇸' }, { nombre: 'Paraguay', flag: '🇵🇾' },
    { nombre: 'Australia', flag: '🇦🇺' }, { nombre: 'Turquía', flag: '🇹🇷' }, { nombre: 'Alemania', flag: '🇩🇪' },
    { nombre: 'Costa de Marfil', flag: '🇨🇮' }, { nombre: 'Curazao', flag: '🇨🇼' }, { nombre: 'Ecuador', flag: '🇪🇨' },
    { nombre: 'Países Bajos', flag: '🇳🇱' }, { nombre: 'Japón', flag: '🇯🇵' }, { nombre: 'Túnez', flag: '🇹🇳' },
    { nombre: 'Suecia', flag: '🇸🇪' }, { nombre: 'Bélgica', flag: '🇧🇪' }, { nombre: 'Egipto', flag: '🇪🇬' },
    { nombre: 'Irán', flag: '🇮🇷' }, { nombre: 'Nueva Zelanda', flag: '🇳🇿' }, { nombre: 'España', flag: '🇪🇸' },
    { nombre: 'Cabo Verde', flag: '🇨🇻' }, { nombre: 'Arabia Saudí', flag: '🇸🇦' }, { nombre: 'Uruguay', flag: '🇺🇾' },
    { nombre: 'Irak', flag: '🇮🇶' }, { nombre: 'Francia', flag: '🇫🇷' }, { nombre: 'Senegal', flag: '🇸🇳' },
    { nombre: 'Noruega', flag: '🇳🇴' }, { nombre: 'Argentina', flag: '🇦🇷' }, { nombre: 'Argelia', flag: '🇩🇿' },
    { nombre: 'Austria', flag: '🇦🇹' }, { nombre: 'Jordania', flag: '🇯🇴' }, { nombre: 'RD Congo', flag: '🇨🇩' },
    { nombre: 'Portugal', flag: '🇵🇹' }, { nombre: 'Uzbekistán', flag: '🇺🇿' }, { nombre: 'Colombia', flag: '🇨🇴' },
    { nombre: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, { nombre: 'Croacia', flag: '🇭🇷' }, { nombre: 'Ghana', flag: '🇬🇭' },
    { nombre: 'Panamá', flag: '🇵🇦' }
  ];

  const seleccionesVisibles = activeGrupo === 'TODOS'
    ? selecciones
    : selecciones.filter(s => GRUPOS.find(g => g.id === activeGrupo)?.equipos?.includes(s.nombre) || s.nombre === 'Todas');

  const toEmbedUrl = (url: string): string => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return url;
  };

  const abrirEnModal = (url: string, titulo: string) => {
    const esGLB = url.toLowerCase().endsWith('.glb');
    const finalUrl = esGLB
      ? (url.startsWith('http') ? url : `${RA_STORAGE_URL}${url}`)
      : toEmbedUrl(url);
    setIframeModal({ url: finalUrl, titulo, is3D: esGLB });
  };

  // ── SUBIR ANIMACIÓN MP4 ──
  const handleUploadAnimacion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !showFullImage) return;
    setUploadingAnim(true);
    try {
      const fileName = `${showFullImage.id}.mp4`;
      const { error: storageError } = await supabase.storage
        .from('animaciones')
        .upload(fileName, file, { upsert: true, cacheControl: '0', contentType: 'video/mp4' });
      if (storageError) throw storageError;
      const publicUrl = `${ANIM_STORAGE_URL}${fileName}`;
      const { error: dbError } = await supabase
        .from('cromos_info')
        .update({ url_animacion: publicUrl })
        .eq('id', showFullImage.id);
      if (dbError) throw dbError;
      setShowFullImage({ ...showFullImage, url_animacion: publicUrl });
      alert(`✅ Animación subida correctamente`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploadingAnim(false);
      e.target.value = '';
    }
  };

  // ── GUARDAR URL YOUTUBE ──
  const handleGuardarYoutube = async () => {
    if (!youtubeInput.trim() || !showFullImage) return;
    setUploadingVideo(true);
    try {
      const { error } = await supabase
        .from('cromos_info')
        .update({ url_video_ra: youtubeInput.trim() })
        .eq('id', showFullImage.id);
      if (error) throw error;
      setShowFullImage({ ...showFullImage, url_video_ra: youtubeInput.trim() });
      setShowYoutubeInput(false);
      setYoutubeInput('');
      alert('✅ URL de YouTube guardada correctamente');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  async function fetchStats() {
    const { data: sinImg } = await supabase.from('cromos_info').select('seleccion').is('url_imagen', null);
    if (sinImg) {
      const conteo: Record<string, number> = {};
      sinImg.forEach(item => { conteo[item.seleccion] = (conteo[item.seleccion] || 0) + 1; });
      setVaciosPorPais(conteo);
    }
    const { data: conImg } = await supabase.from('cromos_info').select('seleccion').not('url_imagen', 'is', null);
    if (conImg) {
      const conteo: Record<string, number> = {};
      conImg.forEach(item => { conteo[item.seleccion] = (conteo[item.seleccion] || 0) + 1; });
      setConImagenPorPais(conteo);
    }
  }

  async function checkStorageIntegrity() {
    setCheckingStorage(true);
    const { data } = await supabase.from('cromos_info').select('id, seleccion, url_imagen').not('url_imagen', 'is', null);
    if (!data) { setCheckingStorage(false); return; }
    const rotas: Record<string, number> = {};
    const BATCH = 50;
    for (let i = 0; i < data.length; i += BATCH) {
      const lote = data.slice(i, i + BATCH);
      await Promise.all(lote.map(async (cromo) => {
        try {
          const res = await fetch(`${STORAGE_URL}${cromo.url_imagen}`, { method: 'HEAD' });
          if (!res.ok) { rotas[cromo.seleccion] = (rotas[cromo.seleccion] || 0) + 1; }
        } catch { rotas[cromo.seleccion] = (rotas[cromo.seleccion] || 0) + 1; }
      }));
    }
    setRotasPorPais(rotas);
    setCheckingStorage(false);
  }

  async function fetchCromos() {
    setLoading(true);
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    let query = supabase.from('cromos_info').select('*', { count: 'exact' }).order('id', { ascending: true }).range(from, to);
    if (filterSeleccion !== 'Todas') {
      query = query.eq('seleccion', filterSeleccion);
    } else if (activeGrupo !== 'TODOS') {
      const equiposDelGrupo = GRUPOS.find(g => g.id === activeGrupo)?.equipos || [];
      query = query.in('seleccion', equiposDelGrupo);
    }
    if (search) {
      const isNumber = /^\d+$/.test(search);
      if (isNumber) { query = query.eq('id', parseInt(search)); }
      else { query = query.ilike('nombre_cromo', `%${search}%`); }
    }
    const { data, count, error } = await query;
    if (!error) { setCromos(data || []); setTotalCount(count || 0); }
    setLoading(false);
    fetchStats();
  }

  useEffect(() => {
    if (currentPage !== 0) { setCurrentPage(0); } else { fetchCromos(); }
  }, [filterSeleccion, search, activeGrupo]);
  useEffect(() => { fetchCromos(); }, [currentPage]);
  useEffect(() => { checkStorageIntegrity(); }, []);

  const handleUpdateImage = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    const fileName = `${id}.jpg`;
    const { error: storageError } = await supabase.storage
      .from('cromos').upload(fileName, file, { upsert: true, cacheControl: '0', contentType: 'image/jpeg' });
    if (storageError) {
      alert(`Error al subir: ${storageError.message}`);
    } else {
      const { error: updateError } = await supabase.from('cromos_info').update({ url_imagen: fileName }).eq('id', id);
      if (!updateError) { fetchCromos(); checkStorageIntegrity(); }
    }
    setUploadingId(null);
  };

  const handleSaveInfo = async () => {
    if (!selectedCromo) return;
    const { error } = await supabase.from('cromos_info')
      .update({ nombre_cromo: selectedCromo.nombre_cromo, rareza: selectedCromo.rareza })
      .eq('id', selectedCromo.id);
    if (error) { alert("No se pudieron guardar los cambios."); }
    else { setIsModalOpen(false); fetchCromos(); }
  };

  const renderInfoTecnica = (info: any) => {
    if (!info || Object.keys(info).length === 0) return <p style={{ color: '#444', fontSize: '12px' }}>Sin datos técnicos.</p>;
    return (
      <div style={{ width: '100%', marginTop: '5px', textAlign: 'left' }}>
        {Object.entries(info).map(([grupo, detalles]: [string, any]) => (
          <div key={grupo} style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.1)' }}>
            <h4 style={{ color: '#eab308', margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', paddingBottom: '3px' }}>
              {grupo}
            </h4>
            {typeof detalles === 'object' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.entries(detalles).map(([key, value]: [string, any]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>{key}</span>
                    <span style={{ color: '#fff', fontSize: '11px' }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: '#ccc', fontSize: '11px' }}>{String(detalles)}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const btnMedia = (color: string, disabled: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px',
    background: disabled ? '#1e293b' : color,
    color: disabled ? '#475569' : 'white',
    border: disabled ? '1px solid #334155' : 'none',
    borderRadius: '12px',
    fontWeight: 'bold', fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: '0.15s',
  });

  const btnUpload: React.CSSProperties = {
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.08)',
    color: 'white', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div style={{ color: 'white', padding: '10px' }}>

      {/* ── FILTROS ── */}
      <div style={filterBar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#eab308' }}>Gestión de Cromos</h3>
            <span style={countBadge}>{totalCount} resultados</span>
            {checkingStorage && <span style={{ fontSize: '11px', color: '#666' }}>⏳ Verificando storage...</span>}
          </div>
          <input type="text" placeholder="🔍 Busca por ID o Nombre..." style={searchInput} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={groupRow}>
          {GRUPOS.map((g) => (
            <button key={g.id} onClick={() => { setActiveGrupo(g.id); setFilterSeleccion('Todas'); }} style={groupBtn(activeGrupo === g.id)}>
              {g.nombre}
            </button>
          ))}
        </div>
        <div style={flagsContainer}>
          {seleccionesVisibles.map((s) => {
            const faltantes = vaciosPorPais[s.nombre] || 0;
            const conImagen = conImagenPorPais[s.nombre] || 0;
            const rotas = rotasPorPais[s.nombre] || 0;
            const esPais = s.nombre !== 'Todas';
            return (
              <button key={s.nombre} onClick={() => setFilterSeleccion(s.nombre)} style={flagBtn(filterSeleccion === s.nombre)}>
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                  <span style={{ fontSize: '22px' }}>{s.flag}</span>
                  {esPais && conImagen > 0 && <span style={{ ...bubbleBase, background: '#22c55e', top: '-8px', right: '-10px' }}>{conImagen}</span>}
                  {esPais && rotas > 0 && <span style={{ ...bubbleBase, background: '#ef4444', top: '-8px', left: '-10px' }}>{rotas}</span>}
                  {esPais && faltantes > 0 && <span style={{ ...bubbleBase, background: '#eab308', bottom: '-8px', right: '-10px', color: '#000' }}>{faltantes}</span>}
                </div>
                <small style={{ fontSize: '9px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {s.nombre.length > 12 ? s.nombre.substring(0, 10) + '..' : s.nombre}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRID DE CROMOS ── */}
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
                      onClick={() => setShowFullImage(c)}
                    />
                  ) : (
                    <div style={emptyIcon}>
                      <span style={{ fontSize: '30px' }}>🖼️</span>
                      <small style={{ marginTop: '5px' }}>Sin Imagen</small>
                    </div>
                  )}
                  {uploadingId === c.id && <div style={loaderOverlay}>⏳</div>}
                  <div style={actionButtons}>
                    <label style={iconBtn} title="Cambiar Foto">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <input type="file" hidden accept="image/*" onChange={(e) => handleUpdateImage(e, c.id)} />
                    </label>
                    <button style={iconBtn} onClick={() => { setSelectedCromo(c); setIsModalOpen(true); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
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
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} style={pageNavBtn}>Anterior</button>
              <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '60vw', padding: '5px' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)} style={pageNumberBtn(currentPage === i)}>{i + 1}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} style={pageNavBtn}>Siguiente</button>
            </div>
          )}
        </>
      )}

      {/* ── MODAL EDITAR ── */}
      {isModalOpen && selectedCromo && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ color: '#eab308', marginTop: 0 }}>Editar Cromo #{selectedCromo.id}</h3>
            <label style={labelS}>Nombre del Personaje</label>
            <input style={inputS} value={selectedCromo.nombre_cromo || ''} onChange={(e) => setSelectedCromo({ ...selectedCromo, nombre_cromo: e.target.value })} />
            <label style={labelS}>Rareza</label>
            <select style={inputS} value={selectedCromo.rareza || 'Común'} onChange={(e) => setSelectedCromo({ ...selectedCromo, rareza: e.target.value })}>
              <option value="Común">Común</option>
              <option value="Inusual">Inusual</option>
              <option value="Raro">Raro</option>
              <option value="Épico">Épico</option>
              <option value="Legendario">Legendario</option>
              <option value="Único">Único</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleSaveInfo} style={btnSave}>Guardar</button>
              <button onClick={() => setIsModalOpen(false)} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE CROMO ── */}
      {showFullImage && (
        <div style={modalOverlay} onClick={() => setShowFullImage(null)}>
          <div style={detailCard} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowFullImage(null)} style={btnCloseAbsolute}>✕</button>

            <div style={detailImageSection}>
              <img
                src={`${STORAGE_URL}${showFullImage.url_imagen}?t=${new Date().getTime()}`}
                style={detailImg}
                alt="Full"
              />
            </div>

            <div style={detailInfoSection}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                  {showFullImage.nombre_cromo || 'Sin Nombre'}
                </h2>
                <p style={{ margin: '5px 0', color: '#eab308', fontWeight: 'bold', fontSize: '15px' }}>
                  {showFullImage.seleccion} — <span style={{ color: '#aaa', fontWeight: 'normal' }}>{showFullImage.rareza}</span>
                </p>
              </div>

              <div style={techScrollArea}>
                <h3 style={{ fontSize: '11px', color: '#eab308', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                  Especificaciones
                </h3>
                {renderInfoTecnica(showFullImage.informacion_tecnica)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>

                {/* ── FILA 1: ANIMACIÓN + UPLOAD ── */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <button
                    disabled={!showFullImage.url_animacion}
                    onClick={() => showFullImage.url_animacion && abrirEnModal(showFullImage.url_animacion, '✨ Animación')}
                    style={btnMedia('linear-gradient(135deg, #7c3aed, #4c1d95)', !showFullImage.url_animacion)}
                  >
                    <span>✨</span>
                    {uploadingAnim ? 'Subiendo...' : showFullImage.url_animacion ? 'Ver Animación' : 'Sin Animación'}
                  </button>

                  {/* BOTÓN UPLOAD ANIMACIÓN */}
                  <label style={btnUpload} title="Subir MP4 de animación">
                    {uploadingAnim ? (
                      <span style={{ fontSize: '14px' }}>⏳</span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    <input
                      type="file"
                      hidden
                      accept="video/mp4"
                      disabled={uploadingAnim}
                      onChange={handleUploadAnimacion}
                    />
                  </label>
                </div>

                {/* ── FILA 2: VIDEO RA + UPLOAD URL YOUTUBE ── */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <button
                    disabled={!showFullImage.url_video_ra}
                    onClick={() => showFullImage.url_video_ra && abrirEnModal(showFullImage.url_video_ra, '▶ Video RA')}
                    style={btnMedia('linear-gradient(135deg, #dc2626, #991b1b)', !showFullImage.url_video_ra)}
                  >
                    <span>▶</span>
                    {showFullImage.url_video_ra ? 'Ver Video (YouTube)' : 'Sin Video'}
                  </button>

                  {/* BOTÓN INGRESAR URL YOUTUBE */}
                  <button
                    style={btnUpload}
                    title="Ingresar URL de YouTube"
                    onClick={() => {
                      setYoutubeInput(showFullImage.url_video_ra || '');
                      setShowYoutubeInput(true);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                </div>

                {/* ── FILA 3: MODELO 3D ── */}
                <button
                  disabled={!showFullImage.url_target_ra}
                  onClick={() => showFullImage.url_target_ra && abrirEnModal(showFullImage.url_target_ra, '🎯 Modelo 3D RA')}
                  style={btnMedia('linear-gradient(135deg, #0891b2, #164e63)', !showFullImage.url_target_ra)}
                >
                  <span>🎯</span>
                  {showFullImage.url_target_ra ? 'Ver Modelo 3D' : 'Sin Modelo 3D'}
                </button>

              </div>

              <button onClick={() => setShowFullImage(null)} style={btnCloseDetail}>Cerrar Vista</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL INPUT URL YOUTUBE ── */}
      {showYoutubeInput && (
        <div style={{ ...modalOverlay, zIndex: 6000 }} onClick={() => setShowYoutubeInput(false)}>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155', width: '90%', maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#eab308', marginTop: 0, fontSize: '15px' }}>
              🎬 URL de YouTube — Cromo #{showFullImage?.id}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>
              Pega la URL completa del video de YouTube
            </p>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeInput}
              onChange={e => setYoutubeInput(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: '#0f172a',
                border: '1px solid #475569', color: 'white',
                borderRadius: '10px', fontSize: '13px',
                boxSizing: 'border-box', marginBottom: '15px', outline: 'none'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleGuardarYoutube}
                disabled={uploadingVideo || !youtubeInput.trim()}
                style={{
                  flex: 1, padding: '12px', background: '#dc2626',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontWeight: 'bold', cursor: uploadingVideo ? 'wait' : 'pointer',
                  opacity: !youtubeInput.trim() ? 0.5 : 1
                }}
              >
                {uploadingVideo ? '⏳ Guardando...' : '✅ Guardar URL'}
              </button>
              <button
                onClick={() => { setShowYoutubeInput(false); setYoutubeInput(''); }}
                style={{
                  flex: 1, padding: '12px', background: 'transparent',
                  color: '#94a3b8', border: '1px solid #334155',
                  borderRadius: '10px', cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL IFRAME UNIVERSAL ── */}
      {iframeModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}
          onClick={() => setIframeModal(null)}
        >
          <div style={{ position: 'relative', width: '95%', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#eab308', fontWeight: 'bold', fontSize: '15px' }}>{iframeModal.titulo}</span>
              <button onClick={() => setIframeModal(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                CERRAR ✕
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '75%', height: 0, borderRadius: '14px', overflow: 'hidden', background: '#000', border: '1px solid #222' }}>
              {iframeModal.is3D ? (
                <model-viewer
                  src={iframeModal.url}
                  ar ar-modes="webxr scene-viewer quick-look"
                  camera-controls shadow-intensity="1"
                  auto-rotate crossorigin="anonymous" loading="eager"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#111' }}
                >
                  <div slot="ar-button" style={{ background: '#eab308', borderRadius: '8px', padding: '10px', position: 'absolute', bottom: '20px', right: '20px', color: '#000', fontWeight: 'bold' }}>
                    Ver en AR
                  </div>
                </model-viewer>
              ) : (
                <iframe
                  key={iframeModal.url}
                  src={iframeModal.url}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; fullscreen; xr-spatial-tracking; ar; camera"
                  allowFullScreen
                  title={iframeModal.titulo}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ── ESTILOS ──
const detailCard: React.CSSProperties = { display: 'flex', width: '95%', maxWidth: '900px', maxHeight: '85vh', background: '#0a0a0a', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7)', flexDirection: 'row', flexWrap: 'nowrap' };
const btnCloseAbsolute: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontSize: '16px' };
const detailImageSection: React.CSSProperties = { flex: '1.1', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRight: '1px solid #1a1a1a' };
const detailImg: React.CSSProperties = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' };
const detailInfoSection: React.CSSProperties = { flex: '1', padding: '35px', display: 'flex', flexDirection: 'column', background: '#0f0f0f', minWidth: '350px' };
const techScrollArea: React.CSSProperties = { flex: 1, overflowY: 'auto', paddingRight: '10px', marginBottom: '20px', scrollbarWidth: 'thin' };
const btnCloseDetail: React.CSSProperties = { width: '100%', padding: '14px', background: '#eab308', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', marginTop: 'auto' };
const bubbleBase: React.CSSProperties = { position: 'absolute', fontSize: '9px', fontWeight: 'bold', minWidth: '17px', height: '17px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a0a0a', color: 'white', zIndex: 10, lineHeight: 1, padding: '0 2px' };
const filterBar: React.CSSProperties = { background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222', marginBottom: '20px' };
const countBadge: React.CSSProperties = { background: '#222', color: '#eab308', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', border: '1px solid #eab30833' };
const searchInput: React.CSSProperties = { flex: 1, maxWidth: '400px', padding: '12px 15px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '14px' };
const groupRow: React.CSSProperties = { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #222', scrollbarWidth: 'none' };
const groupBtn = (active: boolean): React.CSSProperties => ({ padding: '6px 14px', background: active ? '#eab308' : 'transparent', color: active ? '#000' : '#666', border: active ? '1px solid #eab308' : '1px solid #333', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' });
const flagsContainer: React.CSSProperties = { display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 5px', scrollbarWidth: 'none' };
const flagBtn = (active: boolean): React.CSSProperties => ({ minWidth: '75px', padding: '10px 8px', background: active ? '#eab308' : '#0a0a0a', color: active ? '#000' : '#888', border: active ? '1px solid #eab308' : '1px solid #222', borderRadius: '12px', cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.2s', gap: '2px' });
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