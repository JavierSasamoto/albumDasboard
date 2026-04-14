import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar'; // Asegúrate de que el nombre coincida
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios';
import Cromos from './components/Cromos';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <form onSubmit={handleLogin} className="bg-gray-900 p-10 rounded-xl w-80 text-center border border-gray-800">
          <h1 className="text-yellow-400 text-2xl font-bold mb-6 tracking-tighter">BOOGOL ADMIN</h1>
          <input 
            type="email" placeholder="Email" 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 mb-3 bg-black border border-gray-700 rounded text-white focus:border-yellow-400 outline-none" 
          />
          <input 
            type="password" placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 mb-6 bg-black border border-gray-700 rounded text-white focus:border-yellow-400 outline-none" 
          />
          <button type="submit" className="w-full p-3 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-500 transition-colors">
            ENTRAR
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* SIDEBAR NUEVO */}
      <Sidebar currentView={activeTab} onNavigate={setActiveTab} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold capitalize tracking-tight">
              {activeTab.replace(/-/g, ' ')}
            </h1>
            <p className="text-gray-500 text-sm">Gestión del sistema BOOGOL Mundial 2026</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              {session.user.email}
            </span>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-xs font-bold text-red-500 hover:bg-red-500/10 px-3 py-1 rounded transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* RENDERIZADO DE VISTAS */}
        <div className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'usuarios' && <Usuarios />}
          {activeTab === 'gestion-cromos' && <Cromos />}
          
          {/* Secciones en desarrollo con un diseño más atractivo */}
          {!['dashboard', 'usuarios', 'gestion-cromos'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
              <div className="bg-gray-800 p-4 rounded-full mb-4">
                <span className="text-4xl text-gray-600">🚧</span>
              </div>
              <h2 className="text-xl font-bold text-gray-300">Sección en construcción</h2>
              <p className="text-gray-500">Estamos preparando el módulo de <b>{activeTab.replace(/-/g, ' ')}</b></p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}