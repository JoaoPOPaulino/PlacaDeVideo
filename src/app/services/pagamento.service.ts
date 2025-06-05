import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagamento } from '../models/pagamento/pagamento.model';

@Injectable({
  providedIn: 'root',
})
export class PagamentoService {
  private apiUrl = `${environment.apiUrl}/pagamentos`;

  constructor(private http: HttpClient) {}

  processarPagamento(
    pedidoId: number,
    valor: number,
    tipoPagamento: 'PIX'
  ): Observable<Pagamento> {
    const payload = {
      dataPagamento: new Date().toISOString(),
      valorPago: valor,
      status: 'PENDENTE',
      tipoPagamento: tipoPagamento,
    };
    return this.http.post<Pagamento>(
      `${this.apiUrl}/processar/${pedidoId}`,
      payload
    );
  }

  verificarStatusPagamento(pedidoId: number): Observable<Pagamento> {
    return this.http.get<Pagamento>(`${this.apiUrl}/pedido/${pedidoId}`);
  }
}
