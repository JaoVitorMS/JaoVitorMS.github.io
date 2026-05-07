import { useState, useEffect } from "react";
import PresenceForm from "./PresenceForm";
import "./GameList.css";

export default function GameList() {
  const [players, setPlayers] = useState([]);
  
  // TODO: Obter informações de dia, hora e preço
  // Dia: ?
  // Hora: ?
  // Preço: ?
  const gameInfo = {
    day: "Sexta-feira 8 de Maio",
    time: "22h30+",
    price: "R$120 - R$12 se tiver 10 pessoas",
  };
  
  // Provided by user:
  const SHEET_ID = "1vU_mmjVqvlFky3kzztEvH21gZXnpxniQ1FxiJICg8mI";
  const SHEET_GID = "613547221"; // specific sheet tab

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
          .map((r) => {
            // Try to find a valid name (not a Date() and not empty)
            let name = "";
            let status = "";

            // Look through columns to find name and status
            for (let i = 0; i < r.c.length; i++) {
              const val = (r.c[i] && r.c[i].v) || "";

              // Skip if it's a Date value
              if (typeof val === "string" && val.startsWith("Date(")) {
                continue;
              }

              // Skip empty values
              if (!val || val.trim() === "") {
                continue;
              }

              // First valid non-date value is the name
              if (!name) {
                name = String(val).trim();
              } else if (!status) {
                // Second valid value is status
                status = String(val).trim();
                break;
              }
            }

            return { name, status, id: name || Math.random() };
          })
          .filter((p) => p.name && !p.name.startsWith("Date("));
        if (sheetPlayers.length) setPlayers(sheetPlayers);
      } catch (err) {
        console.error("Erro ao carregar sheet:", err);
      }
    };

    load();
  }, []);

  const handleAddPlayer = (newName) => {
    const newPlayer = {
      name: newName,
      status: "Pendente (atualize para fixar)",
      id: `temp-${Date.now()}`,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  return (
    <div className="game-list-container">
      <div className="game-list-background" />

      <div className="game-list-content">
        <div className="game-list-header">
          <h1>Lista de Jogo</h1>
          <div className="game-info">
            <p className="game-info-label">Dia: <span className="game-info-value">{gameInfo.day}</span></p>
            <p className="game-info-label">Hora: <span className="game-info-value">{gameInfo.time}</span></p>
            <p className="game-info-label">Preço: <span className="game-info-value">{gameInfo.price}</span></p>
          </div>
        </div>

        <div className="game-list-card">
          {/* Form para adicionar presença */}
          <PresenceForm onSuccess={handleAddPlayer} />
          
          {/* Contador de jogadores */}
          <div className="game-list-counter">
            <span className="game-list-counter-label">Lista de confirmados:</span>
            <span className="game-list-counter-value">{players.length}</span>
          </div>

          {/* Lista de jogadores */}
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
                  {player.status && (
                    <span className="game-list-item-status">
                      {player.status}
                    </span>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
