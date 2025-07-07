# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os # Importado para ajudar a definir o caminho do banco de dados

# Configuração da aplicação Flask
app = Flask(__name__)
CORS(app)

# Configuração do Banco de Dados SQLite
# Define o caminho do banco de dados na raiz do projeto backend
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Desabilita o rastreamento de modificações para economizar memória

# Inicializa o SQLAlchemy
db = SQLAlchemy(app)

# --- Modelos do Banco de Dados ---

class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False, default=0)
    preco = db.Column(db.Float, nullable=False, default=0.0)

    # Relacionamento com Venda: backref 'produto_vendido' permite acessar o produto a partir da venda
    # lazy=True significa que os produtos relacionados serão carregados sob demanda
    vendas = db.relationship('Venda', backref='produto_vendido', lazy=True)

    def __repr__(self):
        return f'<Produto {self.nome}>'

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "quantidade": self.quantidade,
            "preco": self.preco
        }

class Venda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    valor_total = db.Column(db.Float, nullable=False)
    forma_pagamento = db.Column(db.String(50), nullable=False)
    data_venda = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<Venda {self.id} - Produto ID: {self.produto_id}>'

    def to_dict(self):
        return {
            "id": self.id,
            "produto_id": self.produto_id,
            "produto_nome": self.produto_vendido.nome, # Acessa o nome do produto através do relacionamento
            "quantidade": self.quantidade,
            "valor_total": self.valor_total,
            "forma_pagamento": self.forma_pagamento,
            "data_venda": self.data_venda.isoformat() # Formata a data para ISO 8601 string
        }

# --- Rotas da API ---

@app.route('/')
def home():
    return "Bem-vindo ao Backend do Sistema de Vendas (com Banco de Dados)!"

@app.route('/produtos', methods=['GET'])
def get_produtos():
    produtos = Produto.query.all()
    return jsonify([produto.to_dict() for produto in produtos])

@app.route('/produtos', methods=['POST'])
def add_produto():
    data = request.get_json()
    if not data or not all(key in data for key in ('nome', 'quantidade', 'preco')):
        return jsonify({"error": "Dados inválidos para o produto. Verifique nome, quantidade e preco."}), 400
    
    try:
        quantidade = int(data['quantidade'])
        preco = float(data['preco'])
        if quantidade < 0 or preco < 0:
            return jsonify({"error": "Quantidade e Preço não podem ser negativos."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Quantidade e Preço devem ser números válidos."}), 400

    novo_produto = Produto(nome=data['nome'], quantidade=quantidade, preco=preco)
    db.session.add(novo_produto)
    db.session.commit() # Salva o produto no banco de dados
    return jsonify(novo_produto.to_dict()), 201

@app.route('/produtos/<int:produto_id>', methods=['GET']) # Adicionada rota GET para um único produto
def get_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    return jsonify(produto.to_dict())

@app.route('/produtos/<int:produto_id>', methods=['PUT'])
def update_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

    if 'nome' in data:
        produto.nome = data['nome']
    
    if 'quantidade' in data:
        try:
            quantidade = int(data['quantidade'])
            if quantidade < 0:
                return jsonify({"error": "Quantidade não pode ser negativa."}), 400
            produto.quantidade = quantidade
        except (ValueError, TypeError):
            return jsonify({"error": "Quantidade deve ser um número válido."}), 400
    
    if 'preco' in data:
        try:
            preco = float(data['preco'])
            if preco < 0:
                return jsonify({"error": "Preço não pode ser negativo."}), 400
            produto.preco = preco
        except (ValueError, TypeError):
            return jsonify({"error": "Preço deve ser um número válido."}), 400
    
    db.session.commit() # Salva as alterações no banco de dados
    return jsonify(produto.to_dict())

@app.route('/produtos/<int:produto_id>', methods=['DELETE'])
def delete_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    db.session.delete(produto)
    db.session.commit() # Remove o produto do banco de dados
    return '', 204

@app.route('/vendas', methods=['GET'])
def get_vendas():
    vendas = Venda.query.order_by(Venda.data_venda.desc()).all() # Ordena por data mais recente
    # Para incluir o nome do produto nas vendas, garantimos que o relacionamento esteja carregado
    return jsonify([venda.to_dict() for venda in vendas])

@app.route('/vendas', methods=['POST'])
def registrar_venda():
    data = request.get_json()
    if not data or not all(key in data for key in ('produto_id', 'quantidade', 'forma_pagamento')):
        return jsonify({"error": "Dados inválidos para a venda. Verifique produto_id, quantidade e forma_pagamento."}), 400

    produto_id = data['produto_id']
    quantidade_vendida = data['quantidade']
    forma_pagamento = data['forma_pagamento']

    produto = Produto.query.get(produto_id) # Busca o produto no banco de dados
    
    if not produto:
        return jsonify({"error": "Produto não encontrado no estoque."}), 404

    try:
        quantidade_vendida = int(quantidade_vendida)
        if quantidade_vendida <= 0:
            return jsonify({"error": "Quantidade vendida deve ser maior que zero."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Quantidade deve ser um número válido."}), 400

    if produto.quantidade < quantidade_vendida:
        return jsonify({"error": f"Estoque insuficiente para {produto.nome}. Disponível: {produto.quantidade}."}), 400

    # Atualiza o estoque no objeto do produto
    produto.quantidade -= quantidade_vendida

    # Calcula o valor total
    valor_total = produto.preco * quantidade_vendida

    # Cria a nova venda
    nova_venda = Venda(
        produto_id=produto.id,
        quantidade=quantidade_vendida,
        valor_total=round(valor_total, 2),
        forma_pagamento=forma_pagamento,
        data_venda=datetime.utcnow() # Usa a data UTC para consistência
    )
    
    db.session.add(nova_venda)
    db.session.commit() # Salva a venda E as alterações no produto no banco de dados
    
    # O to_dict da Venda agora acessa produto_vendido.nome
    return jsonify(nova_venda.to_dict()), 201

if __name__ == '__main__':
    # Cria as tabelas no banco de dados se elas ainda não existirem
    # Use este bloco APENAS quando for a primeira vez ou se precisar recriar o DB.
    # Em produção, você usaria migrations.
    with app.app_context():
        db.create_all()
        # Opcional: Adicionar alguns produtos iniciais se o banco de dados estiver vazio
        if not Produto.query.first():
            print("Adicionando produtos de exemplo ao banco de dados...")
            db.session.add(Produto(nome="Teclado Mecânico", quantidade=5, preco=150.00))
            db.session.add(Produto(nome="Mouse Gamer", quantidade=12, preco=80.00))
            db.session.add(Produto(nome="Monitor Ultra-Wide", quantidade=3, preco=1200.00))
            db.session.commit()
            print("Produtos de exemplo adicionados.")

    app.run(debug=True)