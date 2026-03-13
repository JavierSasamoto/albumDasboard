import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Calendar } from 'lucide-react';
import { supabase, Cromo, Rareza } from '../lib/supabase';
import CromoForm from './CromoForm';

const BUCKET_BASE_URL = 'https://gmwwnjxglvzsasbasyra.supabase.co/storage/v1/object/public/cromos/';

const rarezaColors: Record<Rareza, string> = {
  'Común': 'bg-gray-500',
  'Inusual': 'bg-green-500',
  'Raro': 'bg-blue-500',
  'Épico': 'bg-purple-500',
  'Legendario': 'bg-orange-500',
  'Único': 'bg-yellow-500',
};

export default function Cromos() {
  const [cromos, setCromos] = useState<Cromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCromo, setEditingCromo] = useState<Cromo | null>(null);

  useEffect(() => {
    loadCromos();
  }, []);

  const loadCromos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cromos_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCromos(data || []);
    } catch (error) {
      console.error('Error loading cromos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Cromo>) => {
    try {
      if (editingCromo) {
        const { error } = await supabase
          .from('cromos_info')
          .update(data)
          .eq('id', editingCromo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cromos_info')
          .insert([data]);

        if (error) throw error;
      }

      await loadCromos();
      setShowForm(false);
      setEditingCromo(null);
    } catch (error) {
      console.error('Error saving cromo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cromo?')) return;

    try {
      const { error } = await supabase
        .from('cromos_info')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCromos();
    } catch (error) {
      console.error('Error deleting cromo:', error);
    }
  };

  const handleEdit = (cromo: Cromo) => {
    setEditingCromo(cromo);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCromo(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getImageUrl = (imagenUrl: string) => {
    if (!imagenUrl) return 'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=400';
    if (imagenUrl.startsWith('http')) return imagenUrl;
    return `${BUCKET_BASE_URL}${imagenUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando cromos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Gestión de Cromos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Añadir Cromo
        </button>
      </div>

      {cromos.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-lg mb-4">No hay cromos disponibles</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Añadir tu primer cromo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cromos.map((cromo) => (
            <div
              key={cromo.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-400/50 transition-all group"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                <img
                  src={getImageUrl(cromo.imagen_url)}
                  alt={cromo.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className={`absolute top-3 right-3 ${rarezaColors[cromo.rareza]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {cromo.rareza}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 truncate">
                  {cromo.nombre}
                </h3>
                {cromo.seleccion && (
                  <p className="text-sm text-gray-400 mb-3 truncate">
                    {cromo.seleccion}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar size={14} />
                  {formatDate(cromo.created_at)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cromo)}
                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cromo.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CromoForm
          cromo={editingCromo}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
