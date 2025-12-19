from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from decimal import Decimal
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='frontend', static_url_path='')

# Configuração do banco de dados MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== MODELOS DO BANCO DE DADOS ====================

class Venda(db.Model):
    __tablename__ = 'vendas'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)  # 'lanche' ou 'bebida'
    item = db.Column(db.String(100), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    valor_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    valor_total = db.Column(db.Numeric(10, 2), nullable=False)
    data = db.Column(db.Date, nullable=False, default=date.today)
    data_hora = db.Column(db.DateTime, nullable=False, default=datetime.now)

class Despesa(db.Model):
    __tablename__ = 'despesas'
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)  # Ex: ingredientes, aluguel, conta de luz
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    data = db.Column(db.Date, nullable=False, default=date.today)
    data_hora = db.Column(db.DateTime, nullable=False, default=datetime.now)

# ==================== CARDÁPIO (DICIONÁRIOS) ====================

LANCHES = {
    'X-Burger': 15.00,
    'X-Salada': 18.00,
    'X-Bacon': 20.00,
    'X-Tudo': 25.00,
    'X-Egg': 17.00,
    'X-Frango': 16.00,
    'Hot Dog': 12.00,
    'Cachorro Quente Especial': 15.00,
    'Misto Quente': 8.00,
    'Hambúrguer Simples': 10.00
}

BEBIDAS = {
    'Coca-Cola 350ml': 5.00,
    'Coca-Cola 600ml': 8.00,
    'Coca-Cola 2L': 12.00,
    'Guaraná 350ml': 4.50,
    'Guaraná 2L': 10.00,
    'Água 500ml': 3.00,
    'Suco Natural': 7.00,
    'Suco de Lata': 4.00,
    'Cerveja': 6.00,
    'Refrigerante Lata': 4.50
}

CATEGORIAS_DESPESA = [
    'Ingredientes',
    'Aluguel',
    'Energia',
    'Água',
    'Gás',
    'Salários',
    'Manutenção',
    'Limpeza',
    'Marketing',
    'Outros'
]

# ==================== ROTA PRINCIPAL - FRONTEND ====================

@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

# ==================== ROTAS - CARDÁPIO ====================

@app.get('/api/cardapio')
def get_cardapio():
    return jsonify({
        'lanches': LANCHES,
        'bebidas': BEBIDAS
    })

@app.get('/api/categorias-despesa')
def get_categorias_despesa():
    return jsonify(CATEGORIAS_DESPESA)

# ==================== ROTAS - VENDAS ====================

@app.post('/api/vendas')
def criar_venda():
    data = request.json
    
    venda = Venda(
        tipo=data['tipo'],
        item=data['item'],
        quantidade=data['quantidade'],
        valor_unitario=data['valor_unitario'],
        valor_total=data['valor_total'],
        data=datetime.strptime(data.get('data', str(date.today())), '%Y-%m-%d').date()
    )
    
    db.session.add(venda)
    db.session.commit()
    
    return jsonify({
        'id': venda.id,
        'message': 'Venda registrada com sucesso!'
    }), 201

@app.get('/api/vendas')
def listar_vendas():
    data_filtro = request.args.get('data')
    
    query = Venda.query
    if data_filtro:
        query = query.filter_by(data=datetime.strptime(data_filtro, '%Y-%m-%d').date())
    
    vendas = query.order_by(Venda.data_hora.desc()).all()
    
    return jsonify([{
        'id': v.id,
        'tipo': v.tipo,
        'item': v.item,
        'quantidade': v.quantidade,
        'valor_unitario': float(v.valor_unitario),
        'valor_total': float(v.valor_total),
        'data': v.data.isoformat(),
        'data_hora': v.data_hora.isoformat()
    } for v in vendas])

@app.delete('/api/vendas/<int:id>')
def deletar_venda(id):
    venda = Venda.query.get_or_404(id)
    db.session.delete(venda)
    db.session.commit()
    return jsonify({'message': 'Venda excluída com sucesso!'})

# ==================== ROTAS - DESPESAS ====================

