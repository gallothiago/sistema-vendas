// sistema_de_vendas_novo/frontend/src/components/Navegacao.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material'; // Importa Box e Button do MUI

function Navegacao() {
  return (
    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button component={Link} to="/" variant="text" sx={{ color: 'white' }}>
        Início
      </Button>
      <Button component={Link} to="/produtos" variant="text" sx={{ color: 'white' }}>
        Produtos
      </Button>
      <Button component={Link} to="/vendas" variant="text" sx={{ color: 'white' }}>
        Vendas
      </Button>
      <Button component={Link} to="/relatorios" variant="text" sx={{ color: 'white' }}>
        Relatórios
      </Button>
    </Box>
  );
}

export default Navegacao;