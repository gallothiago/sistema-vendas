# Sistema-Vendas

Sistema completo de gestão de **vendas e estoque**, com interface frontend construída em **React.js** e backend em **Python** utilizando **Flask**.

## Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)


---

## Sobre

Este projeto implementa um sistema de vendas e controle de estoque, dividido em duas camadas:  
- **Frontend:** aplicação SPA desenvolvida em **React.js**.  
- **Backend:** API REST construída com **Python + Flask**, responsável por gerenciar lógica de vendas, produtos, estoque e persistência via banco de dados.

---

## Funcionalidades (exemplos — ajustar conforme o projeto real)

- Cadastro de produtos (nome, preço, quantidade em estoque).  
- Listagem e edição de produtos cadastrados.  
- Controle de estoque: decremento automático ao registrar vendas.  
- Registro de vendas, com histórico exibido.  
- (Opcional) Relatórios ou dashboards com métricas (total vendido, produtos mais vendidos).

---

## Tecnologias Utilizadas

- **Frontend:** React.js; (possivelmente) React Router, Axios, Context API, etc.  
- **Backend:** Python, Flask (microframework web).  
- **Banco de Dados:** (ex. SQLite, PostgreSQL, MySQL — ajustar conforme o configurado).  
- **Outras:** (ex. CORS, Marshmallow, JWT, etc. conforme utilizado).

---

## Pré-requisitos

Certifique-se de ter instalado:

- Node.js (versão X ou superior).  
- Python (versão 3.X ou superior) e pip.  
- Banco de dados configurado (se utilizar um no servidor).

---

## Instalação e Execução

### Frontend

```bash
cd frontend
npm install
npm run dev   # ou 'npm start' dependendo da configuração


### Backend

cd backend
python -m venv venv        # criar ambiente virtual
source venv/bin/activate   # Linux/Mac (ou `venv\Scripts\activate` no Windows)
pip install -r requirements.txt
export FLASK_APP=app.py    # nome do script Flask principal (ajustar se diferente)
flask run
