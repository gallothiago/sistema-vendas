// sistema_de_vendas_novo/frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Seu primary-color (verde)
      dark: '#45a049', // Seu darker-primary-color
    },
    secondary: {
      main: '#3f51b5', // O azul que você usava no cabeçalho
    },
    error: {
      main: '#f44336', // Seu error-color (vermelho)
    },
    warning: {
      main: '#ff9800', // Seu warning-color (laranja)
    },
    info: {
      main: '#2196F3', // Seu info-color (azul)
    },
    success: {
        main: '#4CAF50', // Seu success-color (verde)
    },
    background: {
        default: '#eceff1', // Seu background-color
        paper: '#ffffff', // Cor de fundo para componentes como Paper, Card
    },
    text: {
        primary: '#37474F', // Seu text-color
        secondary: '#555',
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#4CAF50', // Cor primária para títulos de seção
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#37474F', // Cor de texto para subtítulos
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove o uppercase padrão dos botões
          borderRadius: '8px', // Botões mais arredondados
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Sombra padrão
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: { // Para inputs
      defaultProps: {
        variant: 'outlined', // Estilo padrão para todos os TextFields
        fullWidth: true, // Por padrão, os inputs serão full width
      },
      styleOverrides: {
        root: {
          marginBottom: '16px', // Espaçamento abaixo dos inputs
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined', // Estilo padrão para Selects
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          marginBottom: '16px',
        },
      },
    },
    MuiTableCell: { // Para células de tabela
        styleOverrides: {
            head: {
                backgroundColor: '#3f51b5', // Cor do cabeçalho da tabela
                color: 'white',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.9em',
            },
            body: {
                fontSize: '1em',
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:nth-of-type(odd)': {
                    backgroundColor: '#f9f9f9', // Linhas impares
                },
                '&:hover': {
                    backgroundColor: '#e3f2fd', // Azul claro ao hover
                },
            },
        },
    },
    MuiPaper: { // Para Cards e outros componentes de "papel"
        styleOverrides: {
            root: {
                borderRadius: '10px', // Borda arredondada padrão para cards/forms
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Sombra mais proeminente
            }
        }
    }
  },
});

export default theme;