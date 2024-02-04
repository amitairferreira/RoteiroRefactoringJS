module.exports = class ServicoCalculoFatura {

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