// sistema_de_vendas_novo/frontend/src/components/Navegacao.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navegacao.module.css'; // Usaremos um CSS modular para ele

function Navegacao() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/produtos" className={styles.navLink}>Estoque de Produtos</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/vendas" className={styles.navLink}>Registro de Vendas</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/relatorios" className={styles.navLink}>Relatórios</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navegacao;