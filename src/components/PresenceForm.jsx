import './PresenceForm.css';

function PresenceForm() {
  const url = "https://docs.google.com/forms/d/e/1FAIpQLSdJmaOF2rFS5T_O4nYXD6md7D2bN3UB_HMrC39wgVvu6eRNlg/viewform";

  return (
    <div className="presence-form-wrapper">
      <iframe
        className="presence-iframe"
        src={`${url}?embedded=true`}
        title="Formulário de presença"
      >
        Carregando…
      </iframe>

      <a
        className="presence-fallback"
        href={url}
        target="_blank"
        rel="noreferrer noopener"
      >
        Abrir formulário em nova aba
      </a>
    </div>
  );
}

export default PresenceForm;
