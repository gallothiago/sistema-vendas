# sistema_de_vendas_novo/backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
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
        # Acessa o nome do produto através do relacionamento 'produto'
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
        print(f"Erro ao adicionar produto: {e}") # Para debug
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

    # Verifica se o novo nome já existe para outro produto, excluindo o produto atual
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
        print(f"Erro ao atualizar produto: {e}") # Para debug
        return jsonify({"error": f"Erro interno ao atualizar produto: {str(e)}"}), 500

@app.route('/produtos/<int:id>', methods=['DELETE'])
def delete_produto(id):
    produto = Produto.query.get_or_404(id)
    if produto.vendas: # Verifica se existem vendas associadas
        return jsonify({"error": "Não é possível excluir o produto porque existem vendas associadas a ele."}), 400

    try:
        db.session.delete(produto)
        db.session.commit()
        return jsonify({"message": "Produto excluído com sucesso."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao excluir produto: {e}") # Para debug
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
        produto.quantidade -= quantidade # Reduz o estoque
        db.session.commit()
        return jsonify(new_venda.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao adicionar venda: {e}") # Para debug
        return jsonify({"error": f"Erro interno ao adicionar venda: {str(e)}"}), 500

@app.route('/vendas', methods=['GET'])
def get_vendas():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Carrega vendas e faz um join com produtos para obter o nome
    paginated_vendas = Venda.query.join(Produto).paginate(page=page, per_page=per_page, error_out=False)
    
    vendas_data = [venda.to_dict() for venda in paginated_vendas.items]
    return jsonify({
        'vendas': vendas_data,
        'total_pages': paginated_vendas.pages,
        'current_page': paginated_vendas.page,
        'total_items': paginated_vendas.total
    })

# Relatórios
@app.route('/relatorios/total_estoque', methods=['GET'])
def total_estoque():
    total_produtos = Produto.query.count()
    valor_total_estoque = db.session.query(db.func.sum(Produto.quantidade * Produto.preco)).scalar() or 0
    return jsonify({
        'total_produtos_cadastrados': total_produtos,
        'valor_total_do_estoque': round(valor_total_estoque, 2)
    })

@app.route('/relatorios/total_vendas', methods=['GET'])
def total_vendas():
    total_vendas = Venda.query.count()
    valor_total_vendas = db.session.query(db.func.sum(Venda.preco_total)).scalar() or 0
    return jsonify({
        'total_vendas_realizadas': total_vendas,
        'valor_total_das_vendas': round(valor_total_vendas, 2)
    })

@app.route('/relatorios/vendas_por_mes', methods=['GET'])
def vendas_por_mes():
    vendas = db.session.query(
        db.func.strftime('%Y-%m', Venda.data_venda).label('mes_ano'),
        db.func.sum(Venda.preco_total).label('total_vendas')
    ).group_by('mes_ano').order_by('mes_ano').all()

    vendas_agrupadas = [{'mes_ano': v.mes_ano, 'total_vendas': round(v.total_vendas, 2)} for v in vendas]
    return jsonify(vendas_agrupadas)

@app.route('/relatorios/vendas_por_produto', methods=['GET'])
def vendas_por_produto():
    vendas = db.session.query(
        Produto.nome.label('produto_nome'),
        db.func.sum(Venda.preco_total).label('total_vendido')
    ).join(Venda).group_by(Produto.nome).order_by(db.func.sum(Venda.preco_total).desc()).all()

    vendas_agrupadas = [{'produto_nome': item.produto_nome, 'total_vendido': round(item.total_vendido, 2)} for item in vendas]
    return jsonify(vendas_agrupadas)

@app.route('/relatorios/receita_por_forma_pagamento', methods=['GET'])
def receita_por_forma_pagamento():
    receitas = db.session.query(
        Venda.forma_pagamento,
        db.func.sum(Venda.preco_total).label('total_receita')
    ).group_by(Venda.forma_pagamento).order_by(Venda.forma_pagamento).all()

    receitas_agrupadas = [{'forma_pagamento': r.forma_pagamento, 'total_receita': round(r.total_receita, 2)} for r in receitas]
    return jsonify(receitas_agrupadas)


# =======================
# Inicialização da Aplicação
# =======================

if __name__ == '__main__':
    # Garante que a pasta 'instance' exista antes de criar o banco de dados
    if not os.path.exists(os.path.join(basedir, 'instance')):
        os.makedirs(os.path.join(basedir, 'instance'))
    
    with app.app_context():
        db.create_all() # Cria as tabelas no banco de dados site.db
    app.run(debug=True)