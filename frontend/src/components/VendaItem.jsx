// sistema_de_vendas_novo/frontend/src/components/VendaItem.jsx
import React from 'react';
import { TableCell, TableRow } from '@mui/material'; // Importa componentes MUI
// import styles from '../App.module.css'; // Não precisamos mais dos estilos de tabela aqui

function VendaItem({ venda }) {
  return (
    <TableRow>
      <TableCell>{venda.id}</TableCell>
      <TableCell>{venda.produto_nome}</TableCell>
      <TableCell>{venda.quantidade}</TableCell>
      <TableCell>R$ {parseFloat(venda.preco_unitario).toFixed(2).replace('.', ',')}</TableCell>
      <TableCell>R$ {parseFloat(venda.preco_total).toFixed(2).replace('.', ',')}</TableCell>
      <TableCell>{venda.forma_pagamento}</TableCell>
      <TableCell>{new Date(venda.data_venda).toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );
}

export default VendaItem;