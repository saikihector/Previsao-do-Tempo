// elementos da tela
const campoCidade = document.getElementById('cidade-input');
const campoStatus = document.getElementById('status');
const listaDeCidades = document.getElementById('lista-cidades');
const areaPrevisao = document.getElementById('previsao');

const API_BASE = 'https://brasilapi.com.br/api/cptec/v1';

function mostrarBuscando() {
  campoStatus.textContent = 'Buscando...';
  campoStatus.classList.remove('erro');
}

function mostrarErro(msg) {
  campoStatus.textContent = msg;
  campoStatus.classList.add('erro');
}

function limparStatus() {
  campoStatus.textContent = '';
  campoStatus.classList.remove('erro');
}

campoCidade.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;

  const nome = campoCidade.value.trim();

  if (!nome) {
    mostrarErro('Digite o nome de uma cidade.');
    return;
  }

  buscarCidades(nome);
});

async function buscarCidades(nomeCidade) {
  listaDeCidades.innerHTML = '';
  areaPrevisao.innerHTML = '';
  mostrarBuscando();

  try {
    const url = `${API_BASE}/cidade/${encodeURIComponent(nomeCidade)}`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      mostrarErro('Não foi possível encontrar cidades com esse nome.');
      return;
    }

    const cidades = await resposta.json();

    if (cidades.length === 0) {
      mostrarErro('Nenhuma cidade encontrada. Tente outro nome.');
      return;
    }

    limparStatus();
    renderizarCidades(cidades);
  } catch (erro) {
    mostrarErro('Erro ao buscar cidades. Verifique sua conexão.');
    console.log(erro);
  }
}

function renderizarCidades(cidades) {
  listaDeCidades.innerHTML = '';

  cidades.forEach((cidade) => {
    const item = document.createElement('li');
    item.textContent = `${cidade.nome} - ${cidade.estado}`;
    item.dataset.id = cidade.id;

    item.addEventListener('click', () => buscarPrevisao(cidade.id));

    listaDeCidades.appendChild(item);
  });
}

async function buscarPrevisao(idCidade) {
  areaPrevisao.innerHTML = '';
  mostrarBuscando();

  try {
    const url = `${API_BASE}/clima/previsao/${idCidade}`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      mostrarErro('Não foi possível obter a previsão do tempo.');
      return;
    }

    const dados = await resposta.json();

    limparStatus();
    renderizarPrevisao(dados);
  } catch (erro) {
    mostrarErro('Erro ao buscar a previsão do tempo.');
    console.log(erro);
  }
}

function renderizarPrevisao(dados) {
  areaPrevisao.innerHTML = '';

  const titulo = document.createElement('h2');
  titulo.textContent = `${dados.cidade} - ${dados.estado}`;
  areaPrevisao.appendChild(titulo);

  const atualizado = document.createElement('p');
  atualizado.textContent = `Atualizado em: ${dados.atualizado_em}`;
  areaPrevisao.appendChild(atualizado);

  dados.clima.forEach((dia) => {
    const card = document.createElement('div');
    card.classList.add('dia-card');

    card.innerHTML = `
      <span class="data">${dia.data}</span>
      <span class="condicao">${dia.condicao_desc}</span>
      <span class="temperaturas">
        <span class="min">${dia.min}°C</span> / <span class="max">${dia.max}°C</span>
      </span>
      <span class="uv">Índice UV: ${dia.indice_uv}</span>
    `;

    areaPrevisao.appendChild(card);
  });
}