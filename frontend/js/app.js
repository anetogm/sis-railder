// Configuração da API
const API_URL = "/api";

// Estado da aplicação
let cardapio = { lanches: {}, lanches_gourmet: {}, porcoes: {}, bebidas: {} };
let descricoes = { lanches: {}, lanches_gourmet: {} };
let categoriasDespesa = [];
let produtoSelecionado = null;
let categoriaSelecionada = null;

// ==================== INICIALIZAÇÃO ====================

document.addEventListener("DOMContentLoaded", () => {
  inicializarApp();
  configurarEventListeners();
  atualizarDataAtual();
});

async function inicializarApp() {
  await carregarCardapio();
  await carregarCategoriasDespesa();
  await atualizarDashboard();
  await carregarVendasRecentes();
  await carregarDespesasRecentes();
}

function configurarEventListeners() {
  // Tabs
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => trocarTab(button.dataset.tab));
  });

  // Botões de tipo (Lanches/Bebidas)
  document.querySelectorAll(".btn-tipo").forEach((button) => {
    button.addEventListener("click", () => {
      const tipo = button.dataset.tipo;
      selecionarTipo(tipo);
    });
  });

  // Forms
  document
    .getElementById("form-venda")
    .addEventListener("submit", registrarVenda);
  document
    .getElementById("form-despesa")
    .addEventListener("submit", registrarDespesa);

  // Quantidade de venda
  document
    .getElementById("quantidade-venda")
    .addEventListener("input", atualizarValorTotal);

  // Datas do relatório - geração automática
  const dataInicio = document.getElementById("data-inicio-relatorio");
  const dataFim = document.getElementById("data-fim-relatorio");
  
  if (dataInicio) {
    dataInicio.value = obterDataHoje();
    dataInicio.addEventListener("change", gerarRelatorio);
  }
  
  if (dataFim) {
    dataFim.value = obterDataHoje();
    dataFim.addEventListener("change", gerarRelatorio);
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

function obterDataHoje() {
  return new Date().toISOString().split("T")[0];
}

function atualizarDataAtual() {
  const agora = new Date();
  const opcoes = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("data-atual").textContent = agora.toLocaleDateString(
    "pt-BR",
    opcoes
  );
}

function formatarMoeda(valor) {
  return parseFloat(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarData(dataStr) {
  const data = new Date(dataStr + "T00:00:00");
  return data.toLocaleDateString("pt-BR");
}

function formatarDataHora(dataHoraStr) {
  const data = new Date(dataHoraStr);
  return data.toLocaleString("pt-BR");
}

function formatarTipoProduto(tipo) {
  const tipos = {
    lanche: "Lanche",
    lanche_gourmet: "Lanche Gourmet",
    porcao: "Porção",
    bebida: "Bebida",
  };
  return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function mostrarToast(mensagem, tipo = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.className = `toast ${tipo} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==================== NAVEGAÇÃO ====================

function trocarTab(tabName) {
  // Atualizar botões
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  // Atualizar conteúdo
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`tab-${tabName}`).classList.add("active");

  // Carregar dados específicos da tab
  if (tabName === "historico") {
    carregarHistorico();
  } else if (tabName === "relatorios") {
    gerarRelatorio();
  }
}

// ==================== CARDÁPIO ====================

async function carregarCardapio() {
  try {
    const response = await fetch(`${API_URL}/cardapio`);
    const dados = await response.json();
    
    cardapio = {
      lanches: dados.lanches,
      lanches_gourmet: dados.lanches_gourmet,
      porcoes: dados.porcoes,
      bebidas: dados.bebidas
    };
    
    descricoes = {
      lanches: dados.descricoes_lanches || {},
      lanches_gourmet: dados.descricoes_lanches_gourmet || {}
    };
    
    console.log("Cardápio carregado:", cardapio);
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    mostrarToast("Erro ao carregar cardápio", "error");
  }
}

async function carregarCategoriasDespesa() {
  try {
    const response = await fetch(`${API_URL}/categorias-despesa`);
    categoriasDespesa = await response.json();
    mostrarCategorias();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

// ==================== SELEÇÃO DE PRODUTOS ====================

function selecionarTipo(tipo) {
  // Atualizar botões
  document.querySelectorAll(".btn-tipo").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-tipo="${tipo}"]`).classList.add("active");

  // Mostrar produtos
  mostrarProdutos(tipo);
}

function mostrarProdutos(tipo) {
  const grid = document.getElementById("produtos-grid");
  grid.innerHTML = "";

  let produtos;
  switch (tipo) {
    case "lanche":
      produtos = cardapio.lanches;
      break;
    case "lanche_gourmet":
      produtos = cardapio.lanches_gourmet;
      break;
    case "porcao":
      produtos = cardapio.porcoes;
      break;
    case "bebida":
      produtos = cardapio.bebidas;
      break;
    default:
      produtos = {};
  }

  Object.entries(produtos).forEach(([nome, preco]) => {
    const card = document.createElement("div");
    card.className = "produto-card";
    
    // Verificar se há descrição para este produto
    const temDescricao = (tipo === 'lanche' && descricoes.lanches[nome]) || 
                         (tipo === 'lanche_gourmet' && descricoes.lanches_gourmet[nome]);
    
    card.innerHTML = `
      ${temDescricao ? '<div class="info-icon"></div>' : ''}
      <h4>${nome}</h4>
      <div class="preco">R$ ${formatarMoeda(preco)}</div>
    `;

    // Event listener para o ícone de informações
    if (temDescricao) {
      const infoIcon = card.querySelector('.info-icon');
      infoIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita selecionar o produto ao clicar no ícone
        const descricao = tipo === 'lanche' ? descricoes.lanches[nome] : descricoes.lanches_gourmet[nome];
        mostrarDescricao(nome, descricao);
      });
    }

    card.addEventListener("click", () => {
      selecionarProduto(tipo, nome, preco, card);
    });

    grid.appendChild(card);
  });
}

function selecionarProduto(tipo, nome, preco, cardElement) {
  produtoSelecionado = { tipo, nome, preco };

  // Destacar card selecionado
  document.querySelectorAll(".produto-card").forEach((card) => {
    card.classList.remove("selected");
  });
  cardElement.classList.add("selected");

  // Mostrar formulário
  document.getElementById("form-venda").style.display = "block";
  document.getElementById("produto-selecionado-nome").textContent = nome;
  document.getElementById(
    "produto-selecionado-preco"
  ).textContent = `R$ ${formatarMoeda(preco)} cada`;

  // Resetar quantidade
  document.getElementById("quantidade-venda").value = 1;
  atualizarValorTotal();

  // Scroll suave para o formulário
  document
    .getElementById("form-venda")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function atualizarValorTotal() {
  if (!produtoSelecionado) return;

  const quantidade =
    parseInt(document.getElementById("quantidade-venda").value) || 0;
  const total = produtoSelecionado.preco * quantidade;

  document.getElementById("valor-total-venda").value = `R$ ${formatarMoeda(
    total
  )}`;
}

function cancelarVenda() {
  produtoSelecionado = null;
  document.getElementById("form-venda").style.display = "none";
  document.querySelectorAll(".produto-card").forEach((card) => {
    card.classList.remove("selected");
  });
}

// ==================== VENDAS ====================

async function registrarVenda(e) {
  e.preventDefault();

  if (!produtoSelecionado) {
    mostrarToast("Selecione um produto primeiro", "error");
    return;
  }

  const quantidade = parseInt(
    document.getElementById("quantidade-venda").value
  );
  const valorTotal = produtoSelecionado.preco * quantidade;

  try {
    const response = await fetch(`${API_URL}/vendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: produtoSelecionado.tipo,
        item: produtoSelecionado.nome,
        quantidade: quantidade,
        valor_unitario: produtoSelecionado.preco,
        valor_total: valorTotal,
        data: obterDataHoje(),
      }),
    });

    if (response.ok) {
      mostrarToast("Venda registrada com sucesso!");
      cancelarVenda();

      await atualizarDashboard();
      await carregarVendasRecentes();
    }
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    mostrarToast("Erro ao registrar venda", "error");
  }
}

async function carregarVendasRecentes() {
  try {
    const response = await fetch(`${API_URL}/vendas?data=${obterDataHoje()}`);
    const vendas = await response.json();

    const container = document.getElementById("lista-vendas-recentes");

    if (vendas.length === 0) {
      container.innerHTML =
        '<div class="empty-state">Nenhuma venda registrada hoje</div>';
      return;
    }

    container.innerHTML = vendas
      .map(
        (venda) => `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${venda.item}</strong>
                    <div class="detalhes">
                        ${venda.quantidade}x - ${formatarTipoProduto(
          venda.tipo
        )}
                        - ${formatarDataHora(venda.data_hora)}
                    </div>
                </div>
                <div class="item-valor">R$ ${formatarMoeda(
                  venda.valor_total
                )}</div>
                <button class="btn btn-danger" onclick="deletarVenda(${
                  venda.id
                })">Excluir</button>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Erro ao carregar vendas:", error);
  }
}

