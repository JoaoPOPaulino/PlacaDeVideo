import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido/pedido.model';
import { ItemCarrinho } from '../models/item-carrinho';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  criarPedido(itens: ItemCarrinho[], usuarioId: number): Observable<Pedido> {
    const itensDTO = itens.map((item) => ({
      idPlacaDeVideo: item.id,
      quantidade: item.quantidade,
    }));
    return this.http.post<Pedido>(`${this.apiUrl}/usuario/${usuarioId}`, {
      itens: itensDTO,
    });
  }

  buscarPedidosPorUsuario(usuarioId: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  buscarPedidoPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  atualizarStatusPedido(id: number, novoStatus: string): Observable<Pedido> {
    return this.http.put<Pedido>(
      `${this.apiUrl}/${id}/status/${novoStatus}`,
      {}
    );
  }

  cancelarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
