import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    // Gera posições aleatórias para os nomes
    const generateNames = () => {
      const newNames = [];
      for (let i = 0; i < 50; i++) {
        newNames.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 4,
          fontSize: 1 + Math.random() * 3,
        });
      }
      setNames(newNames);
    };

    generateNames();
  }, []);

  return (
    <div className="container">
      <div className="pearl-background"></div>
      {names.map((name) => (
        <div
          key={name.id}
          className="floating-name"
          style={{
            left: `${name.x}%`,
            top: `${name.y}%`,
            animationDelay: `${name.delay}s`,
            animationDuration: `${name.duration}s`,
            fontSize: `${name.fontSize}rem`,
          }}
        >
          rataela
        </div>
      ))}
      <div className="center-name">
        <h1 className="main-title">rataela</h1>
      </div>
    </div>
  );
}

export default App;