async function deletarVenda(id) {
  if (!confirm("Deseja realmente excluir esta venda?")) return;

  try {
    const response = await fetch(`${API_URL}/vendas/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      mostrarToast("Venda excluída com sucesso!");
      await atualizarDashboard();
      await carregarVendasRecentes();
    }
  } catch (error) {
    console.error("Erro ao deletar venda:", error);
    mostrarToast("Erro ao excluir venda", "error");
  }
}

// ==================== DESPESAS ====================

function mostrarCategorias() {
  const grid = document.getElementById("categorias-grid");

  if (!categoriasDespesa || categoriasDespesa.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">Nenhuma categoria disponível</div>';
    return;
  }

  grid.innerHTML = categoriasDespesa
    .map(
      (categoria) => `
        <div class="produto-card" onclick="selecionarCategoria('${categoria}')">
          <h4>${categoria}</h4>
        </div>
      `
    )
    .join("");
}

function selecionarCategoria(categoria) {
  categoriaSelecionada = categoria;

  // Remover seleção anterior
  document
    .querySelectorAll("#categorias-grid .produto-card")
    .forEach((card) => {
      card.classList.remove("selecionado");
    });

  // Marcar categoria selecionada
  event.currentTarget.classList.add("selecionado");

  // Mostrar formulário
  document.getElementById("categoria-selecionada-nome").textContent = categoria;
  document.getElementById("form-despesa").style.display = "block";

  // Focar no campo de descrição
  document.getElementById("descricao-despesa").focus();
}

function cancelarDespesa() {
  categoriaSelecionada = null;
  document.getElementById("form-despesa").style.display = "none";
  document.getElementById("form-despesa").reset();

  // Remover seleção
  document
    .querySelectorAll("#categorias-grid .produto-card")
    .forEach((card) => {
      card.classList.remove("selecionado");
    });
}

async function registrarDespesa(e) {
  e.preventDefault();

  if (!categoriaSelecionada) {
    mostrarToast("Selecione uma categoria", "error");
    return;
  }

  const descricao = document.getElementById("descricao-despesa").value;
  const valor = parseFloat(document.getElementById("valor-despesa").value);

  try {
    const response = await fetch(`${API_URL}/despesas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao,
        categoria: categoriaSelecionada,
        valor,
        data: obterDataHoje(),
      }),
    });

    if (response.ok) {
      mostrarToast("Despesa registrada com sucesso!");
      cancelarDespesa();

      await atualizarDashboard();
      await carregarDespesasRecentes();
    }
  } catch (error) {
    console.error("Erro ao registrar despesa:", error);
    mostrarToast("Erro ao registrar despesa", "error");
  }
}