@app.post('/api/despesas')
def criar_despesa():
    data = request.json
    
    despesa = Despesa(
        descricao=data['descricao'],
        categoria=data['categoria'],
        valor=data['valor'],
        data=datetime.strptime(data.get('data', str(date.today())), '%Y-%m-%d').date()
    )
    
    db.session.add(despesa)
    db.session.commit()
    
    return jsonify({
        'id': despesa.id,
        'message': 'Despesa registrada com sucesso!'
    }), 201

@app.get('/api/despesas')
def listar_despesas():
    data_filtro = request.args.get('data')
    
    query = Despesa.query
    if data_filtro:
        query = query.filter_by(data=datetime.strptime(data_filtro, '%Y-%m-%d').date())
    
    despesas = query.order_by(Despesa.data_hora.desc()).all()
    
    return jsonify([{
        'id': d.id,
        'descricao': d.descricao,
        'categoria': d.categoria,
        'valor': float(d.valor),
        'data': d.data.isoformat(),
        'data_hora': d.data_hora.isoformat()
    } for d in despesas])

@app.delete('/api/despesas/<int:id>')
def deletar_despesa(id):
    despesa = Despesa.query.get_or_404(id)
    db.session.delete(despesa)
    db.session.commit()
    return jsonify({'message': 'Despesa excluída com sucesso!'})

# ==================== ROTAS - RELATÓRIOS ====================

@app.get('/api/relatorio/diario')
def relatorio_diario():
    data_filtro = request.args.get('data', str(date.today()))
    data_obj = datetime.strptime(data_filtro, '%Y-%m-%d').date()
    
    # Vendas do dia
    vendas = Venda.query.filter_by(data=data_obj).all()
    total_vendas = sum(float(v.valor_total) for v in vendas)
    
    # Despesas do dia
    despesas = Despesa.query.filter_by(data=data_obj).all()
    total_despesas = sum(float(d.valor) for d in despesas)
    
    # Produtos mais vendidos
    produtos_vendidos = {}
    for venda in vendas:
        key = f"{venda.tipo}:{venda.item}"
        if key not in produtos_vendidos:
            produtos_vendidos[key] = {
                'tipo': venda.tipo,
                'item': venda.item,
                'quantidade': 0,
                'total': 0
            }
        produtos_vendidos[key]['quantidade'] += venda.quantidade
        produtos_vendidos[key]['total'] += float(venda.valor_total)
    
    produtos_ranking = sorted(produtos_vendidos.values(), key=lambda x: x['quantidade'], reverse=True)
    
    # Despesas por categoria
    despesas_por_categoria = {}
    for despesa in despesas:
        if despesa.categoria not in despesas_por_categoria:
            despesas_por_categoria[despesa.categoria] = 0
        despesas_por_categoria[despesa.categoria] += float(despesa.valor)
    
    return jsonify({
        'data': data_filtro,
        'total_vendas': total_vendas,
        'total_despesas': total_despesas,
        'lucro': total_vendas - total_despesas,
        'quantidade_vendas': len(vendas),
        'quantidade_despesas': len(despesas),
        'produtos_mais_vendidos': produtos_ranking[:5],
        'despesas_por_categoria': despesas_por_categoria
    })

@app.get('/api/relatorio/periodo')
def relatorio_periodo():
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim', str(date.today()))
    
    if not data_inicio:
        data_inicio = str(date.today())
    
    data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
    data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
    
    # Vendas do período
    vendas = Venda.query.filter(Venda.data.between(data_inicio_obj, data_fim_obj)).all()
    total_vendas = sum(float(v.valor_total) for v in vendas)
    
    # Despesas do período
    despesas = Despesa.query.filter(Despesa.data.between(data_inicio_obj, data_fim_obj)).all()
    total_despesas = sum(float(d.valor) for d in despesas)
    
    return jsonify({
        'data_inicio': data_inicio,
        'data_fim': data_fim,
        'total_vendas': total_vendas,
        'total_despesas': total_despesas,
        'lucro': total_vendas - total_despesas,
        'quantidade_vendas': len(vendas),
        'quantidade_despesas': len(despesas)
    })

# ==================== INICIALIZAÇÃO ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
