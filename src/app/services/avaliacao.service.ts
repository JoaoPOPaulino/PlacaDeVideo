import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Avaliacao } from '../models/avaliacao/avaliacao.model';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private url = 'http://localhost:8080/avaliacoes';

  constructor(private httpClient: HttpClient) {}

  findAll(
    page: number = 0,
    pageSize: number = 8,
    searchTerm?: string
  ): Observable<Avaliacao[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    const url = searchTerm ? `${this.url}/search` : this.url;

    if (searchTerm) {
      params = params.set('comentario', searchTerm);
    }

    return this.httpClient.get<Avaliacao[]>(url, { params }).pipe(
      map((avaliacoes) =>
        avaliacoes.map((avaliacao) => this.convertToModel(avaliacao))
      ),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<Avaliacao> {
    return this.httpClient.get<Avaliacao>(`${this.url}/${id}`).pipe(
      map((avaliacao) => this.convertToModel(avaliacao)),
      catchError(this.handleError)
    );
  }

  findByPlacaId(placaId: number): Observable<Avaliacao[]> {
    return this.httpClient
      .get<Avaliacao[]>(`${this.url}/placa/${placaId}`)
      .pipe(
        map((avaliacoes) =>
          avaliacoes.map((avaliacao) => this.convertToModel(avaliacao))
        ),
        catchError(this.handleError)
      );
  }

  insert(avaliacao: Avaliacao): Observable<Avaliacao> {
    const payload = this.createPayload(avaliacao);
    return this.httpClient.post<Avaliacao>(this.url, payload).pipe(
      map((av) => this.convertToModel(av)),
      catchError(this.handleError)
    );
  }

  update(avaliacao: Avaliacao): Observable<Avaliacao> {
    const payload = this.createPayload(avaliacao);
    return this.httpClient
      .put<Avaliacao>(`${this.url}/${avaliacao.id}`, payload)
      .pipe(
        map((av) => this.convertToModel(av)),
        catchError(this.handleError)
      );
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  count(searchTerm?: string): Observable<number> {
    const params = searchTerm
      ? new HttpParams().set('comentario', searchTerm)
      : new HttpParams();
    return this.httpClient
      .get<number>(`${this.url}/count`, { params })
      .pipe(catchError(this.handleError));
  }

  private createPayload(avaliacao: Avaliacao): any {
    return {
      idUsuario: avaliacao.usuario?.id,
      idPlacaDeVideo: avaliacao.placadevideo?.id,
      nota: avaliacao.nota?.id || null,
      comentario: avaliacao.comentario,
    };
  }

  private convertToModel(avaliacao: any): Avaliacao {
    const result = new Avaliacao();
    Object.assign(result, avaliacao);

    // Convertendo datas se necessário
    if (avaliacao.dataCriacao) {
      result.dataCriacao = new Date(avaliacao.dataCriacao).toISOString();
    }

    return result;
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
      case 404:
        return 'Avaliação não encontrada';
      case 409:
        return 'Conflito na criação da avaliação';
      case 500:
        return error.error?.message || 'Erro interno no servidor';
      default:
        return `Erro ${error.status}: ${error.message}`;
    }
  }
}