async function carregarDespesasRecentes() {
  try {
    const response = await fetch(`${API_URL}/despesas?data=${obterDataHoje()}`);
    const despesas = await response.json();

    const container = document.getElementById("lista-despesas-recentes");

    if (despesas.length === 0) {
      container.innerHTML =
        '<div class="empty-state">Nenhuma despesa registrada hoje</div>';
      return;
    }

    container.innerHTML = despesas
      .map(
        (despesa) => `
            <div class="item-lista despesa">
                <div class="item-info">
                    <strong>${despesa.descricao}</strong>
                    <div class="detalhes">
                        ${despesa.categoria} - ${formatarDataHora(
          despesa.data_hora
        )}
                    </div>
                </div>
                <div class="item-valor">R$ ${formatarMoeda(despesa.valor)}</div>
                <button class="btn btn-danger" onclick="deletarDespesa(${
                  despesa.id
                })">Excluir</button>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Erro ao carregar despesas:", error);
  }
}

async function deletarDespesa(id) {
  if (!confirm("Deseja realmente excluir esta despesa?")) return;

  try {
    const response = await fetch(`${API_URL}/despesas/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      mostrarToast("Despesa excluída com sucesso!");
      await atualizarDashboard();
      await carregarDespesasRecentes();
    }
  } catch (error) {
    console.error("Erro ao deletar despesa:", error);
    mostrarToast("Erro ao excluir despesa", "error");
  }
}

