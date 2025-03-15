import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Avaliacao } from '../models/avaliacao/avaliacao.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private url = 'http://localhost:8080/placas';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Avaliacao[]> {
    return this.httpClient.get<Avaliacao[]>(this.url);
  }

  findById(id: string): Observable<Avaliacao> {
    return this.httpClient.get<Avaliacao>(`${this.url}/${id}`);
  }

  insert(avaliacao: Avaliacao): Observable<Avaliacao> {
    return this.httpClient.post<Avaliacao>(this.url, avaliacao);
  }

  update(avaliacao: Avaliacao): Observable<any> {
    return this.httpClient.put<Avaliacao>(
      `${this.url}/${avaliacao.id}`,
      avaliacao
    );
  }

  delete(avaliacao: Avaliacao): Observable<any> {
    return this.httpClient.delete<Avaliacao>(`${this.url}/${avaliacao.id}`);
  }
}
