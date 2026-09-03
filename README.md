# Previsão do Tempo

## Projeto:

O projeto tornou-se um site de uso funcional e prático, visando trazer o conhecimento da temperatura máxima, mínima e qual a condição. As informações são somente do dia da pesquisa feita.

<hr>

## Linguagens:

- HTML 5
- CSS 3
- JavaScript

## Link para acesso online:

[Previsão do Tempo](https://previsao-do-tempo-pearl.vercel.app)

<hr>

# Explicação do Projeto

Aplicação web que consulta a **BrasilAPI (serviço CPTEC)** para buscar cidades e
mostrar a previsão do tempo, usando apenas **HTML, CSS e JavaScript puro**.

Projeto dividido em 3 arquivos:
- `index.html` — estrutura da página
- `style.css` — aparência visual
- `script.js` — toda a lógica e as requisições HTTP

---

## 1. Visão geral do funcionamento

```
Usuário digita o nome de uma cidade
          │
          ▼
   Aperta ENTER
          │
          ▼
1ª REQUISIÇÃO → GET /cptec/v1/cidade/{nome}
          │
          ▼
   Lista de cidades aparece na tela
          │
          ▼
   Usuário clica em uma cidade
          │
          ▼
2ª REQUISIÇÃO → GET /cptec/v1/clima/previsao/{id}
          │
          ▼
   Previsão do tempo aparece na tela
```

Duas requisições HTTP GET, feitas com `fetch()`, uma depois da outra,
disparadas por ações do usuário (Enter e clique).

---

## 2. `index.html` — Estrutura da página

```html
<input type="text" id="cidade-input" placeholder="..." autocomplete="off">
<p id="status" class="status" aria-live="polite"></p>
<ul id="lista-cidades" class="lista-cidades"></ul>
<section id="previsao" class="previsao"></section>
<script src="script.js"></script>
```

| Elemento | Papel na aplicação |
|---|---|
| `<input id="cidade-input">` | Campo onde o usuário digita o nome da cidade. |
| `<p id="status">` | Mostra "Buscando..." ou mensagens de erro. Vazio quando não há nada a informar. |
| `<ul id="lista-cidades">` | Lista `<li>` vazia, preenchida via JavaScript com as cidades encontradas. |
| `<section id="previsao">` | Área vazia, preenchida via JavaScript com os dados do clima. |
| `<script src="script.js">` | Carrega o JavaScript. Fica **no fim do `<body>`** de propósito: assim, quando o script roda, todos os elementos acima dele já existem no HTML (senão `getElementById` retornaria `null`). |

Pontos importantes para explicar ao professor:
- **Nenhum conteúdo dinâmico é escrito direto no HTML.** A lista de cidades e a
  previsão começam vazias (`<ul></ul>`, `<section></section>`) e são
  preenchidas em tempo de execução pelo JavaScript — é assim que uma página
  "reage" aos dados vindos da API sem precisar recarregar.
- `aria-live="polite"` no `<p id="status">` é um atributo de acessibilidade:
  avisa leitores de tela que aquele texto pode mudar sozinho (não é
  obrigatório para a atividade, mas mostra cuidado extra).

---

## 3. `style.css` — Aparência

Não faz parte dos requisitos técnicos da atividade, mas vale saber explicar
as partes mais importantes:

- **Gradiente de fundo:** `linear-gradient(135deg, #1a1030 0%, #241848 40%, #16213e 100%)`
  cria um degradê diagonal entre três tons de roxo/azul escuro.
- **Glassmorphism:** fundo semitransparente (`rgba(255,255,255,0.06)`) com
  `border` fina e leve, dando efeito de "vidro fosco" nos cards.
- **`.status.erro`:** classe adicionada via JavaScript (`classList.add('erro')`)
  quando algo dá errado, mudando a cor do texto de status para vermelho.
- **`:hover`** nos itens da lista de cidades, dando feedback visual de que são
  clicáveis.

O CSS não faz nenhuma requisição nem lógica — só estilo. Toda a "inteligência"
está no `script.js`.

---

## 4. `script.js` — A lógica da aplicação

O arquivo é organizado em 7 passos comentados. Segue a explicação de cada um.

### PASSO 1 — Referências aos elementos do HTML

```js
var campoCidade = document.getElementById('cidade-input');
var campoStatus = document.getElementById('status');
var listaDeCidades = document.getElementById('lista-cidades');
var areaPrevisao = document.getElementById('previsao');
var enderecoBaseAPI = 'https://brasilapi.com.br/api/cptec/v1';
```

`document.getElementById('algum-id')` procura, dentro do HTML, o elemento com
aquele `id` e devolve uma referência para ele. A partir daí, a variável
funciona como um "controle remoto": alterar `listaDeCidades.innerHTML`, por
exemplo, altera imediatamente o `<ul>` correspondente na tela.

`enderecoBaseAPI` guarda a parte fixa da URL da API, para não repetir o mesmo
texto várias vezes no código (e facilitar caso o endereço mude no futuro).

### PASSO 2 — Funções auxiliares de mensagem

```js
function mostrarMensagemBuscando() { ... }
function mostrarMensagemDeErro(mensagem) { ... }
function limparMensagem() { ... }
```

Três funções pequenas, cada uma com uma única responsabilidade, reutilizadas
em vários pontos do código (tanto na busca de cidades quanto na busca de
previsão). Isso evita repetir o mesmo trecho de código duas vezes — princípio
básico de organização de código chamado **DRY** (*Don't Repeat Yourself*).

### PASSO 3 — Detectando a tecla Enter

```js
campoCidade.addEventListener('keydown', function (evento) {
  if (evento.key !== 'Enter') {
    return;
  }
  var textoDigitado = campoCidade.value;
  textoDigitado = textoDigitado.trim();
  if (textoDigitado === '') {
    mostrarMensagemDeErro('Digite o nome de uma cidade.');
    return;
  }
  buscarCidades(textoDigitado);
});
```

- **`addEventListener('keydown', ...)`** registra uma função que o navegador
  chama automaticamente toda vez que uma tecla é pressionada dentro do
  `campoCidade`.
- O navegador passa, sozinho, um objeto `evento` para essa função, contendo
  informações sobre o que aconteceu — inclusive `evento.key`, o nome da tecla
  pressionada.
- **`return` como "guarda de entrada" (early return):** em vez de colocar todo
  o resto do código dentro de um `if (evento.key === 'Enter') { ... }`, o
  código verifica logo no início se a condição **não** é a esperada e sai da
  função (`return`) antes. É um estilo mais fácil de ler, evitando blocos
  `if` muito aninhados.
- **`.trim()`** remove espaços em branco do início e do fim do texto digitado
  (ex.: `"  Jacareí  "` vira `"Jacareí"`).
- Se sobrar texto vazio, mostra erro e para. Senão, chama `buscarCidades(...)`
  passando o nome digitado.

### PASSO 4 — Primeira requisição: buscar cidades

```js
async function buscarCidades(nomeCidade) {
  listaDeCidades.innerHTML = '';
  areaPrevisao.innerHTML = '';
  mostrarMensagemBuscando();

  try {
    var endereco = enderecoBaseAPI + '/cidade/' + encodeURIComponent(nomeCidade);
    var resposta = await fetch(endereco);

    if (!resposta.ok) {
      mostrarMensagemDeErro('Não foi possível encontrar cidades com esse nome.');
      return;
    }

    var cidades = await resposta.json();

    if (cidades.length === 0) {
      mostrarMensagemDeErro('Nenhuma cidade encontrada. Tente outro nome.');
      return;
    }

    limparMensagem();
    mostrarListaDeCidades(cidades);

  } catch (erro) {
    mostrarMensagemDeErro('Erro ao buscar cidades. Verifique sua conexão.');
    console.log(erro);
  }
}
```

Esse é o trecho mais importante da atividade. Por partes:

**`async` e `await` — por que existem?**
Uma requisição HTTP não é instantânea: o navegador manda o pedido para o
servidor da BrasilAPI e a resposta demora um tempo pra voltar (depende da
internet). Se o JavaScript "parasse" a página inteira esperando essa resposta,
a aba do navegador travaria. Por isso `fetch()` não devolve a resposta
diretamente — ele devolve uma **Promise**, uma espécie de "recibo" que diz
"a resposta vai chegar, aguarde".

- `async` antes de `function` indica que essa função pode conter `await`.
- `await` pausa **apenas aquela função** (sem travar a página) até a Promise
  ser resolvida, e então continua a execução com o resultado já em mãos.

**`encodeURIComponent(nomeCidade)`**
Uma URL não aceita certos caracteres (espaços, acentos, etc.) do jeito que
foram digitados. Essa função "escapa" o texto para um formato seguro. Por
exemplo, `"São Paulo"` vira `"S%C3%A3o%20Paulo"`. Sem isso, buscar uma cidade
com acento ou espaço poderia falhar.

**`resposta.ok`**
`fetch()` só lança um erro de verdade em caso de falha de rede (sem
internet, domínio errado, etc.). Se o servidor responder normalmente mas com
um status de erro (por exemplo, 404 — não encontrado), o `fetch` **não**
considera isso um erro automaticamente. Por isso o código verifica
manualmente `resposta.ok` (que é `true` para status 200–299) antes de seguir.

**`await resposta.json()`**
O corpo da resposta HTTP chega como texto puro. Esse método interpreta esse
texto como JSON e devolve um array/objeto JavaScript de verdade, pronto para
ser usado (`cidades[0].nome`, por exemplo). Também é assíncrono — por isso
outro `await`.

**`try { ... } catch (erro) { ... }`**
Bloco de tratamento de erro. Tudo que está dentro do `try` roda normalmente;
se **qualquer linha** ali dentro falhar (rede caiu, JSON malformado, etc.), a
execução pula direto para o `catch`, que mostra uma mensagem amigável ao
usuário (`mostrarMensagemDeErro`) e registra o erro técnico no console
(`console.log`) — isso atende ao requisito da atividade de **"informar ao
usuário quando ocorrer um erro em uma requisição"**.

### PASSO 5 — Exibindo a lista de cidades

```js
function mostrarListaDeCidades(cidades) {
  listaDeCidades.innerHTML = '';

  for (var i = 0; i < cidades.length; i++) {
    var cidadeAtual = cidades[i];

    var itemLista = document.createElement('li');
    itemLista.textContent = cidadeAtual.nome + ' - ' + cidadeAtual.estado;
    itemLista.setAttribute('data-id', cidadeAtual.id);

    itemLista.addEventListener('click', function () {
      var idCidadeClicada = this.getAttribute('data-id');
      buscarPrevisao(idCidadeClicada);
    });

    listaDeCidades.appendChild(itemLista);
  }
}
```

- **`for (var i = 0; i < cidades.length; i++)`** percorre o array de cidades
  retornado pela API, um item por vez.
- **Criando elementos "na mão":** `document.createElement('li')` cria um
  `<li>` na memória (ainda não visível na tela); `.textContent` define o
  texto dele; `.appendChild(...)` o insere de fato dentro do `<ul>`, agora
  sim aparecendo na página. Esse é o padrão básico de **manipulação de DOM**:
  criar → configurar → anexar.
- **`setAttribute('data-id', ...)` / `getAttribute('data-id')`:** o `id` da
  cidade (necessário para a segunda requisição) é guardado como um atributo
  personalizado (`data-id`) diretamente no elemento `<li>`. Atributos que
  começam com `data-` são a forma padrão em HTML de guardar informação extra
  em um elemento sem afetar sua aparência.
- **`this` dentro do `addEventListener`:** quando se usa `function () {}`
  (função tradicional, não arrow function) como callback de um evento, a
  palavra `this` dentro dela se refere ao **elemento que dispara o evento** —
  nesse caso, o `<li>` que foi clicado. Por isso `this.getAttribute('data-id')`
  funciona: pega o `data-id` daquele item específico que o usuário clicou.

### PASSO 6 — Segunda requisição: previsão do tempo

```js
async function buscarPrevisao(idCidade) {
  areaPrevisao.innerHTML = '';
  mostrarMensagemBuscando();

  try {
    var endereco = enderecoBaseAPI + '/clima/previsao/' + idCidade;
    var resposta = await fetch(endereco);

    if (!resposta.ok) {
      mostrarMensagemDeErro('Não foi possível obter a previsão do tempo.');
      return;
    }

    var dados = await resposta.json();
    limparMensagem();
    mostrarPrevisao(dados);

  } catch (erro) {
    mostrarMensagemDeErro('Erro ao buscar a previsão do tempo.');
    console.log(erro);
  }
}
```

Estrutura **idêntica** ao Passo 4 (mesmo padrão `async/await` + `try/catch`),
mudando apenas a URL (agora usando `/clima/previsao/{id}`) e a função chamada
no final (`mostrarPrevisao` em vez de `mostrarListaDeCidades`). Repetir esse
padrão mostra ao professor que você entendeu a lógica, não apenas copiou.

### PASSO 7 — Exibindo a previsão do tempo

```js
function mostrarPrevisao(dados) {
  areaPrevisao.innerHTML = '';

  var titulo = document.createElement('h2');
  titulo.textContent = dados.cidade + ' - ' + dados.estado;
  areaPrevisao.appendChild(titulo);

  var atualizadoEm = document.createElement('p');
  atualizadoEm.textContent = 'Atualizado em: ' + dados.atualizado_em;
  areaPrevisao.appendChild(atualizadoEm);

  for (var i = 0; i < dados.clima.length; i++) {
    var diaAtual = dados.clima[i];

    var blocoDia = document.createElement('div');
    blocoDia.classList.add('dia-card');

    blocoDia.innerHTML =
      '<span class="data">' + diaAtual.data + '</span>' +
      '<span class="condicao">' + diaAtual.condicao_desc + '</span>' +
      '<span class="temperaturas">' +
        '<span class="min">' + diaAtual.min + '°C</span> / ' +
        '<span class="max">' + diaAtual.max + '°C</span>' +
      '</span>' +
      '<span class="uv">Índice UV: ' + diaAtual.indice_uv + '</span>';

    areaPrevisao.appendChild(blocoDia);
  }
}
```

- `dados` é o objeto devolvido pela API (`{ cidade, estado, atualizado_em, clima: [...] }`).
- `dados.clima` é um **array**, pois a API pode devolver a previsão de vários
  dias — por isso o `for` percorre item por item, exatamente como no Passo 5.
- Para cada dia, monta um `<div class="dia-card">` com data, condição do
  tempo, temperatura mínima/máxima e índice UV, usando `innerHTML` com
  concatenação de texto (`+`) para montar o HTML de uma vez só — mais rápido
  de escrever quando a estrutura é sempre igual, repetida para cada dia.

---

## 5. Glossário — termos para saber explicar

| Termo | Explicação curta |
|---|---|
| **API** | Sistema que expõe dados/funcionalidades para outros programas consumirem, geralmente via internet. |
| **Requisição HTTP GET** | Pedido feito a um servidor para **obter** dados (sem enviar nem alterar nada). |
| **`fetch()`** | Função nativa do JavaScript para fazer requisições HTTP. |
| **Promise** | Objeto que representa um resultado que ainda vai chegar (sucesso ou erro), típico de operações assíncronas. |
| **`async` / `await`** | Sintaxe que permite "esperar" uma Promise terminar sem travar o restante da página. |
| **JSON** | Formato de texto usado para trocar dados estruturados (objetos/arrays) entre sistemas diferentes. |
| **DOM** | Representação da página HTML em forma de objetos que o JavaScript pode ler e alterar. |
| **`document.getElementById`** | Busca um elemento específico do HTML pelo seu `id`. |
| **`addEventListener`** | Registra uma função para rodar quando um evento (clique, tecla, etc.) acontece. |
| **`try / catch`** | Estrutura para capturar e tratar erros sem quebrar a aplicação inteira. |
| **`encodeURIComponent`** | Converte texto (com espaços, acentos, etc.) em um formato seguro para usar em URLs. |

---


**"O projeto usa alguma biblioteca ou framework?"**
Não — só HTML, CSS e JavaScript puro (*vanilla JS*), como pedido no
enunciado. `fetch`, `document`, `Promise` etc. são todos recursos nativos do
navegador.
