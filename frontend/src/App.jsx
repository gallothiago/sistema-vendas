// frontend/src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import styles from './App.module.css'; // Importa App.module.css
import ProdutoItem from './components/ProdutoItem';
import VendaForm from './components/VendaForm';
import ProdutoForm from './components/ProdutoForm';
import Navegacao from './components/Navegacao';
import VendaItem from './components/VendaItem';
import Relatorios from './components/Relatorios';
import ConfirmModal from './components/ConfirmModal';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduto, setEditingProduto] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editQuantidade, setEditQuantidade] = useState('');
  const [editPreco, setEditPreco] = useState('');

  const [currentView, setCurrentView] = useState('produtos');
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchTermProduto, setSearchTermProduto] = useState('');
  const [filterProdutoVenda, setFilterProdutoVenda] = useState('');
  const [filterFormaPagamentoVenda, setFilterFormaPagamentoVenda] = useState('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [produtoToDeleteId, setProdutoToDeleteId] = useState(null);
  const [produtoToDeleteNome, setProdutoToDeleteNome] = useState('');


  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchData = () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const fetchProdutosPromise = fetch('http://127.0.0.1:5000/produtos')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setProdutos(data);
      })
      .catch(error => {
        console.error("Erro ao buscar produtos:", error);
        setError(error);
        throw error;
      });

    const fetchVendasPromise = fetch('http://127.0.0.1:5000/vendas')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setVendas(data);
      })
      .catch(error => {
        console.error("Erro ao buscar vendas:", error);
        setError(error);
        throw error;
      });

    Promise.all([fetchProdutosPromise, fetchVendasPromise])
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (produto) => {
    setEditingProduto(produto);
    setEditNome(produto.nome);
    setEditQuantidade(produto.quantidade);
    setEditPreco(produto.preco);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpdateProduto = (e) => {
    e.preventDefault();
    if (!editingProduto) return;

    const produtoAtualizado = {
      nome: editNome,
      quantidade: editQuantidade !== '' ? parseInt(editQuantidade) : 0,
      preco: editPreco !== '' ? parseFloat(editPreco) : 0.0,
    };

    if (isNaN(produtoAtualizado.quantidade) || isNaN(produtoAtualizado.preco) || produtoAtualizado.quantidade < 0 || produtoAtualizado.preco < 0) {
      setError(new Error("Quantidade e Preço na edição devem ser números válidos e não negativos."));
      return;
    }

    fetch(`http://127.0.0.1:5000/produtos/${editingProduto.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produtoAtualizado),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`); });
        }
        return response.json();
      })
      .then(data => {
        console.log('Produto atualizado:', data);
        setEditingProduto(null);
        fetchData();
        showSuccessMessage(`Produto "${data.nome}" atualizado com sucesso!`);
        setError(null);
      })
      .catch(error => {
        console.error("Erro ao atualizar produto:", error);
        setError(error);
        setSuccessMessage(null);
      });
  };

  const openConfirmModal = (id, nome) => {
    setProdutoToDeleteId(id);
    setProdutoToDeleteNome(nome);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProdutoToDeleteId(null);
    setProdutoToDeleteNome('');
  };

  const confirmDeleteProduto = () => {
    if (produtoToDeleteId) {
      fetch(`http://127.0.0.1:5000/produtos/${produtoToDeleteId}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`); });
          }
          if (response.status === 204) {
            return {};
          }
          return response.json();
        })
        .then(() => {
          console.log('Produto excluído com sucesso.');
          fetchData();
          showSuccessMessage(`Produto "${produtoToDeleteNome}" excluído com sucesso!`);
          setError(null);
          closeConfirmModal();
        })
        .catch(error => {
          console.error("Erro ao excluir produto:", error);
          setError(error);
          setSuccessMessage(null);
          closeConfirmModal();
        });
    }
  };

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto =>
      produto.nome.toLowerCase().includes(searchTermProduto.toLowerCase())
    );
  }, [produtos, searchTermProduto]);

  const filteredVendas = useMemo(() => {
    let vendasFiltradas = vendas;

    if (filterProdutoVenda) {
      vendasFiltradas = vendasFiltradas.filter(venda =>
        venda.produto_id === parseInt(filterProdutoVenda)
      );
    }

    if (filterFormaPagamentoVenda) {
      vendasFiltradas = vendasFiltradas.filter(venda =>
        venda.forma_pagamento.toLowerCase() === filterFormaPagamentoVenda.toLowerCase()
      );
    }
    return vendasFiltradas;
  }, [vendas, filterProdutoVenda, filterFormaPagamentoVenda]);


  if (loading) {
    return <div>Carregando dados...</div>;
  }

  return (
    <div className={styles.App}> {/* Usa a classe CSS Module */}
      <h1>Sistema de Vendas</h1>

      <Navegacao view={currentView} setView={setCurrentView} />

      {error && (
        <div className={styles.errorMessage}> {/* Usa a classe CSS Module */}
          <strong>Erro:</strong> {error.message}
        </div>
      )}

      {successMessage && (
        <div className={styles.successMessage}> {/* Usa a classe CSS Module */}
          <strong>Sucesso:</strong> {successMessage}
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={`Tem certeza que deseja excluir o produto "${produtoToDeleteNome}"? Esta ação é irreversível.`}
        onConfirm={confirmDeleteProduto}
        onCancel={closeConfirmModal}
      />

      {/* Conteúdo da Visão de Produtos */}
      {currentView === 'produtos' && (
        <>
          <ProdutoForm
            onProdutoCadastrado={() => {
              fetchData();
              showSuccessMessage('Produto cadastrado com sucesso!');
            }}
            onError={setError}
          />

          <hr /> {/* HR pode manter-se sem classe se for estilo global */}

          {editingProduto && (
            <div className={styles.formContainer}> {/* Poderia ser um estilo global ou em ProdutoForm.module.css */}
              <h2>Editar Produto: {editingProduto.nome}</h2>
              <form onSubmit={handleUpdateProduto}>
                <div>
                  <label htmlFor="editNome">Nome:</label>
                  <input
                    type="text"
                    id="editNome"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="editQuantidade">Quantidade:</label>
                  <input
                    type="number"
                    id="editQuantidade"
                    value={editQuantidade}
                    onChange={(e) => setEditQuantidade(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="editPreco">Preço:</label>
                  <input
                    type="number"
                    id="editPreco"
                    step="0.01"
                    value={editPreco}
                    onChange={(e) => setEditPreco(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <button type="submit">Salvar Alterações</button>
                <button type="button" onClick={() => setEditingProduto(null)} className={styles.secondaryButton}> {/* Exemplo de classe reutilizável */}
                  Cancelar
                </button>
              </form>
            </div>
          )}

          <h2>Lista de Produtos em Estoque</h2>
          <div className={styles.searchFilterContainer}> {/* Novo estilo para o container de busca */}
            <label htmlFor="searchProduto">Buscar Produto por Nome:</label>
            <input
              type="text"
              id="searchProduto"
              value={searchTermProduto}
              onChange={(e) => setSearchTermProduto(e.target.value)}
              placeholder="Digite o nome do produto..."
            />
          </div>

          {filteredProdutos.length === 0 ? (
            <p>Nenhum produto encontrado com os critérios de busca.</p>
          ) : (
            <ul>
              {filteredProdutos.map(produto => (
                <ProdutoItem
                  key={produto.id}
                  produto={produto}
                  onEdit={handleEditClick}
                  onDelete={openConfirmModal}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Conteúdo da Visão de Vendas */}
      {currentView === 'vendas' && (
        <>
          <VendaForm
            produtos={produtos}
            onVendaRegistrada={() => {
              fetchData();
              showSuccessMessage('Venda registrada com sucesso!');
            }}
            onError={setError}
          />

          <hr />

          <h2>Histórico de Vendas</h2>
          <div className={styles.searchFilterContainer}> {/* Novo estilo para o container de filtro */}
            <label htmlFor="filterProdutoVenda">Filtrar por Produto:</label>
            <select
              id="filterProdutoVenda"
              value={filterProdutoVenda}
              onChange={(e) => setFilterProdutoVenda(e.target.value)}
            >
              <option value="">Todos os Produtos</option>
              {produtos.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>

            <label htmlFor="filterFormaPagamentoVenda" style={{ marginLeft: '20px' }}>Filtrar por Forma de Pagamento:</label>
            <select
              id="filterFormaPagamentoVenda"
              value={filterFormaPagamentoVenda}
              onChange={(e) => setFilterFormaPagamentoVenda(e.target.value)}
            >
              <option value="">Todas as Formas</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartao de Credito">Cartão de Crédito</option>
              <option value="Cartao de Debito">Cartão de Débito</option>
              <option value="Pix">Pix</option>
            </select>
            <button
                onClick={() => { setFilterProdutoVenda(''); setFilterFormaPagamentoVenda(''); }}
                className={styles.secondaryButton}
            >
                Limpar Filtros
            </button>
          </div>

          {filteredVendas.length === 0 ? (
            <p>Nenhuma venda encontrada com os critérios de filtro.</p>
          ) : (
            <ul>
              {filteredVendas.map(venda => (
                <VendaItem key={venda.id} venda={venda} />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Conteúdo da Visão de Relatórios */}
      {currentView === 'relatorios' && (
        <Relatorios produtos={produtos} vendas={vendas} />
      )}
    </div>
  );
}

export default App;