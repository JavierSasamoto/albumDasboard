import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Image,
  Users,
  CreditCard,
  Trophy,
  HelpCircle,
  Bell,
  FileText,
  Menu,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  icon: typeof LayoutDashboard;
  href: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: 'dashboard' },
  { name: 'Cromos', icon: Image, href: 'cromos' },
  { name: 'Usuarios', icon: Users, href: 'usuarios' },
  { name: 'Pagos', icon: CreditCard, href: 'pagos' },
  { name: 'Ranking', icon: Trophy, href: 'ranking' },
  { name: 'Trivia', icon: HelpCircle, href: 'trivia' },
  { name: 'Notificaciones', icon: Bell, href: 'notificaciones' },
  { name: 'Auditoría', icon: FileText, href: 'auditoria' },
];

export default function Layout({ children }: LayoutProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-zinc-900 to-black border-b border-yellow-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Backoffice ⚽
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-zinc-800 text-yellow-400 hover:bg-zinc-700 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-zinc-900 via-black to-zinc-900 border-r border-yellow-500/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-yellow-500/20">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Backoffice ⚽
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Panel de Administración</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setCurrentView(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 shadow-lg shadow-yellow-500/10 border border-yellow-500/30'
                      : 'text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-yellow-500/20">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-400">Sistema v1.0</p>
              <p className="text-xs text-yellow-500 mt-1">Álbum Mundial 2026</p>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="min-h-screen p-4 lg:p-8">
          {children({ currentView })}
        </main>
      </div>
    </div>
  );
}
