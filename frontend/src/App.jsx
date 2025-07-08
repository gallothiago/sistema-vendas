// sistema_de_vendas_novo/frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom'; // Importa Link do react-router-dom como RouterLink

// Importações do MUI
import { Container, AppBar, Toolbar, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme, Divider } from '@mui/material'; // Adicionado Divider
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close'; // Ícone para fechar o Drawer (opcional, mas útil)

import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

// Importa todos os componentes necessários
import ProdutoForm from './components/ProdutoForm';
import ProdutoItem from './components/ProdutoItem';
import Vendas from './components/Vendas';
import Relatorios from './components/Relatorios';
import Toast from './components/Toast';
import Navegacao from './components/Navegacao';
import LoadingSpinner from './components/LoadingSpinner';

// Importa os estilos CSS
import './index.css';
import styles from './App.module.css';

function App() {
  const [toast, setToast] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produtoToEdit, setProdutoToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    await fetchProdutos(currentPage, searchTerm);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
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

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Produtos', icon: <InventoryIcon />, path: '/produtos' },
    { text: 'Vendas', icon: <ShoppingCartIcon />, path: '/vendas' },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios' },
  ];

  return (
    <Router>
      <Box className={styles.appContainer}>
        <AppBar position="static" sx={{ backgroundColor: 'secondary.main', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' }}>
          <Toolbar sx={{ flexDirection: isMobile ? 'row' : 'column', justifyContent: isMobile ? 'space-between' : 'center', alignItems: 'center', paddingY: { xs: 1, sm: 2 } }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h1"
              component="div"
              sx={{ flexGrow: 1, color: 'white', fontSize: { xs: '1.5em', sm: '2em', md: '2.2em' }, textAlign: isMobile ? 'center' : 'center', marginBottom: isMobile ? '0' : '15px' }}
            >
              Sistema de Gestão de Vendas
            </Typography>
            {!isMobile && <Navegacao />}
          </Toolbar>
        </AppBar>

        {/* Drawer para telas menores */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            // remove onClick and onKeyDown from Box, apply to ListItemButton instead for better accessibility
          >
            {/* Cabeçalho do Drawer */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                Menu de Navegação
              </Typography>
              <IconButton onClick={toggleDrawer(false)} color="inherit" aria-label="fechar menu">
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider /> {/* Linha divisória */}
            <List>
              {drawerItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  {/* Usar RouterLink para navegação do React Router DOM */}
                  <ListItemButton component={RouterLink} to={item.path} onClick={toggleDrawer(false)}>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>


        {/* Conteúdo principal */}
        <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, paddingY: { xs: 2, md: 4 }, marginY: { xs: 2, md: 4 } }}>
          <Paper elevation={3} sx={{ padding: { xs: 2, sm: 3, md: 4 }, borderRadius: '10px' }}>
            <Routes>
              <Route path="/produtos" element={
                <Box>
                  <Typography variant="h2" component="h2" align="center" sx={{ mb: { xs: 2, md: 4 }, color: 'primary.main', fontSize: { xs: '1.8rem', sm: '2rem' } }}>
                    Gestão de Produtos
                  </Typography>

                  <Grid container spacing={3} justifyContent="center" alignItems="center">
                    <Grid item xs={12}>
                      <ProdutoForm
                        produtoToEdit={produtoToEdit}
                        onProdutoSaved={handleProdutoSaved}
                        onCancelEdit={handleCancelEdit}
                        showToast={showToast}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8} md={6} sx={{ textAlign: 'center' }}>
                      <TextField
                        label="Buscar produto por nome"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TableContainer component={Paper} sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
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

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: { xs: 1, sm: 2 }, mt: { xs: 2, md: 4 }, p: { xs: 1.5, md: 2 }, bgcolor: '#e0e0e0', borderRadius: '8px', boxShadow: 'var(--box-shadow)' }}>
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      variant="contained"
                      color="primary"
                    >
                      Anterior
                    </Button>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.9em', sm: '1em' } }}>
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
