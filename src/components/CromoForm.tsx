import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Cromo, Rareza } from '../lib/supabase';

interface CromoFormProps {
  cromo?: Cromo | null;
  onSave: (data: Partial<Cromo>) => void;
  onClose: () => void;
}

const rarezaOptions: Rareza[] = ['Común', 'Inusual', 'Raro', 'Épico', 'Legendario', 'Único'];

const rarezaColors: Record<Rareza, string> = {
  'Común': 'bg-gray-500',
  'Inusual': 'bg-green-500',
  'Raro': 'bg-blue-500',
  'Épico': 'bg-purple-500',
  'Legendario': 'bg-orange-500',
  'Único': 'bg-yellow-500',
};

export default function CromoForm({ cromo, onSave, onClose }: CromoFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    seleccion: '',
    rareza: 'Común' as Rareza,
    imagen_url: '',
  });

  useEffect(() => {
    if (cromo) {
      setFormData({
        nombre: cromo.nombre,
        seleccion: cromo.seleccion,
        rareza: cromo.rareza,
        imagen_url: cromo.imagen_url,
      });
    }
  }, [cromo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {cromo ? 'Editar Cromo' : 'Añadir Cromo'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="Nombre del cromo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selección
            </label>
            <input
              type="text"
              value={formData.seleccion}
              onChange={(e) => setFormData({ ...formData, seleccion: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="Selección o categoría"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rareza
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rarezaOptions.map((rareza) => (
                <button
                  key={rareza}
                  type="button"
                  onClick={() => setFormData({ ...formData, rareza })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.rareza === rareza
                      ? `${rarezaColors[rareza]} text-white`
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {rareza}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL de Imagen
            </label>
            <input
              type="text"
              value={formData.imagen_url}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="nombre-del-archivo.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo el nombre del archivo. Se añadirá automáticamente la ruta del bucket.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              {cromo ? 'Guardar Cambios' : 'Añadir Cromo'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
