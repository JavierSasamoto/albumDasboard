import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Trivia as TriviaType } from '../types/database';

export default function Trivia() {
  const [trivias, setTrivias] = useState<TriviaType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrivia, setEditingTrivia] = useState<TriviaType | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pregunta: '',
    opcion_a: '',
    opcion_b: '',
    opcion_c: '',
    opcion_d: '',
    respuesta_correcta: '',
    categoria: 'futbol',
  });

  useEffect(() => {
    loadTrivias();
  }, []);

  const loadTrivias = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trivia')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setTrivias(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingTrivia) {
      await supabase.from('trivia').update(formData).eq('id', editingTrivia.id);
    } else {
      await supabase.from('trivia').insert([formData]);
    }

    await loadTrivias();
    closeModal();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      await supabase.from('trivia').delete().eq('id', id);
      await loadTrivias();
    }
  };

  const openModal = (trivia?: TriviaType) => {
    if (trivia) {
      setEditingTrivia(trivia);
      setFormData({
        pregunta: trivia.pregunta,
        opcion_a: trivia.opcion_a,
        opcion_b: trivia.opcion_b,
        opcion_c: trivia.opcion_c,
        opcion_d: trivia.opcion_d,
        respuesta_correcta: trivia.respuesta_correcta,
        categoria: trivia.categoria,
      });
    } else {
      setEditingTrivia(null);
      setFormData({
        pregunta: '',
        opcion_a: '',
        opcion_b: '',
        opcion_c: '',
        opcion_d: '',
        respuesta_correcta: '',
        categoria: 'futbol',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrivia(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestión de Trivia
          </h1>
          <p className="text-zinc-400">
            Administra las preguntas del sistema de trivia
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-500/20"
        >
          <Plus size={20} />
          <span>Nueva Pregunta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trivias.map((trivia, index) => (
          <div
            key={trivia.id}
            className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                    #{index + 1}
                  </span>
                  <span className="text-zinc-400 text-sm">
                    {trivia.categoria}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {trivia.pregunta}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      trivia.respuesta_correcta === 'A'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-zinc-400 text-sm">A)</span>{' '}
                    <span className="text-white">{trivia.opcion_a}</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      trivia.respuesta_correcta === 'B'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-zinc-400 text-sm">B)</span>{' '}
                    <span className="text-white">{trivia.opcion_b}</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      trivia.respuesta_correcta === 'C'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-zinc-400 text-sm">C)</span>{' '}
                    <span className="text-white">{trivia.opcion_c}</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      trivia.respuesta_correcta === 'D'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-zinc-400 text-sm">D)</span>{' '}
                    <span className="text-white">{trivia.opcion_d}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => openModal(trivia)}
                  className="p-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(trivia.id)}
                  className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-yellow-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingTrivia ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="text-zinc-400" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Pregunta *
                </label>
                <textarea
                  required
                  value={formData.pregunta}
                  onChange={(e) =>
                    setFormData({ ...formData, pregunta: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Opción A *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.opcion_a}
                    onChange={(e) =>
                      setFormData({ ...formData, opcion_a: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Opción B *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.opcion_b}
                    onChange={(e) =>
                      setFormData({ ...formData, opcion_b: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Opción C *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.opcion_c}
                    onChange={(e) =>
                      setFormData({ ...formData, opcion_c: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Opción D *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.opcion_d}
                    onChange={(e) =>
                      setFormData({ ...formData, opcion_d: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Respuesta Correcta *
                </label>
                <select
                  required
                  value={formData.respuesta_correcta}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      respuesta_correcta: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Selecciona la respuesta correcta</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all"
                >
                  <Save size={20} />
                  <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
