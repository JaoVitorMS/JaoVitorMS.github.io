import { useState } from 'react';
import PresenceForm from './components/PresenceForm';
import GameList from './components/GameList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('form');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Meu Site</h1>
        <p>Bem-vindo!</p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Formulário de Presença
        </button>
        <button
          className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Lista de Jogo
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'form' && <PresenceForm />}
        {activeTab === 'list' && <GameList />}
      </main>
    </div>
  );
}

export default App;
