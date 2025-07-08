// sistema_de_vendas_novo/frontend/src/components/ConfirmModal.jsx
import React from 'react';
import styles from './ConfirmModal.module.css'; // CSS modular para o modal

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>{message}</p>
        <div className={styles.modalActions}>
          <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
          <button onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;