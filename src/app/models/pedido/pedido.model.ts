export interface Pedido {
  id: number;
  usuario: { id: number; nome: string; email: string; cpf: string };
  itens: Array<{
    id: number;
    placaDeVideo: { id: number; nome: string; preco: number };
    quantidade: number;
    precoUnitario: number;
  }>;
  status: 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  valorTotal: number;
  dataPedido: string;
}