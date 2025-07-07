// frontend/src/components/Navegacao.jsx
import React from 'react';
import styles from './Navegacao.module.css'; // Importa o CSS Module

function Navegacao({ view, setView }) {
  // O estilo foi movido para o CSS Module, então esta função é simplificada ou removida
  // const buttonStyle = (isActive) => ({ ... }); 

  return (
    <nav className={styles.navContainer}>
      <button
        className={`${styles.navButton} ${view === 'produtos' ? styles.active : ''}`}
        onClick={() => setView('produtos')}
      >
        Estoque de Produtos
      </button>
      <button
        className={`${styles.navButton} ${view === 'vendas' ? styles.active : ''}`}
        onClick={() => setView('vendas')}
      >
        Registro de Vendas
      </button>
      <button
        className={`${styles.navButton} ${view === 'relatorios' ? styles.active : ''}`}
        onClick={() => setView('relatorios')}
      >
        Relatórios
      </button>
    </nav>
  );
}

export default Navegacao;