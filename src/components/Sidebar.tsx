import { LayoutDashboard, Image, Package, Users, Brain } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cromos', label: 'Cromos', icon: Image },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'trivia', label: 'Trivia', icon: Brain },
];

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-yellow-400">Álbum Dashboard</h1>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-yellow-400 text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
