// frontend/src/components/VendaItem.jsx
import React from 'react';
import styles from './VendaItem.module.css'; // Importa o CSS Module

function VendaItem({ venda }) {
    // Se você quiser exibir o nome do produto, você precisará fazer uma requisição

  return (
    <li className={styles.vendaItem}>
      <div>
        <p><strong>Venda ID:</strong> {venda.id}</p>
        <p><strong>Produto ID:</strong> {venda.produto_id}</p>
        {/* Se quiser o nome do produto, descomente e ajuste conforme a nota acima: */}
        {/* <p><strong>Produto:</strong> {nomeProduto}</p> */}
        <p><strong>Quantidade:</strong> {venda.quantidade}</p>
      </div>
      <div>
        <p><strong>Forma de Pagamento:</strong> {venda.forma_pagamento}</p>
        <p><strong>Data:</strong> {new Date(venda.data_venda).toLocaleDateString()}</p>
        <p className={styles.vendaValue}><strong>Valor Total:</strong> R${venda.valor_total.toFixed(2)}</p>
      </div>
    </li>
  );
}

export default VendaItem;