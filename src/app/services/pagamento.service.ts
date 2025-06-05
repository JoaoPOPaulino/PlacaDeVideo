import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pagamento } from '../models/pagamento/pagamento.model';

@Injectable({
  providedIn: 'root',
})
export class PagamentoService {
  private url = 'http://localhost:8080/pagamentos';

  constructor(private http: HttpClient) {}

  processarPagamento(
    pedidoId: number,
    valor: number,
    metodo: string,
    customer: { name: string; email: string; cellphone: string; taxId: string }
  ): Observable<Pagamento> {
    if (metodo !== 'PIX') {
      return throwError(() => new Error('Apenas pagamento via Pix é suportado.'));
    }

    const paymentData = {
      pedidoId,
      valor: Math.round(valor * 100), // Converter para centavos
      metodo,
      customer: {
        name: customer.name || 'Cliente Teste',
        email: customer.email || 'cliente@example.com',
        cellphone: customer.cellphone || '(55) 99999-9999',
        taxId: customer.taxId || '123.456.789-01',
      },
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    console.log('Enviando para o backend:', {
      url: this.url,
      payload: paymentData,
      headers: headers.keys(),
    });

    return this.http
      .post<Pagamento>(this.url, paymentData, { headers })
      .pipe(catchError(this.handleError));
  }

  verificarStatusPagamento(pedidoId: number): Observable<Pagamento> {
    return this.http
      .get<Pagamento>(`${this.url}/pedido/${pedidoId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = this.getServerErrorMessage(error);
    }
    console.error('Erro no PagamentoService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Requisição inválida';
      case 401:
        return 'Autenticação falhou';
      case 404:
        return 'Recurso não encontrado';
      case 500:
        return error.error?.message || 'Erro interno no servidor';
      default:
        return `Erro ${error.status}: ${error.message}`;
    }
  }
}