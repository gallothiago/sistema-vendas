// frontend/src/components/Relatorios.jsx
import React from 'react';
import styles from './Relatorios.module.css'; // Importa o CSS Module

function Relatorios({ produtos, vendas }) {
  const valorTotalEstoque = produtos.reduce((total, produto) => {
    return total + (produto.quantidade * produto.preco);
  }, 0);

  const valorTotalVendas = vendas.reduce((total, venda) => {
    return total + venda.valor_total;
  }, 0);

  const totalProdutosUnicos = produtos.length;
  const totalVendasRealizadas = vendas.length;

  return (
    <div className={styles.reportsContainer}>
      <h2>Relatórios do Sistema</h2>
      <div className={styles.reportCards}>
        <div className={`${styles.reportCard} ${styles.stockCard}`}>
          <h3>Estoque</h3>
          <p><strong>Total de Produtos Cadastrados:</strong> {totalProdutosUnicos}</p>
          <p><strong>Valor Total do Estoque:</strong> R${valorTotalEstoque.toFixed(2)}</p>
        </div>
        <div className={`${styles.reportCard} ${styles.salesCard}`}>
          <h3>Vendas</h3>
          <p><strong>Total de Vendas Realizadas:</strong> {totalVendasRealizadas}</p>
          <p><strong>Valor Total das Vendas:</strong> R${valorTotalVendas.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;