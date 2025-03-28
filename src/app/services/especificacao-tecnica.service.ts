import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EspecificacaoTecnica } from '../models/placa-de-video/especificacao-tecnica.model';

@Injectable({
  providedIn: 'root',
})
export class EspecificacaoTecnicaService {
  private url = 'http://localhost:8080/especificacoes-tecnicas';

  constructor(private httpClient: HttpClient) {}

  findAll(
    page?: number,
    pageSize?: number
  ): Observable<EspecificacaoTecnica[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
    }
    return this.httpClient.get<EspecificacaoTecnica[]>(this.url, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.url}/count`);
  }

  findById(id: string): Observable<EspecificacaoTecnica> {
    return this.httpClient.get<EspecificacaoTecnica>(`${this.url}/${id}`);
  }

  insert(
    especificacao: EspecificacaoTecnica
  ): Observable<EspecificacaoTecnica> {
    return this.httpClient.post<EspecificacaoTecnica>(this.url, especificacao);
  }

  update(especificacao: EspecificacaoTecnica): Observable<any> {
    return this.httpClient.put<any>(
      `${this.url}/${especificacao.id}`,
      especificacao
    );
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/${id}`);
  }
}
