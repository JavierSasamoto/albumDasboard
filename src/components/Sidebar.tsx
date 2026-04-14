import { 
  LayoutDashboard, Image, Users, Brain, Download, BookOpen, 
  Coins, CreditCard, Trophy, Globe, MessageSquare, History, 
  TrendingUp, ShoppingCart, Mail, MessageCircle, BarChart3, 
  Settings, PlaySquare, ListOrdered
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const menuGroups = [
  {
    group: "General",
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    group: "Gestión del Álbum",
    items: [
      { id: 'usuarios', label: 'Usuarios', icon: Users },
      { id: 'gestion-cromos', label: 'Gestión de Cromos', icon: Image },
      { id: 'control-descargas', label: 'Control Descargas', icon: Download },
      { id: 'control-albumes', label: 'Control Álbumes', icon: BookOpen },
      { id: 'transacciones', label: 'Control Transacciones', icon: CreditCard },
      { id: 'monedas', label: 'Control Monedas', icon: Coins },
      { id: 'premios', label: 'Control Premios', icon: Trophy },
      { id: 'trivias', label: 'Trivias Álbum', icon: Brain },
    ]
  },
  {
    group: "Sitio Web",
    items: [
      { id: 'lista-espera', label: 'Lista de Espera', icon: ListOrdered },
      { id: 'blog', label: 'Gestión Blog', icon: Globe },
      { id: 'historia', label: 'Gestión Historia', icon: History },
      { id: 'memes', label: 'Gestión Memes', icon: MessageSquare },
      { id: 'video-estadisticas', label: 'Estadísticas (Videos)', icon: PlaySquare }, // Movido aquí
      { id: 'ranking', label: 'Ranking', icon: TrendingUp },
      { id: 'tienda', label: 'Tienda', icon: ShoppingCart },
    ]
  },
  {
    group: "Marketing & Data",
    items: [
      { id: 'campana-email', label: 'Campaña Email', icon: Mail },
      { id: 'campana-whatsapp', label: 'Campaña WhatsApp', icon: MessageCircle },
      { id: 'estadisticas-marketing', label: 'Análisis de Datos', icon: BarChart3 },
    ]
  },
  {
    group: "Sistema",
    items: [
      { id: 'configuracion', label: 'Configuración', icon: Settings },
    ]
  }
];

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen fixed left-0 top-0 overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <h1 className="text-xl font-bold text-yellow-400 tracking-tight">BOOGOL ADMIN</h1>
      </div>

      <div className="p-4 pb-12">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              {group.group}
            </h2>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-yellow-400 text-gray-900 font-bold shadow-lg shadow-yellow-400/10'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-yellow-400'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}