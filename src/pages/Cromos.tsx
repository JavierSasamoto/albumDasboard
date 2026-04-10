import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Search, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Cromo } from '../types/database';

type CategoriaType = 'Jugador' | 'Estadio' | 'Selección' | 'Grupo';
type RarezaType = 'Común' | 'Inusual' | 'Raro' | 'Épico' | 'Legendario' | 'Único';

interface JsonbField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
}

const JSONB_SCHEMAS: Record<CategoriaType, JsonbField[]> = {
  Jugador: [
    { key: 'posicion', label: 'Posición', type: 'text' },
    { key: 'dorsal', label: 'Dorsal', type: 'number' },
    { key: 'altura', label: 'Altura (cm)', type: 'number' },
    { key: 'peso', label: 'Peso (kg)', type: 'number' },
    { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date' },
    { key: 'pierna_habil', label: 'Pierna Hábil', type: 'text' },
    { key: 'goles', label: 'Goles', type: 'number' },
    { key: 'asistencias', label: 'Asistencias', type: 'number' },
  ],
  Estadio: [
    { key: 'capacidad', label: 'Capacidad', type: 'number' },
    { key: 'ciudad', label: 'Ciudad', type: 'text' },
    { key: 'año_construccion', label: 'Año de Construcción', type: 'number' },
    { key: 'superficie', label: 'Superficie', type: 'text' },
  ],
  Selección: [
    { key: 'grupo', label: 'Grupo', type: 'text' },
    { key: 'entrenador', label: 'Entrenador', type: 'text' },
    { key: 'mundiales_ganados', label: 'Mundiales Ganados', type: 'number' },
    { key: 'ranking_fifa', label: 'Ranking FIFA', type: 'number' },
  ],
  Grupo: [
    { key: 'equipos', label: 'Equipos', type: 'text' },
    { key: 'sede_principal', label: 'Sede Principal', type: 'text' },
  ],
};

export default function Cromos() {
  const [cromos, setCromos] = useState<Cromo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCromo, setEditingCromo] = useState<Cromo | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    nombre_cromo: '',
    nombres: '',
    apodo: '',
    categoria: 'Jugador' as CategoriaType,
    sub_categoria: '',
    pais: '',
    seleccion: '',
    rareza: 'Común' as RarezaType,
    url_imagen: '',
    url_video_ra: '',
    url_target_ra: '',
    url_animacion: '',
    informacion_tecnica: {} as Record<string, any>,
  });

  useEffect(() => {
    loadCromos();
  }, []);

  const loadCromos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cromos_info')
      .select('*')
      .order('id', { ascending: true });

    if (data) setCromos(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      informacion_tecnica: formData.informacion_tecnica,
    };

    if (editingCromo) {
      await supabase.from('cromos_info').update(payload).eq('id', editingCromo.id);
    } else {
      await supabase.from('cromos_info').insert([payload]);
    }

    await loadCromos();
    closeModal();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este cromo?')) {
      await supabase.from('cromos_info').delete().eq('id', id);
      await loadCromos();
    }
  };

  const openModal = (cromo?: Cromo) => {
    if (cromo) {
      setEditingCromo(cromo);
      setFormData({
        id: cromo.id,
        nombre_cromo: cromo.nombre_cromo,
        nombres: cromo.nombres,
        apodo: cromo.apodo || '',
        categoria: cromo.categoria as CategoriaType,
        sub_categoria: cromo.sub_categoria || '',
        pais: cromo.pais || '',
        seleccion: cromo.seleccion || '',
        rareza: cromo.rareza,
        url_imagen: cromo.url_imagen || '',
        url_video_ra: cromo.url_video_ra || '',
        url_target_ra: cromo.url_target_ra || '',
        url_animacion: cromo.url_animacion || '',
        informacion_tecnica: cromo.informacion_tecnica || {},
      });
    } else {
      setEditingCromo(null);
      setFormData({
        id: 0,
        nombre_cromo: '',
        nombres: '',
        apodo: '',
        categoria: 'Jugador',
        sub_categoria: '',
        pais: '',
        seleccion: '',
        rareza: 'Común',
        url_imagen: '',
        url_video_ra: '',
        url_target_ra: '',
        url_animacion: '',
        informacion_tecnica: {},
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCromo(null);
  };

  const handleJsonbChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      informacion_tecnica: {
        ...prev.informacion_tecnica,
        [key]: value,
      },
    }));
  };

  const filteredCromos = cromos.filter(
    (cromo) =>
      cromo.nombre_cromo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cromo.nombres.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rarityColors: Record<RarezaType, string> = {
    Común: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    Inusual: 'bg-green-500/20 text-green-400 border-green-500/30',
    Raro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Épico: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Legendario: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Único: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestión de Cromos
          </h1>
          <p className="text-zinc-400">
            Administra el catálogo completo de cromos
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-500/20"
        >
          <Plus size={20} />
          <span>Nuevo Cromo</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar cromos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">
                  Categoría
                </th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">
                  País
                </th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">
                  Rareza
                </th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCromos.map((cromo) => (
                <tr
                  key={cromo.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-white">{cromo.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">
                        {cromo.nombre_cromo}
                      </p>
                      <p className="text-sm text-zinc-400">{cromo.nombres}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    {cromo.categoria}
                  </td>
                  <td className="py-3 px-4 text-zinc-300">{cromo.pais}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        rarityColors[cromo.rareza]
                      }`}
                    >
                      {cromo.rareza}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(cromo)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cromo.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-yellow-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingCromo ? 'Editar Cromo' : 'Nuevo Cromo'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="text-zinc-400" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    ID del Cromo *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Nombre del Cromo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_cromo}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre_cromo: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Nombres Completos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) =>
                      setFormData({ ...formData, nombres: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Apodo
                  </label>
                  <input
                    type="text"
                    value={formData.apodo}
                    onChange={(e) =>
                      setFormData({ ...formData, apodo: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        categoria: e.target.value as CategoriaType,
                        informacion_tecnica: {},
                      });
                    }}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Jugador">Jugador</option>
                    <option value="Estadio">Estadio</option>
                    <option value="Selección">Selección</option>
                    <option value="Grupo">Grupo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Rareza *
                  </label>
                  <select
                    required
                    value={formData.rareza}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rareza: e.target.value as RarezaType,
                      })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Común">Común</option>
                    <option value="Inusual">Inusual</option>
                    <option value="Raro">Raro</option>
                    <option value="Épico">Épico</option>
                    <option value="Legendario">Legendario</option>
                    <option value="Único">Único</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) =>
                      setFormData({ ...formData, pais: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Selección
                  </label>
                  <input
                    type="text"
                    value={formData.seleccion}
                    onChange={(e) =>
                      setFormData({ ...formData, seleccion: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Información Técnica ({formData.categoria})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {JSONB_SCHEMAS[formData.categoria].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={formData.informacion_tecnica[field.key] || ''}
                        onChange={(e) =>
                          handleJsonbChange(field.key, e.target.value)
                        }
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Assets de Realidad Aumentada
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      URL Imagen
                    </label>
                    <input
                      type="url"
                      value={formData.url_imagen}
                      onChange={(e) =>
                        setFormData({ ...formData, url_imagen: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      URL Video RA
                    </label>
                    <input
                      type="url"
                      value={formData.url_video_ra}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url_video_ra: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      URL Target RA
                    </label>
                    <input
                      type="url"
                      value={formData.url_target_ra}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url_target_ra: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      URL Animación
                    </label>
                    <input
                      type="url"
                      value={formData.url_animacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url_animacion: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
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
