export interface Pedido {
  id: number;
  usuarioId?: number;
  data: string;
  total: number;
  status?: string;
  itens: {
    id: string;
    idPlacaDeVideo: number;
    quantidade: number;
    nomePlaca?: string;
    unitPrice?: number;
  }[];
}
