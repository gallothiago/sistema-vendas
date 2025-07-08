// sistema_de_vendas_novo/frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importações do MUI
import { Container, AppBar, Toolbar, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // Exemplo de ícone, pode ser usado depois
import InputAdornment from '@mui/material/InputAdornment'; // Para ícone no input
import TextField from '@mui/material/TextField'; // Para o campo de busca

// Importa todos os componentes necessários
import ProdutoForm from './components/ProdutoForm';
import ProdutoItem from './components/ProdutoItem';
import Vendas from './components/Vendas';
import Relatorios from './components/Relatorios';
import Toast from './components/Toast';
import Navegacao from './components/Navegacao';
import LoadingSpinner from './components/LoadingSpinner';

// Importa os estilos CSS (agora mais enxutos)
import './index.css'; // Alterado de App.css para index.css para o CSS global
import styles from './App.module.css'; // Para layout principal e classes que não são de componentes MUI

function App() {
  const [toast, setToast] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produtoToEdit, setProdutoToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchProdutos = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:5000/produtos?page=${page}&search=${search}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProdutos(data.produtos);
      setTotalPages(data.total_pages);
      setCurrentPage(data.current_page);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError(err);
      showToast('Erro ao carregar produtos!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleProdutoSaved = async () => {
    setProdutoToEdit(null);
    await fetchProdutos(1, searchTerm); // Sempre vai para a primeira página após salvar
    setCurrentPage(1);
  };

  const handleEditRequest = (produto) => {
    setProdutoToEdit(produto);
  };

  const handleCancelEdit = () => {
    setProdutoToEdit(null);
  };

  const handleProdutoDeleted = async () => {
    if (produtos.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
    } else {
        await fetchProdutos(currentPage, searchTerm);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Router>
      <Box className={styles.appContainer}>
        <AppBar position="static" sx={{ backgroundColor: 'secondary.main', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }}>
          <Toolbar sx={{ flexDirection: 'column', paddingY: 2 }}>
            <Typography variant="h1" component="div" sx={{ flexGrow: 1, color: 'white', fontSize: '2.2em', marginBottom: '15px' }}>
              Sistema de Gestão de Vendas
            </Typography>
            <Navegacao />
          </Toolbar>
        </AppBar>

        <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, paddingY: 4, marginY: 4 }}>
          <Paper elevation={3} sx={{ padding: 4, borderRadius: '10px' }}>
            <Routes>
              <Route path="/produtos" element={
                <Box>
                  <Typography variant="h2" component="h2" align="center" sx={{ mb: 4, color: 'primary.main' }}>
                    Gestão de Produtos
                  </Typography>
                  <ProdutoForm
                    produtoToEdit={produtoToEdit}
                    onProdutoSaved={handleProdutoSaved}
                    onCancelEdit={handleCancelEdit}
                    showToast={showToast}
                  />

                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <TextField
                      label="Buscar produto por nome"
                      variant="outlined"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: '60%', maxWidth: '500px' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <TableContainer component={Paper} sx={{ mb: 4, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="tabela de produtos">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Nome</TableCell>
                          <TableCell>Quantidade</TableCell>
                          <TableCell>Preço (R$)</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading && produtos.length === 0 && !error ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <LoadingSpinner />
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" className={styles.errorMessage}>
                              Erro ao carregar produtos: {error.message}. Por favor, tente novamente.
                            </TableCell>
                          </TableRow>
                        ) : produtos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" className={styles.noData}>Nenhum produto encontrado.</TableCell>
                          </TableRow>
                        ) : (
                          produtos.map(produto => (
                            <ProdutoItem
                              key={produto.id}
                              produto={produto}
                              onEditRequest={handleEditRequest}
                              onProdutoDeleted={handleProdutoDeleted}
                              showToast={showToast}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4, p: 2, bgcolor: '#e0e0e0', borderRadius: '8px', boxShadow: 'var(--box-shadow)' }}>
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      variant="contained"
                      color="primary"
                    >
                      Anterior
                    </Button>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Página {currentPage} de {totalPages}
                    </Typography>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      variant="contained"
                      color="primary"
                    >
                      Próxima
                    </Button>
                  </Box>
                </Box>
              } />
              <Route path="/vendas" element={<Vendas showToast={showToast} />} />
              <Route path="/relatorios" element={<Relatorios showToast={showToast} />} />
              <Route path="/" element={<Typography variant="body1" align="center" sx={{ mt: 6, fontStyle: 'italic', color: '#777' }}>Bem-vindo ao Sistema de Gestão! Utilize a navegação acima para começar.</Typography>} />
            </Routes>
          </Paper>
        </Container>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </Box>
    </Router>
  );
}

export default App;
