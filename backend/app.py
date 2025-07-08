# sistema_de_vendas_novo/backend/app.py
# ... (suas importações, configurações e modelos existentes) ...

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, time, date # Importe 'date' se for usar para algo específico, 'datetime' já é suficiente

import os

# Configuração da aplicação Flask
app = Flask(__name__)
CORS(app) 

# Configuração do banco de dados SQLite
# Define o caminho do banco de dados para a pasta 'instance'
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'instance', 'site.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# =======================
# Modelos do Banco de Dados
# =======================

class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), unique=True, nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco = db.Column(db.Float, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento de volta com Venda (permite acessar vendas de um produto)
    vendas = db.relationship('Venda', backref='produto', lazy=True)

    def __repr__(self):
        return f'<Produto {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'quantidade': self.quantidade,
            'preco': self.preco,
            'data_criacao': self.data_criacao.isoformat()
        }

class Venda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco_unitario = db.Column(db.Float, nullable=False)
    preco_total = db.Column(db.Float, nullable=False)
    forma_pagamento = db.Column(db.String(50), nullable=False)
    data_venda = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Venda {self.id} - Produto: {self.produto_id}>'

    def to_dict(self):
        produto_nome = self.produto.nome if self.produto else 'Produto Desconhecido'
        return {
            'id': self.id,
            'produto_id': self.produto_id,
            'produto_nome': produto_nome,
            'quantidade': self.quantidade,
            'preco_unitario': self.preco_unitario,
            'preco_total': self.preco_total,
            'forma_pagamento': self.forma_pagamento,
            'data_venda': self.data_venda.isoformat()
        }

# =======================
# Rotas (Endpoints) da API
# =======================

