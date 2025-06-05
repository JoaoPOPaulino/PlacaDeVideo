export interface Pagamento {
  id: number;
  dataPagamento: string;
  valorPago: number;
  status: string;
  chavePix?: string;
}
