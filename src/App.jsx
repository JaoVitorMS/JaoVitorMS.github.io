import PresenceForm from "./components/PresenceForm";
import GameList from "./components/GameList";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="app-content">
        <PresenceForm />
        <GameList />
      </div>
    </div>
  );
}

export default App;
