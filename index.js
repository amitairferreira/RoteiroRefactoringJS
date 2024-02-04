const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

function getPeca(pecas, apresentacao) {
  return pecas[apresentacao.id];
}

function calcularCredito(pecas, apresentacao) {
  const peca = getPeca(pecas, apresentacao);
  let creditos = Math.max(apresentacao.audiencia - 30, 0);

  if (peca.tipo === "comedia") {
    creditos += Math.floor(apresentacao.audiencia / 5);
  }

  return creditos;
}

function calcularTotalCreditos(pecas, apresentacoes) {
  return apresentacoes.reduce((creditos, apresentacao) => creditos + calcularCredito(pecas, apresentacao), 0);
}

function calcularTotalApresentacao(pecas, apresentacao) {
  const peca = getPeca(pecas, apresentacao);

  switch (peca.tipo) {
    case "tragedia":
      return 40000 + Math.max(0, apresentacao.audiencia - 30) * 1000;
    case "comedia":
      const base = 30000 + Math.max(0, apresentacao.audiencia - 20) * 500;
      const bonus = 300 * apresentacao.audiencia;
      return base + bonus;
    default:
      throw new Error(`Peça desconhecida: ${peca.tipo}`);
  }
}

function calcularTotalFatura(pecas, apresentacoes) {
  return apresentacoes.reduce((total, apresentacao) => total + calcularTotalApresentacao(pecas, apresentacao), 0);
}

function gerarFaturaStr(fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apresentacao of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apresentacao).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apresentacao))} (${apresentacao.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;

  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
