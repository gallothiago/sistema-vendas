// sistema_de_vendas_novo/frontend/src/components/Relatorios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, CircularProgress, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../App.module.css'; // Certifique-se de que este caminho está correto

function Relatorios({ showToast }) {
  const [totalEstoque, setTotalEstoque] = useState(null);
  const [totalVendas, setTotalVendas] = useState(null);
  const [vendasPorMes, setVendasPorMes] = useState([]);
  const [vendasPorProduto, setVendasPorProduto] = useState([]);
  const [receitaPorFormaPagamento, setReceitaPorFormaPagamento] = useState([]);
  const [produtos, setProdutos] = useState([]); // Novo estado para lista de produtos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados dos filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState('Todos'); // 'Todos' como padrão
  const [produtoIdFiltro, setProdutoIdFiltro] = useState(''); // ID do produto selecionado

  // Lista de formas de pagamento para o filtro
  const formasPagamento = ['Todos', 'Cartao de Credito', 'Debito', 'Dinheiro', 'Pix'];

  // Função para buscar produtos (usada no filtro de produto)
  const fetchProdutos = useCallback(async () => {
    try {
      // Busca todos os produtos para o filtro (per_page=999)
      const response = await fetch('http://127.0.0.1:5000/produtos?per_page=999');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProdutos(data.produtos);
    } catch (err) {
      console.error("Erro ao buscar produtos para o filtro:", err);
      showToast('Erro ao carregar lista de produtos para filtros!', 'error');
    }
  }, [showToast]);

  // Função centralizada para buscar todos os relatórios
  const fetchAllReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Constrói os parâmetros de consulta (query parameters) dinamicamente
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    if (formaPagamentoFiltro && formaPagamentoFiltro !== 'Todos') params.append('forma_pagamento_filtro', formaPagamentoFiltro);
    if (produtoIdFiltro) params.append('produto_id_filtro', produtoIdFiltro);

    const queryString = params.toString();

    try {
      // Fetch Total Estoque (não usa filtros de venda)
      const estoqueRes = await fetch('http://127.0.0.1:5000/relatorios/total_estoque');
      if (!estoqueRes.ok) throw new Error(`Erro ao buscar total de estoque! Status: ${estoqueRes.status}`);
      setTotalEstoque(await estoqueRes.json());

      // Fetch Total Vendas (com filtros)
      const totalVendasRes = await fetch(`http://127.0.0.1:5000/relatorios/total_vendas?${queryString}`);
      if (!totalVendasRes.ok) throw new Error(`Erro ao buscar total de vendas! Status: ${totalVendasRes.status}`);
      setTotalVendas(await totalVendasRes.json());

      // Fetch Vendas por Mês (com filtros)
      const vendasMesRes = await fetch(`http://127.0.0.1:5000/relatorios/vendas_por_mes?${queryString}`);
      if (!vendasMesRes.ok) throw new Error(`Erro ao buscar vendas por mês! Status: ${vendasMesRes.status}`);
      setVendasPorMes(await vendasMesRes.json());

      // Fetch Vendas por Produto (com filtros)
      const vendasProdutoRes = await fetch(`http://127.0.0.1:5000/relatorios/vendas_por_produto?${queryString}`);
      if (!vendasProdutoRes.ok) throw new Error(`Erro ao buscar vendas por produto! Status: ${vendasProdutoRes.status}`);
      setVendasPorProduto(await vendasProdutoRes.json());

      // Fetch Receita por Forma de Pagamento (com filtros)
      const receitaPagamentoRes = await fetch(`http://127.0.0.1:5000/relatorios/receita_por_forma_pagamento?${queryString}`);
      if (!receitaPagamentoRes.ok) throw new Error(`Erro ao buscar receita por forma de pagamento! Status: ${receitaPagamentoRes.status}`);
      setReceitaPorFormaPagamento(await receitaPagamentoRes.json());

    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      setError(err);
      showToast(err.message || 'Erro ao carregar um ou mais relatórios!', 'error');
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, formaPagamentoFiltro, produtoIdFiltro, showToast]);

  useEffect(() => {
    fetchProdutos(); // Busca produtos uma vez ao montar o componente
    fetchAllReports(); // Busca relatórios inicialmente (e quando filtros mudam)
  }, [fetchProdutos, fetchAllReports]);

  // Função para aplicar os filtros
  const handleApplyFilters = () => {
    fetchAllReports(); // Basta chamar a função de busca novamente, que usará os estados atualizados dos filtros
  };

  // Função para limpar os filtros
  const handleClearFilters = () => {
    setDataInicio('');
    setDataFim('');
    setFormaPagamentoFiltro('Todos');
    setProdutoIdFiltro('');
    // fetchAllReports será chamado pelo useEffect devido à mudança dos estados dos filtros.
  };

  if (loading && !totalEstoque && !totalVendas && vendasPorMes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando relatórios...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">Erro ao carregar relatórios:</Typography>
        <Typography variant="body1" color="error">{error.message}</Typography>
        <Button onClick={fetchAllReports} variant="contained" sx={{ mt: 2 }}>Tentar Novamente</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Typography variant="h2" component="h2" align="center" sx={{ mb: { xs: 2, md: 4 }, color: 'primary.main', fontSize: { xs: '1.8rem', sm: '2rem' } }}>
        Relatórios do Sistema
      </Typography>

      {/* Seção de Filtros */}
      <Paper elevation={2} sx={{ padding: 3, mb: 4, borderRadius: '10px', border: '1px solid #cfd8dc' }}>
        <Typography variant="h4" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
          Filtros de Relatórios
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Início"
              type="date"
              fullWidth
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Fim"
              type="date"
              fullWidth
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="forma-pagamento-filter-label">Forma de Pagamento</InputLabel>
              <Select
                labelId="forma-pagamento-filter-label"
                value={formaPagamentoFiltro}
                label="Forma de Pagamento"
                onChange={(e) => setFormaPagamentoFiltro(e.target.value)}
              >
                {formasPagamento.map((forma) => (
                  <MenuItem key={forma} value={forma}>{forma}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="produto-filter-label">Produto</InputLabel>
              <Select
                labelId="produto-filter-label"
                value={produtoIdFiltro}
                label="Produto"
                onChange={(e) => setProdutoIdFiltro(e.target.value)}
              >
                <MenuItem value="">
                  <em>Todos os Produtos</em>
                </MenuItem>
                {produtos.map((produto) => (
                  <MenuItem key={produto.id} value={produto.id}>
                    {produto.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              fullWidth
              sx={{ height: '56px' }} // Altura para alinhar com os TextFields
            >
              Aplicar Filtros
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearFilters}
              fullWidth
              sx={{ height: '56px' }}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>


      <Grid container spacing={3}>
        {/* Total Estoque */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ padding: 3, borderRadius: '10px', height: '100%', border: '1px solid #cfd8dc' }}>
            <Typography variant="h4" component="h4" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
              Total em Estoque
            </Typography>
            {totalEstoque && (
              <Box>
                <Typography variant="h5" color="text.secondary">
                  Produtos Cadastrados: <span className={styles.reportValue}>{totalEstoque.total_produtos_cadastrados}</span>
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Valor Total do Estoque: <span className={styles.reportValue}>R$ {totalEstoque.valor_total_do_estoque.toFixed(2).replace('.', ',')}</span>
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Total Vendas (agora com filtros) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ padding: 3, borderRadius: '10px', height: '100%', border: '1px solid #cfd8dc' }}>
            <Typography variant="h4" component="h4" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
              Total de Vendas (Com Filtros)
            </Typography>
            {totalVendas && (
              <Box>
                <Typography variant="h5" color="text.secondary">
                  Vendas Realizadas: <span className={styles.reportValue}>{totalVendas.total_vendas_realizadas}</span>
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Valor Total das Vendas: <span className={styles.reportValue}>R$ {totalVendas.valor_total_das_vendas.toFixed(2).replace('.', ',')}</span>
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Vendas por Mês (Gráfico de Barras com filtros) */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ padding: 3, borderRadius: '10px', height: 400, border: '1px solid #cfd8dc' }}>
            <Typography variant="h4" component="h4" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
              Vendas por Mês (Com Filtros)
            </Typography>
            {vendasPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vendasPorMes}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes_ano" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Vendas']} />
                  <Legend />
                  <Bar dataKey="total_vendas" fill="#8884d8" name="Total de Vendas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>Nenhum dado de vendas por mês para os filtros selecionados.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Vendas por Produto (Gráfico de Barras com filtros) */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ padding: 3, borderRadius: '10px', height: 400, border: '1px solid #cfd8dc' }}>
            <Typography variant="h4" component="h4" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
              Vendas por Produto (Com Filtros)
            </Typography>
            {vendasPorProduto.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vendasPorProduto}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="produto_nome" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Total Vendido']} />
                  <Legend />
                  <Bar dataKey="total_vendido" fill="#82ca9d" name="Total Vendido" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>Nenhum dado de vendas por produto para os filtros selecionados.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Receita por Forma de Pagamento (Gráfico de Barras com filtros) */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ padding: 3, borderRadius: '10px', height: 400, border: '1px solid #cfd8dc' }}>
            <Typography variant="h4" component="h4" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
              Receita por Forma de Pagamento (Com Filtros)
            </Typography>
            {receitaPorFormaPagamento.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={receitaPorFormaPagamento}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="forma_pagamento" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Total Receita']} />
                  <Legend />
                  <Bar dataKey="total_receita" fill="#ffc658" name="Total Receita" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>Nenhum dado de receita por forma de pagamento para os filtros selecionados.</Typography>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default Relatorios;