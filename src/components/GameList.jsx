import { useState, useEffect } from "react";
import "./GameList.css";

export default function GameList() {
  const [players, setPlayers] = useState([]);
  const STORAGE_KEY = "gamePlayerList";
  // Provided by user:
  const SHEET_ID = "1vU_mmjVqvlFky3kzztEvH21gZXnpxniQ1FxiJICg8mI";
  const SHEET_GID = "613547221"; // specific sheet tab
  // Google Form URL para adicionar presença
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdJmaOF2rFS5T_O4nYXD6md7D2bN3UB_HMrC39wgVvu6eRNlg/viewform";

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
        // assumes first column contains player names, second column optional status
        const sheetPlayers = rows
          .map((r, idx) => ({
            name: (r.c[0] && r.c[0].v) || "",
            status: (r.c[1] && r.c[1].v) || "",
            id: idx, // use index as id (simple and clean)
          }))
          .filter((p) => p.name);
        if (sheetPlayers.length) setPlayers(sheetPlayers);
      } catch (err) {
        console.error("Erro ao carregar sheet:", err);
      }
    };

    load();
  }, []);

  return (
    <div className="game-list-container">
      <div className="game-list-background" />

      <div className="game-list-content">
        <div className="game-list-header">
          <h1>Lista de Jogo</h1>
          <p>Jogadores confirmados</p>
        </div>

        <div className="game-list-card">
          <div className="game-list-counter">
            <span className="game-list-counter-label">Jogadores na fila:</span>
            <span className="game-list-counter-value">{players.length}</span>
          </div>

          <div className="game-list-list">
            {players.length === 0 ? (
              <div className="game-list-empty-state">
                <div className="game-list-empty-state-icon">📋</div>
                <div className="game-list-empty-state-text">Lista vazia</div>
              </div>
            ) : (
              players.map((player, index) => (
                <div key={player.id} className="game-list-item">
                  <span className="game-list-item-index">{index + 1}</span>
                  <span className="game-list-item-name">{player.name}</span>
                  {player.status && (
                    <span className="game-list-item-status">{player.status}</span>
                  )}
                </div>
              ))
            )}
          </div>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="game-list-btn-add-form"
          >
            ✋ Confirmar Presença via Formulário
          </a>
        </div>
      </div>
    </div>
  );
}
