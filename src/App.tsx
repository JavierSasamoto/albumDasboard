import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cromos from './components/Cromos';
import Inventario from './components/Inventario';
import Usuarios from './components/Usuarios';
import Trivia from './components/Trivia';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'cromos':
        return <Cromos />;
      case 'inventario':
        return <Inventario />;
      case 'usuarios':
        return <Usuarios />;
      case 'trivia':
        return <Trivia />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="ml-64 p-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
