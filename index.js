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

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

class ServicoCalculoFatura {

  constructor(repo) {
    this.repo = repo;
  }

  calcularCredito(apresentacao) {
    const peca = this.repo.getPeca(apresentacao);
    let creditos = Math.max(apresentacao.audiencia - 30, 0);
  
    if (peca.tipo === "comedia") {
      creditos += Math.floor(apresentacao.audiencia / 5);
    }
  
    return creditos;
  }
  
  calcularTotalCreditos(apresentacoes) {
    return apresentacoes.reduce((creditos, apresentacao) => creditos + this.calcularCredito(apresentacao), 0);
  }
  
  calcularTotalApresentacao(apresentacao) {
    const peca = this.repo.getPeca(apresentacao);
  
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
  
  calcularTotalFatura(apresentacoes) {
    return apresentacoes.reduce((total, apresentacao) => total + this.calcularTotalApresentacao(apresentacao), 0);
  }
}

function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apresentacao of fatura.apresentacoes) {
    faturaStr += `  ${calc.repo.getPeca(apresentacao).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apresentacao))} (${apresentacao.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;

  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas, calc) {
  let faturaStr = `<html>\n<p>Fatura ${fatura.cliente}</p>\n<ul>\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(
      calc.calcularTotalApresentacao(pecas, apre)
    )} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += '</ul>\n'
  faturaStr += `</ul>\n<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  faturaStr += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  faturaStr += '</html>\n'
  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);
