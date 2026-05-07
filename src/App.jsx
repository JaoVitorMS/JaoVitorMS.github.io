import "./App.css";

function App() {
  return (
    <main className="splash">
      <div className="noise" aria-hidden="true" />
      <section className="panel">
        <p className="status">🛰️ OUT OF SYSTEM</p>
        <h1>
          Estamos no pit stop cósmico.
          <br />
          Voltamos em breve!
        </h1>
        <p className="subtitle">
          Enquanto isso, o robô está atualizando os parafusos e recarregando o
          café.
        </p>
        <p className="loading" aria-label="Carregando">
          carregando<span>.</span>
          <span>.</span>
          <span>.</span>
        </p>
      </section>
      <div className="ufo" aria-hidden="true">
        🛸
      </div>
    </main>
  );
}

export default App;
