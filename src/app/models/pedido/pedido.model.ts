import { Pagamento } from '../pagamento/pagamento.model';
import { ItemCarrinho } from '../item-carrinho';

export interface Pedido {
  id: number;
  usuarioId?: number;
  data?: string;
  valorTotal: number;
  status: string;
  itens: ItemCarrinho[];
  pagamento?: Pagamento;
}
