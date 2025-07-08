// sistema_de_vendas_novo/frontend/src/components/Relatorios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material'; // Importa componentes MUI
import LoadingSpinner from './LoadingSpinner';
import styles from '../App.module.css'; // Para classes de cores personalizadas do card

function Relatorios({ showToast }) {
  const [totalEstoque, setTotalEstoque] = useState(null);
  const [totalVendas, setTotalVendas] = useState(null);
  const [vendasPorMes, setVendasPorMes] = useState([]);
  const [vendasPorProduto, setVendasPorProduto] = useState([]);
  const [receitaPorFormaPagamento, setReceitaPorFormaPagamento] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        'total_estoque',
        'total_vendas',
        'vendas_por_mes',
        'vendas_por_produto',
        'receita_por_forma_pagamento'
      ];
      const promises = endpoints.map(endpoint =>
        fetch(`http://127.0.0.1:5000/relatorios/${endpoint}`)
          .then(res => {
            if (!res.ok) throw new Error(`Erro ao buscar ${endpoint}: ${res.statusText}`);
            return res.json();
          })
          .catch(err => {
            console.error(`Erro no endpoint ${endpoint}:`, err);
            showToast(`Erro ao carregar dados de ${endpoint}.`, 'error');
            return null; // Retorna null para continuar com outros fetches
          })
      );

      const [
        estoqueData,
        vendasData,
        mesData,
        produtoData,
        pagamentoData
      ] = await Promise.all(promises);

      setTotalEstoque(estoqueData);
      setTotalVendas(vendasData);
      setVendasPorMes(mesData || []);
      setVendasPorProduto(produtoData || []);
      setReceitaPorFormaPagamento(pagamentoData || []);

    } catch (err) {
      console.error("Erro geral ao carregar relatórios:", err);
      showToast('Erro ao carregar relatórios. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ padding: 4 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h2" component="h2" align="center" sx={{ mb: 5, color: 'secondary.main' }}>
        Relatórios do Sistema
      </Typography>

      {totalEstoque && (
        <Paper elevation={3} className={`${styles.relatorioCard} ${styles.estoque}`} sx={{ mb: 3, borderLeft: '6px solid', borderColor: 'info.main' }}>
          <Typography variant="h3" component="h3" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>Estoque</Typography>
          <Typography variant="body1">Total de Produtos Cadastrados: <strong>{totalEstoque.total_produtos_cadastrados}</strong></Typography>
          <Typography variant="body1">Valor Total do Estoque: <strong>R$ {totalEstoque.valor_total_do_estoque.toFixed(2).replace('.', ',')}</strong></Typography>
        </Paper>
      )}

      {totalVendas && (
        <Paper elevation={3} className={`${styles.relatorioCard} ${styles.vendas}`} sx={{ mb: 3, borderLeft: '6px solid', borderColor: 'success.main' }}>
          <Typography variant="h3" component="h3" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>Vendas</Typography>
          <Typography variant="body1">Total de Vendas Realizadas: <strong>{totalVendas.total_vendas_realizadas}</strong></Typography>
          <Typography variant="body1">Valor Total das Vendas: <strong>R$ {totalVendas.valor_total_das_vendas.toFixed(2).replace('.', ',')}</strong></Typography>
        </Paper>
      )}

      {vendasPorProduto.length > 0 && (
        <Paper elevation={3} className={`${styles.relatorioCard} ${styles.vendasProduto}`} sx={{ mb: 3, borderLeft: '6px solid', borderColor: '#9c27b0' }}> {/* Roxo */}
          <Typography variant="h3" component="h3" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>Vendas por Produto</Typography>
          <List className={styles.relatorioList}>
            {vendasPorProduto.map((item, index) => (
              <ListItem key={index} className={styles.relatorioListItem} disablePadding>
                <ListItemText primary={item.produto_nome} secondary={`R$ ${item.total_vendido.toFixed(2).replace('.', ',')}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {receitaPorFormaPagamento.length > 0 && (
        <Paper elevation={3} className={`${styles.relatorioCard} ${styles.vendasPagamento}`} sx={{ mb: 3, borderLeft: '6px solid', borderColor: 'warning.main' }}>
          <Typography variant="h3" component="h3" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>Receita por Forma de Pagamento</Typography>
          <List className={styles.relatorioList}>
            {receitaPorFormaPagamento.map((item, index) => (
              <ListItem key={index} className={styles.relatorioListItem} disablePadding>
                <ListItemText primary={item.forma_pagamento} secondary={`R$ ${item.total_receita.toFixed(2).replace('.', ',')}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {vendasPorMes.length > 0 && (
        <Paper elevation={3} className={`${styles.relatorioCard} ${styles.vendasMes}`} sx={{ mb: 3, borderLeft: '6px solid', borderColor: '#00bcd4' }}> {/* Ciano */}
          <Typography variant="h3" component="h3" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>Vendas por Mês</Typography>
          <List className={styles.relatorioList}>
            {vendasPorMes.map((item, index) => (
              <ListItem key={index} className={styles.relatorioListItem} disablePadding>
                <ListItemText primary={item.mes_ano} secondary={`R$ ${item.total_vendas.toFixed(2).replace('.', ',')}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {!totalEstoque && !totalVendas && vendasPorProduto.length === 0 && receitaPorFormaPagamento.length === 0 && vendasPorMes.length === 0 && !loading && (
        <Typography className={styles.noData} sx={{ mt: 4 }}>Nenhum dado de relatório disponível.</Typography>
      )}
    </Box>
  );
}

export default Relatorios;