import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Avaliacao } from '../models/avaliacao/avaliacao.model';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  public readonly url = 'http://localhost:8080/avaliacoes';

  constructor(private httpClient: HttpClient) {}

  findByPlacaId(placaId: number): Observable<Avaliacao[]> {
    const params = new HttpParams().set('idPlacaDeVideo', placaId.toString());
    return this.httpClient
      .get<Avaliacao[]>(`${this.url}/placa`, { params })
      .pipe(catchError(this.handleError));
  }

  findAll(
    page: number = 0,
    pageSize: number = 8,
    searchTerm?: string
  ): Observable<Avaliacao[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = searchTerm ? `${this.url}/search` : this.url;

    if (searchTerm) {
      params = params.set('comentario', searchTerm);
    }

    return this.httpClient
      .get<Avaliacao[]>(url, { params })
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

  findById(id: string): Observable<Avaliacao> {
    return this.httpClient
      .get<Avaliacao>(`${this.url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  insert(avaliacao: Avaliacao): Observable<Avaliacao> {
  if (!avaliacao.usuario?.id || !avaliacao.placaDeVideo?.id) {
    return throwError(() => new Error('Usuário ou Placa de Vídeo inválidos'));
  }

  const payload = {
    idUsuario: avaliacao.usuario.id,
    idPlacaDeVideo: avaliacao.placaDeVideo.id,
    nota: avaliacao.nota,
    comentario: avaliacao.comentario,
  };

  return this.httpClient
    .post<Avaliacao>(this.url, payload)
    .pipe(catchError(this.handleError));
}

  update(avaliacao: Avaliacao): Observable<Avaliacao> {
    if (!avaliacao.id) {
      return throwError(() => new Error('ID da avaliação inválido'));
    }

    const payload = {
      idUsuario: avaliacao.usuario?.id,
      idPlacaDeVideo: avaliacao.placaDeVideo?.id,
      nota: avaliacao.nota,
      comentario: avaliacao.comentario,
    };

    return this.httpClient
      .put<Avaliacao>(`${this.url}/${avaliacao.id}`, payload)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocorreu um erro';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Erro ${error.status}: ${
        error.error?.message || error.statusText
      }`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
