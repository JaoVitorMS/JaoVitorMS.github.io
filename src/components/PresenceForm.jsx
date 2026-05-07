import { useState } from "react";
import "./PresenceForm.css";

function PresenceForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const FORM_ID = "1FAIpQLSdJmaOF2rFS5T_O4nYXD6md7D2bN3UB_HMrC39wgVvu6eRNlg";
  const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("Por favor, digite seu nome");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("entry.290949965", name);

      await fetch(FORM_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });

      setMessage("✅ Presença confirmada!");
      if (onSuccess) {
        onSuccess(name);
      }
      setName("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Erro ao enviar. Tente novamente.");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="presence-form-wrapper">
      <div className="presence-form-container">
        <div className="presence-form-header">
          <h2>Confirmar Presença</h2>
        </div>
        <form onSubmit={handleSubmit} className="presence-form">
          <div className="form-group">
            <label htmlFor="name">Seu Nome *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              disabled={loading}
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="form-submit">
            {loading ? "Enviando..." : "✋ Enviar"}
          </button>

          {message && <div className="form-message">{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default PresenceForm;
