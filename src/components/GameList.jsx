import { useState, useEffect } from "react";
import PresenceForm from "./PresenceForm";
import "./GameList.css";

export default function GameList() {
  const gameInfo = {
    day: "Sexta-feira 8 de Maio",
    time: "22h30+",
    totalPrice: 120,
  };
  
  // Provided by user:
  const SHEET_ID = "1vU_mmjVqvlFky3kzztEvH21gZXnpxniQ1FxiJICg8mI";
  const SHEET_GID = "613547221"; // specific sheet tab

  const [players, setPlayers] = useState([]);
  
  // Cálculo do preço por pessoa
  // Goleiros entram no rateio se estiverem na lista. 
  // O usuário mencionou: "campo goleiro que por enquanto ele ficar como nao, mas se eu mudar ele deve entrar no price total"
  // Interpretamos que se estiver na lista e for goleiro, por padrão pode não pagar, 
  // mas se o dono da planilha mudar algo, ele entra.
  // Para simplificar: Preço Total / (Jogadores que não são goleiros + Goleiros que devem pagar)
  const nonGoalies = players.filter(p => !p.isGoalie).length;
  const payingGoalies = players.filter(p => p.isGoalie && p.isPaid).length; // Se o goleiro está marcado como 'Pago', ele entra no rateio
  
  const totalPayers = nonGoalies + payingGoalies;
  const pricePerPlayer = totalPayers > 0 ? (gameInfo.totalPrice / totalPayers).toFixed(2) : 0;

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
            // Column 0: Name (usually)
            // Column 1+: Looking for specific tags
            let name = "";
            let isGoalie = false;
            let isPaid = false;
            let otherStatus = "";

            const values = r.c.map(cell => (cell && cell.v) ? String(cell.v).trim() : "");
            
            // Find name (first non-date, non-empty value)
            for (let val of values) {
              if (val && !val.startsWith("Date(")) {
                name = val;
                break;
              }
            }

            // Look for Goalie and Paid status in any column
            values.forEach(val => {
              const lowerVal = val.toLowerCase();
              if (lowerVal === "goleiro") {
                isGoalie = true;
              }
              if (lowerVal === "pago") isPaid = true;
              if (lowerVal === "não-pago" || lowerVal === "nao-pago") isPaid = false;
            });

            // If we have a second value that isn't name/goalie/paid, use it as status
            const filteredValues = values.filter(v => v && v !== name && !v.startsWith("Date("));
            if (filteredValues.length > 0) {
              otherStatus = filteredValues[0];
            }

            return { 
              name, 
              isGoalie, 
              isPaid, 
              status: otherStatus,
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
            <p className="game-info-label">Preço Total: <span className="game-info-value">R${gameInfo.totalPrice}</span></p>
            <p className="game-info-label">Preço do Goleiro de aluguel: <span className="game-info-value">R${0}</span></p>
          </div>
        </div>

        <div className="game-list-card">
          {/* Form para adicionar presença */}
          <PresenceForm onSuccess={handleAddPlayer} />
          
          {/* Contador de jogadores */}
          <div className="game-list-counter">
            <div className="game-list-counter-info">
              <span className="game-list-counter-label">Confirmados:</span>
              <span className="game-list-counter-value">{players.length}</span>
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
            : players.map((player, index) => (
                <div key={player.id} className={`game-list-item ${player.isPaid ? 'is-paid' : ''}`}>
                  <span className="game-list-item-index">{index + 1}</span>
                  <div className="game-list-item-info">
                    <span className="game-list-item-name">
                      {player.name}
                      {player.isGoalie && <span className="goalie-tag">Goleiro</span>}
                    </span>
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
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
