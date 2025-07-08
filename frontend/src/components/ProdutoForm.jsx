// sistema_de_vendas_novo/frontend/src/components/ProdutoForm.jsx
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material'; // Importa componentes MUI
// import styles from '../App.module.css'; // Não precisamos mais dos estilos de formulário aqui

function ProdutoForm({ produtoToEdit, onProdutoSaved, onCancelEdit, showToast }) {
  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    quantidade: '',
    preco: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProdutoId, setCurrentProdutoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (produtoToEdit) {
      setProdutoForm({
        nome: produtoToEdit.nome,
        quantidade: produtoToEdit.quantidade,
        preco: produtoToEdit.preco
      });
      setIsEditing(true);
      setCurrentProdutoId(produtoToEdit.id);
      setFormErrors({}); // Limpar erros anteriores ao editar
    } else {
      setProdutoForm({ nome: '', quantidade: '', preco: '' });
      setIsEditing(false);
      setCurrentProdutoId(null);
      setFormErrors({}); // Limpar erros
    }
  }, [produtoToEdit]);

  const validateForm = () => {
    const errors = {};
    if (!produtoForm.nome.trim()) {
      errors.nome = 'Nome é obrigatório.';
    }
    if (produtoForm.quantidade === '' || isNaN(produtoForm.quantidade) || parseInt(produtoForm.quantidade) < 0 || !Number.isInteger(parseFloat(produtoForm.quantidade))) {
      errors.quantidade = 'Quantidade inválida (deve ser um número inteiro não negativo).';
    }
    if (produtoForm.preco === '' || isNaN(produtoForm.preco) || parseFloat(produtoForm.preco) < 0) {
      errors.preco = 'Preço inválido (deve ser um número não negativo).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProdutoForm({
      ...produtoForm,
      [name]: value
    });
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Por favor, corrija os erros no formulário.', 'error');
      return;
    }

    const payload = {
      ...produtoForm,
      quantidade: parseInt(produtoForm.quantidade),
      preco: parseFloat(produtoForm.preco)
    };

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await fetch(`http://127.0.0.1:5000/produtos/${currentProdutoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://127.0.0.1:5000/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      onProdutoSaved();
      showToast(isEditing ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!', 'success');

    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      let errorMessage = `Erro ao ${isEditing ? 'atualizar' : 'adicionar'} produto.`;
      if (err.message.includes('Produto com este nome já existe')) {
          errorMessage = 'Já existe um produto com este nome.';
          setFormErrors(prev => ({ ...prev, nome: errorMessage }));
      } else if (err.message) {
          errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancelEdit();
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} elevation={2} sx={{ padding: 4, borderRadius: '10px', mb: 4, border: '1px solid #cfd8dc' }}>
      <Typography variant="h3" component="h3" align="center" sx={{ mb: 3, pb: 1.5, borderBottom: '1px solid #eee' }}>
        {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Nome"
          id="nome"
          name="nome"
          value={produtoForm.nome}
          onChange={handleFormChange}
          error={!!formErrors.nome}
          helperText={formErrors.nome}
          disabled={loading}
          fullWidth // Adiciona a propriedade fullWidth
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Quantidade"
          id="quantidade"
          name="quantidade"
          type="number"
          value={produtoForm.quantidade}
          onChange={handleFormChange}
          error={!!formErrors.quantidade}
          helperText={formErrors.quantidade}
          disabled={loading}
          fullWidth
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Preço"
          id="preco"
          name="preco"
          type="number"
          step="0.01"
          value={produtoForm.preco}
          onChange={handleFormChange}
          error={!!formErrors.preco}
          helperText={formErrors.preco}
          disabled={loading}
          fullWidth
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
        {isEditing && (
          <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </Box>
    </Paper>
  );
}

export default ProdutoForm;