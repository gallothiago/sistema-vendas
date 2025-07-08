// sistema_de_vendas_novo/frontend/src/components/VendaItem.jsx
import React from 'react';
import { TableRow, TableCell, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function VendaItem({ venda, onDeleteRequest }) {
  const formattedDate = new Date(venda.data_venda).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <TableRow
      key={venda.id}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {venda.id}
      </TableCell>
      <TableCell>{venda.produto_nome}</TableCell>
      <TableCell>{venda.quantidade}</TableCell>
      <TableCell>R$ {venda.preco_unitario.toFixed(2).replace('.', ',')}</TableCell>
      <TableCell>R$ {venda.preco_total.toFixed(2).replace('.', ',')}</TableCell>
      <TableCell>{venda.forma_pagamento}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            aria-label="excluir"
            color="error"
            onClick={() => onDeleteRequest(venda)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default VendaItem;