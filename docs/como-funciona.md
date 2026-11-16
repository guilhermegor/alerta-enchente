# Como funciona

Esta página explica as decisões de projeto que o código não mostra sozinho. O código-fonte não tem comentários, por regra do repositório; o porquê de cada escolha fica aqui.

## Do CEP ao nível de risco

`assessAddress()` (`src/capabilities/flood-risk/application/assess-address.ts`) executa o pipeline:

1. **CEP → endereço** pelo ViaCEP. O CEP precisa ter 8 dígitos; a máscara (`01310-100`) é removida antes.
2. **Endereço → coordenadas** pelo Nominatim (OpenStreetMap). A busca começa com rua, bairro, cidade e UF e, se nada for encontrado, tenta só rua, cidade e UF. Só vale um resultado que seja uma via ou um imóvel (classes `highway` e `building` do OpenStreetMap): se a rua não existe no mapa, o Nominatim costuma devolver o bairro ou a cidade, e esse ponto não pode passar por endereço. Isso é necessário porque o ViaCEP e o OpenStreetMap costumam dar nomes diferentes ao mesmo bairro: o CEP 08190-000 vem do ViaCEP como "Vila Aimoré", mas no mapa a rua fica em "Vila Grão Mogol".
3. **Sem rua no mapa → centro da cidade**, pelo Nominatim com cidade e UF. A UF é necessária porque há municípios com o mesmo nome em estados diferentes (Bom Jesus existe no RS e no PI). A localização fica marcada como `approximate` e o resultado avisa a pessoa. Nesse caso, relevo e histórico do bairro **não entram no cálculo**, porque descreveriam outro lugar. Antes dessa regra, um CEP do Itaim Paulista era comparado com a Praça da Bandeira, no centro de São Paulo.
4. **Chuva**: a precipitação horária das próximas 72 h a partir da hora atual (Open-Meteo). Cada valor horário é a chuva da hora **anterior** ao horário, então o primeiro valor da série já passou: o adaptador pede 73 horas (`forecast_hours=73`) e descarta a primeira, somada em 24 h e 72 h. Com `forecast_days`, a série começaria à meia-noite e, à noite, as "próximas 24 h" já teriam passado. Se faltar algum valor na série, a consulta falha com aviso em vez de tratar a falta como chuva zero.
5. **Relevo**: a altitude do endereço menos a média de quatro pontos a 500 m dele (norte, leste, sul e oeste), pela API de elevação do Open-Meteo. Um valor negativo indica que o endereço fica num vale.
6. **Histórico**: o ponto de alagamento conhecido mais próximo num raio de 2 km.

A chuva e o relevo são buscados em paralelo, porque ambos dependem só das coordenadas. Nenhuma das APIs pede chave, e todas aceitam chamadas do navegador (CORS), inclusive com a página aberta direto do disco.

## A regra: o pior fator manda

`riskScore()` (`application/risk-score.ts`) transforma cada fator numa faixa e usa a **maior** delas:

| Fator                                     | Faixa 0       | Faixa 1 | Faixa 2 | Faixa 3  |
| ----------------------------------------- | ------------- | ------- | ------- | -------- |
| Chuva em 24 h (limites de aviso do INMET) | < 30 mm       | ≥ 30 mm | > 50 mm | > 100 mm |
| Relevo em relação ao entorno              | acima de −3 m | ≤ −3 m  | ≤ −10 m | —        |
| Histórico do bairro (até 2 km)            | nenhum        | médio   | alto    | —        |

Faixa 0 = baixo, 1 = moderado, 2 = alto, 3 = muito alto. A regra é conservadora e fácil de justificar ("alto por causa de X"). Fatores médios não se somam: chuva moderada num terreno levemente baixo continua moderado.

O simulador da página Consulta usa o mesmo `riskScore()`, alimentado por controles deslizantes em vez das APIs. Por isso funciona sem internet.

## Pontos de alagamento

`src/capabilities/flood-risk/infrastructure/hotspots.json` lista 12 bairros com alagamentos recorrentes, citados pelo CGE-SP, pelo Alerta Rio e pelas defesas civis do RS e de PE. As coordenadas são o centro aproximado de cada bairro e o histórico é qualitativo (médio ou alto). **Os dados são ilustrativos.** Para uso real, troque o arquivo por uma série oficial de ocorrências. O catálogo recusa um histórico desconhecido ao carregar.

A busca do mais próximo percorre a lista inteira, o que basta para algumas dezenas de registros. Com milhares de pontos, valeria um índice espacial.

## Cadastro de alertas

- `validateSignup()` roda todas as regras de uma vez, para o formulário mostrar todos os problemas juntos. O telefone é opcional.
- A cidade é preenchida pelo ViaCEP quando o campo CEP perde o foco. O cadastro faz a própria chamada ao ViaCEP, separada da consulta de risco: ele só precisa da cidade, e as duas funções podem mudar por motivos diferentes.
- O protótipo não tem servidor, então os cadastros ficam no `localStorage` deste navegador. Quando existir um serviço de alertas, basta trocar `LocalSignupRepository` por um adaptador HTTP que implemente a mesma porta `SignupRepository`.

## Abrir sem instalar nada

O enunciado pede que o `index.html` abra direto no navegador. Para isso:

- **`HashRouter`**: as rotas ficam depois do `#` (`index.html#/consulta`). Um roteador baseado no caminho não reconhece nenhuma rota em `file://`, e o hash também dispensa o truque do `404.html` no GitHub Pages.
- **`publicPath: 'auto'`**: os arquivos são carregados com caminho relativo à página (veja `docs/configuration.md`).
- **CSS em arquivo**: o build extrai o CSS para `css/`, sem `<style>` embutido. Imagens ficam em `img/`, scripts em `js/` e fontes em `fonts/`.

## Acessibilidade

- O tamanho da fonte e o alto contraste ficam em atributos do `<html>` (`data-font-step`, `data-contrast`), e o CSS faz o resto. Cada passo de fonte aumenta o tamanho base em cerca de 12,5%.
- A preferência é guardada no `localStorage`. Se o navegador bloquear o armazenamento (aba anônima, cookies bloqueados), os botões continuam funcionando; a escolha só não é lembrada.
- Campos de formulário e `<select>` ocupam toda a largura disponível, e itens de grid têm `min-width: 0`. Sem isso, opções longas ou o tamanho padrão de um `<input>` alargariam a página no celular (verificado em 320 px).
