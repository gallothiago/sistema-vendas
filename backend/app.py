# sistema_de_vendas_novo/backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, time, date
import os

# Configuração da aplicação Flask
app = Flask(__name__)
CORS(app)  # Habilita o CORS para todas as rotas

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
# Rotas de Relatórios (COM FILTROS)
# =======================

def apply_venda_filters(query):
    # Parâmetros de filtro
    data_inicio_str = request.args.get('data_inicio')
    data_fim_str = request.args.get('data_fim')
    forma_pagamento_filtro = request.args.get('forma_pagamento_filtro')
    produto_id_filtro = request.args.get('produto_id_filtro', type=int)

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

    if forma_pagamento_filtro and forma_pagamento_filtro != 'Todos': # Adiciona 'Todos' como opção para o frontend
        query = query.filter(Venda.forma_pagamento == forma_pagamento_filtro)

    if produto_id_filtro:
        # Certifica-se de que a query tem o join com Produto para que o filtro de produto.id funcione
        # Se a query já veio com join (e.g., de Venda.query.join(Produto)), isso não adiciona um join duplicado.
        # Caso contrário, adiciona.
        if Produto not in [mapper.class_ for mapper in query._join_entities]: # Verifica se Produto já está no join
            query = query.join(Produto)
        query = query.filter(Produto.id == produto_id_filtro)

    return query


@app.route('/relatorios/total_estoque', methods=['GET'])
def total_estoque():
    # Este relatório não precisa de filtros de venda
    total_produtos = Produto.query.count()
    valor_total_estoque = db.session.query(db.func.sum(Produto.quantidade * Produto.preco)).scalar() or 0
    return jsonify({
        'total_produtos_cadastrados': total_produtos,
        'valor_total_do_estoque': round(valor_total_estoque, 2)
    })

@app.route('/relatorios/total_vendas', methods=['GET'])
def total_vendas():
    query = Venda.query
    query = apply_venda_filters(query) # Aplica os filtros na query base

    print(f"\n--- DEBUG TOTAL VENDAS ---")
    print(f"Filtros aplicados (request.args): {request.args}")

    # Agora, use a 'query' já filtrada para contar e somar.
    # Contagem de vendas
    total_vendas_count = query.count()
    print(f"Contagem de vendas após filtros: {total_vendas_count}")

    # Para depurar, vamos buscar os itens da query antes de somar
    vendas_filtradas = query.all()
    print(f"Vendas filtradas para soma ({len(vendas_filtradas)} itens):")
    for venda in vendas_filtradas:
        print(f"  - ID: {venda.id}, Produto: {venda.produto_id}, Preco Total: {venda.preco_total}, Data: {venda.data_venda}")

    # Calcular a soma manualmente a partir dos itens filtrados (para conferência)
    manual_sum = sum(venda.preco_total for venda in vendas_filtradas)
    print(f"Soma manual dos preco_total: {manual_sum}")

    # Corrigido: Agora a soma usa a mesma query filtrada, para garantir consistência.
    valor_total_vendas_sum = query.with_entities(db.func.sum(Venda.preco_total)).scalar() or 0
    print(f"Soma do banco de dados (valor_total_vendas_sum): {valor_total_vendas_sum}")
    print(f"--- FIM DEBUG TOTAL VENDAS ---\n")

    return jsonify({
        'total_vendas_realizadas': total_vendas_count,
        'valor_total_das_vendas': round(valor_total_vendas_sum, 2)
    })

@app.route('/relatorios/vendas_por_mes', methods=['GET'])
def vendas_por_mes():
    query = Venda.query
    query = apply_venda_filters(query) # Aplica os filtros

    # Corrigido: Agora o group by é feito sobre a query filtrada diretamente
    # Certifique-se de que se houver um filtro de produto, o join com Produto exista.
    # O `apply_venda_filters` já lida com o join se `produto_id_filtro` for usado.
    vendas_por_mes_query = query.with_entities(
        db.func.strftime('%Y-%m', Venda.data_venda).label('mes_ano'),
        db.func.sum(Venda.preco_total).label('total_vendas')
    ).group_by('mes_ano').order_by('mes_ano').all()

    result = []
    for vm in vendas_por_mes_query:
        year, month_num = map(int, vm.mes_ano.split('-'))
        month_name = datetime(year, month_num, 1).strftime('%B').capitalize()
        result.append({
            'mes_ano': f"{month_name} de {year}",
            'total_vendas': round(vm.total_vendas, 2)
        })
    return jsonify(result)

@app.route('/relatorios/vendas_por_produto', methods=['GET'])
def vendas_por_produto():
    query = Venda.query.join(Produto) # Começa com join para ter acesso ao nome do produto
    query = apply_venda_filters(query) # Aplica os filtros

    # Corrigido: o group_by é feito sobre a query já filtrada e com join
    vendas_por_produto_query = query.with_entities(
        Produto.nome,
        db.func.sum(Venda.preco_total).label('total_vendido')
    ).group_by(Produto.nome).order_by(db.func.sum(Venda.preco_total).desc()).all()

    result = [{'produto_nome': vp.nome, 'total_vendido': round(vp.total_vendido, 2)} for vp in vendas_por_produto_query]
    return jsonify(result)

@app.route('/relatorios/receita_por_forma_pagamento', methods=['GET'])
def receita_por_forma_pagamento():
    query = Venda.query
    query = apply_venda_filters(query) # Aplica os filtros

    # Corrigido: o group_by é feito sobre a query já filtrada
    receita_por_forma_pagamento_query = query.with_entities(
        Venda.forma_pagamento,
        db.func.sum(Venda.preco_total).label('total_receita')
    ).group_by(Venda.forma_pagamento).order_by(db.func.sum(Venda.preco_total).desc()).all()

    result = [{'forma_pagamento': rp.forma_pagamento, 'total_receita': round(rp.total_receita, 2)} for rp in receita_por_forma_pagamento_query]
    return jsonify(result)

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