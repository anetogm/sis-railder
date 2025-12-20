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
    tipo = db.Column(db.String(20), nullable=False)  # 'lanche', 'bebida', 'lanche_gourmet' ou 'porcao'
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
    '01-X-FRANGO SIMPLES': 23.00,
    '02-X-FRANGO EGG': 27.00,
    '03-X-FRANGO SALADA': 27.00,
    '04-X-FRANGO CATUPIRY': 28.00,
    '05-X-FRANGO TUDO': 28.00,
    '06-X-SUPER PARADA': 43.00,
    '07-X-TUDO': 34.00,
    '08-X-TUDINHO': 28.00,
    '09-X-BACON': 27.00,
    '10-X-BACON CEBOLA': 28.00,
    '11-X-BACON EGG': 29.00
}

DESCRICOES_LANCHES = {
    '01-X-FRANGO SIMPLES': 'Pão, molho especial, tomate, milho, batata palha, frango e queijo',
    '02-X-FRANGO EGG': 'Pão, molho especial, tomate, milho, batata palha, frango, queijo e ovo',
    '03-X-FRANGO SALADA': 'Pão, molho especial, alface, tomate, milho, frango e queijo',
    '04-X-FRANGO CATUPIRY': 'Pão, molho especial, tomate, milho, batata palha, catupiry, frango e presunto',
    '05-X-FRANGO TUDO': 'Pão, molho especial, alface, tomate, milho, batata palha, ovo, frango, bacon, presunto e queijo',
    '06-X-SUPER PARADA': 'Pão, molho especial, alface, tomate, milho, batata palha, calabresa, frango, bacon, 2 ovos, 2 hambúrgueres, 2 presunto e 2 queijos',
    '07-X-TUDO': 'Pão, molho especial, alface, tomate, milho, batata palha, ovo, hambúrguer, frango, bacon, presunto e queijo',
    '08-X-TUDINHO': 'Pão, molho especial, alface, tomate, milho, batata palha, ovo, hambúrguer, frango, bacon, presunto e queijo (meia porção)',
    '09-X-BACON': 'Pão, molho especial, tomate, batata palha, hambúrguer, bacon e queijo',
    '10-X-BACON CEBOLA': 'Pão, molho especial, tomate, batata palha, hambúrguer, bacon, cebola e queijo',
    '11-X-BACON EGG': 'Pão, molho especial, tomate, batata palha, hambúrguer, bacon, ovo e queijo'
}

LANCHES_GOURMET = {
    '12-CLÁSSICO': 28.00,
    '13-DELÍRIO': 31.00,
    '14-MALVADO': 32.00,
    '15-DETROIT': 33.00,
    '16-FRITZ': 30.00,
    '17-PAMPA': 32.00,
    '18-BORGUETINHO': 31.00,
    '19-CHICAGO': 34.00,
    '20-TSUNAMI': 44.00,
    '21-FAVORITO': 31.00
}

DESCRICOES_LANCHES_GOURMET = {
    '12-CLÁSSICO': 'Pão de brioche, hambúrguer 180g, molho especial e 2 fatias de queijo',
    '13-DELÍRIO': 'Pão de brioche, hambúrguer 180g, catupiry, molho especial, bacon e queijo',
    '14-MALVADO': 'Pão de brioche, hambúrguer 180g, bacon, cebola caramelizada e molho barbecue',
    '15-DETROIT': 'Pão de brioche, hambúrguer 180g, molho especial, bacon, 2 fatias de queijo e cebola roxa',
    '16-FRITZ': 'Pão de brioche, hambúrguer 180g, milho, batata palha, queijo, tomate e molho especial',
    '17-PAMPA': 'Pão de brioche, hambúrguer 180g, milho, batata palha, queijo, tomate e molho especial',
    '18-BORGUETINHO': 'Pão de brioche, hambúrguer 180g, molho especial, queijo, tomate e cebola',
    '19-CHICAGO': 'Pão de brioche, hambúrguer 180g, queijo, cheddar cremoso, molho especial, bacon e queijo',
    '20-TSUNAMI': 'Pão de brioche, 2 hambúrguer 180g, cheddar cremoso, queijo, bacon, cebola caramelizada e molho barbecue',
    '21-FAVORITO': 'Pão de brioche, hambúrguer 180g, molho barbecue, bacon, queijo e cebola caramelizada'
}

PORCOES = {
    'PORÇÃO BATATA SIMPLES': 23.00,
    'PORÇÃO BATATA QUEIJO/BACON': 28.00,
    'PORÇÃO BATATA BACON/CHEDDAR': 30.00,
    'PORÇÃO BATATA CHEDDAR': 25.00,
    'PORÇÃO NUGGETS': 17.00,
    'ANÉIS DE CEBOLA': 16.00
}

BEBIDA = {
    'SUCO DEL VALLE': 8.00,
    'REFRI 600ML': 8.00,
    'REFRI 2L': 15.00,
    'REFRI 1,5L': 10.00,
    'REFRI LATA': 6.00,
    'CERVEJA LATA': 7.00,
    'ÁGUA': 3.00,
    'ÁGUA C/ GÁS': 3.50,
    'CERVEJA LONG': 12.00,
    'CERVEJA CORONA': 12.00
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
        'lanches_gourmet': LANCHES_GOURMET,
        'porcoes': PORCOES,
        'bebidas': BEBIDA,
        'descricoes_lanches': DESCRICOES_LANCHES,
        'descricoes_lanches_gourmet': DESCRICOES_LANCHES_GOURMET
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
    
    # Produtos mais vendidos - separados por categoria
    produtos_vendidos_lanches = {}
    produtos_vendidos_bebidas = {}
    produtos_vendidos_porcoes = {}
    
    for venda in vendas:
        key = f"{venda.tipo}:{venda.item}"
        
        # Determinar qual categoria (lanches inclui lanche e lanche_gourmet)
        if venda.tipo in ['lanche', 'lanche_gourmet']:
            produtos_dict = produtos_vendidos_lanches
        elif venda.tipo == 'bebida':
            produtos_dict = produtos_vendidos_bebidas
        elif venda.tipo == 'porcao':
            produtos_dict = produtos_vendidos_porcoes
        else:
            continue
        
        if key not in produtos_dict:
            produtos_dict[key] = {
                'tipo': venda.tipo,
                'item': venda.item,
                'quantidade': 0,
                'total': 0
            }
        produtos_dict[key]['quantidade'] += venda.quantidade
        produtos_dict[key]['total'] += float(venda.valor_total)
    
    # Ordenar cada categoria por quantidade
    lanches_ranking = sorted(produtos_vendidos_lanches.values(), key=lambda x: x['quantidade'], reverse=True)[:5]
    bebidas_ranking = sorted(produtos_vendidos_bebidas.values(), key=lambda x: x['quantidade'], reverse=True)[:5]
    porcoes_ranking = sorted(produtos_vendidos_porcoes.values(), key=lambda x: x['quantidade'], reverse=True)[:5]
    
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
        'lanches_mais_vendidos': lanches_ranking,
        'bebidas_mais_vendidas': bebidas_ranking,
        'porcoes_mais_vendidas': porcoes_ranking,
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
