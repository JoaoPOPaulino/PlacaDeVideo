import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pagamento } from '../models/pagamento/pagamento.model';

@Injectable({
  providedIn: 'root',
})
export class PagamentoService {
  private apiUrl = `${environment.apiUrl}/pagamentos`;
  private abacatePayUrl = environment.abacatePay.url;
  private abacatePayApiKey = environment.abacatePay.apiKey;

  constructor(private http: HttpClient) {}

  processarPagamento(
    pedidoId: number,
    valor: number,
    tipoPagamento: 'PIX'
  ): Observable<Pagamento> {
    if (tipoPagamento !== 'PIX') {
      return throwError(
        () => new Error('Apenas pagamento via Pix é suportado.')
      );
    }

    const payload = {
      valor: valor,
      descricao: `Pagamento do pedido ${pedidoId}`,
      metodo: 'pix',
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.abacatePayApiKey}`,
      'Content-Type': 'application/json',
    });

    // Chamar a API da AbacatePay
    return this.http
      .post<{ pix: { qrCode: string } }>(this.abacatePayUrl, payload, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Erro ao chamar AbacatePay:', error);
          return throwError(
            () => new Error('Falha ao gerar chave Pix: ' + error.message)
          );
        }),
        switchMap((response) => {
          if (!response.pix || !response.pix.qrCode) {
            return throwError(
              () => new Error('Chave Pix não retornada pela AbacatePay.')
            );
          }

          // Preparar payload para o backend
          const pagamentoDto = {
            dataPagamento: new Date().toISOString(),
            valorPago: valor,
            status: 'PENDENTE',
            tipoPagamento: 'PIX',
          };

          // Enviar chave Pix ao backend
          return this.http
            .post<Pagamento>(`${this.apiUrl}/salvar/${pedidoId}`, {
              ...pagamentoDto,
              chavePix: response.pix.qrCode,
            })
            .pipe(
              catchError((error) => {
                console.error('Erro ao salvar pagamento no backend:', error);
                return throwError(
                  () => new Error('Falha ao salvar pagamento: ' + error.message)
                );
              })
            );
        })
      );
  }

  verificarStatusPagamento(pedidoId: number): Observable<Pagamento> {
    return this.http.get<Pagamento>(`${this.apiUrl}/pedido/${pedidoId}`).pipe(
      catchError((error) => {
        console.error('Erro ao verificar status do pagamento:', error);
        return throwError(
          () => new Error('Falha ao verificar status: ' + error.message)
        );
      })
    );
  }
}
