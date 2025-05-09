//seleciona os selects curso, periodo semestre
const cursoSelect = document.getElementById("curso");
const periodoSelect = document.getElementById("periodo");
const semestreSelect = document.getElementById("semestre");
//pega o tbody, onde os dados serão preenchidos automaticamente
const corpoTabela = document.querySelector("tbody");

// cria uma array com dias da semana em ordem (segunda a sexta) pra que eles possam ser exibidos sempre na mesma ordem e serve como guia para montar as tabelas
const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];

// Função para formatar o horário recebe dois horarios e retorna uma string no formato "18:45 às 19:35".
function formatarHorario(inicio, fim) {
  return `${inicio} às ${fim}`;
}

// Função principal que atualiza a tabela ao mudar os selects
async function atualizarTabela() {
  //le o que o usuario escolheu ao clicar nos selects e usa pra montar a URL de requisição
  const curso = cursoSelect.value;
  const periodo = periodoSelect.value;
  const semestre = semestreSelect.value;

  try {
    //frontend envia uma requisição GET pra rota /horarios do back passando os parametros (com as variaveis) na URL 
    const response = await fetch(`http://localhost:3000/horarios?curso=${curso}&periodo=${periodo}&semestre=${semestre}`);
    const dados = await response.json();
    //evita
    corpoTabela.innerHTML = ""; // Limpa a tabela antes de inserir os novos dados


    //se houver dados, ele vai executar, caso não tenha ele vai fazer o else
    if (dados.length > 0) {
      //organiza os dados do back em um mapa de horarios e agrupa os dados por faixa de horário (cria um mapa de agrupamento)
      const horariosMap = {};
      //percorre cada item do array dados que veio do banco de dados (os itens contem informações como: hora_inicio: "18:45")
      dados.forEach(item => {
        const horario = formatarHorario(item.hora_inicio, item.hora_fim); //chama a função formatarHorario pra transformar o par hora_inicio e hora_fim

        //verifica se horariosMap existe, se não existir ele inicializa um novo objeto vazio 
        if (!horariosMap[horario]) {
          horariosMap[horario] = {};
        }
        // melhor jeito de entender a linha a baixo é com o exemplo: horariosMap["18:45 às 19:35"]["segunda"] = "Prof. João (Lab 01)";
        horariosMap[horario][item.dia_semana] = `${item.nome_professor} (${item.nome_ambiente})`;
      });

      // Monta a tabela com base no agrupamento e percorre todas as chaves dentro do objeto horariosMap
      for (const horario in horariosMap) {
        const tr = document.createElement("tr"); //cria uma tr(linha da tabela) e atribui à variavel tr

        // Primeira coluna: faixa de horário, cria uma td(celula da linha) que conterá o texto do horario
        const tdHorario = document.createElement("td");
        tdHorario.textContent = horario; //define o tdHorario(conteudo da celula td) como o horario
        tr.appendChild(tdHorario); //tdHorario é adicionado como "filho" dentro de tr, 
      // exemplo:
      // <tr>
      // <td>18:45 às 19:35</td>  
      // </tr>

        // Colunas de segunda a sexta
        //pga a variavel dias, que contém arrays(forEach, é um metodo array que pega cada item da lista), e pra cada dia da semana ele cria um td
        dias.forEach(dia => {
          const td = document.createElement("td");
          td.textContent = horariosMap[horario][dia] || "";
          tr.appendChild(td);
        });

        corpoTabela.appendChild(tr);
      }
    } else {
      // Caso não existam dados para essa combinação
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.textContent = "Horário não disponível.";
      tr.appendChild(td);
      corpoTabela.appendChild(tr);
    }

  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
  }
}

// Eventos para atualizar a tabela quando os selects mudam
cursoSelect.addEventListener("change", atualizarTabela);
periodoSelect.addEventListener("change", atualizarTabela);
semestreSelect.addEventListener("change", atualizarTabela);

// Atualiza a tabela ao carregar a página
window.addEventListener("DOMContentLoaded", atualizarTabela);