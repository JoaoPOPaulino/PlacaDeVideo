export class EspecificacaoTecnica {
  id!: number;
  memoria!: string;
  clock!: string;
  barramento!: string;
  consumoEnergia!: string;

  get descricao(): string {
    return `${this.memoria} | ${this.clock} | ${this.barramento}`;
  }
}
