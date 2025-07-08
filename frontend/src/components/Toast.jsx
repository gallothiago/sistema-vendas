// sistema_de_vendas_novo/frontend/src/components/Toast.jsx
import React from 'react';
import '../App.css'; // Importa o CSS global para os estilos do toast

function Toast({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type}`} role="alert" aria-live="assertive" aria-atomic="true">
        <div>
          <div className="toast-body">
            {message}
          </div>
        </div>
        {/* Opcional: Botão para fechar o toast manualmente */}
        {onClose && (
          <button
            type="button"
            className="close-toast-button"
            onClick={onClose}
            aria-label="Close"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.2em',
              cursor: 'pointer',
              marginLeft: '10px',
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}

export default Toast;