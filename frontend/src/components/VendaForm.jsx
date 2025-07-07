// frontend/src/components/VendaForm.jsx
import React, { useState } from 'react';
import styles from './VendaForm.module.css'; // Importa o CSS Module

function VendaForm({ produtos, onVendaRegistrada, onError }) {
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [quantidadeVendida, setQuantidadeVendida] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  const [produtoIdError, setProdutoIdError] = useState('');
  const [quantidadeVendaError, setQuantidadeVendaError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setProdutoIdError('');
    setQuantidadeVendaError('');
    onError(null);

    if (!produtoSelecionadoId) {
      setProdutoIdError('Por favor, selecione um produto.');
      isValid = false;
    }

    const parsedQuantidade = parseInt(quantidadeVendida);
    if (isNaN(parsedQuantidade) || parsedQuantidade <= 0) {
      setQuantidadeVendaError('A quantidade vendida deve ser um número inteiro positivo.');
      isValid = false;
    } else {
      const produtoNoEstoque = produtos.find(p => p.id === parseInt(produtoSelecionadoId));
      if (produtoNoEstoque && parsedQuantidade > produtoNoEstoque.quantidade) {
        setQuantidadeVendaError(`Estoque insuficiente. Disponível: ${produtoNoEstoque.quantidade}.`);
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const produtoVendido = produtos.find(p => p.id === parseInt(produtoSelecionadoId));
    const valorTotal = produtoVendido.preco * parseInt(quantidadeVendida);

    const novaVenda = {
      produto_id: parseInt(produtoSelecionadoId),
      quantidade: parseInt(quantidadeVendida),
      forma_pagamento: formaPagamento,
      valor_total: parseFloat(valorTotal.toFixed(2))
    };

    fetch('http://127.0.0.1:5000/vendas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novaVenda),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`); });
        }
        return response.json();
      })
      .then(data => {
        console.log('Venda registrada:', data);
        setProdutoSelecionadoId('');
        setQuantidadeVendida('');
        setFormaPagamento('Dinheiro');
        onVendaRegistrada();
        setProdutoIdError('');
        setQuantidadeVendaError('');
      })
      .catch(error => {
        console.error("Erro ao registrar venda:", error);
        onError(error);
      });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3>Registrar Nova Venda</h3>
      <div>
        <label htmlFor="produtoVenda">Produto:</label>
        <select
          id="produtoVenda"
          value={produtoSelecionadoId}
          onChange={(e) => setProdutoSelecionadoId(e.target.value)}
          required
        >
          <option value="">Selecione um produto</option>
          {produtos.map(produto => (
            <option key={produto.id} value={produto.id}>
              {produto.nome} (Estoque: {produto.quantidade})
            </option>
          ))}
        </select>
        {produtoIdError && <p className={styles.validationError}>{produtoIdError}</p>}
      </div>
      <div>
        <label htmlFor="quantidadeVenda">Quantidade:</label>
        <input
          type="number"
          id="quantidadeVenda"
          value={quantidadeVendida}
          onChange={(e) => setQuantidadeVendida(e.target.value)}
          min="1"
          required
        />
        {quantidadeVendaError && <p className={styles.validationError}>{quantidadeVendaError}</p>}
      </div>
      <div>
        <label htmlFor="formaPagamento">Forma de Pagamento:</label>
        <select
          id="formaPagamento"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          required
        >
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartao de Credito">Cartão de Crédito</option>
          <option value="Cartao de Debito">Cartão de Débito</option>
          <option value="Pix">Pix</option>
        </select>
      </div>
      <button type="submit">Registrar Venda</button>
    </form>
  );
}

export default VendaForm;