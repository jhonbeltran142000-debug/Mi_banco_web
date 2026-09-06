import './ConfirmModal.css';

export default function ConfirmModal({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="confirm-overlay" onClick={onCancelar}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-msg">{mensaje}</p>
        <div className="confirm-actions">
          <button onClick={onCancelar} className="confirm-btn confirm-cancel">
            Cancelar
          </button>
          <button onClick={onConfirmar} className="confirm-btn confirm-ok">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
