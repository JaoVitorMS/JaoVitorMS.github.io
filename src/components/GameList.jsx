import { useState, useEffect } from "react";
import PresenceForm from "./PresenceForm";
import "./GameList.css";

export default function GameList() {
  const gameInfo = {
    day: "Sexta-feira 8 de Maio",
    time: "22h30+",
    local: "Planet Ball",
    quadra: "5",
    totalPrice: 120,
    hiredGoaliePrice: 0, // Adicione o valor aqui quando houver goleiro de aluguel
  };
  
  // Provided by user:
  const SHEET_ID = "1vU_mmjVqvlFky3kzztEvH21gZXnpxniQ1FxiJICg8mI";
  const SHEET_GID = "613547221"; // specific sheet tab

  const [players, setPlayers] = useState([]);
  
  // Cálculo do preço por pessoa
  const totalPlayersCount = players.length;
  const finalTotal = gameInfo.totalPrice + (gameInfo.hiredGoaliePrice || 0);
  const pricePerPlayer = totalPlayersCount > 0 ? (finalTotal / totalPlayersCount).toFixed(2) : 0;

  useEffect(() => {
    if (!SHEET_ID) return;
    
    const load = async () => {
      try {
        // Cache busting: adicionar timestamp para garantir dados frescos
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}&t=${Date.now()}`;
        const res = await fetch(url);
        const text = await res.text();
        const jsonText = text.match(/setResponse\((.*)\);/s)?.[1];
        if (!jsonText) return;
        const data = JSON.parse(jsonText);
        const rows = data.table.rows || [];
        // assumes first column contains player names, second column optional status
        const sheetPlayers = rows
          .map((r) => {
            // Mapping columns:
            // Column 0: Timestamp (ignore)
            // Column 1: Name
            // Column 2: Status (Pago, Não-Pago, Goleiro, etc.)
            
            const getName = (cell) => (cell && cell.v) ? String(cell.v).trim() : "";
            const getStatus = (cell) => (cell && cell.v) ? String(cell.v).trim() : "";

            const name = getName(r.c[1]);
            const rawStatus = getStatus(r.c[2]);
            
            const lowerStatus = rawStatus.toLowerCase();
            const isPaid = lowerStatus === "pago";
            
            // "status" para informações extras que não sejam apenas "pago"
            let status = "";
            if (lowerStatus !== "pago" && lowerStatus !== "não-pago" && lowerStatus !== "nao-pago") {
              status = rawStatus;
            }

            return { 
              name, 
              isPaid, 
              status,
              id: name || Math.random() 
            };
          })
          .filter((p) => p.name && !p.name.startsWith("Date("));
        
        if (sheetPlayers.length) {
          setPlayers(sheetPlayers);
        }
      } catch (err) {
        console.error("Erro ao carregar sheet:", err);
      }
    };

    load();

    // Atualização automática a cada 30 segundos
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPlayer = (newName) => {
    const newPlayer = {
      name: newName,
      status: "(atualize para fixar)",
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
            <p className="game-info-label">Local: <span className="game-info-value">{gameInfo.local}</span></p>
            <p className="game-info-label">Tipo de quadra: <span className="game-info-value">{gameInfo.quadra}</span></p>
            <p className="game-info-label">Preço Total: <span className="game-info-value">R${gameInfo.totalPrice}</span></p>
            {gameInfo.hiredGoaliePrice > 0 && (
              <p className="game-info-label">Goleiro de aluguel: <span className="game-info-value">R${gameInfo.hiredGoaliePrice}</span></p>
            )}
          </div>
        </div>

        <div className="game-list-card">
          {/* Form para adicionar presença */}
          <PresenceForm onSuccess={handleAddPlayer} />
          
          {/* Contador de jogadores */}
          <div className="game-list-counter">
            <div className="game-list-counter-info">
              <span className="game-list-counter-label">Confirmados:</span>
              <span className="game-list-counter-value">{totalPlayersCount}</span>
            </div>
            <div className="game-list-price-badge">
              R${pricePerPlayer}/pessoa
            </div>
          </div>

          {/* Lista de jogadores */}
          <div className="game-list-list">
            {players.length === 0 ?
              <div className="game-list-empty-state">
                <div className="game-list-empty-state-icon">📋</div>
                <div className="game-list-empty-state-text">Lista vazia</div>
              </div>
            : (
              <>
                {players.map((player, index) => (
                  <div key={player.id} className={`game-list-item ${player.isPaid ? 'is-paid' : ''}`}>
                    <span className="game-list-item-index">{index + 1}</span>
                    <div className="game-list-item-info">
                      <span className="game-list-item-name">{player.name}</span>
                    </div>
                    <div className="game-list-item-tags">
                      {player.isPaid ? (
                        <span className="status-tag paid">Pago</span>
                      ) : (
                        <span className="status-tag unpaid">Pendente</span>
                      )}
                      {player.status && !player.isPaid && (
                        <span className="game-list-item-status">
                          {player.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
