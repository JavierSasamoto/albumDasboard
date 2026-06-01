import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';

interface TriviaPregunta {
  id?: number;
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  respuesta_correcta: string; // 'a', 'b', 'c' o 'd'
  categoria: string | null;
}

const TriviaManager: React.FC = () => {
  const [trivias, setTrivias] = useState<TriviaPregunta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTrivia, setEditingTrivia] = useState<TriviaPregunta | null>(null);

  // Estado para el formulario (Crear / Editar)
  const [form, setForm] = useState<TriviaPregunta>({
    pregunta: '',
    opcion_a: '',
    opcion_b: '',
    opcion_c: '',
    opcion_d: '',
    respuesta_correcta: 'a',
    categoria: 'Mundial 2026'
  });

  useEffect(() => {
    cargarTrivias();
  }, []);

  const cargarTrivias = async () => {
    setLoading(true);
    try {
      // 💡 CORREGIDO: Apuntando a la tabla 'trivia' en singular
      const { data, error } = await supabase
        .from('trivia')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setTrivias(data || []);
    } catch (error: any) {
      console.error("Error al cargar trivias:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las trivias.', background: '#0a0a0a', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Guardar (Insertar o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.pregunta || !form.opcion_a || !form.opcion_b || !form.opcion_c || !form.opcion_d) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, rellena la pregunta y todas las opciones.', background: '#0a0a0a', color: '#fff' });
      return;
    }

    try {
      if (editingTrivia && editingTrivia.id) {
        // --- Modo Edición (UPDATE) ---
        // 💡 CORREGIDO: Apuntando a la tabla 'trivia'
        const { error } = await supabase
          .from('trivia')
          .update({
            pregunta: form.pregunta,
            opcion_a: form.opcion_a,
            opcion_b: form.opcion_b,
            opcion_c: form.opcion_c,
            opcion_d: form.opcion_d,
            respuesta_correcta: form.respuesta_correcta,
            categoria: form.categoria
          })
          .eq('id', editingTrivia.id);

        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Trivia Actualizada', text: 'La pregunta se guardó correctamente.', background: '#0a0a0a', color: '#fff', timer: 2000, showConfirmButton: false });
      } else {
        // --- Modo Creación (INSERT) ---
        // 💡 CORREGIDO: Apuntando a la tabla 'trivia'
        const { error } = await supabase
          .from('trivia')
          .insert([
            {
              pregunta: form.pregunta,
              opcion_a: form.opcion_a,
              opcion_b: form.opcion_b,
              opcion_c: form.opcion_c,
              opcion_d: form.opcion_d,
              respuesta_correcta: form.respuesta_correcta,
              categoria: form.categoria,
              created_at: new Date().toISOString().split('T')[0] // Formato date YYYY-MM-DD
            }
          ]);

        if (error) throw error;
        Swal.fire({ icon: 'success', title: 'Trivia Creada', text: 'Nueva pregunta agregada al pool.', background: '#0a0a0a', color: '#fff', timer: 2000, showConfirmButton: false });
      }

      resetForm();
      cargarTrivias();
    } catch (error: any) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error al guardar', text: error.message, background: '#0a0a0a', color: '#fff' });
    }
  };

  const iniciarEdicion = (trivia: TriviaPregunta) => {
    setEditingTrivia(trivia);
    setForm({
      pregunta: trivia.pregunta,
      opcion_a: trivia.opcion_a,
      opcion_b: trivia.opcion_b,
      opcion_c: trivia.opcion_c,
      opcion_d: trivia.opcion_d,
      respuesta_correcta: trivia.respuesta_correcta,
      categoria: trivia.categoria || 'General'
    });
  };

  const resetForm = () => {
    setEditingTrivia(null);
    setForm({
      pregunta: '',
      opcion_a: '',
      opcion_b: '',
      opcion_c: '',
      opcion_d: '',
      respuesta_correcta: 'a',
      categoria: 'Mundial 2026'
    });
  };

  const eliminarTrivia = async (id: number) => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar Pregunta?',
      text: "Esta acción borrará la trivia del sistema de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      // 💡 CORREGIDO: Apuntando a la tabla 'trivia'
      const { error } = await supabase
        .from('trivia')
        .delete()
        .eq('id', id);

      if (error) throw error;

      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'La pregunta fue removida.', background: '#0a0a0a', color: '#fff', timer: 1500, showConfirmButton: false });
      cargarTrivias();
    } catch (error: any) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Fallo al borrar', text: error.message, background: '#0a0a0a', color: '#fff' });
    }
  };

  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', color: '#fff', minHeight: '80vh' }}>
      <h2 style={{ margin: 0, color: '#eab308', fontSize: '22px' }}>🧠 Centro de Control de Trivias - Boogol IA</h2>
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '25px' }}>
        Administra las preguntas que la IA de los cromos usará para desafiar a los usuarios y regalar monedas virtuales.
      </p>

      {/* --- FORMULARIO DE CREACIÓN / EDICIÓN --- */}
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 15px 0', color: editingTrivia ? '#3b82f6' : '#22c55e', fontSize: '16px' }}>
          {editingTrivia ? `📝 Editando Trivia ID: #${editingTrivia.id}` : '➕ Agregar Nueva Trivia'}
        </h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Enunciado de la Pregunta:</label>
          <textarea name="pregunta" value={form.pregunta} onChange={handleChange} rows={2} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px', resize: 'vertical', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Ej: ¿Qué país organizó el primer mundial de la FIFA en 1930?" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Opción A:</label>
            <input type="text" name="opcion_a" value={form.opcion_a} onChange={handleChange} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Opción B:</label>
            <input type="text" name="opcion_b" value={form.opcion_b} onChange={handleChange} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Opción C:</label>
            <input type="text" name="opcion_c" value={form.opcion_c} onChange={handleChange} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Opción D:</label>
            <input type="text" name="opcion_d" value={form.opcion_d} onChange={handleChange} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Letra de la Respuesta Correcta:</label>
            <select name="respuesta_correcta" value={form.respuesta_correcta} onChange={handleChange} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box', cursor: 'pointer' }}>
              <option value="a">Opción A</option>
              <option value="b">Opción B</option>
              <option value="c">Opción C</option>
              <option value="d">Opción D</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Categoría / Grupo:</label>
            <input type="text" name="categoria" value={form.categoria || ''} onChange={handleChange} placeholder="Ej: Historia, Brasil, Grupo A" style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {editingTrivia && (
            <button type="button" onClick={resetForm} style={{ background: '#475569', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancelar Edición
            </button>
          )}
          <button type="submit" style={{ background: editingTrivia ? '#3b82f6' : '#22c55e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingTrivia ? '💾 Guardar Cambios' : '🚀 Publicar Pregunta'}
          </button>
        </div>
      </form>

      {/* --- TABLA DE LISTADO DE TRIVIAS --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#eab308', fontWeight: 'bold' }}>
          🔄 Sincronizando banco de preguntas desde Supabase...
        </div>
      ) : trivias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          No hay preguntas de trivia creadas. ¡Sé el primero en agregar una arriba!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                <th style={{ padding: '12px', width: '60px' }}>ID</th>
                <th style={{ padding: '12px' }}>Categoría</th>
                <th style={{ padding: '12px', width: '40%' }}>Pregunta / Enunciado</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Correcta</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trivias.map((trivia) => (
                <tr key={trivia.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#94a3b8' }}>#{trivia.id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {trivia.categoria || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{trivia.pregunta}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ background: '#16a34a', color: '#fff', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {trivia.respuesta_correcta}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => iniciarEdicion(trivia)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => trivia.id && eliminarTrivia(trivia.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        🗑️ Borrar
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

export default TriviaManager;