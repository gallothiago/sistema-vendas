// sistema_de_vendas_novo/frontend/src/components/ProdutoItem.jsx
import React, { useState } from 'react';
import { Button, TableCell, TableRow } from '@mui/material'; // Importa componentes MUI
import EditIcon from '@mui/icons-material/Edit'; // Ícone de editar
import DeleteIcon from '@mui/icons-material/Delete'; // Ícone de deletar
import ConfirmModal from './ConfirmModal'; // Modal de confirmação (ainda personalizado)
// import styles from '../App.module.css'; // Não precisamos mais dos estilos de tabela aqui

function ProdutoItem({ produto, onEditRequest, onProdutoDeleted, showToast }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setDeleting(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/produtos/${produto.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      onProdutoDeleted();
      showToast('Produto excluído com sucesso!', 'success');

    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      let errorMessage = `Erro ao excluir produto: ${err.message}`;
      if (err.message.includes('Não é possível excluir o produto porque existem vendas associadas a ele.')) {
          errorMessage = 'Não é possível excluir este produto pois ele tem vendas registradas.';
      } else if (err.message) {
          errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <TableRow>
        <TableCell>{produto.id}</TableCell>
        <TableCell>{produto.nome}</TableCell>
        <TableCell>{produto.quantidade}</TableCell>
        <TableCell>R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="warning" // Warning color definida no tema
            onClick={() => onEditRequest(produto)}
            disabled={deleting}
            startIcon={<EditIcon />} // Adiciona ícone
            sx={{ mr: 1 }} // Margem à direita
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="error" // Error color definida no tema
            onClick={handleDeleteClick}
            disabled={deleting}
            startIcon={<DeleteIcon />} // Adiciona ícone
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </TableCell>
      </TableRow>
      {showConfirmModal && (
        <ConfirmModal
          message={`Tem certeza que deseja excluir o produto "${produto.nome}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}

export default ProdutoItem;