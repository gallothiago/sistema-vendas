// sistema_de_vendas_novo/frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.spinnerText}>Carregando...</p>
    </div>
  );
}

export default LoadingSpinner;