// frontend/src/components/ProdutoItem.jsx
import React from 'react';
import styles from './ProdutoItem.module.css'; // Importa o CSS Module

function ProdutoItem({ produto, onEdit, onDelete }) {
  return (
    <li className={styles.productItem}>
      <div className={styles.productInfo}>
        <p><strong>Nome:</strong> {produto.nome}</p>
        <p><strong>Quantidade:</strong> {produto.quantidade}</p>
        <p><strong>Preço:</strong> R${produto.preco.toFixed(2)}</p>
      </div>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => onEdit(produto)}
          className={styles.editButton}
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(produto.id, produto.nome)}
          className={styles.deleteButton}
        >
          Excluir
        </button>
      </div>
    </li>
  );
}

export default ProdutoItem;