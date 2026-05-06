import { useState, useEffect } from "react";
import "./GameList.css";

export default function GameList() {
  const [players, setPlayers] = useState([]);
  const [input, setInput] = useState("");
  const STORAGE_KEY = "gamePlayerList";
  // Optional: set your public Google Sheet ID here to load players from a sheet.
  // Make sure the sheet is published to web or is publicly viewable.
  // Example: const SHEET_ID = '1aBcD...';
  // Provided by user:
  const SHEET_ID = "1vU_mmjVqvlFky3kzztEvH21gZXnpxniQ1FxiJICg8mI";
  const SHEET_GID = "613547221"; // specific sheet tab

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPlayers(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!SHEET_ID) return;
    const load = async () => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;
        const res = await fetch(url);
        const text = await res.text();
        const jsonText = text.match(/setResponse\((.*)\);/s)?.[1];
        if (!jsonText) return;
        const data = JSON.parse(jsonText);
        const rows = data.table.rows || [];
        const sheetPlayers = rows
          .map((r) => ({
            name: (r.c[0] && r.c[0].v) || "",
            id: Date.now() + Math.random(),
          }))
          .filter((p) => p.name);
        if (sheetPlayers.length) setPlayers(sheetPlayers);
      } catch (err) {
        // silent fail — keep local players
        console.error("Erro ao carregar sheet:", err);
      }
    };

    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  const addPlayer = () => {
    const name = input.trim();

    if (!name) return;

    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert("Este jogador já está na lista!");
      return;
    }

    setPlayers([...players, { name, id: Date.now() }]);
    setInput("");
  };

  const removePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    if (confirm("Tem certeza que quer limpar toda a lista?")) {
      setPlayers([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  return (
    <div className="game-list-container">
      <div className="game-list-background" />

      <div className="game-list-content">
        <div className="game-list-header">
          <h1>Lista de Jogo</h1>
          <p>Adicione seu nome aqui</p>
        </div>

        <div className="game-list-card">
          <div className="game-list-input-group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Seu nome..."
              autoComplete="off"
              className="game-list-input"
            />
            <button onClick={addPlayer} className="game-list-btn-add">
              Entrar
            </button>
          </div>

          <div className="game-list-counter">
            <span className="game-list-counter-label">Jogadores na fila:</span>
            <span className="game-list-counter-value">{players.length}</span>
          </div>

          <div className="game-list-list">
            {players.length === 0 ?
              <div className="game-list-empty-state">
                <div className="game-list-empty-state-icon">📋</div>
                <div className="game-list-empty-state-text">Lista vazia</div>
              </div>
            : players.map((player, index) => (
                <div key={player.id} className="game-list-item">
                  <span className="game-list-item-index">{index + 1}</span>
                  <span className="game-list-item-name">{player.name}</span>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="game-list-btn-remove"
                  >
                    Remover
                  </button>
                </div>
              ))
            }
          </div>

          <button onClick={clearAll} className="game-list-btn-clear">
            Limpar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
