const { readFileSync } = require('fs');

function gerarFaturaStr(fatura, pecas) {
  function getPeca(apresentacao) {
    return pecas[apresentacao.id];
  }

  function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    }).format(valor / 100);
  }

  function calcularTotalApresentacao(apre) {
    const peca = getPeca(apre);

    switch (peca.tipo) {
      case "tragedia":
        return 40000 + Math.max(0, apre.audiencia - 30) * 1000;
      case "comedia":
        const base = 30000 + Math.max(0, apre.audiencia - 20) * 500;
        const bonus = 300 * apre.audiencia;
        return base + bonus;
      default:
        throw new Error(`Peça desconhecida: ${peca.tipo}`);
    }
  }

  function calcularTotalFatura() {
    return fatura.apresentacoes.reduce((total, apre) => total + calcularTotalApresentacao(apre), 0);
  }

  function calcularTotalCreditos() {
    return fatura.apresentacoes.reduce((creditos, apre) => creditos + calcularCredito(apre), 0);
  }

  function calcularCredito(apre) {
    const peca = getPeca(apre);
    let creditos = Math.max(apre.audiencia - 30, 0);

    if (peca.tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }

    return creditos;
  }

  // corpo principal (após funções aninhadas)
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura())}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos()} \n`;
  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
