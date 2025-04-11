import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Fabricante } from '../models/placa-de-video/fabricante.model';

@Injectable({
  providedIn: 'root',
})
export class FabricanteService {
  private url = 'http://localhost:8080/fabricantes';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Fabricante[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params
        .set('page', page.toString())
        .set('page_size', pageSize.toString());
    }

    return this.httpClient.get<Fabricante[]>(this.url, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.url}/count`);
  }

  findById(id: string): Observable<Fabricante> {
    return this.httpClient.get<Fabricante>(`${this.url}/${id}`);
  }

  insert(fabricante: Fabricante): Observable<Fabricante> {
    return this.httpClient.post<Fabricante>(this.url, fabricante);
  }

  update(fabricante: Fabricante): Observable<any> {
    return this.httpClient.put<Fabricante>(
      `${this.url}/${fabricante.id}`,
      fabricante
    );
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/${id}`).pipe(
      catchError((error) => {
        console.error('Erro na requisição DELETE:', error);
        throw error;
      })
    );
  }
}
