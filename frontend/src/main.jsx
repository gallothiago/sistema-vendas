// sistema_de_vendas_novo/frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Mantenha este se tiver estilos globais
// Importações do MUI Theme
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Importe seu tema personalizado
// Importação do CSS Baseline para resetar estilos do navegador
import CssBaseline from '@mui/material/CssBaseline';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Isso aplica um reset de CSS para uma base consistente */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);