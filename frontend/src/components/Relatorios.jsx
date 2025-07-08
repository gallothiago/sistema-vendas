// sistema_de_vendas_novo/frontend/src/components/Relatorios.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Não precisamos do 'format' do date-fns aqui se o backend já está enviando 'MM/YYYY' ou 'YYYY-MM' formatado
// import { format } from 'date-fns'; // Esta importação não é mais estritamente necessária para o gráfico se o backend formatar.

function Relatorios({ showToast }) {
  const [relatorios, setRelatorios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  // O backend não usa 'tipo_movimento' para filtrar as vendas no seu modelo atual,
  // mas o frontend ainda o tem. Vamos manter no frontend por enquanto,
  // mas ele não terá efeito no backend até que você adicione essa coluna na tabela Venda.
  const [tipoMovimento, setTipoMovimento] = useState('Todos');

  // Novos estados para os novos filtros do backend (se você for adicioná-los no frontend)
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState('Todos');
  const [produtoIdFiltro, setProdutoIdFiltro] = useState(''); // Pode ser string para campo de texto ou number para select

  const fetchRelatorios = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      // O 'tipo_movimento' não é usado no backend Flask-SQLAlchemy atual.
      // Se você não o adicionar ao backend, esta linha pode ser removida ou ignorada.
      // if (tipoMovimento && tipoMovimento !== 'Todos') params.append('tipo_movimento', tipoMovimento);

      // Adicionar os novos filtros para o backend
      if (formaPagamentoFiltro && formaPagamentoFiltro !== 'Todos') params.append('forma_pagamento', formaPagamentoFiltro);
      if (produtoIdFiltro) params.append('produto_id', produtoIdFiltro);

      // A requisição agora é para a rota consolidada '/relatorios'
      const response = await fetch(`http://127.0.0.1:5000/relatorios?${params.toString()}`);
      if (!response.ok) {
        // Tentar ler o corpo da resposta para mais detalhes sobre o erro
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, Details: ${errorData.error || 'Nenhum detalhe.'}`);
      }
      const data = await response.json();
      setRelatorios(data);
      console.log("Dados do relatório recebidos:", data); // DEBUG: Verifique os dados recebidos
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err);
      setError(err);
      showToast(`Erro ao carregar relatórios! ${err.message}`, 'error'); // Mostra mais detalhes do erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const handleAplicarFiltros = () => {
    fetchRelatorios();
  };

  const handleLimparFiltros = () => {
    setDataInicio('');
    setDataFim('');
    setTipoMovimento('Todos'); // Manter no frontend se desejar para compatibilidade futura
    setFormaPagamentoFiltro('Todos'); // Limpar o novo filtro
    setProdutoIdFiltro(''); // Limpar o novo filtro
    fetchRelatorios(); // Força o re-fetch com filtros limpos
  };

  // Preparar dados para o gráfico de vendas por mês
  // Os dados já vêm do backend com 'mesAno' no formato 'MM/YYYY' ou 'YYYY-MM'
  const vendasPorMesData = relatorios?.vendas_por_mes || [];

  // DEBUG: log os dados antes de passar para o gráfico
  console.log("Dados para o gráfico de Vendas por Mês:", vendasPorMesData);


  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      <Typography variant="h2" component="h2" align="center" sx={{ mb: { xs: 3, md: 5 }, color: 'primary.main', fontSize: { xs: '1.8rem', sm: '2rem' } }}>
        Relatórios do Sistema
      </Typography>

      {/* Seção de Filtros */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, md: 4 }, borderRadius: '10px' }}>
        <Typography variant="h6" component="h3" sx={{ mb: { xs: 2, md: 3 }, color: 'text.secondary' }}>
          Filtros de Relatórios
        </Typography>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
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
          {/* O filtro tipoMovimento no frontend não tem correspondência no backend atual (modelo Venda) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="tipo-movimento-label">Tipo de Movimento</InputLabel>
              <Select
                labelId="tipo-movimento-label"
                id="tipo-movimento-select"
                value={tipoMovimento}
                label="Tipo de Movimento"
                onChange={(e) => setTipoMovimento(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Novos filtros: Forma de Pagamento e ID do Produto */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="forma-pagamento-label">Forma de Pagamento</InputLabel>
              <Select
                labelId="forma-pagamento-label"
                id="forma-pagamento-select"
                value={formaPagamentoFiltro}
                label="Forma de Pagamento"
                onChange={(e) => setFormaPagamentoFiltro(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Cartao de Credito">Cartão de Crédito</MenuItem>
                <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                <MenuItem value="Pix">Pix</MenuItem>
                {/* Adicione outras formas de pagamento que você tenha */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="ID do Produto"
              type="number"
              fullWidth
              value={produtoIdFiltro}
              onChange={(e) => setProdutoIdFiltro(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1 }}
            />
          </Grid>
          {/* Fim dos novos filtros */}

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'space-around', sm: 'flex-end' }, gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAplicarFiltros}
                sx={{ flexGrow: { xs: 1, sm: 0 } }}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleLimparFiltros}
                sx={{ flexGrow: { xs: 1, sm: 0 } }}
              >
                Limpar Filtros
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Typography align="center" variant="h6" color="text.secondary">Carregando relatórios...</Typography>
      ) : error ? (
        <Typography align="center" variant="h6" color="error">Erro: {error.message}</Typography>
      ) : relatorios ? (
        <Grid container spacing={4}>
          {/* Card: Total em Estoque */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '10px' }}>
              <Typography variant="h6" component="h3" sx={{ color: 'primary.main', mb: 1 }}>
                Total em Estoque
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Produtos Cadastrados: <Typography component="span" variant="body1" sx={{ fontWeight: 'bold' }}>{relatorios.total_produtos}</Typography>
              </Typography>
              <Typography variant="body1">
                Valor Total do Estoque: <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>R$ {relatorios.valor_total_estoque ? relatorios.valor_total_estoque.toFixed(2).replace('.', ',') : '0,00'}</Typography>
              </Typography>
            </Paper>
          </Grid>

          {/* Card: Total de Vendas */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '10px' }}>
              <Typography variant="h6" component="h3" sx={{ color: 'primary.main', mb: 1 }}>
                Total de Vendas (Com Filtros)
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Vendas Realizadas: <Typography component="span" variant="body1" sx={{ fontWeight: 'bold' }}>{relatorios.total_vendas}</Typography>
              </Typography>
              <Typography variant="body1">
                Valor Total das Vendas: <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>R$ {relatorios.valor_total_vendas ? relatorios.valor_total_vendas.toFixed(2).replace('.', ',') : '0,00'}</Typography>
              </Typography>
            </Paper>
          </Grid>

          {/* Gráfico: Vendas por Mês */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '10px', height: 400, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h3" sx={{ mb: { xs: 2, md: 3 }, color: 'text.secondary', textAlign: 'center' }}>
                Vendas por Mês (Com Filtros)
              </Typography>
              {vendasPorMesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={vendasPorMesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mesAno" /> {/* dataKey deve ser 'mesAno' conforme backend */}
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="vendas" stroke="#8884d8" activeDot={{ r: 8 }} name="Vendas" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography align="center" variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                  Nenhum dado de vendas por mês disponível com os filtros atuais.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Novo: Gráfico de Vendas por Produto */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '10px', height: 400, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h3" sx={{ mb: { xs: 2, md: 3 }, color: 'text.secondary', textAlign: 'center' }}>
                Vendas por Produto (Com Filtros)
              </Typography>
              {relatorios.vendas_por_produto && relatorios.vendas_por_produto.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={relatorios.vendas_por_produto}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="produto_nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="total_vendido" stroke="#82ca9d" name="Total Vendido" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography align="center" variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                  Nenhum dado de vendas por produto disponível com os filtros atuais.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Novo: Gráfico de Receita por Forma de Pagamento */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '10px', height: 400, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h3" sx={{ mb: { xs: 2, md: 3 }, color: 'text.secondary', textAlign: 'center' }}>
                Receita por Forma de Pagamento (Com Filtros)
              </Typography>
              {relatorios.receita_por_forma_pagamento && relatorios.receita_por_forma_pagamento.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={relatorios.receita_por_forma_pagamento}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="forma_pagamento" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="total_receita" stroke="#ffc658" name="Total Receita" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography align="center" variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                  Nenhum dado de receita por forma de pagamento disponível com os filtros atuais.
                </Typography>
              )}
            </Paper>
          </Grid>

        </Grid>
      ) : (
        <Typography align="center" variant="h6" color="text.secondary">Nenhum relatório para exibir. Aplique os filtros.</Typography>
      )}
    </Box>
  );
}

export default Relatorios;