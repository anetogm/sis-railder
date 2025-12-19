# Sistema de Gerenciamento de Lanchonete 🍔

Sistema completo para gerenciamento de vendas e despesas de lanchonetes, desenvolvido com Python (Flask) no backend e JavaScript puro no frontend.

## 📋 Funcionalidades

- ✅ Registro de vendas (lanches e bebidas)
- 💸 Registro de despesas por categoria
- 📊 Dashboard em tempo real com totais do dia
- 📈 Relatórios diários detalhados
- 🏆 Ranking de produtos mais vendidos
- 💰 Análise de despesas por categoria
- 📅 Histórico completo de vendas e despesas
- 🗑️ Exclusão de registros

## 🚀 Tecnologias Utilizadas

### Backend

- Python 3.8+
- Flask (Framework web)
- Flask-SQLAlchemy (ORM)
- Flask-CORS (Cross-Origin Resource Sharing)
- PyMySQL (Conector MySQL)
- MySQL (Banco de dados)

### Frontend

- HTML5
- CSS3 (Design moderno e responsivo)
- JavaScript puro (Vanilla JS)
- Fetch API para comunicação com backend

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd sis-railder
```

### 2. Criar ambiente virtual Python

```bash
python -m venv venv
```

### 3. Ativar o ambiente virtual

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/Mac:**

```bash
source venv/bin/activate
```

### 4. Instalar dependências

```bash
pip install -r requirements.txt
```

### 5. Configurar o banco de dados MySQL

Crie um banco de dados MySQL:

```sql
CREATE DATABASE lanchonete_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Configurar variáveis de ambiente

Edite o arquivo `.env` com suas credenciais do MySQL:

```
DATABASE_URL=mysql+pymysql://root:sua_senha@localhost/lanchonete_db
```

> **📖 Precisa de ajuda com o banco de dados?** Veja o guia completo em [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md)

### 7. Iniciar o sistema

```bash
python app.py
```

Ou use o script de início rápido:

```bash
start.bat
```

O sistema estará disponível em `http://localhost:5000` 🎉

O Flask serve automaticamente tanto o backend (APIs) quanto o frontend (HTML/CSS/JS)!

## 📖 Estrutura do Projeto

```
sis-railder/
│
├── app.py                  # Aplicação Flask principal (Backend + Frontend)
├── frontend/
│   ├── index.html          # Página principal
│   ├── css/
│   │   └── style.css       # Estilos
│   └── js/
│       └── app.js          # Lógica JavaScript
│
├── requirements.txt        # Dependências Python
├── .env.example           # Exemplo de configuração
└── README.md              # Este arquivo
```

## 🎯 Como Usar

### Registrar uma Venda

1. Na aba "Registrar Vendas"
2. Selecione o tipo (Lanche ou Bebida)
3. Escolha o item do cardápio
4. Informe a quantidade
5. Clique em "Registrar Venda"

### Registrar uma Despesa

1. Na aba "Registrar Despesas"
2. Preencha a descrição
3. Selecione a categoria
4. Informe o valor
5. Clique em "Registrar Despesa"

### Visualizar Relatórios

1. Na aba "Relatórios"
2. Selecione a data desejada
3. Clique em "Gerar Relatório"
4. Visualize:
   - Total de vendas e despesas
   - Lucro/Prejuízo
   - Produtos mais vendidos
   - Despesas por categoria

## 📊 Cardápio Padrão

### Lanches

- X-Burger: R$ 15,00
- X-Salada: R$ 18,00
- X-Bacon: R$ 20,00
- X-Tudo: R$ 25,00
- X-Egg: R$ 17,00
- X-Frango: R$ 16,00
- Hot Dog: R$ 12,00
- Cachorro Quente Especial: R$ 15,00
- Misto Quente: R$ 8,00
- Hambúrguer Simples: R$ 10,00

### Bebidas

- Coca-Cola 350ml: R$ 5,00
- Coca-Cola 600ml: R$ 8,00
- Coca-Cola 2L: R$ 12,00
- Guaraná 350ml: R$ 4,50
- Guaraná 2L: R$ 10,00
- Água 500ml: R$ 3,00
- Suco Natural: R$ 7,00
- Suco de Lata: R$ 4,00
- Cerveja: R$ 6,00
- Refrigerante Lata: R$ 4,50

> **Nota:** Os preços podem ser alterados diretamente no arquivo `backend/app.py` nos dicionários `LANCHES` e `BEBIDAS`.

## 🔧 Categorias de Despesas

- Ingredientes
- Aluguel
- Energia
- Água
- Gás
- Salários
- Manutenção
- Limpeza
- Marketing
- Outros

## 🌐 API Endpoints

### Cardápio

- `GET /api/cardapio` - Retorna lanches e bebidas
- `GET /api/categorias-despesa` - Retorna categorias de despesas

### Vendas

- `POST /api/vendas` - Registra nova venda
- `GET /api/vendas` - Lista vendas (opcional: ?data=YYYY-MM-DD)
- `DELETE /api/vendas/:id` - Exclui venda

### Despesas

- `POST /api/despesas` - Registra nova despesa
- `GET /api/despesas` - Lista despesas (opcional: ?data=YYYY-MM-DD)
- `DELETE /api/despesas/:id` - Exclui despesa

### Relatórios

- `GET /api/relatorio/diario` - Relatório do dia (opcional: ?data=YYYY-MM-DD)
- `GET /api/relatorio/periodo` - Relatório de período (?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD)

## 🎨 Interface

O sistema possui uma interface moderna e responsiva com:

- 🎨 Design clean e profissional
- 📱 Totalmente responsivo (mobile-friendly)
- 🌈 Cores intuitivas (verde para vendas, vermelho para despesas)
- ⚡ Feedback visual instantâneo
- 📊 Dashboard com métricas em tempo real
- 🔔 Notificações toast para ações

## 🔒 Segurança

- CORS configurado para desenvolvimento
- Validações de dados no backend
- Confirmações antes de exclusões
- Tratamento de erros

## 📝 Observações

- O sistema cria as tabelas automaticamente na primeira execução
- Todos os dados são armazenados no MySQL
- O frontend se comunica com o backend via REST API
- É recomendado usar HTTPS em produção

## 🤝 Contribuindo

Sinta-se à vontade para contribuir com melhorias! Algumas ideias:

- Autenticação de usuários
- Relatórios em PDF
- Gráficos visuais
- Backup automático
- Sistema de metas
- Notificações por email

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👨‍💻 Autor

Sistema desenvolvido para gerenciamento eficiente de lanchonetes.

---

**Desenvolvido com ❤️ e ☕**
