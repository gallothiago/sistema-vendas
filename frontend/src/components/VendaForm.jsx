// sistema_de_vendas_novo/frontend/src/components/VendaForm.jsx
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; // Importa componentes MUI
// import styles from '../App.module.css'; // Não precisamos mais dos estilos de formulário aqui

function VendaForm({ onVendaSaved, showToast }) {
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [vendaForm, setVendaForm] = useState({
    produto_id: '',
    quantidade: '',
    forma_pagamento: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchProdutosDisponiveis = async () => {
      try {
        // A busca por per_page=999 deve retornar todos os produtos.
        // Se houver um erro no backend, ele será capturado aqui.
        const response = await fetch('http://127.0.0.1:5000/produtos?per_page=999');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Certifique-se de que 'data.produtos' é um array e contém os produtos.
        if (data && Array.isArray(data.produtos)) {
          setProdutosDisponiveis(data.produtos);
        } else {
          console.error("Resposta da API de produtos inesperada:", data);
          showToast('Formato de dados de produtos inesperado!', 'error');
          setProdutosDisponiveis([]); // Garante que a lista esteja vazia
        }
      } catch (err) {
        console.error("Erro ao buscar produtos para venda:", err);
        showToast('Erro ao carregar produtos para venda! Verifique o console do backend.', 'error');
        setProdutosDisponiveis([]); // Garante que a lista esteja vazia
      }
    };
    fetchProdutosDisponiveis();
  }, [showToast]);

  const selectedProduto = produtosDisponiveis.find(p => p.id === parseInt(vendaForm.produto_id));
  const precoUnitario = selectedProduto ? selectedProduto.preco : 0;
  const precoTotal = precoUnitario * (vendaForm.quantidade || 0);

  const validateForm = () => {
    const errors = {};
    if (!vendaForm.produto_id) {
      errors.produto_id = 'Selecione um produto.';
    }
    if (vendaForm.quantidade === '' || isNaN(vendaForm.quantidade) || parseInt(vendaForm.quantidade) <= 0 || !Number.isInteger(parseFloat(vendaForm.quantidade))) {
      errors.quantidade = 'Quantidade inválida (deve ser um número inteiro positivo).';
    } else if (selectedProduto && parseInt(vendaForm.quantidade) > selectedProduto.quantidade) {
      errors.quantidade = `Quantidade em estoque insuficiente. Disponível: ${selectedProduto.quantidade}`;
    }
    if (!vendaForm.forma_pagamento.trim()) {
      errors.forma_pagamento = 'Forma de pagamento é obrigatória.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setVendaForm({
      ...vendaForm,
      [name]: value
    });
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Por favor, corrija os erros no formulário de venda.', 'error');
      return;
    }

    const payload = {
      produto_id: parseInt(vendaForm.produto_id),
      quantidade: parseInt(vendaForm.quantidade),
      forma_pagamento: vendaForm.forma_pagamento
    };

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setVendaForm({ produto_id: '', quantidade: '', forma_pagamento: '' });
      onVendaSaved();
      showToast('Venda registrada com sucesso!', 'success');

    } catch (err) {
      console.error("Erro ao registrar venda:", err);
      let errorMessage = `Erro ao registrar venda: ${err.message}`;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} elevation={2} sx={{ padding: 4, borderRadius: '10px', mb: 4, border: '1px solid #cfd8dc' }}>
      <Typography variant="h3" component="h3" align="center" sx={{ mb: 3, pb: 1.5, borderBottom: '1px solid #eee' }}>
        Registrar Nova Venda
      </Typography>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth error={!!formErrors.produto_id}>
          <InputLabel id="produto-select-label">Produto</InputLabel>
          <Select
            labelId="produto-select-label"
            id="produto_id"
            name="produto_id"
            value={vendaForm.produto_id}
            label="Produto"
            onChange={handleFormChange}
            disabled={loading}
          >
            <MenuItem value="">
              <em>Selecione um produto</em>
            </MenuItem>
            {produtosDisponiveis.map(produto => (
              <MenuItem key={produto.id} value={produto.id}>
                {produto.nome} (Estoque: {produto.quantidade}) - R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
              </MenuItem>
            ))}
          </Select>
          {formErrors.produto_id && <Typography color="error" variant="caption">{formErrors.produto_id}</Typography>}
        </FormControl>
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Quantidade"
          id="quantidade"
          name="quantidade"
          type="number"
          value={vendaForm.quantidade}
          onChange={handleFormChange}
          error={!!formErrors.quantidade}
          helperText={formErrors.quantidade}
          disabled={loading}
          fullWidth
        />
      </Box>
      <Typography variant="body1" sx={{ mb: 1 }}>Preço Unitário: R$ {precoUnitario.toFixed(2).replace('.', ',')}</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>Preço Total da Venda: R$ {precoTotal.toFixed(2).replace('.', ',')}</Typography>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth error={!!formErrors.forma_pagamento}>
          <InputLabel id="forma-pagamento-select-label">Forma de Pagamento</InputLabel>
          <Select
            labelId="forma-pagamento-select-label"
            id="forma_pagamento"
            name="forma_pagamento"
            value={vendaForm.forma_pagamento}
            label="Forma de Pagamento"
            onChange={handleFormChange}
            disabled={loading}
          >
            <MenuItem value="">
              <em>Selecione a forma de pagamento</em>
            </MenuItem>
            <MenuItem value="Cartao de Credito">Cartão de Crédito</MenuItem>
            <MenuItem value="Debito">Débito</MenuItem>
            <MenuItem value="Dinheiro">Dinheiro</MenuItem>
            <MenuItem value="Pix">Pix</MenuItem>
          </Select>
          {formErrors.forma_pagamento && <Typography color="error" variant="caption">{formErrors.forma_pagamento}</Typography>}
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          Registrar Venda
        </Button>
      </Box>
    </Paper>
  );
}

export default VendaForm;