// ==================== DASHBOARD ====================

async function atualizarDashboard() {
  try {
    const response = await fetch(
      `${API_URL}/relatorio/diario?data=${obterDataHoje()}`
    );
    const dados = await response.json();

    document.getElementById("total-vendas-dia").textContent = formatarMoeda(
      dados.total_vendas
    );
    document.getElementById("qtd-vendas-dia").textContent =
      dados.quantidade_vendas;

    document.getElementById("total-despesas-dia").textContent = formatarMoeda(
      dados.total_despesas
    );
    document.getElementById("qtd-despesas-dia").textContent =
      dados.quantidade_despesas;

    document.getElementById("lucro-dia").textContent = formatarMoeda(
      Math.abs(dados.lucro)
    );

    const lucroContainer = document.getElementById("lucro-container");
    if (dados.lucro < 0) {
      lucroContainer.style.color = "var(--danger-color)";
    } else {
      lucroContainer.style.color = "var(--success-color)";
    }
  } catch (error) {
    console.error("Erro ao atualizar dashboard:", error);
  }
}

// ==================== HISTÓRICO ====================

async function carregarHistorico(dataFiltro = null) {
  let url = `${API_URL}/vendas`;
  if (dataFiltro) {
    url += `?data=${dataFiltro}`;
  }

  try {
    // Carregar vendas
    const responseVendas = await fetch(url);
    const vendas = await responseVendas.json();

    const containerVendas = document.getElementById("historico-vendas");
    if (vendas.length === 0) {
      containerVendas.innerHTML =
        '<div class="empty-state">Nenhuma venda encontrada</div>';
    } else {
      containerVendas.innerHTML = vendas
        .map(
          (venda) => `
                <div class="item-lista">
                    <div class="item-info">
                        <strong>${venda.item}</strong>
                        <div class="detalhes">
                            ${venda.quantidade}x - ${formatarData(
            venda.data
          )} às ${new Date(venda.data_hora).toLocaleTimeString("pt-BR")}
                        </div>
                    </div>
                    <div class="item-valor">R$ ${formatarMoeda(
                      venda.valor_total
                    )}</div>
                    <button class="btn btn-danger" onclick="deletarVenda(${
                      venda.id
                    })">Excluir</button>
                </div>
            `
        )
        .join("");
    }

    // Carregar despesas
    let urlDespesas = `${API_URL}/despesas`;
    if (dataFiltro) {
      urlDespesas += `?data=${dataFiltro}`;
    }

    const responseDespesas = await fetch(urlDespesas);
    const despesas = await responseDespesas.json();

    const containerDespesas = document.getElementById("historico-despesas");
    if (despesas.length === 0) {
      containerDespesas.innerHTML =
        '<div class="empty-state">Nenhuma despesa encontrada</div>';
    } else {
      containerDespesas.innerHTML = despesas
        .map(
          (despesa) => `
                <div class="item-lista despesa">
                    <div class="item-info">
                        <strong>${despesa.descricao}</strong>
                        <div class="detalhes">
                            ${despesa.categoria} - ${formatarData(
            despesa.data
          )} às ${new Date(despesa.data_hora).toLocaleTimeString("pt-BR")}
                        </div>
                    </div>
                    <div class="item-valor">R$ ${formatarMoeda(
                      despesa.valor
                    )}</div>
                    <button class="btn btn-danger" onclick="deletarDespesa(${
                      despesa.id
                    })">Excluir</button>
                </div>
            `
        )
        .join("");
    }
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
  }
}

function aplicarFiltroHistorico() {
  const data = document.getElementById("filtro-data-historico").value;
  if (data) {
    carregarHistorico(data);
  }
}

