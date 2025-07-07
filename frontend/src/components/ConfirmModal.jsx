// frontend/src/components/ConfirmModal.jsx
import React from 'react';
import styles from './ConfirmModal.module.css'; // Importa o CSS Module

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Confirmação</h3>
        <p>{message}</p>
        <div className={styles.buttonGroup}>
          <button className={styles.confirmButton} onClick={onConfirm}>Confirmar</button>
          <button className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;