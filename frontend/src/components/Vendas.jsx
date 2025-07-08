// sistema_de_vendas_novo/frontend/src/components/Vendas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import VendaForm from './VendaForm';
import VendaItem from './VendaItem';
import styles from '../App.module.css';
import LoadingSpinner from './LoadingSpinner'; // Importa o novo componente

function Vendas({ showToast }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    // Quando uma venda é salva, recarregar a lista de vendas (e produtos no App.jsx também precisa de recarga)
    fetchVendas(currentPage);
    // Nota: O estoque de produtos é atualizado pelo backend. Para que o dropdown de produtos no VendaForm
    // reflita essa mudança imediatamente sem recarregar a página inteira, VendaForm precisa re-fetch produtos,
    // ou App.jsx precisar passar um trigger para re-fetch produtos para Vendas.
    // Por simplicidade, assumimos que o App.jsx também vai re-renderizar e re-fetch.
    // Para um sistema maior, você usaria um contexto ou Redux para gerenciar estados globais.
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.vendasPageContent}>
      <h2>Gestão de Vendas</h2>
      <VendaForm onVendaSaved={handleVendaSaved} showToast={showToast} />

      <div className={styles.vendasListContainer}>
        <h3>Histórico de Vendas</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço Unitário</th>
                <th>Preço Total</th>
                <th>Forma Pagamento</th>
                <th>Data da Venda</th>
              </tr>
            </thead>
            <tbody>
              {loading && vendas.length === 0 && !error ? (
                <tr>
                  <td colSpan="7">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className={styles.errorMessage}>
                    Erro ao carregar vendas: {error.message}. Por favor, tente novamente.
                  </td>
                </tr>
              ) : vendas.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.noData}>Nenhuma venda registrada.</td>
                </tr>
              ) : (
                vendas.map(venda => (
                  <VendaItem key={venda.id} venda={venda} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

export default Vendas;