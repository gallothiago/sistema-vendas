// frontend/src/components/ProdutoForm.jsx
import React, { useState } from 'react';
import styles from './ProdutoForm.module.css'; // Importa o CSS Module

function ProdutoForm({ onProdutoCadastrado, onError }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');

  const [nomeError, setNomeError] = useState('');
  const [quantidadeError, setQuantidadeError] = useState('');
  const [precoError, setPrecoError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setNomeError('');
    setQuantidadeError('');
    setPrecoError('');
    onError(null);

    if (!nome.trim()) {
      setNomeError('O nome do produto é obrigatório.');
      isValid = false;
    }

    const parsedQuantidade = parseInt(quantidade);
    if (isNaN(parsedQuantidade) || parsedQuantidade < 0) {
      setQuantidadeError('A quantidade deve ser um número inteiro não negativo.');
      isValid = false;
    }

    const parsedPreco = parseFloat(preco);
    if (isNaN(parsedPreco) || parsedPreco < 0) {
      setPrecoError('O preço deve ser um número não negativo.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const novoProduto = {
      nome,
      quantidade: parseInt(quantidade),
      preco: parseFloat(parseFloat(preco).toFixed(2)),
    };

    fetch('http://127.0.0.1:5000/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novoProduto),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`); });
        }
        return response.json();
      })
      .then(data => {
        console.log('Produto cadastrado:', data);
        setNome('');
        setQuantidade('');
        setPreco('');
        onProdutoCadastrado();
        setNomeError('');
        setQuantidadeError('');
        setPrecoError('');
      })
      .catch(error => {
        console.error("Erro ao cadastrar produto:", error);
        onError(error);
      });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3>Cadastrar Novo Produto</h3>
      <div>
        <label htmlFor="nomeProduto">Nome:</label>
        <input
          type="text"
          id="nomeProduto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        {nomeError && <p className={styles.validationError}>{nomeError}</p>}
      </div>
      <div>
        <label htmlFor="quantidadeProduto">Quantidade:</label>
        <input
          type="number"
          id="quantidadeProduto"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
          min="0"
        />
        {quantidadeError && <p className={styles.validationError}>{quantidadeError}</p>}
      </div>
      <div>
        <label htmlFor="precoProduto">Preço:</label>
        <input
          type="number"
          id="precoProduto"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
          min="0"
        />
        {precoError && <p className={styles.validationError}>{precoError}</p>}
      </div>
      <button type="submit">Cadastrar Produto</button>
    </form>
  );
}

export default ProdutoForm;