# Produtos
@app.route('/produtos', methods=['POST'])
def add_produto():
    data = request.get_json()
    nome = data.get('nome')
    quantidade = data.get('quantidade')
    preco = data.get('preco')

    if not nome or quantidade is None or preco is None:
        return jsonify({"error": "Nome, quantidade e preço são obrigatórios."}), 400

    if not isinstance(nome, str) or not nome.strip():
        return jsonify({"error": "Nome do produto é inválido."}), 400
    if not isinstance(quantidade, (int, float)) or quantidade < 0:
        return jsonify({"error": "Quantidade deve ser um número não negativo."}), 400
    if not isinstance(preco, (int, float)) or preco < 0:
        return jsonify({"error": "Preço deve ser um número não negativo."}), 400

    # Verifica se o produto já existe pelo nome
    if Produto.query.filter_by(nome=nome.strip()).first():
        return jsonify({"error": "Produto com este nome já existe."}), 409

    try:
        new_produto = Produto(nome=nome.strip(), quantidade=int(quantidade), preco=float(preco))
        db.session.add(new_produto)
        db.session.commit()
        return jsonify(new_produto.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao adicionar produto: {e}")
        return jsonify({"error": f"Erro interno ao adicionar produto: {str(e)}"}), 500

@app.route('/produtos', methods=['GET'])
def get_produtos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search_term = request.args.get('search', '', type=str)

    query = Produto.query
    if search_term:
        query = query.filter(Produto.nome.ilike(f'%{search_term}%'))

    paginated_produtos = query.paginate(page=page, per_page=per_page, error_out=False)

    produtos_data = [produto.to_dict() for produto in paginated_produtos.items]
    return jsonify({
        'produtos': produtos_data,
        'total_pages': paginated_produtos.pages,
        'current_page': paginated_produtos.page,
        'total_items': paginated_produtos.total
    })

@app.route('/produtos/<int:id>', methods=['GET'])
def get_produto(id):
    produto = Produto.query.get_or_404(id)
    return jsonify(produto.to_dict())

@app.route('/produtos/<int:id>', methods=['PUT'])
def update_produto(id):
    produto = Produto.query.get_or_404(id)
    data = request.get_json()
    nome = data.get('nome')
    quantidade = data.get('quantidade')
    preco = data.get('preco')

    if not nome or quantidade is None or preco is None:
        return jsonify({"error": "Nome, quantidade e preço são obrigatórios."}), 400

    if not isinstance(nome, str) or not nome.strip():
        return jsonify({"error": "Nome do produto é inválido."}), 400
    if not isinstance(quantidade, (int, float)) or quantidade < 0:
        return jsonify({"error": "Quantidade deve ser um número não negativo."}), 400
    if not isinstance(preco, (int, float)) or preco < 0:
        return jsonify({"error": "Preço deve ser um número não negativo."}), 400

    existing_produto = Produto.query.filter(
        Produto.nome == nome.strip(),
        Produto.id != id
    ).first()
    if existing_produto:
        return jsonify({"error": "Produto com este nome já existe."}), 409

    try:
        produto.nome = nome.strip()
        produto.quantidade = int(quantidade)
        produto.preco = float(preco)
        db.session.commit()
        return jsonify(produto.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar produto: {e}")
        return jsonify({"error": f"Erro interno ao atualizar produto: {str(e)}"}), 500

@app.route('/produtos/<int:id>', methods=['DELETE'])
def delete_produto(id):
    produto = Produto.query.get_or_404(id)
    try:
        if produto.vendas:
            return jsonify({"error": "Não é possível excluir o produto porque existem vendas associadas a ele."}), 400

        db.session.delete(produto)
        db.session.commit()
        return jsonify({"message": "Produto excluído com sucesso."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao excluir produto: {e}")
        return jsonify({"error": f"Erro interno ao excluir produto: {str(e)}"}), 500

# Vendas
@app.route('/vendas', methods=['POST'])
def add_venda():
    data = request.get_json()
    produto_id = data.get('produto_id')
    quantidade = data.get('quantidade')
    forma_pagamento = data.get('forma_pagamento')

    if not produto_id or not quantidade or not forma_pagamento:
        return jsonify({"error": "Produto, quantidade e forma de pagamento são obrigatórios."}), 400

    if not isinstance(quantidade, int) or quantidade <= 0:
        return jsonify({"error": "Quantidade da venda deve ser um número inteiro positivo."}), 400
    if not isinstance(forma_pagamento, str) or not forma_pagamento.strip():
        return jsonify({"error": "Forma de pagamento inválida."}), 400

    produto = Produto.query.get(produto_id)
    if not produto:
        return jsonify({"error": "Produto não encontrado."}), 404
    if quantidade > produto.quantidade:
        return jsonify({"error": "Quantidade em estoque insuficiente."}), 400

    try:
        preco_unitario = produto.preco
        preco_total = preco_unitario * quantidade

        new_venda = Venda(
            produto_id=produto_id,
            quantidade=quantidade,
            preco_unitario=preco_unitario,
            preco_total=preco_total,
            forma_pagamento=forma_pagamento.strip()
        )
        db.session.add(new_venda)
        produto.quantidade -= quantidade
        db.session.commit()
        return jsonify(new_venda.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao adicionar venda: {e}")
        return jsonify({"error": f"Erro interno ao adicionar venda: {str(e)}"}), 500

@app.route('/vendas', methods=['GET'])
def get_vendas():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    paginated_vendas = Venda.query.join(Produto).order_by(Venda.data_venda.desc()).paginate(page=page, per_page=per_page, error_out=False)

    vendas_data = [venda.to_dict() for venda in paginated_vendas.items]
    return jsonify({
        'vendas': vendas_data,
        'total_pages': paginated_vendas.pages,
        'current_page': paginated_vendas.page,
        'total_items': paginated_vendas.total
    })

@app.route('/vendas/<int:id>', methods=['DELETE'])
def delete_venda(id):
    venda = Venda.query.get_or_404(id)
    try:
        produto = Produto.query.get(venda.produto_id)
        if produto:
            produto.quantidade += venda.quantidade

        db.session.delete(venda)
        db.session.commit()
        return jsonify({"message": "Venda excluída com sucesso e estoque atualizado."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao excluir venda: {e}")
        return jsonify({"error": f"Erro interno ao excluir venda: {str(e)}"}), 500


# =======================
# Funções Auxiliares para Relatórios
# =======================

def apply_venda_filters(query):
    # Parâmetros de filtro
    data_inicio_str = request.args.get('data_inicio')
    data_fim_str = request.args.get('data_fim')
    # O frontend envia 'tipo_movimento', mas sua tabela 'Venda' não tem essa coluna.
    # Vou ignorar 'tipo_movimento' no backend, ou você precisará adicionar essa coluna à sua tabela Venda.
    # tipo_movimento_filtro = request.args.get('tipo_movimento')
    forma_pagamento_filtro = request.args.get('forma_pagamento') # Mudado de 'forma_pagamento_filtro' para 'forma_pagamento'
    produto_id_filtro = request.args.get('produto_id', type=int) # Mudado de 'produto_id_filtro' para 'produto_id'

    # Se você decidir adicionar tipo_movimento à tabela Venda, descomente e ajuste:
    # if tipo_movimento_filtro and tipo_movimento_filtro != 'Todos':
    #     query = query.filter(Venda.tipo_movimento == tipo_movimento_filtro)

    if data_inicio_str:
        try:
            # Pega o início do dia da data de início
            data_inicio = datetime.strptime(data_inicio_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Venda.data_venda >= data_inicio)
        except ValueError:
            print(f"DEBUG: apply_venda_filters - data_inicio inválida: {data_inicio_str}")
            pass # Ignora filtro inválido

    if data_fim_str:
        try:
            # Pega o final do dia da data de fim
            data_fim = datetime.strptime(data_fim_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999)
            query = query.filter(Venda.data_venda <= data_fim)
        except ValueError:
            print(f"DEBUG: apply_venda_filters - data_fim inválida: {data_fim_str}")
            pass # Ignora filtro inválido

    if forma_pagamento_filtro and forma_pagamento_filtro != 'Todos':
        query = query.filter(Venda.forma_pagamento == forma_pagamento_filtro)

    if produto_id_filtro:
        # Garante que a query tem o join com Produto para que o filtro de produto.id funcione
        # É uma boa prática fazer o join no início da consulta que você passa para apply_venda_filters
        # para evitar problemas de múltiplos joins ou joins ausentes.
        # Ex: Venda.query.join(Produto)
        query = query.filter(Produto.id == produto_id_filtro)

    return query

# =======================
# Nova Rota Consolidada de Relatórios
# =======================

@app.route('/relatorios', methods=['GET'])
def get_consolidated_relatorios():
    try:
        # 1. Total em Estoque e Valor Total do Estoque (não precisa de filtros de venda)
        total_produtos_cadastrados = Produto.query.count()
        valor_total_do_estoque = db.session.query(db.func.sum(Produto.quantidade * Produto.preco)).scalar() or 0
        
        # 2. Total de Vendas e Valor Total das Vendas (com filtros)
        query_vendas = Venda.query
        query_vendas = apply_venda_filters(query_vendas)

        total_vendas_realizadas = query_vendas.count()
        valor_total_das_vendas = query_vendas.with_entities(db.func.sum(Venda.preco_total)).scalar() or 0.0

        # 3. Vendas por Mês (com filtros)
        # Replicando a lógica de vendas_por_mes
        query_vendas_por_mes = Venda.query # Nova query base para este gráfico
        query_vendas_por_mes = apply_venda_filters(query_vendas_por_mes) # Aplica os mesmos filtros

        vendas_por_mes_data_raw = query_vendas_por_mes.with_entities(
            db.func.strftime('%Y-%m', Venda.data_venda).label('mes_ano_raw'), # Mantém o formato original para ordenação
            db.func.sum(Venda.preco_total).label('total_vendas')
        ).group_by('mes_ano_raw').order_by('mes_ano_raw').all()

        vendas_por_mes_data_formatted = []
        for vm in vendas_por_mes_data_raw:
            year, month_num = map(int, vm.mes_ano_raw.split('-'))
            # Usar format do date-fns no frontend é mais flexível, mas podemos fazer aqui se necessário
            # Apenas para simplificar a passagem, vamos manter o formato MM/YYYY ou YYYY-MM para o frontend lidar.
            # Ou, se realmente quiser o nome do mês, use datetime para formatar.
            mes_nome = datetime(year, month_num, 1).strftime('%m/%Y') # Retorna MM/YYYY para facilitar no frontend
            # mes_nome = datetime(year, month_num, 1).strftime('%B').capitalize() # Para nome do mês
            vendas_por_mes_data_formatted.append({
                'mesAno': mes_nome, # Nome da chave deve ser 'mesAno' para bater com o frontend
                'vendas': round(vm.total_vendas, 2)
            })

        # 4. Vendas por Produto (com filtros)
        query_vendas_por_produto = Venda.query.join(Produto) # Deve começar com join
        query_vendas_por_produto = apply_venda_filters(query_vendas_por_produto)

        vendas_por_produto_data = query_vendas_por_produto.with_entities(
            Produto.nome.label('produto_nome'),
            db.func.sum(Venda.preco_total).label('total_vendido')
        ).group_by(Produto.nome).order_by(db.func.sum(Venda.preco_total).desc()).all()

        vendas_por_produto_formatted = [{'produto_nome': vp.produto_nome, 'total_vendido': round(vp.total_vendido, 2)} for vp in vendas_por_produto_data]

        # 5. Receita por Forma de Pagamento (com filtros)
        query_receita_por_forma_pagamento = Venda.query
        query_receita_por_forma_pagamento = apply_venda_filters(query_receita_por_forma_pagamento)

        receita_por_forma_pagamento_data = query_receita_por_forma_pagamento.with_entities(
            Venda.forma_pagamento.label('forma_pagamento'),
            db.func.sum(Venda.preco_total).label('total_receita')
        ).group_by(Venda.forma_pagamento).order_by(db.func.sum(Venda.preco_total).desc()).all()

        receita_por_forma_pagamento_formatted = [{'forma_pagamento': rp.forma_pagamento, 'total_receita': round(rp.total_receita, 2)} for rp in receita_por_forma_pagamento_data]

        return jsonify({
            'total_produtos': total_produtos_cadastrados,
            'valor_total_estoque': round(valor_total_do_estoque, 2),
            'total_vendas': total_vendas_realizadas,
            'valor_total_vendas': round(valor_total_das_vendas, 2),
            'vendas_por_mes': vendas_por_mes_data_formatted,
            'vendas_por_produto': vendas_por_produto_formatted, # Adicionado
            'receita_por_forma_pagamento': receita_por_forma_pagamento_formatted # Adicionado
        }), 200

    except Exception as e:
        print(f"Erro ao gerar relatórios consolidados: {e}")
        return jsonify({'error': f"Erro interno ao gerar relatórios: {str(e)}"}), 500


# As rotas individuais de relatório (/relatorios/total_estoque, etc.) podem ser mantidas ou removidas
# dependendo se você ainda as utiliza de forma independente em algum lugar.
# Se o frontend só for usar a rota consolidada, elas podem ser removidas para evitar redundância.
# Por enquanto, vou deixá-las, mas a rota principal de relatórios chamará a lógica diretamente.
# Você pode remover as rotas abaixo se elas não forem mais usadas diretamente.

# @app.route('/relatorios/total_estoque', methods=['GET'])
# def total_estoque():
#     # ... (lógica existente) ...

# @app.route('/relatorios/total_vendas', methods=['GET'])
# def total_vendas():
#     # ... (lógica existente) ...

# @app.route('/relatorios/vendas_por_mes', methods=['GET'])
# def vendas_por_mes():
#     # ... (lógica existente) ...

# @app.route('/relatorios/vendas_por_produto', methods=['GET'])
# def vendas_por_produto():
#     # ... (lógica existente) ...

# @app.route('/relatorios/receita_por_forma_pagamento', methods=['GET'])
# def receita_por_forma_pagamento():
#     # ... (lógica existente) ...


# =======================
# Inicialização da Aplicação
# =======================

if __name__ == '__main__':
    # Garante que a pasta 'instance' exista antes de criar o banco de dados
    if not os.path.exists(os.path.join(basedir, 'instance')):
        os.makedirs(os.path.join(basedir, 'instance'))

    with app.app_context():
        db.create_all()
    app.run(debug=True)