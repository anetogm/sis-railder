// Configuração da API
const API_URL = "http://localhost:5000/api";

// Estado da aplicação
let cardapio = { lanches: {}, bebidas: {} };
let categoriasDespesa = [];

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

  // Forms
  document
    .getElementById("form-venda")
    .addEventListener("submit", registrarVenda);
  document
    .getElementById("form-despesa")
    .addEventListener("submit", registrarDespesa);

  // Campos de venda
  document
    .getElementById("tipo-venda")
    .addEventListener("change", atualizarItensVenda);
  document
    .getElementById("item-venda")
    .addEventListener("change", atualizarValoresVenda);
  document
    .getElementById("quantidade-venda")
    .addEventListener("input", atualizarValoresVenda);

  // Data do relatório
  const dataRelatorio = document.getElementById("data-relatorio");
  dataRelatorio.value = obterDataHoje();
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
    cardapio = await response.json();
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    mostrarToast("Erro ao carregar cardápio", "error");
  }
}

async function carregarCategoriasDespesa() {
  try {
    const response = await fetch(`${API_URL}/categorias-despesa`);
    categoriasDespesa = await response.json();

    const select = document.getElementById("categoria-despesa");
    categoriasDespesa.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

function atualizarItensVenda() {
  const tipo = document.getElementById("tipo-venda").value;
  const selectItem = document.getElementById("item-venda");

  selectItem.innerHTML = '<option value="">Selecione...</option>';
  selectItem.disabled = false;

  if (tipo === "lanche") {
    Object.keys(cardapio.lanches).forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = `${item} - R$ ${formatarMoeda(
        cardapio.lanches[item]
      )}`;
      selectItem.appendChild(option);
    });
  } else if (tipo === "bebida") {
    Object.keys(cardapio.bebidas).forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = `${item} - R$ ${formatarMoeda(
        cardapio.bebidas[item]
      )}`;
      selectItem.appendChild(option);
    });
  }

  // Limpar valores
  document.getElementById("valor-unitario-venda").value = "";
  document.getElementById("valor-total-venda").value = "";
}

function atualizarValoresVenda() {
  const tipo = document.getElementById("tipo-venda").value;
  const item = document.getElementById("item-venda").value;
  const quantidade =
    parseInt(document.getElementById("quantidade-venda").value) || 0;

  if (tipo && item && quantidade > 0) {
    const precoUnitario =
      tipo === "lanche" ? cardapio.lanches[item] : cardapio.bebidas[item];

    const total = precoUnitario * quantidade;

    document.getElementById("valor-unitario-venda").value = `R$ ${formatarMoeda(
      precoUnitario
    )}`;
    document.getElementById("valor-total-venda").value = `R$ ${formatarMoeda(
      total
    )}`;
  }
}

// ==================== VENDAS ====================

async function registrarVenda(e) {
  e.preventDefault();

  const tipo = document.getElementById("tipo-venda").value;
  const item = document.getElementById("item-venda").value;
  const quantidade = parseInt(
    document.getElementById("quantidade-venda").value
  );

  const valorUnitario =
    tipo === "lanche" ? cardapio.lanches[item] : cardapio.bebidas[item];

  const valorTotal = valorUnitario * quantidade;

  try {
    const response = await fetch(`${API_URL}/vendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        item,
        quantidade,
        valor_unitario: valorUnitario,
        valor_total: valorTotal,
        data: obterDataHoje(),
      }),
    });

    if (response.ok) {
      mostrarToast("Venda registrada com sucesso! ✅");
      document.getElementById("form-venda").reset();
      document.getElementById("item-venda").disabled = true;
      document.getElementById("valor-unitario-venda").value = "";
      document.getElementById("valor-total-venda").value = "";

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
                        ${venda.quantidade}x - ${
          venda.tipo === "lanche" ? "🍔" : "🥤"
        }
                        ${
                          venda.tipo.charAt(0).toUpperCase() +
                          venda.tipo.slice(1)
                        } - 
                        ${formatarDataHora(venda.data_hora)}
                    </div>
                </div>
                <div class="item-valor">R$ ${formatarMoeda(
                  venda.valor_total
                )}</div>
                <button class="btn btn-danger" onclick="deletarVenda(${
                  venda.id
                })">🗑️</button>
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

async function registrarDespesa(e) {
  e.preventDefault();

  const descricao = document.getElementById("descricao-despesa").value;
  const categoria = document.getElementById("categoria-despesa").value;
  const valor = parseFloat(document.getElementById("valor-despesa").value);

  try {
    const response = await fetch(`${API_URL}/despesas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao,
        categoria,
        valor,
        data: obterDataHoje(),
      }),
    });

    if (response.ok) {
      mostrarToast("Despesa registrada com sucesso! ✅");
      document.getElementById("form-despesa").reset();

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
                })">🗑️</button>
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
                    })">🗑️</button>
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
                    })">🗑️</button>
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
  const data =
    document.getElementById("data-relatorio").value || obterDataHoje();

  try {
    const response = await fetch(`${API_URL}/relatorio/diario?data=${data}`);
    const dados = await response.json();

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

    // Produtos mais vendidos
    const containerProdutos = document.getElementById("produtos-mais-vendidos");
    if (dados.produtos_mais_vendidos.length === 0) {
      containerProdutos.innerHTML =
        '<div class="empty-state">Nenhuma venda registrada</div>';
    } else {
      containerProdutos.innerHTML = dados.produtos_mais_vendidos
        .map(
          (produto, index) => `
                <div class="produto-item">
                    <div class="produto-info">
                        <strong>${index + 1}. ${produto.item}</strong>
                        <div class="detalhes">
                            ${produto.quantidade} unidades - ${
            produto.tipo === "lanche" ? "🍔" : "🥤"
          }
                        </div>
                    </div>
                    <div class="produto-valor">R$ ${formatarMoeda(
                      produto.total
                    )}</div>
                </div>
            `
        )
        .join("");
    }

    // Despesas por categoria
    const containerCategorias = document.getElementById(
      "despesas-por-categoria"
    );
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
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    mostrarToast("Erro ao gerar relatório", "error");
  }
}