function limparFiltroHistorico() {
  document.getElementById("filtro-data-historico").value = "";
  carregarHistorico();
}

// ==================== RELATÓRIOS ====================

async function gerarRelatorio() {
  const dataInicio = document.getElementById("data-inicio-relatorio").value;
  const dataFim = document.getElementById("data-fim-relatorio").value;

  if (!dataInicio || !dataFim) {
    return; // Não gera relatório se as datas não estiverem preenchidas
  }

  try {
    // Se for o mesmo dia, usa o endpoint diário
    let response;
    let dados;
    
    if (dataInicio === dataFim) {
      response = await fetch(`${API_URL}/relatorio/diario?data=${dataInicio}`);
      dados = await response.json();
    } else {
      // Usa o endpoint de período
      response = await fetch(`${API_URL}/relatorio/periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
      dados = await response.json();
    }

    // Resumo financeiro
    document.getElementById("rel-vendas").textContent = formatarMoeda(
      dados.total_vendas
    );
    document.getElementById("rel-qtd-vendas").textContent =
      dados.quantidade_vendas;

    document.getElementById("rel-despesas").textContent = formatarMoeda(
      dados.total_despesas
    );
    document.getElementById("rel-qtd-despesas").textContent =
      dados.quantidade_despesas;

    document.getElementById("rel-lucro").textContent = formatarMoeda(
      Math.abs(dados.lucro)
    );

    const lucroContainer = document.getElementById("rel-lucro-container");
    if (dados.lucro < 0) {
      lucroContainer.classList.add("negativo");
    } else {
      lucroContainer.classList.remove("negativo");
    }

    // Produtos mais vendidos (apenas disponível no relatório diário)
    const containerProdutos = document.getElementById("produtos-mais-vendidos");
    if (dados.produtos_mais_vendidos && dados.produtos_mais_vendidos.length > 0) {
      containerProdutos.innerHTML = dados.produtos_mais_vendidos
        .map(
          (produto, index) => `
                <div class="produto-item">
                    <div class="produto-info">
                        <strong>${index + 1}. ${produto.item}</strong>
                        <div class="detalhes">
                            ${
                              produto.quantidade
                            } unidades - ${formatarTipoProduto(produto.tipo)}
                        </div>
                    </div>
                    <div class="produto-valor">R$ ${formatarMoeda(
                      produto.total
                    )}</div>
                </div>
            `
        )
        .join("");
    } else {
      containerProdutos.innerHTML =
        '<div class="empty-state">Nenhuma venda registrada</div>';
    }

    // Despesas por categoria (apenas disponível no relatório diário)
    const containerCategorias = document.getElementById(
      "despesas-por-categoria"
    );
    
    if (dados.despesas_por_categoria) {
      const categorias = Object.entries(dados.despesas_por_categoria);
      
      if (categorias.length === 0) {
        containerCategorias.innerHTML =
          '<div class="empty-state">Nenhuma despesa registrada</div>';
      } else {
        containerCategorias.innerHTML = categorias
          .map(
            ([categoria, valor]) => `
                  <div class="categoria-item">
                      <div class="categoria-info">
                          <strong>${categoria}</strong>
                      </div>
                      <div class="categoria-valor">R$ ${formatarMoeda(
                        valor
                      )}</div>
                  </div>
              `
          )
          .join("");
      }
    } else {
      containerCategorias.innerHTML =
        '<div class="empty-state">Detalhamento disponível apenas para relatórios de um único dia</div>';
    }
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    mostrarToast("Erro ao gerar relatório", "error");
  }
}
// ==================== MODAL DE DESCRIÇÃO ====================

function mostrarDescricao(nome, descricao) {
  const modal = document.getElementById('modal-descricao');
  const titulo = document.getElementById('modal-descricao-titulo');
  const texto = document.getElementById('modal-descricao-texto');
  
  titulo.textContent = nome;
  texto.textContent = descricao;
  
  modal.classList.add('show');
}

function fecharModalDescricao() {
  const modal = document.getElementById('modal-descricao');
  modal.classList.remove('show');
}

// Fechar modal ao clicar fora dele
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-descricao');
  if (e.target === modal) {
    fecharModalDescricao();
  }
});