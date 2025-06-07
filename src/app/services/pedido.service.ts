import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pedido } from '../models/pedido/pedido.model';
import { ItemCarrinho } from '../models/item-carrinho';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private url = 'http://localhost:8080/pedidos';

  constructor(private http: HttpClient) {}

  criarPedido(items: ItemCarrinho[], usuarioId: number): Observable<Pedido> {
    const pedidoDto = {
      itens: items.map((item) => ({
        idPlacaDeVideo: item.id,
        quantidade: item.quantidade,
      })),
    };

    console.log('Enviando para backend:', {
      url: `${this.url}/usuario/${usuarioId}`,
      payload: pedidoDto,
    });

    return this.http
      .post<Pedido>(`${this.url}/usuario/${usuarioId}`, pedidoDto)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = this.getServerErrorMessage(error);
    }
    return throwError(() => new Error(errorMessage));
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Requisição inválida';
      case 401:
        return 'Não autorizado';
      case 404:
        return 'Endpoint de criação de pedido não encontrado';
      case 500:
        return error.error?.message || 'Erro interno no servidor';
      default:
        return `Erro ${error.status}: ${error.message}`;
    }
  }

  getPedidosByUsuario(usuarioId: number): Observable<Pedido[]> {
    return this.http
      .get<Pedido[]>(`${this.url}/usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }
}
