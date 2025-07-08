// sistema_de_vendas_novo/frontend/src/components/Vendas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import VendaForm from './VendaForm';
import VendaItem from './VendaItem';
import styles from '../App.module.css';
import LoadingSpinner from './LoadingSpinner';
import DeleteIcon from '@mui/icons-material/Delete';

function Vendas({ showToast }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vendaToDelete, setVendaToDelete] = useState(null);

  const fetchVendas = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:5000/vendas?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVendas(data.vendas);
      setTotalPages(data.total_pages);
      setCurrentPage(data.current_page);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
      setError(err);
      showToast('Erro ao carregar vendas!', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVendas(currentPage);
  }, [currentPage, fetchVendas]);

  const handleVendaSaved = () => {
    fetchVendas(currentPage);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteRequest = (venda) => {
    setVendaToDelete(venda);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setVendaToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!vendaToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/vendas/${vendaToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao deletar venda! Status: ${response.status}`);
      }

      showToast('Venda excluída com sucesso!', 'success');
      if (vendas.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
      } else {
          fetchVendas(currentPage);
      }
    } catch (err) {
      console.error("Erro ao deletar venda:", err);
      showToast(err.message || 'Erro ao excluir venda!', 'error');
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Typography variant="h2" component="h2" align="center" sx={{ mb: { xs: 2, md: 4 }, color: 'primary.main', fontSize: { xs: '1.8rem', sm: '2rem' } }}>
        Gestão de Vendas
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <VendaForm onVendaSaved={handleVendaSaved} showToast={showToast} />
        </Grid>
      </Grid>


      <Box sx={{ mt: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h3" sx={{ mb: { xs: 2, md: 3 }, pb: 1.5, borderBottom: '1px solid #eee' }}>
          Histórico de Vendas
        </Typography>
        <TableContainer component={Paper} sx={{ mb: { xs: 3, md: 4 }, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
          <Table sx={{ minWidth: 700 }} aria-label="tabela de vendas">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Preço Unitário</TableCell>
                <TableCell>Preço Total</TableCell>
                <TableCell>Forma Pagamento</TableCell>
                <TableCell>Data da Venda</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && vendas.length === 0 && !error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" className={styles.errorMessage}>
                    Erro ao carregar vendas: {error.message}. Por favor, tente novamente.
                  </TableCell>
                </TableRow>
              ) : vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" className={styles.noData}>Nenhuma venda registrada.</TableCell>
                </TableRow>
              ) : (
                vendas.map(venda => (
                  <VendaItem
                    key={venda.id}
                    venda={venda}
                    onDeleteRequest={handleDeleteRequest}
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

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão de Venda?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você tem certeza que deseja excluir a venda do produto "{vendaToDelete?.produto_nome}" (ID: {vendaToDelete?.id})?
            Esta ação não pode ser desfeita e a quantidade será revertida ao estoque.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Vendas;